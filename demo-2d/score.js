
var tonal = require('tonal');
var frampton = require('../../frampton/dist/web-frampton');
var mediaConfig = require('../piano_long.json');
var song = require('../caprice5.json');

var finder = new frampton.MediaFinder(mediaConfig);

var renderer = new frampton.WebRenderer({
  mediaConfig: mediaConfig,
  videoSourceMaker: function(filename) {
    return '/' + mediaConfig.path + filename;
  }
});

var noteNumberRange = makeNoteRange();

var initialDelay = 2000;
iterateTracks(function(trackIndex, el) {
  scheduleSegment(el);
});

function scheduleSegment(el) {
  var note = tonal.fromMidi(el.noteNumber);
  var video = finder.findVideoWithPatern(note);

  var segment = new frampton.VideoSegment(video);
  segment
    .setWidth('25%')
    .setTop('25%');

  var duration = Math.max(el.duration / 1000, 0.2);
  segment.setDuration(duration);

  var left = noteNumberRange.getPercent(el.noteNumber) * 80;
  segment.setLeft(left + '%');

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
