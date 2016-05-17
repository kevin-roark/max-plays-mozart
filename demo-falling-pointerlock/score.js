
var tonal = require('tonal');
var THREE = require('../../frampton/node_modules/three');
var PointerLockControls = require('../../frampton/dist/threejs/pointerlock-controls');
var Pointerlocker = require('../js/pointerlocker');
var frampton = require('../../frampton/dist/web-frampton');
var WebRenderer3D = require('../../frampton/dist/renderer/web-renderer-3d');
var mediaConfig = require('../piano_long.json');
var song = require('../moon1-2.json');

var finder = new frampton.MediaFinder(mediaConfig);
var initialDelay = 2000;
var startYPosition = 1333;
var noteNumberRange = makeNoteRange();
var controls;

var renderer = new WebRenderer3D({
  mediaConfig: mediaConfig,
  videoSourceMaker: function(filename) {
    return '/' + mediaConfig.path + filename;
  },
  cameraProvider: function() {
    return new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1500);
  }
});

var locker = new Pointerlocker();
renderer.renderer.domElement.addEventListener('click', function() {
  locker.requestPointerlock();
}, false);

setupEnvironment();
setupSplash();

function start() {
  controls.enabled = true;

  setTimeout(function() {
    controls.getObject().position.y = startYPosition;
  }, 20);

  iterateTracks(function(trackIndex, el) {
    scheduleSegment(el, trackIndex);
  });
}

function scheduleSegment(el, trackIndex) {
  var note = tonal.fromMidi(el.noteNumber);
  var video = finder.findVideoWithPatern(note);

  var segment = new frampton.VideoSegment(video);

  var duration = Math.max(el.duration / 1000, 0.2);
  segment.setDuration(duration);

  segment.threeOptions = {
    videoMeshWidth: 200, videoMeshHeight: 112, videoSourceWidth: 568, videoSourceHeight: 320,
    geometryProvider: (videoMeshWidth, videoMeshHeight) => {
      return new THREE.BoxGeometry(videoMeshWidth, videoMeshHeight, 40);
    },
    meshConfigurer: function(mesh) {
      var radius = 290;
      var angle = noteNumberRange.getPercent(el.noteNumber) * Math.PI * 2;
      var x = Math.cos(angle) * radius;
      var z = Math.sin(angle) * radius;
      mesh.position.set(x, 45, z);
      mesh.rotation.y = -angle - Math.PI/2;

      mesh.castShadow = true;
    }
  };

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
  var range = {min: 1000, max: 0};
  iterateTracks(function(trackIndex, el) {
    range.min = Math.min(range.min, el.noteNumber);
    range.max = Math.max(range.max, el.noteNumber);
  });

  range.range = range.max - range.min;

  range.getPercent = function(x) {
    return (range.max - x) / range.range;
  };

  return range;
}

function setupSplash() {
  var splashBackground = document.createElement('div');
  splashBackground.className = 'splash-background';

  var clickToStart = document.createElement('div');
  clickToStart.className = 'click-to-start';
  clickToStart.innerText = 'Click to hear Max Play the Piano';
  splashBackground.appendChild(clickToStart);

  var hasStarted = false;
  splashBackground.onclick = function() {
    if (hasStarted) return;
    hasStarted = true;

    splashBackground.style.opacity = 0;
    locker.requestPointerlock();
    start();

    setTimeout(function() {
      document.body.removeChild(splashBackground);
    }, 2000);
  };

  document.body.appendChild(splashBackground);
}

function setupEnvironment() {
  renderer.renderer.shadowMap.enabled = true;
  renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.renderer.gammaInput = true;
  renderer.renderer.gammaOutput = true;
  renderer.renderer.antialias = true;

  controls = new PointerLockControls(renderer.camera, {mass: 25, gravity: -0.75, jumpBoost: 100});
  controls.getObject().position.y = startYPosition;
  controls.rotate(0, 785);
  renderer.scene.add(controls.getObject());

  renderer.addUpdateFunction(function(delta) {
    controls.update(delta);
  });

  var ground = createGround();
  ground.position.set(0, -50, 0);
  renderer.scene.add(ground);

  var spt = createSpotLight();
  spt.position.set(0, 250, -50);
  renderer.scene.add(spt);
  //renderer.scene.add(spt.shadowCameraHelper); // add this to see shadow helper
}

function createGround() {
  var geometry = new THREE.PlaneGeometry(1500, 1500);
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  var material = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    emissive: 0x777777,
    side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  return mesh;
}

function createSpotLight() {
  var spt = new THREE.SpotLight(0xffaaaa, 1.5);
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
