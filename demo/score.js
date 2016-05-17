
var tonal = require('tonal');
var THREE = require('../../frampton/node_modules/three');
var frampton = require('../../frampton/dist/web-frampton');
var WebRenderer3D = require('../../frampton/dist/renderer/web-renderer-3d');
var OrbitControls = require('../../frampton/dist/threejs/orbit-controls');
var mediaConfig = require('../piano_long.json');
var song = require('../moon1-2.json');

var finder = new frampton.MediaFinder(mediaConfig);

var renderer = new WebRenderer3D({
  mediaConfig: mediaConfig,
  videoSourceMaker: function(filename) {
    return '/' + mediaConfig.path + filename;
  }
});

setupEnvironment();

var noteNumberRange = makeNoteRange();

var initialDelay = 2000;
iterateTracks(function(trackIndex, el) {
  scheduleSegment(el, trackIndex);
});

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
      var radius = 100;
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

function setupEnvironment() {
  renderer.renderer.shadowMap.enabled = true;
  renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.renderer.gammaInput = true;
  renderer.renderer.gammaOutput = true;
  renderer.renderer.antialias = true;

  renderer.camera.position.z = 1;

  var controls = new OrbitControls(renderer.camera, renderer.renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = false;

  renderer.addUpdateFunction(function() {
    controls.update();
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
