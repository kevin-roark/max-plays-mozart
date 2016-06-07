
var tonal = require('tonal');
var THREE = require('../../frampton/node_modules/three');
var TWEEN = require('../../frampton/node_modules/tween.js');
var PointerLockControls = require('../../frampton/dist/threejs/pointerlock-controls');
var Pointerlocker = require('../js/pointerlocker');
var frampton = require('../../frampton/dist/web-frampton');
var WebRenderer3D = require('../../frampton/dist/renderer/web-renderer-3d');
var mediaConfig = require('../piano_long.json');
var queryString = require('query-string');

var finder = new frampton.MediaFinder(mediaConfig);
var initialDelay = 2000;
var cameraStartYPosition = 200;
var numberOfColumns = 4;
var renderer, noteNumberRange, velocityRange, controls, locker;
var backgroundBox, activeVideo;

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

var parsedQueryString = queryString.parse(location.search || '?song=ode_to_joy');
var is3D = !!parsedQueryString['3d'];
var songPath = getSongInfo(parsedQueryString.song).songPath;

var song;
getJSON(songPath, function(err, json) {
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
  }

  setupClickToStart(function () {
    if (is3D) {
      locker.requestPointerlock();
    }

    start();
  });
}

function start() {
  if (is3D) {
    controls.enabled = true;

    setTimeout(function() {
      controls.getObject().position.y = cameraStartYPosition;
    }, 20);
  }

  noteNumberRange = makeNoteRange();
  velocityRange = makeVelocityRange();

  var lastTrackEndTime = 0;
  iterateTracks(function(trackIndex, el) {
    scheduleSegment(el, trackIndex);
    lastTrackEndTime = Math.max(initialDelay + el.time + el.duration, lastTrackEndTime);
  });

  var pathname = window.location.pathname;
  setTimeout(function() {
    window.location = pathname.substring(0, pathname.indexOf('play/'));
  }, lastTrackEndTime + 1000);
}

function getSongInfo(songName) {
  var songPath;
  switch (songName) {
    case 'moon1':
      songPath = 'moon1-2.json';
      break;

    case 'moon1_2':
      songPath = 'moon1-2.json';
      break;

    case 'string_quartet':
      songPath = 'string_quartet.json';
      break;

    case 'turc':
      songPath = 'turc.json';
      break;

    case 'caprice5':
      songPath = 'caprice5.json';
      break;

    case 'dies_irae':
      songPath = 'dies_irae.json';
      break;

    case 'nachtmusic':
      songPath = 'nachtmusic.json';
      break;

    case 'ode_to_joy':
    default:
      songPath = 'ode_to_joy.json';
      break;
  }

  return {songPath: '../songs/' + songPath};
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
      videoSourceWidth: 568, videoSourceHeight: 320,
      geometryProvider: (videoMeshWidth, videoMeshHeight) => {
        return new THREE.BoxGeometry(videoMeshWidth, videoMeshHeight, 10 + velocityPercent * 40);
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
  xhr.open('get', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if (xhr.status === 200) {
      callback(null, xhr.response);
    }
    else {
      callback(xhr.status);
    }
  };

  xhr.send();
}

function setupClickToStart(callback) {
  var clickToStart = document.createElement('div');
  clickToStart.className = 'click-to-start';
  clickToStart.innerText = 'Click to hear Max Play the Piano';
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

  controls = new PointerLockControls(renderer.camera, {mass: 25, gravity: -0.75, jumpBoost: 100});
  controls.getObject().position.y = cameraStartYPosition;
  //controls.rotate(0, 785);
  renderer.scene.add(controls.getObject());

  var backgroundMaterial = createVideoMaterial();

  backgroundBox = createBackgroundBox(backgroundMaterial.videoMaterial);
  backgroundBox.position.set(0, 1000 / 2 - 40, 0);
  renderer.scene.add(backgroundBox);

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
  });

  var ground = createGround();
  ground.position.set(0, -50, 0);
  renderer.scene.add(ground);

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

  function createGround() {
    var geometry = new THREE.PlaneGeometry(1500, 1500);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      emissive: 0x444444,
      side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

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
    var videoSourceWidth = options.videoSourceWidth || 568;
    var videoSourceHeight = options.videoSourceHeight || 320;

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
}
