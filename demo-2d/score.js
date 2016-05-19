
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

var numberOfColumns = 4;

var initialDelay = 2000;
iterateTracks(function(trackIndex, el) {
  scheduleSegment(el);
});

function scheduleSegment(el) {
  var note = tonal.fromMidi(el.noteNumber);
  var video = finder.findVideoWithPatern(note);

  var segment = new frampton.VideoSegment(video);
  segment.setWidth('33%');

  var duration = Math.max(el.duration / 1000, 0.7);
  segment.setDuration(duration);

  var volume = Math.min(1, (el.velocity + 1) / 128);
  segment.setVolume(volume);

  var column = Math.floor(noteNumberRange.getPercent(el.noteNumber) * numberOfColumns);
  var left = (column / numberOfColumns) * 67;
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
  var top = (topBound - el.noteNumber) / (topBound - bottomBound) * 60;
  segment.setTop(top + '%');

  console.log('note ' + el.noteNumber + ' column ' + column + ' left ' + left + ' top ' + top);

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
