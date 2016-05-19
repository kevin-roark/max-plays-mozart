
var tonal = require('tonal');
var frampton = require('../../frampton/dist/video-frampton');
var mediaConfig = require('../piano_long.json');
var song = require('../nachtmusic.json');

var finder = new frampton.MediaFinder(mediaConfig);

var renderer = new frampton.VideoRenderer({
  mediaConfig: mediaConfig,
  log: true
});

iterateTracks(function(trackIndex, el) {
  scheduleSegment(el, trackIndex);
});

function scheduleSegment(el) {
  var note = tonal.fromMidi(el.noteNumber);
  var video = finder.findVideoWithPatern(note);

  var segment = new frampton.VideoSegment(video);

  var duration = Math.max(el.duration / 1000, 0.2);
  segment.setDuration(duration);

  var volume = Math.min(1, (el.velocity + 1) / 128);
  segment.setVolume(volume);

  segment.setAudioFadeDuration(20 / 1000);

  renderer.scheduleSegmentRender(segment, 100 + el.time);
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
