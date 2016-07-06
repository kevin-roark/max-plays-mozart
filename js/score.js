
var tonal = require('tonal');
var queryString = require('query-string');
var THREE = require('../../frampton/node_modules/three');
var TWEEN = require('../../frampton/node_modules/tween.js');
var frampton = require('../../frampton/dist/web-frampton');
var WebRenderer3D = require('../../frampton/dist/renderer/web-renderer-3d');
var PointerLockControls = require('../../frampton/dist/threejs/pointerlock-controls');
var Pointerlocker = require('./pointerlocker');
var songMap = require('./song-map');
var mediaConfig = require('../piano_long.json');

var finder = new frampton.MediaFinder(mediaConfig);
var initialDelay = 2000;
var cameraStartYPosition = 200;
var numberOfColumns = 4;
var renderer, noteNumberRange, velocityRange, controls, locker, midiPlayer;
var backgroundBox, activeVideo;
var startTime, lastTrackEndTime = 0, backingAudioEl;

var videoSourceMaker = function(filename) {
  return '../' + mediaConfig.path + filename;
};

var splashBackground = document.createElement('div');
splashBackground.className = 'splash-background';
document.body.appendChild(splashBackground);

var loadingDiv = document.createElement('div');
loadingDiv.className = 'loading-message';
loadingDiv.textContent = 'Loading fuckin music...';
splashBackground.appendChild(loadingDiv);

var parsedQueryString = queryString.parse(location.search || '?song=crazy');
var songInfo = songMap(parsedQueryString.song);
var is3D = !!parsedQueryString['3d'];
var isMidiBacking = songInfo.backingMIDI && !!parsedQueryString.midiBacking;

var song;
getJSON(songInfo.guitarJSON, function(err, json) {
  song = json;

  stopLoading();
  setup();
});

function stopLoading() {
  loadingDiv.style.opacity = 0;

  setTimeout(function() {
    if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
  }, 500);
}

function setup() {
  if (is3D) {
    renderer = new WebRenderer3D({
      mediaConfig: mediaConfig,
      videoSourceMaker: videoSourceMaker,
      cameraProvider: function() {
        return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500);
      }
    });

    locker = new Pointerlocker();
    renderer.renderer.domElement.addEventListener('click', function() {
      locker.requestPointerlock();
    }, false);

    setupEnvironment();
  }
  else {
    renderer = new frampton.WebRenderer({
      mediaConfig: mediaConfig,
      videoSourceMaker: videoSourceMaker
    });

    setupGuitarBorder();
  }

  if (isMidiBacking) {
    MIDI.loadPlugin({
			soundfontUrl: "../soundfont/",
			onprogress: function(state, progress) {
				console.log('midi loading progress: ' + progress);
			},
			onsuccess: function() {
        console.log("Sound being generated with " + MIDI.api + " " + JSON.stringify(MIDI.supports));

				midiPlayer = MIDI.Player;
				midiPlayer.loadFile(songInfo.backingMIDI, function onsuccess () {
        }, null, function onerror (e) {
          console.log('midi loading error', e);
        });

        doClickToStart();
			}
		});
  } else {
    doClickToStart();
  }

  function doClickToStart() {
    setupClickToStart(function () {
      if (is3D) {
        locker.requestPointerlock();
      }

      start();
    });
  }
}

function start () {
  if (is3D) {
    controls.enabled = true;

    setTimeout(function() {
      controls.getObject().position.y = cameraStartYPosition;
    }, 20);
  }

  showTracklist();

  startTime = new Date();
  noteNumberRange = makeNoteRange();
  velocityRange = makeVelocityRange();

  // schedule backing track
  if (!isMidiBacking) {
    var audio = new Audio();
    audio.preload = true;
    audio.src = songInfo.backingMP3;
    audio.preferHTMLAudio = true;
    setTimeout(function() {
      audio.play();
    }, initialDelay + songInfo.backingOffset);

    backingAudioEl = audio;
  } else {
    setTimeout(function() {
      console.log('midi player starting');
      midiPlayer.start();
    }, initialDelay - 5);
  }

  // schedule midi
  iterateTracks(function(trackIndex, el) {
    scheduleSegment(el, trackIndex);
    lastTrackEndTime = Math.max(initialDelay + el.time + el.duration, lastTrackEndTime);
  });

  var pathname = window.location.pathname;
  setTimeout(function() {
    window.location = pathname.substring(0, pathname.indexOf('play/'));
  }, lastTrackEndTime + 1000);
}

function scheduleSegment(el) {
  var note = tonal.fromMidi(el.noteNumber);
  var video = finder.findVideoWithPatern(note);

  var segment = new frampton.VideoSegment(video);
  segment.setWidth('33.33%');

  var duration = Math.max(el.duration / 1000, 0.7);
  segment.setDuration(duration);

  var volume = Math.min(1, (el.velocity + 1) / 128);
  segment.setVolume(volume);

  if (is3D) {
    var velocityPercent = velocityRange.getPercent(el.velocity);
    var notePercent = noteNumberRange.getPercent(el.noteNumber);
    segment.threeOptions = {
      videoMeshWidth: 50 + velocityPercent * 200, videoMeshHeight: 28 + velocityPercent * 112,
      videoSourceWidth: 426, videoSourceHeight: 240,
      geometryProvider: (videoMeshWidth, videoMeshHeight) => {
        var p = Math.random();
        if (p < 0.45) {
          return new THREE.BoxGeometry(videoMeshWidth, videoMeshHeight, 10 + velocityPercent * 40);
        } else if (p < 0.7) {
          return new THREE.SphereGeometry(videoMeshWidth * 0.75 + videoMeshWidth * 0.25 * velocityPercent, 6, 6);
        } else if (p < 0.85) {
          return new THREE.TetrahedronGeometry(videoMeshWidth * 0.5 + videoMeshWidth * 0.25 * velocityPercent);
        } else {
          return new THREE.TorusKnotGeometry(videoMeshWidth * 0.25 + videoMeshWidth * 0.25 * velocityPercent, 10, 24, 6);
        }
      },
      meshConfigurer: function(mesh) {
        var radiusRange = { min: 200, max: 400 };
        var segmentCount = 3; var halfSegmentCount = Math.floor(segmentCount / 2);
        var radialSegment = Math.min(segmentCount - 1, Math.floor(notePercent * segmentCount));
        var segmentPercents = { min: radialSegment / segmentCount, max: (radialSegment + 1) / segmentCount };
        var percentInSegment = 1 - (segmentPercents.max - notePercent) / (segmentPercents.max - segmentPercents.min);
        var radius = radiusRange.min + (radiusRange.max - radiusRange.min) * percentInSegment;

        var angle;
        if (radialSegment == halfSegmentCount) angle = Math.PI*3/2;
        else if (radialSegment < halfSegmentCount) angle = Math.PI*3/2 - (1 - (radialSegment / halfSegmentCount)) * Math.PI*0.2;
        else angle = Math.PI*3/2 + ((segmentCount - (halfSegmentCount+1)) / (segmentCount - radialSegment)) * Math.PI*0.2;

        var x = Math.cos(angle) * radius;
        var z = Math.sin(angle) * radius;
        var y = velocityPercent * 50 + 30;
        mesh.position.set(x, y, z);

        mesh.rotation.y = -angle - Math.PI/2;

        mesh.castShadow = true;
      }
    };

    segment.onStart = function() {
      activeVideo = segment._backingVideo;
    };
  }
  else {
    var column = Math.floor(noteNumberRange.getPercent(el.noteNumber) * numberOfColumns);
    var left = (column / numberOfColumns) * 66.67;
    segment.setLeft(left + '%');

    // the top levels need to vary within a column
    // concept math to figure this out
    // say you are at min 60 -> max 80
    // range: 20, per column (at 4 columns): 5
    // 67 -> diff from min = 7
    // bottomBound = 65, topBound = 70
    var rangeChunkPerColumn = Math.ceil(noteNumberRange.range / numberOfColumns);
    var diffFromMin = el.noteNumber - noteNumberRange.min;
    var bottomBound = el.noteNumber - (diffFromMin % rangeChunkPerColumn);
    var topBound = bottomBound + rangeChunkPerColumn;
    var widthInPixels = 0.3333 * window.innerWidth;
    var heightInPixels = widthInPixels * 9/16;
    var heightAsPercent = (heightInPixels / window.innerHeight) * 100;
    var top = (topBound - el.noteNumber) / (topBound - bottomBound) * (100 - heightAsPercent);
    segment.setTop(top + '%');
  }

  renderer.scheduleSegmentRender(segment, initialDelay + el.time);
}

function iterateTracks(fn) {
  song.tracks.forEach(function(track, idx) {
    track.forEach(function(el) {
      fn(idx, el);
    });
  });
}

function makeNoteRange() {
  return makeMidiRange('noteNumber');
}

function makeVelocityRange() {
  return makeMidiRange('velocity');
}

function makeMidiRange (key) {
  var range = {min: 1000, max: 0};
  iterateTracks(function(trackIndex, el) {
    range.min = Math.min(range.min, el[key]);
    range.max = Math.max(range.max, el[key]);
  });

  range.range = range.max - range.min;

  range.getPercent = function(x) {
    return (range.max - x) / range.range;
  };

  range.getValue = function(percent) {
    return range.max - range.range * percent;
  }

  return range;
}

function getJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open('GET', url, true);
  xhr.onload = function() {
    callback(null, xhr.response);
  };
  xhr.onerror = function() {
    callback(xhr.statusText, null);
  };

  xhr.send();
}

function setupClickToStart(callback) {
  var clickToStart = document.createElement('div');
  clickToStart.className = 'click-to-start';
  clickToStart.innerHTML = 'Click to let... <br/> MAX ROCK';
  clickToStart.style.opacity = 0;
  splashBackground.appendChild(clickToStart);

  setTimeout(function() {
    clickToStart.style.opacity = 1;
  }, 20);

  var hasStarted = false;
  splashBackground.onclick = function() {
    if (hasStarted) return;
    hasStarted = true;

    splashBackground.style.opacity = 0;

    if (callback) callback();

    setTimeout(function() {
      document.body.removeChild(splashBackground);
    }, 2000);
  };
}

function setupEnvironment() {
  renderer.renderer.shadowMap.enabled = true;
  renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.renderer.gammaInput = true;
  renderer.renderer.gammaOutput = true;
  renderer.renderer.antialias = true;

  var clock = new THREE.Clock();

  controls = new PointerLockControls(renderer.camera, {mass: 25, gravity: -0.75, jumpBoost: 100});
  controls.getObject().position.y = cameraStartYPosition;
  //controls.rotate(0, 785);
  renderer.scene.add(controls.getObject());

  var backgroundMaterial = createVideoMaterial();

  backgroundBox = createBackgroundBox(backgroundMaterial.videoMaterial);
  backgroundBox.position.set(0, 1000 / 2 - 40, 0);
  renderer.scene.add(backgroundBox);

  var guitars = [];
  addGuitarMeshes(function(g) {
    guitars = g;
  });

  addFloaters();

  renderer.addUpdateFunction(function(delta) {
    controls.update(delta);

    if (activeVideo && activeVideo.readyState === activeVideo.HAVE_ENOUGH_DATA) {
      if (!backgroundMaterial.videoMaterial.map) {
        backgroundMaterial.videoMaterial.map = backgroundMaterial.videoTexture;
        backgroundMaterial.videoMaterial.needsUpdate = true;
      }

      backgroundMaterial.videoContext.drawImage(activeVideo, 0, 0);
      backgroundMaterial.videoTexture.needsUpdate = true;
    }

    for (var i = 0; i < guitars.length; i++) {
      var guitar = guitars[i];

      guitar.position.x += 3 * (Math.random() - 0.5);
      guitar.position.y += 3 * (Math.random() - 0.5);
      guitar.position.z += 3 * (Math.random() - 0.5);

      guitar.scale.x += 0.9 * (Math.random() - 0.5);
      guitar.scale.x += 0.9 * (Math.random() - 0.5);
      guitar.scale.x += 0.9 * (Math.random() - 0.5);

      guitar.rotation.x += 0.5 * (Math.random() - 0.5);
      guitar.rotation.y += 0.5 * (Math.random() - 0.5);
      guitar.rotation.z += 0.5 * (Math.random() - 0.5);
    }
  });

  var ground = createRoomPlane();
  ground.position.set(0, -50, 0);
  renderer.scene.add(ground);

  var ceiling = createRoomPlane(true);
  ceiling.position.set(0, 960, 0);
  renderer.scene.add(ceiling);

  var spt = createSpotLight();
  spt.position.set(0, 250, -50);
  controls.getObject().add(spt);
  //renderer.scene.add(spt.shadowCameraHelper); // add this to see shadow helper

  var targetColor = 'g';
  tweenSpotColor();
  function tweenSpotColor() {
    var goal = {r: 0.67, g: 0.5, b: 0.5};
    var nextTarget;
    switch (targetColor) {
      case 'r': goal.r = 1; nextTarget = 'g'; break;
      case 'g': goal.g = 1; nextTarget = 'b'; break;
      default: goal.b = 1; nextTarget = 'r'; break;
    }

    var rgb = spt.color.toArray();

    var tween = new TWEEN.Tween({r: rgb[0], g: rgb[1], b: rgb[2]})
      .to(goal, 5000)
      .easing(TWEEN.Easing.Quartic.In)
      .onUpdate(function() {
        spt.color.setRGB(this.r, this.g, this.b);
      })
      .onComplete(function() {
        targetColor = nextTarget;
        tweenSpotColor();
      });

    tween.start();
  }

  function createRoomPlane(isCeiling) {
    var geometry = new THREE.PlaneGeometry(1500, 1500);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture(isCeiling ? '../media/home/stadium.jpg' : '../media/home/flame.jpg'),
      shininess: 50,
      side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    if (isCeiling) {
      mesh.rotation.z = Math.PI;
    }

    return mesh;
  }

  function createSpotLight() {
    var spt = new THREE.SpotLight(0xff888888, 1.5);
    spt.castShadow = true;
    spt.shadow.camera.near = 0.1;
    spt.shadow.camera.far = 20000;
    spt.shadow.mapSize.width = spt.shadow.mapSize.height = 1024;
    spt.shadowCameraHelper = new THREE.CameraHelper(spt.shadow.camera); // colored lines
    spt.angle = 1.0;
    spt.exponent = 2.0;
    spt.penumbra = 0.15;
    spt.decay = 1.25;
    spt.distance = 500;

    return spt;
  }

  function createBackgroundBox(videoMaterial) {
    var transparentMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );

    var backgroundGeometry = new THREE.BoxGeometry(1000, 1000, 1000, 1, 1, 1);
    var invisibleIndices = [4, 5, 6, 7];
    for (var i = 0; i < backgroundGeometry.faces.length; i++) {
      // assign material to each face (0 video, 1 trans)
      backgroundGeometry.faces[i].materialIndex = invisibleIndices.indexOf(i) >= 0 ? 1 : 0;
    }
    backgroundGeometry.sortFacesByMaterialIndex(); // optional, to reduce draw calls

    return new THREE.Mesh(
      backgroundGeometry,
      new THREE.MeshFaceMaterial( [videoMaterial, transparentMaterial] )
    );
  }

  function createVideoMaterial(options) {
    if (!options) options = {};
    var videoMeshWidth = options.videoMeshWidth || 1000;
    var videoMeshHeight = options.videoMeshHeight || 1000;
    var videoSourceWidth = options.videoSourceWidth || 426;
    var videoSourceHeight = options.videoSourceHeight || 240;

    var videoCanvas = document.createElement('canvas');
    videoCanvas.width = videoSourceWidth; videoCanvas.height = videoSourceHeight;

    var videoContext = videoCanvas.getContext('2d');
    videoContext.fillStyle = '#000000'; // background color if no video present
    videoContext.fillRect( 0, 0, videoMeshWidth, videoMeshHeight);

    var videoTexture = new THREE.Texture(videoCanvas);
    videoTexture.minFilter = videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoTexture.generateMipmaps = false;

    var videoMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      overdraw: true,
      side: THREE.BackSide
    });

    return { videoMaterial: videoMaterial, videoTexture: videoTexture, videoContext: videoContext };
  }

  function addGuitarMeshes (cb) {
    var loader = new THREE.JSONLoader();
    loader.load('../models/guitar.json', function (geometry, materials) {
      var material = new THREE.MultiMaterial(materials);
      var guitar = new THREE.Mesh(geometry, material);
      var guitars = [];
      for (var i = 0; i < 8; i++) {
        guitars.push(i === 0 ? guitar : guitar.clone());
      }

      guitars.forEach(function(guitar, idx) {
        var scale = 5 + Math.random() * 20;
        guitar.scale.set(scale, scale, scale);

        guitar.position.set(-500 + Math.random() * 1000, Math.random() * 180, -500 + Math.random() * 1000);

        renderer.scene.add(guitar);
      });

      if (cb) cb(guitars);
    });
  }

  function addFloaters () {
    var textureNames = [
      '../media/home/flame.jpg',
      '../media/home/pinkflame.jpg',
      '../media/home/lightning.jpg',
      '../media/home/lightning2.jpg',
      '../media/home/lightning3.jpg'
    ];

    for (var i = 0; i < 20; i++) {
      addFloater();
    }

    function addFloater () {
      var r = 5 + Math.random() * 40;
      var s = Math.floor(Math.random() * 6) + 3;
      var geometry = new THREE.SphereGeometry(r, s, s);

      var texture = THREE.ImageUtils.loadTexture(textureNames[Math.floor(Math.random() * textureNames.length)]);
      var material = new THREE.MeshBasicMaterial({
        map: texture
      });

      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(-500 + Math.random() * 1000, Math.random() * 400, -500 + Math.random() * 1000);

      renderer.scene.add(mesh);

      setTimeout(function() {
        float(mesh);
      }, 3000 + Math.random() * 5000);
    }

    function float (mesh, dir) {
      var trackPercent = backingAudioEl.currentTime / backingAudioEl.duration;
      var d = trackPercent < 0.25 ? 0 : trackPercent * 500;
      var x = mesh.position.x + (Math.random() * d - d / 2);
      var z = mesh.position.z + (Math.random() * d - d / 2);
      var goal = {
        x: Math.min(500, Math.max(-500, x)),
        y: dir === 'up' ? 750 : 20,
        z: Math.min(500, Math.max(-500, z))
      };

      var duration = (1 - trackPercent) * 10000 + 1000;

      var tween = new TWEEN.Tween(mesh.position)
        .to(goal, duration)
        .onComplete(function() {
          var nextDir = dir === 'up' ? 'down' : 'up';
          float(mesh, nextDir);
        });

      tween.start();
    }
  }
}

function setupGuitarBorder () {
  for (var x = 0; x < window.innerWidth; x += 32 + Math.random() * 32) {
    var yVals = [0, window.innerHeight - 64];
    for (var y = 0; y < yVals.length; y++) {
      addGuitar(x, yVals[y]);
    }
  }

  for (var y = 0; y < window.innerHeight; y += 32 + Math.random() * 32) {
    var xVals = [0, window.innerWidth - 64];
    for (var x = 0; x < xVals.length; x++) {
      addGuitar(xVals[x], y);
    }
  }

  function addGuitar (x, y) {
    var img = new Image();
    img.src = '../media/home/guitar_icon.png';
    img.className = 'guitar-icon';
    img.style.left = x + 'px';
    img.style.top = y + 'px';
    document.body.appendChild(img);
  }
}

function showTracklist () {
  var tracklist = document.createElement('div');
  tracklist.className = 'tracklist';

  tracklist.innerHTML = [parsedQueryString.song.toUpperCase(), 'Carmichael Payamps', 'MAX AND ROLL', '2016'].join('<br/>');

  document.body.appendChild(tracklist);
  setTimeout(function() {
    tracklist.style.opacity = 1;
    setTimeout(function() {
      tracklist.style.opacity = 0;
      setTimeout(function() {
        document.body.removeChild(tracklist);
      }, 1000);
    }, 6666);
  }, 1);
}
