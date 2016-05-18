
var tonal = require('tonal');
var frampton = require('../../frampton/dist/web-frampton');
var mediaConfig = require('../piano_long.json');
var song = require('../turc.json');

var finder = new frampton.MediaFinder(mediaConfig);

var renderer = new frampton.WebRenderer({
  mediaConfig: mediaConfig,
  videoSourceMaker: function(filename) {
    return '/' + mediaConfig.path + filename;
  }
});

var noteNumberRange = makeNoteRange();

var numberOfRows = 4;
var numberOfColumns = Math.floor(noteNumberRange.range / numberOfRows);

var initialDelay = 2000;
iterateTracks(function(trackIndex, el) {
  scheduleSegment(el);
});

function scheduleSegment(el) {
  var note = tonal.fromMidi(el.noteNumber);
  var video = finder.findVideoWithPatern(note);

  var segment = new frampton.VideoSegment(video);
  segment.setWidth('33%');

  var duration = Math.max(el.duration / 1000, 1);
  segment.setDuration(duration);

  var notePercent = noteNumberRange.getPercent(el.noteNumber) * 100;
  var row = Math.floor(Math.floor(notePercent) % numberOfRows);
  var column = Math.floor(Math.floor(notePercent) % numberOfColumns);

  var top = noteNumberRange.getPercent(el.noteNumber) * 90 - 20; (row / numberOfRows) * 100;
  segment.setTop(top + '%');

  var left = (column / numberOfColumns) * 100;
  segment.setLeft(left + '%');

  console.log('note ' + el.noteNumber + ' left ' + left + ' top ' + top);

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
