(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var util = require('./util');
require('string-natural-compare');

module.exports.frequencyWeightedMedia = function (media) {
  if (!media) return [];

  var weightedMedia = [];
  for (var i = 0; i < media.length; i++) {
    var mediaObject = media[i];
    var frequency = mediaObject.frequency !== undefined ? mediaObject.frequency : 5; // default

    for (var f = 0; f < frequency; f++) {
      weightedMedia.push(mediaObject);
    }
  }

  return util.shuffle(weightedMedia);
};

module.exports.durationSortedMedia = function (media, descending) {
  return _mediaSortedWithComparator(media, function (mediaA, mediaB) {
    var durationA = mediaA.duration || 0;
    var durationB = mediaB.duration || 0;

    return descending ? durationB - durationA : durationA - durationB;
  });
};

module.exports.volumeSortedMedia = function (media) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var descending = options.descending || false;
  var useMax = options.useMax || false;
  return _mediaSortedWithComparator(media, function (mediaA, mediaB) {
    var volumeA = mediaA.volumeInfo ? useMax ? mediaA.volumeInfo.max : mediaA.volumeInfo.mean : -20;
    var volumeB = mediaB.volumeInfo ? useMax ? mediaB.volumeInfo.max : mediaB.volumeInfo.mean : -20;

    return descending ? volumeB - volumeA : volumeA - volumeB;
  });
};

module.exports.naturalLanguageSortedMedia = function (media) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var descending = options.descending || false;
  var caseSensitive = options.caseSensitive || false;

  var comparator = caseSensitive ? String.naturalCompare : String.naturalCaseCompare;

  return _mediaSortedWithComparator(media, function (mediaA, mediaB) {
    var val = comparator(mediaA.filename, mediaB.filename);
    return descending ? -val : val;
  });
};

module.exports.mediaSortedWithComparator = _mediaSortedWithComparator;
function _mediaSortedWithComparator(media, comparator) {
  if (!media || !comparator) return [];

  var mediaCopy = copiedMedia(media);

  mediaCopy.sort(comparator);

  return mediaCopy;
}

function copiedMedia(media) {
  if (!media) return [];

  var mediaCopy = [];

  for (var i = 0; i < media.length; i++) {
    mediaCopy.push(media[i]);
  }

  return mediaCopy;
}
},{"./util":4,"string-natural-compare":23}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function MediaFinder(mediaConfig) {
    _classCallCheck(this, MediaFinder);

    this.mediaConfig = mediaConfig;
  }

  _createClass(MediaFinder, [{
    key: 'findVideoWithPatern',
    value: function findVideoWithPatern(pattern) {
      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        if (video.filename.indexOf(pattern) >= 0) {
          return video;
        }
      }

      return null;
    }
  }, {
    key: 'findAudioHandleForVideo',
    value: function findAudioHandleForVideo(video) {
      var strippedFilename = stripExtension(video.filename || video);

      var audio = this.mediaConfig.audio;
      if (!audio || audio.length === 0) {
        return null;
      }

      for (var i = 0; i < audio.length; i++) {
        var track = audio[i];
        if (strippedFilename === stripExtension(track.filename)) {
          return track;
        }
      }

      return null;
    }
  }]);

  return MediaFinder;
}();

function stripExtension(filename) {
  var lastDotIndex = filename.lastIndexOf('.');
  return filename.substring(0, lastDotIndex);
}
},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('./util');

module.exports = function () {
  function Tagger(mediaConfig) {
    _classCallCheck(this, Tagger);

    this.mediaConfig = mediaConfig;

    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (!video.tags) {
        video.tags = [];
      }
    }

    this.buildTagMap();
  }

  _createClass(Tagger, [{
    key: 'buildTagMap',
    value: function buildTagMap() {
      var tagMap = {};

      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var tags = video.tags;
        if (!tags) {
          continue;
        }

        for (var j = 0; j < tags.length; j++) {
          var tag = tags[j];
          var videosWithTag = tagMap[tag];
          if (!videosWithTag) {
            videosWithTag = [];
            tagMap[tag] = videosWithTag;
          }

          videosWithTag.push(video);
        }
      }

      this.tagMap = tagMap;
    }
  }, {
    key: 'videosWithTag',
    value: function videosWithTag(tag, options) {
      var videos = this.tagMap[tag] || [];

      if (options && options.shuffle) {
        videos = util.shuffle(videos);
      }

      if (options && options.limit) {
        videos = videos.slice(0, options.limit);
      }

      return videos;
    }
  }, {
    key: 'videosWithoutTag',
    value: function videosWithoutTag(tag, options) {
      var videos = [];

      var allVideos = this.mediaConfig.videos;
      for (var i = 0; i < allVideos.length; i++) {
        var video = allVideos[i];
        if (!this.videoHasTag(video, tag)) {
          videos.push(tag);
        }
      }

      if (options && options.shuffle) {
        videos = util.shuffle(videos);
      }

      if (options && options.limit) {
        videos = videos.slice(0, options.limit);
      }

      return videos;
    }
  }, {
    key: 'randomVideoWithTag',
    value: function randomVideoWithTag(tag) {
      var videos = this.videosWithTag(tag);
      return util.choice(videos);
    }
  }, {
    key: 'videoSequenceFromTagSequence',
    value: function videoSequenceFromTagSequence(tagSequence) {
      var videos = [];
      for (var i = 0; i < tagSequence.length; i++) {
        var tag = tagSequence[i];
        var video = this.randomVideoWithTag(tag);
        if (video) {
          videos.push(video);
        }
      }
      return videos;
    }
  }, {
    key: 'videoHasTag',
    value: function videoHasTag(video, tag) {
      if (!video) return false;

      var filename = video.filename || video;

      var videosWithTag = this.videosWithTag(tag);

      for (var i = 0; i < videosWithTag.length; i++) {
        if (videosWithTag[i].filename === filename) {
          return true;
        }
      }

      return false;
    }

    /// Utility Taggers

  }, {
    key: 'tagVideosWithPattern',
    value: function tagVideosWithPattern(pattern, tag) {
      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        if (video.filename.indexOf(pattern) >= 0) {
          video.tags.push(tag);
        }
      }

      this.buildTagMap();
    }
  }, {
    key: 'tagVideosWithQualitativeLength',
    value: function tagVideosWithQualitativeLength() {
      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var duration = video.duration;

        if (duration < 0.3) {
          video.tags.push('short');
          video.tags.push('short1');
        } else if (duration < 1.0) {
          video.tags.push('short');
          video.tags.push('short2');
        } else if (duration < 3.0) {
          video.tags.push('med');
          video.tags.push('med1');
        } else if (duration < 5.0) {
          video.tags.push('med');
          video.tags.push('med2');
        } else if (duration < 10.0) {
          video.tags.push('long');
          video.tags.push('long1');
        } else if (duration < 30.0) {
          video.tags.push('long');
          video.tags.push('long2');
        } else {
          video.tags.push('long');
          video.tags.push('long3');
        }
      }

      this.buildTagMap();
    }
  }]);

  return Tagger;
}();
},{"./util":4}],4:[function(require,module,exports){
"use strict";

module.exports = {
  choice: choice,
  shuffle: shuffle,
  randInt: randInt,
  splitArray: splitArray
};

function choice(arr) {
  var i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function shuffle(arr) {
  var newArray = new Array(arr.length);
  for (var i = 0; i < arr.length; i++) {
    newArray[i] = arr[i];
  }

  newArray.sort(function () {
    return 0.5 - Math.random();
  });
  return newArray;
}

function randInt(min, max) {
  if (!min) min = 1;
  if (!max) max = 1000;

  return Math.floor(Math.random() * (max - min)) + min;
}

function splitArray(arr, n) {
  var arrs = [];

  var currentArr = [];
  for (var i = 0; i < arr.length; i++) {
    currentArr.push(arr[i]);
    if (currentArr.length === n) {
      arrs.push(currentArr);
      currentArr = [];
    }
  }

  if (currentArr.length > 0) {
    arrs.push(currentArr);
  }

  return arrs;
}
},{}],5:[function(require,module,exports){
'use strict';

module.exports = {
  VideoSegment: require('./segment/video-segment'),
  ImageSegment: require('./segment/image-segment'),
  ColorSegment: require('./segment/color-segment'),
  AudioSegment: require('./segment/audio-segment'),
  TextSegment: require('./segment/text-segment'),

  SequencedSegment: require('./segment/sequenced-segment'),
  StackedSegment: require('./segment/stacked-segment'),
  finiteLoopingSegment: require('./segment/finite-looping-segment'),
  sequencedSegmentFromFrames: require('./segment/sequenced-segment-from-frames'),

  Renderer: require('./renderer/renderer'),

  Tagger: require('./etc/tagger'),
  MediaFinder: require('./etc/media-finder'),
  mediaArranger: require('./etc/media-arranger'),
  util: require('./etc/util')
};
},{"./etc/media-arranger":1,"./etc/media-finder":2,"./etc/tagger":3,"./etc/util":4,"./renderer/renderer":7,"./segment/audio-segment":10,"./segment/color-segment":11,"./segment/finite-looping-segment":12,"./segment/image-segment":13,"./segment/sequenced-segment":17,"./segment/sequenced-segment-from-frames":16,"./segment/stacked-segment":18,"./segment/text-segment":19,"./segment/video-segment":20}],6:[function(require,module,exports){
"use strict";

module.exports.setTransition = function (el, transition) {
  //el.style.setProperty('-moz-transition', transition);
  //el.style.setProperty('-ms-transition', transition);
  //el.style.setProperty('-o-transition', transition);

  el.style.webkitTransition = transition;
  el.style.transition = transition;
};
},{}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Renderer(options) {
    _classCallCheck(this, Renderer);

    this.mediaConfig = options.mediaConfig;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : 'out/';
    this.log = options.log || false;
    this.audioFadeDuration = options.audioFadeDuration;
    this.videoFadeDuration = options.videoFadeDuration;

    if (this.log) {
      console.log('frampton is starting now...');
    }
  }

  /// Scheduling

  _createClass(Renderer, [{
    key: 'scheduleSegmentRender',
    value: function scheduleSegmentRender(segment, delay) {
      // override to provide concrete implementation of actual scheduling

      // this handles associated segments 4 u
      var associatedSegments = segment.associatedSegments();
      if (associatedSegments) {
        for (var i = 0; i < associatedSegments.length; i++) {
          var associatedOffset = delay + associatedSegments[i].offset * 1000;
          this.scheduleSegmentRender(associatedSegments[i].segment, associatedOffset);
        }
      }
    }
  }, {
    key: 'insertScheduledUnit',
    value: function insertScheduledUnit(scheduledUnit, units) {
      var insertionIndex = getInsertionIndex(units, scheduledUnit, compareScheduledUnits);
      units.splice(insertionIndex, 0, scheduledUnit);
    }

    /// Rendering

  }, {
    key: 'renderVideoSegment',
    value: function renderVideoSegment() {}
  }, {
    key: 'renderImageSegment',
    value: function renderImageSegment() {}
  }, {
    key: 'renderColorSegment',
    value: function renderColorSegment() {}
  }, {
    key: 'renderAudioSegment',
    value: function renderAudioSegment() {}
  }, {
    key: 'renderTextSegment',
    value: function renderTextSegment() {}
  }, {
    key: 'renderSegment',
    value: function renderSegment(segment) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      switch (segment.segmentType) {
        case 'video':
          this.renderVideoSegment(segment, options);
          break;

        case 'image':
          this.renderImageSegment(segment, options);
          break;

        case 'color':
          this.renderColorSegment(segment, options);
          break;

        case 'audio':
          this.renderAudioSegment(segment, options);
          break;

        case 'text':
          this.renderTextSegment(segment, options);
          break;

        case 'sequence':
          this.renderSequencedSegment(segment, options);
          break;

        case 'stacked':
          this.renderStackedSegment(segment, options);
          break;

        default:
          console.log('unhandled sequence type: ' + segment.segmentType);
          break;
      }
    }
  }, {
    key: 'renderSequencedSegment',
    value: function renderSequencedSegment(sequenceSegment, _ref) {
      var _this = this;

      var _ref$offset = _ref.offset;
      var offset = _ref$offset === undefined ? 0 : _ref$offset;

      sequenceSegment.segments.forEach(function (segment, idx) {
        _this.scheduleSegmentRender(segment, offset);
        offset += segment.msDuration() + sequenceSegment.msVideoOffset();

        if (idx === 0) {
          _this.overrideOnStart(segment, function () {
            sequenceSegment.didStart();
          });
        } else if (idx === sequenceSegment.segmentCount() - 1) {
          _this.overrideOnComplete(segment, function () {
            sequenceSegment.cleanup();
          });
        }
      });
    }
  }, {
    key: 'renderStackedSegment',
    value: function renderStackedSegment(stackedSegment, _ref2) {
      var _this2 = this;

      var _ref2$offset = _ref2.offset;
      var offset = _ref2$offset === undefined ? 0 : _ref2$offset;

      stackedSegment.segments.forEach(function (segment, idx) {
        var segmentOffset = offset + stackedSegment.msSegmentOffset(idx);
        _this2.scheduleSegmentRender(segment, segmentOffset);

        if (idx === 0) {
          _this2.overrideOnStart(segment, function () {
            stackedSegment.didStart();
          });
        }
      });

      var lastSegment = stackedSegment.lastSegment();
      this.overrideOnComplete(lastSegment, function () {
        stackedSegment.cleanup();
      });
    }

    /// Utility

  }, {
    key: 'overrideOnStart',
    value: function overrideOnStart(segment, onStart) {
      var originalOnStart = segment.onStart;
      segment.onStart = function () {
        // call and reset the original
        if (originalOnStart) {
          originalOnStart();
        }
        segment.onStart = originalOnStart;

        // call the new one
        onStart();
      };
    }
  }, {
    key: 'overrideOnComplete',
    value: function overrideOnComplete(segment, onComplete) {
      var originalOnComplete = segment.onComplete;
      segment.onComplete = function () {
        // call and reset the original
        if (originalOnComplete) {
          originalOnComplete();
        }
        segment.onComplete = originalOnComplete;

        // call the new one
        onComplete();
      };
    }
  }]);

  return Renderer;
}();

function compareScheduledUnits(scheduledUnitA, scheduledUnitB) {
  var offsetA = scheduledUnitA.offset || 0;
  var offsetB = scheduledUnitB.offset || 0;

  return offsetA - offsetB;
}

// binary search baby
function getInsertionIndex(arr, element, comparator) {
  if (arr.length === 0) {
    return 0;
  }

  var low = 0;
  var high = arr.length - 1;

  while (low <= high) {
    var mid = Math.floor((low + high) / 2);
    var compareValue = comparator(arr[mid], element);
    if (compareValue < 0) {
      low = mid + 1;
    } else if (compareValue > 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  return low;
}
},{}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function ScheduledUnit(segment, offset) {
    _classCallCheck(this, ScheduledUnit);

    this.segment = segment;
    this.offset = offset;
  }

  _createClass(ScheduledUnit, [{
    key: "toString",
    value: function toString() {
      return Math.round(this.offset * 100) / 100 + ": " + this.segment.simpleName() + " for " + this.segment.getDuration();
    }
  }]);

  return ScheduledUnit;
}();
},{}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TWEEN = require('tween.js');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var dahmer = require('./dahmer');

var TimePerFrame = 16.67;

module.exports = function (_Renderer) {
  _inherits(WebRenderer, _Renderer);

  function WebRenderer(options) {
    _classCallCheck(this, WebRenderer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebRenderer).call(this, options));

    _this.timeToLoadVideo = options.timeToLoadVideo || 4000;
    _this.startDelayCorrection = options.startDelayCorrection || 1.8; // this adapts over time
    _this.startPerceptionCorrection = options.startPerceptionCorrection || 13; // this is constant

    _this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : function (filename) {
      var mediaPath = _this.mediaConfig.path;
      if (mediaPath[mediaPath.length - 1] !== '/') mediaPath += '/';
      return mediaPath + filename;
    };

    _this.domContainer = document.body;
    _this.scheduledRenders = [];
    _this.updateFunctions = [];

    _this.videosPlayed = 0;
    _this.meanStartDelay = 0;

    _this.lastUpdateTime = 0;
    _this.update(); // get the loop going
    return _this;
  }

  /// Scheduling

  _createClass(WebRenderer, [{
    key: 'update',
    value: function update(totalTime) {
      window.requestAnimationFrame(this.update.bind(this));
      TWEEN.update(totalTime);

      var now = window.performance.now();
      var timeSinceLastUpdate = now - this.lastUpdateTime;
      this.lastUpdateTime = now;

      var timeToLoad = this.timeToLoadVideo + TimePerFrame;
      var scheduledRenders = this.scheduledRenders;

      var toRender = [];
      for (var i = 0; i < scheduledRenders.length; i++) {
        var scheduledRender = scheduledRenders[i];
        var timeUntilStart = scheduledRender.offset - now;

        if (timeUntilStart < timeToLoad) {
          // start to render, and mark for removal
          toRender.push({ segment: scheduledRender.segment, options: { offset: Math.max(timeUntilStart, 0) } });
        } else {
          break; // because we sort by offset, we can break early
        }
      }

      if (toRender.length > 0) {
        // remove used-up units
        scheduledRenders.splice(0, toRender.length);

        // actually perform rendering
        for (i = 0; i < toRender.length; i++) {
          var renderModel = toRender[i];
          this.renderSegment(renderModel.segment, renderModel.options);
        }
      }

      for (i = 0; i < this.updateFunctions.length; i++) {
        this.updateFunctions[i].fn(timeSinceLastUpdate);
      }
    }
  }, {
    key: 'addUpdateFunction',
    value: function addUpdateFunction(fn) {
      var identifier = '' + Math.floor(Math.random() * 1000000000);
      this.updateFunctions.push({
        identifier: identifier,
        fn: fn
      });

      return identifier;
    }
  }, {
    key: 'removeUpdateFunctionWithIdentifier',
    value: function removeUpdateFunctionWithIdentifier(identifier) {
      var indexOfIdentifier = -1;
      for (var i = 0; i < this.updateFunctions.length; i++) {
        if (this.updateFunctions[i].identifier === identifier) {
          indexOfIdentifier = i;
          break;
        }
      }

      if (indexOfIdentifier >= 0) {
        this.updateFunctions.splice(indexOfIdentifier, 1);
      }
    }
  }, {
    key: 'scheduleSegmentRender',
    value: function scheduleSegmentRender(segment, delay) {
      _get(Object.getPrototypeOf(WebRenderer.prototype), 'scheduleSegmentRender', this).call(this, segment, delay);

      var offset = window.performance.now() + delay;
      var unit = new ScheduledUnit(segment, offset);

      this.insertScheduledUnit(unit, this.scheduledRenders);
    }

    /// Rendering

  }, {
    key: 'renderVideoSegment',
    value: function renderVideoSegment(segment, _ref) {
      var _ref$offset = _ref.offset;
      var offset = _ref$offset === undefined ? 0 : _ref$offset;

      var self = this;

      var video = document.createElement('video');
      video.preload = true;
      video.className = 'frampton-video';

      var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
      video.src = this.videoSourceMaker(filename);

      video.style.zIndex = segment.z;

      if (segment.width) {
        video.style.width = video.style.height = segment.width;
      }
      if (segment.top) {
        video.style.top = segment.top;
      }
      if (segment.left) {
        video.style.left = segment.left;
      }

      video.volume = segment.volume;
      segment.addChangeHandler('volume', function (volume) {
        video.volume = volume;
      });

      video.currentTime = segment.startTime;

      video.playbackRate = segment.playbackRate;
      segment.addChangeHandler('playbackRate', function (playbackRate) {
        video.playbackRate = playbackRate;
      });

      var displayStyle = video.style.display || 'block';
      video.style.display = 'none';
      this.domContainer.appendChild(video);

      var segmentDuration = segment.msDuration();
      var expectedStart = window.performance.now() + offset;

      var hasPlayedFirstTime = false;
      video.addEventListener('playing', function () {
        if (hasPlayedFirstTime) return;

        hasPlayedFirstTime = true;
        var now = window.performance.now();
        var startDelay = now + self.startPerceptionCorrection - expectedStart;

        var endTimeout = segmentDuration;
        if (startDelay > self.startPerceptionCorrection) {
          endTimeout -= startDelay;
        }

        setTimeout(end, endTimeout);

        self.videosPlayed += 1;
        if (self.videosPlayed === 1) {
          self.meanStartDelay = startDelay;
        } else {
          self.meanStartDelay = (self.meanStartDelay * (self.videosPlayed - 1) + startDelay) / self.videosPlayed;

          if (Math.abs(self.meanStartDelay > 1)) {
            if (self.meanStartDelay > 0.05 && self.startDelayCorrection < 3) {
              self.startDelayCorrection += 0.05;
            } else if (self.meanStartDelay < -0.05 && self.startDelayCorrection > 0.05) {
              self.startDelayCorrection -= 0.05;
            }
          }
        }

        if (self.log) {
          console.log(now + ': start ' + filename + ' | duration ' + segmentDuration + ' | start delay ' + startDelay);
          console.log('start correction ' + self.startDelayCorrection + ' | mean delay ' + self.meanStartDelay);
        }
      }, false);

      setTimeout(start, offset - this.startDelayCorrection - this.startPerceptionCorrection);

      function start() {
        video.play();

        video.style.display = displayStyle;

        var videoFadeDuration = segment.videoFadeDuration || self.videoFadeDuration;
        if (videoFadeDuration) {
          videoFadeDuration = Math.min(videoFadeDuration, segmentDuration / 2);

          video.style.opacity = 0;
          var transition = 'opacity ' + videoFadeDuration + 'ms';
          dahmer.setTransition(video, transition);

          // fade in
          setTimeout(function () {
            video.style.opacity = segment.opacity;
          }, 1);

          // fade out
          setTimeout(function () {
            video.style.opacity = 0;
          }, segmentDuration - videoFadeDuration);
        } else {
          self.setVisualSegmentOpacity(segment, video);
        }

        self.fadeAudioForVideoSegment(segment, video);

        segment.didStart();
      }

      function end() {
        if (self.log) {
          var now = window.performance.now();
          var expectedEnd = expectedStart + segmentDuration;
          console.log(now + ': finish ' + filename + ' | end delay: ' + (now - expectedEnd));
        }

        if (segment.loop) {
          video.currentTime = segment.startTime;
          setTimeout(end, segmentDuration);
        } else {
          video.parentNode.removeChild(video);
          video.src = '';
          segment.cleanup();
        }
      }
    }
  }, {
    key: 'fadeAudioForVideoSegment',
    value: function fadeAudioForVideoSegment(segment, video) {
      var audioFadeDuration = segment.audioFadeDuration || this.audioFadeDuration;
      if (audioFadeDuration) {
        var segmentDuration = segment.msDuration();
        audioFadeDuration = Math.min(audioFadeDuration, segmentDuration / 2);

        // fade in
        video.volume = 0;
        new TWEEN.Tween(video).to({ volume: segment.volume }, audioFadeDuration).start();

        setTimeout(function () {
          // fade out
          new TWEEN.Tween(video).to({ volume: 0 }, audioFadeDuration).start();
        }, segmentDuration - audioFadeDuration);
      }
    }
  }, {
    key: 'renderTextSegment',
    value: function renderTextSegment(segment, _ref2) {
      var _ref2$offset = _ref2.offset;
      var offset = _ref2$offset === undefined ? 0 : _ref2$offset;

      var self = this;

      var div = document.createElement('div');
      div.className = 'frampton-text';

      div.style.fontFamily = segment.font;
      div.style.fontSize = segment.fontSize;
      div.style.zIndex = segment.z;
      div.style.textAlign = segment.textAlignment;
      div.style.color = segment.color;

      if (segment.maxWidth) {
        div.style.maxWidth = segment.maxWidth;
      }
      if (segment.top) {
        div.style.top = segment.top;
      }
      if (segment.left) {
        div.style.left = segment.left;
      }

      div.textContent = segment.text;

      div.style.display = 'none';
      this.domContainer.appendChild(div);

      setTimeout(start, offset);
      setTimeout(end, offset + segment.msDuration());

      function start() {
        div.style.display = 'block';
        self.setVisualSegmentOpacity(segment, div);
        segment.didStart();
      }

      function end() {
        div.parentNode.removeChild(div);
        segment.cleanup();
      }
    }
  }, {
    key: 'renderColorSegment',
    value: function renderColorSegment(segment, _ref3) {
      var _ref3$offset = _ref3.offset;
      var offset = _ref3$offset === undefined ? 0 : _ref3$offset;

      var self = this;

      var div = document.createElement('div');
      div.className = 'frampton-video';

      div.style.zIndex = segment.z;

      if (segment.width) {
        div.style.width = div.style.height = segment.width;
      }
      if (segment.top) {
        div.style.top = segment.top;
      }
      if (segment.left) {
        div.style.left = segment.left;
      }

      if (segment.transitionBetweenColors) {
        div.style.transition = 'background-color 5ms';
      }

      var displayStyle = div.style.display || 'block';
      div.style.display = 'none';
      this.domContainer.appendChild(div);

      var framesDataResponseCallback;
      if (!segment.framesData) {
        if (this.log) {
          console.log('loading color frames for: ' + segment.filename);
        }
        this.getJSON(this.videoSourceMaker(segment.filename), function (framesData) {
          segment.setFramesData(framesData);

          if (framesDataResponseCallback) framesDataResponseCallback();
          framesDataResponseCallback = null;
        });
      }

      if (offset > 0) {
        setTimeout(start, offset);
      } else {
        start();
      }

      function start() {
        if (!segment.framesData) {
          framesDataResponseCallback = function framesDataResponseCallback() {
            start();
          };
          return;
        }

        if (self.log) {
          console.log('displaying colors for: ' + segment.filename);
        }

        div.style.display = displayStyle;

        self.setVisualSegmentOpacity(segment, div);

        segment.didStart();

        var msPerFrame;
        var currentFrameIndex = segment.startTime === 0 ? 0 : Math.floor(segment.startTime * 1000 / msPerFrame);
        var lastUpdateLeftoverTime = 0;

        updateMSPerFrame();
        updateColorRender(0);

        segment.addChangeHandler('playbackRate', updateMSPerFrame);

        var fnIdentifier = self.addUpdateFunction(updateColorRender);

        function updateColorRender(timeDelta) {
          var deltaWithLeftoverTime = timeDelta + lastUpdateLeftoverTime;

          var frames = Math.floor(deltaWithLeftoverTime / msPerFrame);
          currentFrameIndex += frames;

          lastUpdateLeftoverTime = deltaWithLeftoverTime - frames * msPerFrame;

          if (currentFrameIndex >= segment.numberOfColors()) {
            if (segment.loop) {
              currentFrameIndex = currentFrameIndex - segment.numberOfColors();
            } else {
              end(fnIdentifier);
              return;
            }
          }

          div.style.backgroundColor = segment.rgb(segment.getColor(currentFrameIndex));

          if (self.log) {
            console.log(window.performance.now() + ': displaying frame ' + currentFrameIndex + ' for color segment - ' + segment.simpleName());
          }
        }

        function updateMSPerFrame() {
          msPerFrame = segment.msDuration() / segment.numberOfColors();
        }

        if (self.log) {
          console.log(window.performance.now() + ': started color segment - ' + segment.simpleName());
        }
      }

      function end(fnIdentifier) {
        div.parentNode.removeChild(div);
        segment.cleanup();

        self.removeUpdateFunctionWithIdentifier(fnIdentifier);

        if (self.log) {
          console.log(window.performance.now() + ': finished color segment - ' + segment.simpleName());
        }
      }
    }
  }, {
    key: 'renderAudioSegment',
    value: function renderAudioSegment(segment, options) {
      if (segment.preferHTMLAudio || options.preferHTMLAudio || this.preferHTMLAudio) {
        this.renderAudioSegmentWithHTMLAudio(segment, options);
      } else {
        this.renderAudioSegmentWithWebAudio(segment, options);
      }
    }

    // helpful web audio documentation: http://www.html5rocks.com/en/tutorials/webaudio/intro/

  }, {
    key: 'renderAudioSegmentWithWebAudio',
    value: function renderAudioSegmentWithWebAudio(segment, _ref4) {
      var _ref4$offset = _ref4.offset;
      var offset = _ref4$offset === undefined ? 0 : _ref4$offset;

      var self = this;

      var Context = window.AudioContext || window.webkitAudioContext;
      var audioContext = new Context();
      var source = audioContext.createBufferSource();
      var sourceStartTime = audioContext.currentTime + offset / 1000;

      var gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      segment.addChangeHandler('volume', function (volume) {
        gainNode.gain.value = volume;
      });

      if (segment.fadeInDuration) {
        gainNode.gain.linearRampToValueAtTime(0, sourceStartTime);
        gainNode.gain.linearRampToValueAtTime(segment.volume, sourceStartTime + segment.fadeInDuration);
      } else {
        gainNode.gain.value = segment.volume;
      }

      if (segment.fadeOutDuration) {
        gainNode.gain.linearRampToValueAtTime(segment.volume, sourceStartTime + segment.getDuration() - segment.fadeOutDuration);
        gainNode.gain.linearRampToValueAtTime(0, sourceStartTime + segment.getDuration());
      }

      source.start(sourceStartTime, segment.startTime, segment.getDuration());

      var request = new XMLHttpRequest();
      request.open('GET', this.videoSourceMaker(segment.filename), true);
      request.responseType = 'arraybuffer';

      request.onload = function () {
        var audioData = request.response;

        audioContext.decodeAudioData(audioData, function (buffer) {
          source.buffer = buffer;
          source.connect(gainNode);

          source.loop = segment.loop;
          if (segment.loop) {
            source.loopStart = segment.startTime;
            source.loopEnd = segment.endTime();
          }

          source.playbackRate.value = segment.playbackRate;
          segment.addChangeHandler('playbackRate', function (playbackRate) {
            source.playbackRate.value = playbackRate;
          });
        }, function (e) {
          if (self.log) {
            console.log('audio decoding erorr: ' + e.err);
          }
        });
      };

      request.send();
    }
  }, {
    key: 'renderAudioSegmentWithHTMLAudio',
    value: function renderAudioSegmentWithHTMLAudio(segment, _ref5) {
      var _ref5$offset = _ref5.offset;
      var offset = _ref5$offset === undefined ? 0 : _ref5$offset;

      var self = this;

      var audio = document.createElement('audio');
      audio.preload = true;
      audio.src = this.videoSourceMaker(segment.filename);
      audio.currentTime = segment.startTime;
      audio.playbackRate = segment.playbackRate;
      segment.addChangeHandler('playbackRate', function (playbackRate) {
        audio.playbackRate = playbackRate;
      });
      audio.volume = segment.volume;
      segment.addChangeHandler('volume', function (volume) {
        audio.volume = volume;
      });

      var segmentDuration = segment.msDuration();
      var expectedStart = window.performance.now() + offset;

      audio.addEventListener('playing', function () {
        var now = window.performance.now();
        var startDelay = now + self.startPerceptionCorrection - expectedStart;

        var endTimeout = segmentDuration;
        if (startDelay > self.startPerceptionCorrection) {
          endTimeout -= startDelay;
        }

        setTimeout(end, endTimeout);

        if (self.log) {
          console.log('audio is playing for ' + segment.filename);
        }
      }, false);

      setTimeout(start, offset - this.startPerceptionCorrection);

      function start() {
        audio.play();

        var fadeInDuration = 1000 * segment.fadeInDuration || self.audioFadeDuration;
        if (fadeInDuration) {
          fadeInDuration = Math.min(fadeInDuration, segmentDuration / 2);

          audio.volume = 0;
          new TWEEN.Tween(audio).to({ volume: segment.volume }, fadeInDuration).start();
        }

        var fadeOutDuration = 1000 * segment.fadeOutDuration || self.audioFadeDuration;
        if (fadeOutDuration) {
          setTimeout(function () {
            new TWEEN.Tween(audio).to({ volume: 0 }, fadeOutDuration).start();
          }, segmentDuration - fadeOutDuration);
        }

        if (self.log) {
          console.log('started playing audio for: ' + segment.filename);
        }

        segment.didStart();
      }

      function end() {
        if (segment.loop) {
          audio.pause();
          audio.currentTime = segment.startTime;
          audio.play();
          setTimeout(end, segmentDuration);
        } else {
          audio.src = '';
          segment.cleanup();
        }
      }
    }

    /// Rendering Helpers

  }, {
    key: 'setVisualSegmentOpacity',
    value: function setVisualSegmentOpacity(segment, el) {
      if (segment.opacity !== 1.0) {
        el.style.opacity = segment.opacity;
      }
      segment.addChangeHandler('opacity', function (opacity) {
        el.style.opacity = opacity;
      });
    }
  }, {
    key: 'getJSON',
    value: function getJSON(url, callback) {
      if (!callback) return;

      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function () {
        var data = JSON.parse(request.responseText);
        callback(data);
      };

      request.send();
    }
  }]);

  return WebRenderer;
}(Renderer);
},{"./dahmer":6,"./renderer":7,"./scheduled-unit":8,"tween.js":24}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MediaSegment = require('./media-segment');

/// Play some audio!!
/// Dynamic properties on web: volume
module.exports = function (_MediaSegment) {
  _inherits(AudioSegment, _MediaSegment);

  function AudioSegment(options) {
    _classCallCheck(this, AudioSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioSegment).call(this, options));

    _this.segmentType = 'audio';

    _this.volume = options.volume || 0.8;
    _this.fadeInDuration = options.fadeInDuration;
    _this.fadeOutDuration = options.fadeOutDuration || _this.fadeInDuration;
    return _this;
  }

  _createClass(AudioSegment, [{
    key: 'copy',
    value: function copy(audioSegment) {
      _get(Object.getPrototypeOf(AudioSegment.prototype), 'copy', this).call(this, audioSegment);

      this.volume = audioSegment.volume;
      this.fadeInDuration = audioSegment.fadeInDuration;
      this.fadeOutDuration = audioSegment.fadeOutDuration;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new AudioSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      this.volume = volume;

      this.notifyChangeHandlers('volume', volume);

      return this;
    }
  }, {
    key: 'setFadeDuration',
    value: function setFadeDuration(fadeDuration) {
      return this.setFadeInDuration(fadeDuration).setFadeOutDuration(fadeDuration);
    }
  }, {
    key: 'setFadeInDuration',
    value: function setFadeInDuration(fadeInDuration) {
      this.fadeInDuration = fadeInDuration;

      return this;
    }
  }, {
    key: 'setFadeOutDuration',
    value: function setFadeOutDuration(fadeOutDuration) {
      this.fadeOutDuration = fadeOutDuration;

      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'audio - ' + this.filename;
    }
  }]);

  return AudioSegment;
}(MediaSegment);
},{"./media-segment":14}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');

module.exports = function (_VisualSegment) {
  _inherits(ColorSegment, _VisualSegment);

  function ColorSegment(options) {
    _classCallCheck(this, ColorSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ColorSegment).call(this, options));

    _this.segmentType = 'color';

    // TODO: abstract this into FramesSegment
    _this.fps = options.fps;
    _this.numberOfFrames = options.numberOfFrames;
    _this.framesData = options.framesData;

    _this.transitionBetweenColors = options.transitionBetweenColors || false;
    return _this;
  }

  _createClass(ColorSegment, [{
    key: 'copy',
    value: function copy(colorSegment) {
      _get(Object.getPrototypeOf(ColorSegment.prototype), 'copy', this).call(this, colorSegment);

      this.fps = colorSegment.fps;
      this.numberOfFrames = colorSegment.numberOfFrames;
      this.framesData = colorSegment.framesData;
      this.transitionBetweenColors = colorSegment.transitionBetweenColors;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ColorSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setColors',
    value: function setColors(colors) {
      this.colors = colors;
      return this;
    }
  }, {
    key: 'setFramesData',
    value: function setFramesData(framesData) {
      this.framesData = framesData.frames ? framesData.frames : framesData;
      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'color - ' + this.filename;
    }
  }, {
    key: 'numberOfColors',
    value: function numberOfColors() {
      if (this.numberOfFrames) {
        return this.numberOfFrames;
      }

      return this.framesData ? this.framesData.length : 0;
    }
  }, {
    key: 'getColor',
    value: function getColor(index) {
      if (!this.framesData) {
        return null;
      }

      var colors = this.framesData[index].colors;
      return colors.dominant;
    }
  }, {
    key: 'getPalette',
    value: function getPalette(index) {
      if (!this.framesData) {
        return null;
      }

      var colors = this.framesData[index].colors;
      return colors.palette;
    }
  }, {
    key: 'rgb',
    value: function rgb(color) {
      if (!color) return 'rgb(0, 0, 0)';

      return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    }
  }]);

  return ColorSegment;
}(VisualSegment);
},{"./visual-segment":21}],12:[function(require,module,exports){
'use strict';

var SequencedSegment = require('./sequenced-segment');

module.exports = function finiteLoopingSegment(segment) {
  var timesToLoop = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  // create the list of cloned segments to loop
  var clonedSegments = [];
  for (var i = 0; i < timesToLoop; i++) {
    clonedSegments.push(segment.clone());
  }

  options.segments = clonedSegments;

  // create the looping sequence segment
  var loopingSegment = new SequencedSegment(options);

  return loopingSegment;
};
},{"./sequenced-segment":17}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');

module.exports = function (_VisualSegment) {
  _inherits(ImageSegment, _VisualSegment);

  function ImageSegment(options) {
    _classCallCheck(this, ImageSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageSegment).call(this, options));

    _this.segmentType = 'image';
    return _this;
  }

  _createClass(ImageSegment, [{
    key: 'copy',
    value: function copy(imageSegment) {
      _get(Object.getPrototypeOf(ImageSegment.prototype), 'copy', this).call(this, imageSegment);

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ImageSegment({}).copy(this);
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'image - ' + this.filename;
    }
  }]);

  return ImageSegment;
}(VisualSegment);
},{"./visual-segment":21}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

/// abstract superclass for VisualSegment, AudioSegment
/// Dynamic properties on web: playbackRate
module.exports = function (_Segment) {
  _inherits(MediaSegment, _Segment);

  function MediaSegment(options) {
    _classCallCheck(this, MediaSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MediaSegment).call(this, options));

    _this.segmentType = 'media';

    // media config
    _this.filename = options.filename;
    _this.mediaDuration = options.duration;

    // segment config
    _this.startTime = options.startTime || 0;
    _this.duration = _this.mediaDuration - _this.startTime;
    _this.playbackRate = options.playbackRate || 1.0;
    _this.loop = options.loop || false;
    return _this;
  }

  _createClass(MediaSegment, [{
    key: 'copy',
    value: function copy(mediaSegment) {
      _get(Object.getPrototypeOf(MediaSegment.prototype), 'copy', this).call(this, mediaSegment);

      this.filename = mediaSegment.filename;
      this.mediaDuration = mediaSegment.mediaDuration;

      this.startTime = mediaSegment.startTime;
      this.duration = mediaSegment.duration;
      this.playbackRate = mediaSegment.playbackRate;
      this.loop = mediaSegment.loop;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new MediaSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setFilename',
    value: function setFilename(filename) {
      this.filename = filename;
      return this;
    }
  }, {
    key: 'setEndTime',
    value: function setEndTime(endTime) {
      this.startTime = endTime - this.duration;
      return this;
    }
  }, {
    key: 'setStartTime',
    value: function setStartTime(startTime) {
      this.startTime = startTime;
      this.duration = Math.min(this.duration, this.mediaDuration - startTime);
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration, startAtEnd) {
      this.duration = Math.min(duration, this.mediaDuration);

      var maximalStartTime = this.mediaDuration - this.duration;
      if (startAtEnd || this.startTime > maximalStartTime) {
        this.startTime = maximalStartTime;
      }

      return this;
    }
  }, {
    key: 'setPlaybackRate',
    value: function setPlaybackRate(playbackRate) {
      this.playbackRate = playbackRate;

      this.notifyChangeHandlers('playbackRate', playbackRate);

      return this;
    }
  }, {
    key: 'setLoop',
    value: function setLoop(loop) {
      this.loop = loop;

      return this;
    }

    // Generators

  }, {
    key: 'extensionlessName',
    value: function extensionlessName() {
      return this.filename.substring(0, this.filename.lastIndexOf('.'));
    }
  }, {
    key: 'endTime',
    value: function endTime() {
      return this.startTime + this.duration;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration / this.playbackRate;
    }
  }, {
    key: 'msStartTime',
    value: function msStartTime() {
      return this.startTime * 1000;
    }
  }, {
    key: 'msEndTime',
    value: function msEndTime() {
      return this.endTime() * 1000;
    }
  }]);

  return MediaSegment;
}(Segment);
},{"./segment":15}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Segment(options) {
    _classCallCheck(this, Segment);

    this.onStart = options.onStart;
    this.onComplete = options.onComplete;

    this.changeHandlers = {};
  }

  _createClass(Segment, [{
    key: 'copy',
    value: function copy(segment) {
      this.onStart = segment.onStart;
      this.onComplete = segment.onComplete;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new Segment({}).copy(this);
    }

    /// Start and Finish

  }, {
    key: 'didStart',
    value: function didStart() {
      if (this.onStart) {
        this.onStart();
        this.onStart = undefined;
      }
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      if (this.onComplete) {
        this.onComplete();
        this.onComplete = undefined;
      }
    }

    /// Change Notification

  }, {
    key: 'addChangeHandler',
    value: function addChangeHandler(propertyName, fn) {
      var handlers = this.getChangeHandlers(propertyName);
      handlers.push(fn);
    }
  }, {
    key: 'notifyChangeHandlers',
    value: function notifyChangeHandlers(propertyName, value) {
      var handlers = this.getChangeHandlers(propertyName);

      for (var i = 0; i < handlers.length; i++) {
        handlers[i](value);
      }
    }
  }, {
    key: 'getChangeHandlers',
    value: function getChangeHandlers(propertyName) {
      var handlers = this.changeHandlers[propertyName];
      if (handlers !== undefined) {
        return handlers;
      }

      handlers = [];
      this.changeHandlers[propertyName] = handlers;

      return handlers;
    }

    /// Generators

  }, {
    key: 'getDuration',
    value: function getDuration() {
      return 0;
    }
  }, {
    key: 'msDuration',
    value: function msDuration() {
      return this.getDuration() * 1000;
    }
  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'plain segment';
    }
  }, {
    key: 'associatedSegments',
    value: function associatedSegments() {
      return null;
    }
  }]);

  return Segment;
}();
},{}],16:[function(require,module,exports){
'use strict';

var VideoSegment = require('./video-segment');
var ImageSegment = require('./image-segment');
var SequencedSegment = require('./sequenced-segment');

module.exports = function sequencedSegmentFromFrames(framesData) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var firstFrameIndex = options.firstFrameIndex || 0;
  var numberOfFrames = options.numberOfFrames || framesData.frames.length;
  var cutVideos = options.cutVideos || false;

  var frameDuration = 1 / framesData.fps;

  // create list of video segments, each segment with duration equal to one frame
  var segments = [];
  for (var i = firstFrameIndex; i < numberOfFrames; i++) {
    var frame = framesData.frames[i];

    if (cutVideos) {
      var videoSegment = new VideoSegment(framesData);
      videoSegment.setStartTime(frame.timecode).setDuration(frameDuration);

      segments.push(videoSegment);
    } else {
      var imageSegment = new ImageSegment({
        filename: frame.imageFilename,
        duration: frameDuration
      });

      segments.push(imageSegment);
    }
  }

  // put segments in given options array to allow arbitrary options-passing to SequencedSegment
  options.segments = segments;

  // create the looping sequence segment
  var sequencedSegment = new SequencedSegment(options);

  return sequencedSegment;
};
},{"./image-segment":13,"./sequenced-segment":17,"./video-segment":20}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(SequencedSegment, _Segment);

  function SequencedSegment() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SequencedSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SequencedSegment).call(this, options));

    _this.segmentType = 'sequence';
    _this.segments = options.segments || [];
    _this.videoOffset = options.videoOffset || 0;
    return _this;
  }

  _createClass(SequencedSegment, [{
    key: 'copy',
    value: function copy(sequencedSegment, recursive) {
      _get(Object.getPrototypeOf(SequencedSegment.prototype), 'copy', this).call(this, sequencedSegment);

      this.segments = [];
      for (var i = 0; i < sequencedSegment.segments.length; i++) {
        var segment = sequencedSegment.segments[i];
        this.segments.push(recursive ? segment.clone() : segment);
      }

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new SequencedSegment().copy(this, true);
    }

    /// Generators

  }, {
    key: 'getSegment',
    value: function getSegment(index) {
      return this.segments[index];
    }
  }, {
    key: 'segmentCount',
    value: function segmentCount() {
      return this.segments.length;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      var offset = 0;
      for (var i = 0; i < this.segments.length - 1; i++) {
        offset += this.segments[i].getDuration() - this.videoOffset;
      }

      var duration = offset + this.segments[this.segments.length - 1].getDuration();

      return duration;
    }
  }, {
    key: 'msVideoOffset',
    value: function msVideoOffset() {
      return this.videoOffset * 1000;
    }
  }]);

  return SequencedSegment;
}(Segment);
},{"./segment":15}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(StackedSegment, _Segment);

  function StackedSegment() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, StackedSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StackedSegment).call(this, options));

    _this.segmentType = 'stacked';
    _this.segments = options.segments || [];
    _this.stackAllowance = options.stackAllowance || 0.25;
    _this.segmentOffsets = [];
    _this.segmentEndTimes = [];

    var accumulatedOffset = 0;
    for (var i = 0; i < _this.segments.length; i++) {
      _this.segmentOffsets.push(accumulatedOffset);

      var duration = _this.segments[i].getDuration();
      _this.segmentEndTimes.push(accumulatedOffset + duration);

      accumulatedOffset += Math.random() * duration * _this.stackAllowance * 2 + duration * (1 - _this.stackAllowance);
    }
    return _this;
  }

  _createClass(StackedSegment, [{
    key: 'copy',
    value: function copy(stackedSegment, recursive) {
      _get(Object.getPrototypeOf(StackedSegment.prototype), 'copy', this).call(this, stackedSegment);

      this.stackAllowance = stackedSegment.stackAllowance;

      for (var i = 0; i < stackedSegment.segments.length; i++) {
        var segment = stackedSegment.segments[i];
        this.segments.push(recursive ? segment.clone() : segment);

        this.segmentOffsets.push(stackedSegment.segmentOffsets[i]);
        this.segmentEndTimes.push(stackedSegment.segmentEndTimes[i]);
      }

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new StackedSegment().copy(this, true);
    }

    /// Generators

  }, {
    key: 'msSegmentOffset',
    value: function msSegmentOffset(idx) {
      return this.segmentOffsets[idx] * 1000;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return Math.max.apply(null, this.segmentEndTimes);
    }
  }, {
    key: 'lastSegment',
    value: function lastSegment() {
      var maxEndTime = Math.max.apply(null, this.segmentEndTimes);
      var maxEndTimeIndex = this.segmentEndTimes.indexOf(maxEndTime) || this.segmentEndTimes.length - 1;
      return this.segments[maxEndTimeIndex];
    }
  }]);

  return StackedSegment;
}(Segment);
},{"./segment":15}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(TextSegment, _Segment);

  function TextSegment(options) {
    _classCallCheck(this, TextSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TextSegment).call(this, options));

    _this.segmentType = 'text';

    _this.text = options.text || '';
    _this.duration = options.duration || 5;
    _this.font = options.font || 'Times New Roman';
    _this.fontSize = options.fontSize || '24px';
    _this.textAlignment = options.textAlignment || 'left';
    _this.color = options.color || 'black';
    _this.top = options.top;
    _this.left = options.left;
    _this.maxWidth = options.maxWidth;
    _this.z = options.z || 0;
    _this.opacity = options.opacity || 1.0;
    return _this;
  }

  _createClass(TextSegment, [{
    key: 'copy',
    value: function copy(textSegment) {
      _get(Object.getPrototypeOf(TextSegment.prototype), 'copy', this).call(this, textSegment);

      this.text = textSegment.text;
      this.duration = textSegment.duration;
      this.font = textSegment.font;
      this.fontSize = textSegment.fontSize;
      this.textAlignment = textSegment.textAlignment;
      this.color = textSegment.color;
      this.top = textSegment.top;
      this.left = textSegment.left;
      this.maxWidth = textSegment.maxWidth;
      this.z = textSegment.z;
      this.opacity = textSegment.opacity;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new TextSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setText',
    value: function setText(text) {
      this.text = text;
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration) {
      this.duration = duration;
      return this;
    }
  }, {
    key: 'setFont',
    value: function setFont(font) {
      this.font = font;
      return this;
    }
  }, {
    key: 'setFontSize',
    value: function setFontSize(fontSize) {
      this.fontSize = fontSize;
      return this;
    }
  }, {
    key: 'setTextAlignment',
    value: function setTextAlignment(textAlignment) {
      this.textAlignment = textAlignment;
      return this;
    }
  }, {
    key: 'setColor',
    value: function setColor(color) {
      this.color = color;
      return this;
    }
  }, {
    key: 'setTop',
    value: function setTop(top) {
      this.top = top;
      return this;
    }
  }, {
    key: 'setLeft',
    value: function setLeft(left) {
      this.left = left;
      return this;
    }
  }, {
    key: 'setMaxWidth',
    value: function setMaxWidth(maxWidth) {
      this.maxWidth = maxWidth;
      return this;
    }

    // Generators

  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration;
    }
  }]);

  return TextSegment;
}(Segment);
},{"./segment":15}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');
var AudioSegment = require('./audio-segment');

module.exports = function (_VisualSegment) {
  _inherits(VideoSegment, _VisualSegment);

  function VideoSegment(options) {
    _classCallCheck(this, VideoSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VideoSegment).call(this, options));

    _this.segmentType = 'video';

    _this.audioFadeDuration = options.audioFadeDuration || 0;
    _this.videoFadeDuration = options.videoFadeDuration || 0;

    _this.audioHandleMedia = options.audioHandleMedia;
    _this.audioHandleSegmentOptions = options.audioHandleSegmentOptions || {};
    _this.audioHandleFadeDuration = options.audioHandleFadeDuration || 0.25;
    _this.audioHandleStartTimeOffset = options.audioHandleStartTimeOffset || 0.0;

    if (_this.audioHandleMedia) {
      _this.volume = 0;
    } else if (options.volume && !isNaN(parseFloat(options.volume))) {
      _this.volume = options.volume;
    } else {
      _this.volume = 1.0;
    }
    return _this;
  }

  _createClass(VideoSegment, [{
    key: 'copy',
    value: function copy(videoSegment) {
      _get(Object.getPrototypeOf(VideoSegment.prototype), 'copy', this).call(this, videoSegment);

      this.audioFadeDuration = videoSegment.audioFadeDuration;
      this.videoFadeDuration = videoSegment.videoFadeDuration;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new VideoSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setAudioFadeDuration',
    value: function setAudioFadeDuration(audioFadeDuration) {
      this.audioFadeDuration = audioFadeDuration;
      return this;
    }
  }, {
    key: 'setVideoFadeDuration',
    value: function setVideoFadeDuration(videoFadeDuration) {
      this.videoFadeDuration = videoFadeDuration;
      return this;
    }
  }, {
    key: 'setAudioHandleMedia',
    value: function setAudioHandleMedia(audioHandleMedia) {
      this.audioHandleMedia = audioHandleMedia;
      this.setVolume(0);
      return this;
    }
  }, {
    key: 'setAudioHandleFadeDuration',
    value: function setAudioHandleFadeDuration(audioHandleFadeDuration) {
      this.audioHandleFadeDuration = audioHandleFadeDuration;
      return this;
    }
  }, {
    key: 'setAudioHandleStartTimeOffset',
    value: function setAudioHandleStartTimeOffset(audioHandleStartTimeOffset) {
      this.audioHandleStartTimeOffset = audioHandleStartTimeOffset;
      return this;
    }
  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      this.volume = volume;

      this.notifyChangeHandlers('volume', volume);

      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'video - ' + this.filename;
    }
  }, {
    key: 'associatedSegments',
    value: function associatedSegments() {
      if (!this.audioHandleMedia) {
        return null;
      }

      var audioHandleOptions = this.audioHandleSegmentOptions;
      for (var key in this.audioHandleMedia) {
        if (this.audioHandleMedia.hasOwnProperty(key)) {
          audioHandleOptions[key] = this.audioHandleMedia[key];
        }
      }

      var audioHandleSegment = new AudioSegment(audioHandleOptions);

      audioHandleSegment.setStartTime(this.startTime + this.audioHandleStartTimeOffset).setDuration(this.getDuration() + this.audioHandleFadeDuration * 2).setFadeDuration(this.audioHandleFadeDuration).setPlaybackRate(this.playbackRate).setLoop(this.loop);

      return [{
        segment: audioHandleSegment,
        offset: -this.audioHandleFadeDuration
      }];
    }
  }]);

  return VideoSegment;
}(VisualSegment);
},{"./audio-segment":10,"./visual-segment":21}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MediaSegment = require('./media-segment');

/// abstract superclass for Video, Color, Image
/// Dynamic properties on web: opacity
module.exports = function (_MediaSegment) {
  _inherits(VisualSegment, _MediaSegment);

  function VisualSegment(options) {
    _classCallCheck(this, VisualSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VisualSegment).call(this, options));

    _this.segmentType = 'visual';

    _this.z = options.z || 0;
    _this.opacity = options.opacity || 1.0;
    _this.width = options.width;
    _this.top = options.top;
    _this.left = options.left;
    return _this;
  }

  _createClass(VisualSegment, [{
    key: 'copy',
    value: function copy(visualSegment) {
      _get(Object.getPrototypeOf(VisualSegment.prototype), 'copy', this).call(this, visualSegment);

      this.z = visualSegment.z;
      this.opacity = visualSegment.opacity;
      this.width = visualSegment.width;
      this.left = visualSegment.left;
      this.top = visualSegment.top;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new VisualSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setOpacity',
    value: function setOpacity(opacity) {
      this.opacity = opacity;
      this.notifyChangeHandlers('opacity', opacity);
      return this;
    }
  }, {
    key: 'setLeft',
    value: function setLeft(left) {
      this.left = left;
      this.notifyChangeHandlers('left', left);
      return this;
    }
  }, {
    key: 'setTop',
    value: function setTop(top) {
      this.top = top;
      this.notifyChangeHandlers('top', top);
      return this;
    }
  }, {
    key: 'setWidth',
    value: function setWidth(width) {
      this.width = width;
      this.notifyChangeHandlers('width', width);
      return this;
    }
  }, {
    key: 'setZ',
    value: function setZ(z) {
      this.z = z;
      this.notifyChangeHandlers('z', z);
      return this;
    }
  }]);

  return VisualSegment;
}(MediaSegment);
},{"./media-segment":14}],22:[function(require,module,exports){
'use strict';

var frampton = require('./frampton');

frampton.WebRenderer = require('./renderer/web-renderer');

module.exports = frampton;
},{"./frampton":5,"./renderer/web-renderer":9}],23:[function(require,module,exports){
/**
 * Natural Compare
 * https://github.com/woollybogger/string-natural-compare
 *
 * @version 1.1.1
 * @copyright 2015 Nathan Woltman
 * @license MIT https://github.com/woollybogger/string-natural-compare/blob/master/LICENSE.txt
 */

(function() {
  'use strict';

  var alphabet;
  var alphabetIndexMap;
  var alphabetIndexMapLength = 0;

  function isNumberCode(code) {
    return code >= 48 && code <= 57;
  }

  function naturalCompare(a, b) {
    var lengthA = (a += '').length;
    var lengthB = (b += '').length;
    var aIndex = 0;
    var bIndex = 0;
    var alphabetIndexA;
    var alphabetIndexB;

    while (aIndex < lengthA && bIndex < lengthB) {
      var charCodeA = a.charCodeAt(aIndex);
      var charCodeB = b.charCodeAt(bIndex);

      if (isNumberCode(charCodeA)) {
        if (!isNumberCode(charCodeB)) {
          return charCodeA - charCodeB;
        }

        var numStartA = aIndex;
        var numStartB = bIndex;

        while (charCodeA === 48 && ++numStartA < lengthA) {
          charCodeA = a.charCodeAt(numStartA);
        }
        while (charCodeB === 48 && ++numStartB < lengthB) {
          charCodeB = b.charCodeAt(numStartB);
        }

        var numEndA = numStartA;
        var numEndB = numStartB;

        while (numEndA < lengthA && isNumberCode(a.charCodeAt(numEndA))) {
          ++numEndA;
        }
        while (numEndB < lengthB && isNumberCode(b.charCodeAt(numEndB))) {
          ++numEndB;
        }

        var numLengthA = numEndA - numStartA;
        var numLengthB = numEndB - numStartB;

        if (numLengthA < numLengthB) {
          return -1;
        }
        if (numLengthA > numLengthB) {
          return 1;
        }

        if (numLengthA) {
          var numA = a.slice(numStartA, numEndA);
          var numB = b.slice(numStartB, numEndB);

          if (numA < numB) {
            return -1;
          }
          if (numA > numB) {
            return 1;
          }
        }

        aIndex = numEndA;
        bIndex = numEndB;
        continue;
      }

      if (charCodeA !== charCodeB) {
        if (
          alphabetIndexMapLength &&
          charCodeA < alphabetIndexMapLength &&
          charCodeB < alphabetIndexMapLength &&
          (alphabetIndexA = alphabetIndexMap[charCodeA]) !== -1 &&
          (alphabetIndexB = alphabetIndexMap[charCodeB]) !== -1
        ) {
          return alphabetIndexA - alphabetIndexB;
        }

        return charCodeA - charCodeB;
      }

      ++aIndex;
      ++bIndex;
    }

    return lengthA - lengthB;
  }

  Object.defineProperties(String, {
    alphabet: {
      get: function() {
        return alphabet;
      },
      set: function(value) {
        alphabet = value;
        alphabetIndexMap = [];
        var i = 0;
        if (alphabet) {
          for (; i < alphabet.length; i++) {
            alphabetIndexMap[alphabet.charCodeAt(i)] = i;
          }
        }
        alphabetIndexMapLength = alphabetIndexMap.length;
        for (i = 0; i < alphabetIndexMapLength; i++) {
          if (i in alphabetIndexMap) continue;
          alphabetIndexMap[i] = -1;
        }
      },
    },
    naturalCompare: {
      value: naturalCompare,
      configurable: true,
      writable: true,
    },
    naturalCaseCompare: {
      value: function(a, b) {
        return naturalCompare(('' + a).toLowerCase(), ('' + b).toLowerCase());
      },
      configurable: true,
      writable: true,
    },
  });

})();

},{}],24:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Include a performance.now polyfill
(function () {

	if ('performance' in window === false) {
		window.performance = {};
	}

	// IE 8
	Date.now = (Date.now || function () {
		return new Date().getTime();
	});

	if ('now' in window.performance === false) {
		var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
		                                                                                    : Date.now();

		window.performance.now = function () {
			return Date.now() - offset;
		};
	}

})();

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : window.performance.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time)) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();

TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for (var field in object) {
		_valuesStart[field] = parseFloat(object[field], 10);
	}

	this.to = function (properties, duration) {

		if (duration !== undefined) {
			_duration = duration;
		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object);
			}

			_onStartCallbackFired = true;

		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.startsWith('+') || end.startsWith('-')) {
						end = start + parseFloat(end, 10);
					} else {
						end = parseFloat(end, 10);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if (_onCompleteCallback !== null) {
					_onCompleteCallback.call(_object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

		},

		Out: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

		},

		InOut: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			if ((k *= 2) < 1) {
				return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
			}

			return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return TWEEN;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);

},{}],25:[function(require,module,exports){

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

var numberOfRows = 5;
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

  var duration = Math.max(el.duration / 1000, 0.7);
  segment.setDuration(duration);

  var notePercent = noteNumberRange.getPercent(el.noteNumber) * 100;
  var row = Math.floor(Math.floor(notePercent) % numberOfRows);
  var column = Math.floor(Math.floor(notePercent) % numberOfColumns);

  var volume = Math.min(1, (el.velocity + 1) / 128);
  segment.setVolume(volume);

  var top = noteNumberRange.getPercent(el.noteNumber) * 85 - 10; (row / numberOfRows) * 100;
  segment.setTop(top + '%');

  var left = (column / numberOfColumns) * 85 - 4 ;
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

},{"../../frampton/dist/web-frampton":22,"../piano_long.json":41,"../turc.json":42,"tonal":40}],26:[function(require,module,exports){
'use strict'

// shorthand tonal notation (with quality after number)
var IVL_TNL = '([-+]?)(\\d+)(d{1,4}|m|M|P|A{1,4})'
// standard shorthand notation (with quality before number)
var IVL_STR = '(AA|A|P|M|m|d|dd)([-+]?)(\\d+)'
var COMPOSE = '(?:(' + IVL_TNL + ')|(' + IVL_STR + '))'
var IVL_REGEX = new RegExp('^' + COMPOSE + '$')

/**
 * Parse a string with an interval in [shorthand notation](https://en.wikipedia.org/wiki/Interval_(music)#Shorthand_notation)
 * and returns an object with interval properties
 *
 * @param {String} str - the string with the interval
 * @return {Object} an object properties or null if not valid interval string
 * The returned object contains:
 * - `num`: the interval number
 * - `q`: the interval quality string (M is major, m is minor, P is perfect...)
 * - `simple`: the simplified number (from 1 to 7)
 * - `dir`: the interval direction (1 ascending, -1 descending)
 * - `type`: the interval type (P is perfectable, M is majorable)
 * - `alt`: the alteration, a numeric representation of the quality
 * - `oct`: the number of octaves the interval spans. 0 for simple intervals.
 * - `size`: the size of the interval in semitones
 * @example
 * var parse = require('interval-notation').parse
 * parse('M3')
 * // => { num: 3, q: 'M', dir: 1, simple: 3,
 * //      type: 'M', alt: 0, oct: 0, size: 4 }
 */
function parse (str) {
  if (typeof str !== 'string') return null
  var m = IVL_REGEX.exec(str)
  if (!m) return null
  var i = { num: +(m[3] || m[8]), q: m[4] || m[6] }
  i.dir = (m[2] || m[7]) === '-' ? -1 : 1
  var step = (i.num - 1) % 7
  i.simple = step + 1
  i.type = TYPES[step]
  i.alt = qToAlt(i.type, i.q)
  i.oct = Math.floor((i.num - 1) / 7)
  i.size = i.dir * (SIZES[step] + i.alt + 12 * i.oct)
  return i
}
var SIZES = [0, 2, 4, 5, 7, 9, 11]

var TYPES = 'PMMPPMM'
/**
 * Get the type of interval. Can be perfectavle ('P') or majorable ('M')
 * @param {Integer} num - the interval number
 * @return {String} `P` if it's perfectable, `M` if it's majorable.
 */
function type (num) {
  return TYPES[(num - 1) % 7]
}

function dirStr (dir) { return dir === -1 ? '-' : '' }
function num (simple, oct) { return simple + 7 * oct }

/**
 * Build a shorthand interval notation string from properties.
 *
 * @param {Integer} simple - the interval simple number (from 1 to 7)
 * @param {Integer} alt - the quality expressed in numbers. 0 means perfect
 * or major, depending of the interval number.
 * @param {Integer} oct - the number of octaves the interval spans.
 * 0 por simple intervals. Positive number.
 * @param {Integer} dir - the interval direction: 1 ascending, -1 descending.
 * @example
 * var interval = require('interval-notation')
 * interval.shorthand(3, 0, 0, 1) // => 'M3'
 * interval.shorthand(3, -1, 0, -1) // => 'm-3'
 * interval.shorthand(3, 1, 1, 1) // => 'A10'
 */
function shorthand (simple, alt, oct, dir) {
  return altToQ(simple, alt) + dirStr(dir) + num(simple, oct)
}
/**
 * Build a special shorthand interval notation string from properties.
 * The special shorthand interval notation changes the order or the standard
 * shorthand notation so instead of 'M-3' it returns '-3M'.
 *
 * The standard shorthand notation has a string 'A4' (augmented four) that can't
 * be differenciate from 'A4' (the A note in 4th octave), so the purpose of this
 * notation is avoid collisions
 *
 * @param {Integer} simple - the interval simple number (from 1 to 7)
 * @param {Integer} alt - the quality expressed in numbers. 0 means perfect
 * or major, depending of the interval number.
 * @param {Integer} oct - the number of octaves the interval spans.
 * 0 por simple intervals. Positive number.
 * @param {Integer} dir - the interval direction: 1 ascending, -1 descending.
 * @example
 * var interval = require('interval-notation')
 * interval.build(3, 0, 0, 1) // => '3M'
 * interval.build(3, -1, 0, -1) // => '-3m'
 * interval.build(3, 1, 1, 1) // => '10A'
 */
function build (simple, alt, oct, dir) {
  return dirStr(dir) + num(simple, oct) + altToQ(simple, alt)
}

/**
 * Get an alteration number from an interval quality string.
 * It accepts the standard `dmMPA` but also sharps and flats.
 *
 * @param {Integer|String} num - the interval number or a string representing
 * the interval type ('P' or 'M')
 * @param {String} quality - the quality string
 * @return {Integer} the interval alteration
 * @example
 * qToAlt('M', 'm') // => -1 (for majorables, 'm' is -1)
 * qToAlt('P', 'A') // => 1 (for perfectables, 'A' means 1)
 * qToAlt('M', 'P') // => null (majorables can't be perfect)
 */
function qToAlt (num, q) {
  var t = typeof num === 'number' ? type(num) : num
  if (q === 'M' && t === 'M') return 0
  if (q === 'P' && t === 'P') return 0
  if (q === 'm' && t === 'M') return -1
  if (/^A+$/.test(q)) return q.length
  if (/^d+$/.test(q)) return t === 'P' ? -q.length : -q.length - 1
  return null
}

function fillStr(s, n) { return Array(Math.abs(n) + 1).join(s) }
/**
 * Get interval quality from interval type and alteration
 *
 * @function
 * @param {Integer|String} num - the interval number of the the interval
 * type ('M' for majorables, 'P' for perfectables)
 * @param {Integer} alt - the interval alteration
 * @return {String} the quality string
 * @example
 * altToQ('M', 0) // => 'M'
 */
function altToQ (num, alt) {
  var t = typeof num === 'number' ? type(Math.abs(num)) : num
  if (alt === 0) return t === 'M' ? 'M' : 'P'
  else if (alt === -1 && t === 'M') return 'm'
  else if (alt > 0) return fillStr('A', alt)
  else if (alt < 0) return fillStr('d', t === 'P' ? alt : alt + 1)
  else return null
}

module.exports = { parse: parse, type: type,
  altToQ: altToQ, qToAlt: qToAlt,
  build: build, shorthand: shorthand }

},{}],27:[function(require,module,exports){
'use strict'

var REGEX = /^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/
/**
 * A regex for matching note strings in scientific notation.
 *
 * @name regex
 * @function
 * @return {RegExp} the regexp used to parse the note name
 *
 * The note string should have the form `letter[accidentals][octave][element]`
 * where:
 *
 * - letter: (Required) is a letter from A to G either upper or lower case
 * - accidentals: (Optional) can be one or more `b` (flats), `#` (sharps) or `x` (double sharps).
 * They can NOT be mixed.
 * - octave: (Optional) a positive or negative integer
 * - element: (Optional) additionally anything after the duration is considered to
 * be the element name (for example: 'C2 dorian')
 *
 * The executed regex contains (by array index):
 *
 * - 0: the complete string
 * - 1: the note letter
 * - 2: the optional accidentals
 * - 3: the optional octave
 * - 4: the rest of the string (trimmed)
 *
 * @example
 * var parser = require('note-parser')
 * parser.regex.exec('c#4')
 * // => ['c#4', 'c', '#', '4', '']
 * parser.regex.exec('c#4 major')
 * // => ['c#4major', 'c', '#', '4', 'major']
 * parser.regex().exec('CMaj7')
 * // => ['CMaj7', 'C', '', '', 'Maj7']
 */
function regex () { return REGEX }

var SEMITONES = [0, 2, 4, 5, 7, 9, 11]
/**
 * Parse a note name in scientific notation an return it's components,
 * and some numeric properties including midi number and frequency.
 *
 * @name parse
 * @function
 * @param {String} note - the note string to be parsed
 * @param {Boolean} isTonic - true if the note is the tonic of something.
 * If true, en extra tonicOf property is returned. It's false by default.
 * @param {Float} tunning - The frequency of A4 note to calculate frequencies.
 * By default it 440.
 * @return {Object} the parsed note name or null if not a valid note
 *
 * The parsed note name object will ALWAYS contains:
 * - letter: the uppercase letter of the note
 * - acc: the accidentals of the note (only sharps or flats)
 * - pc: the pitch class (letter + acc)
 * - step: s a numeric representation of the letter. It's an integer from 0 to 6
 * where 0 = C, 1 = D ... 6 = B
 * - alt: a numeric representation of the accidentals. 0 means no alteration,
 * positive numbers are for sharps and negative for flats
 * - chroma: a numeric representation of the pitch class. It's like midi for
 * pitch classes. 0 = C, 1 = C#, 2 = D ... It can have negative values: -1 = Cb.
 * Can detect pitch class enhramonics.
 *
 * If the note has octave, the parser object will contain:
 * - oct: the octave number (as integer)
 * - midi: the midi number
 * - freq: the frequency (using tuning parameter as base)
 *
 * If the parameter `isTonic` is set to true, the parsed object will contain:
 * - tonicOf: the rest of the string that follows note name (left and right trimmed)
 *
 * @example
 * var parse = require('note-parser').parse
 * parse('Cb4')
 * // => { letter: 'C', acc: 'b', pc: 'Cb', step: 0, alt: -1, chroma: -1,
 *         oct: 4, midi: 59, freq: 246.94165062806206 }
 * // if no octave, no midi, no freq
 * parse('fx')
 * // => { letter: 'F', acc: '##', pc: 'F##', step: 3, alt: 2, chroma: 7 })
 */
function parse (str, isTonic, tuning) {
  if (typeof str !== 'string') return null
  var m = REGEX.exec(str)
  if (!m || !isTonic && m[4]) return null
  tuning = tuning || 440

  var p = { letter: m[1].toUpperCase(), acc: m[2].replace(/x/g, '##') }
  p.pc = p.letter + p.acc
  p.step = (p.letter.charCodeAt(0) + 3) % 7
  p.alt = p.acc[0] === 'b' ? -p.acc.length : p.acc.length
  p.chroma = SEMITONES[p.step] + p.alt
  if (m[3]) {
    p.oct = +m[3]
    p.midi = p.chroma + 12 * (p.oct + 1)
    p.freq = Math.pow(2, (p.midi - 69) / 12) * tuning
  }
  if (isTonic) p.tonicOf = m[4]
  return p
}

// add a property getter to a lib
function getter (lib, name) {
  lib[name] = function (src) {
    var p = parse(src)
    return p && (typeof p[name] !== 'undefined') ? p[name] : null
  }
  return lib
}

var PROPS = ['letter', 'acc', 'pc', 'step', 'alt', 'chroma', 'oct', 'midi', 'freq']
var parser = PROPS.reduce(getter, {})
parser.regex = regex
parser.parse = parse
module.exports = parser

// extra API docs
/**
 * Get midi of a note
 *
 * @name midi
 * @function
 * @param {String} note - the note name
 * @return {Integer} the midi number of the note or null if not a valid note
 * or the note does NOT contains octave
 * @example
 * var parser = require('note-parser')
 * parser.midi('A4') // => 69
 * parser.midi('A') // => null
 */
/**
 * Get freq of a note in hertzs (in a well tempered 440Hz A4)
 *
 * @name freq
 * @function
 * @param {String} note - the note name
 * @return {Float} the freq of the number if hertzs or null if not valid note
 * or the note does NOT contains octave
 * @example
 * var parser = require('note-parser')
 * parser.freq('A4') // => 440
 * parser.freq('A') // => null
 */

},{}],28:[function(require,module,exports){
'use strict';

var tonalPitch = require('tonal-pitch');
var tonalNotation = require('tonal-notation');
var tonalTranspose = require('tonal-transpose');
var tonalDistance = require('tonal-distance');

function id (x) { return x }

// items can be separated by spaces, bars and commas
var SEP = /\s*\|\s*|\s*,\s*|\s+/

/**
 * Convert anything to array. Speifically, split string separated by spaces,
 * commas or bars. The arrays are passed without modifications and the rest of
 * the objects are wrapped.
 *
 * This function always returns an array (null or undefined values are converted
 * to empty arrays)
 *
 * Thanks to this function, the rest of the functions of this module accepts
 * any object (or more useful: strings) as an array parameter.
 *
 * @param {*} source - the thing to get an array from
 * @return {Array} the object as an array
 *
 * @example
 * import { asArr } from 'tonal-arrays'
 * asArr('C D E F G') // => ['C', 'D', 'E', 'F', 'G']
 */
function asArr (src) {
  return tonalNotation.isArr(src) ? src
    : typeof src === 'string' ? src.trim().split(SEP)
    : (src === null || typeof src === 'undefined') ? []
    : [ src ]
}

/**
 * Return a new array with the elements mapped by a function.
 * Basically the same as the JavaScript standard `array.map` but with
 * two enhacements:
 *
 * - Arrays can be expressed as strings (see [asArr])
 * - This function can be partially applied. This is useful to create _mapped_
 * versions of single element functions. For an excellent introduction of
 * the adventages [read this](https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch4.html)
 *
 * @param {Function} fn - the function
 * @param {Array|String} arr - the array to be mapped
 * @return {Array}
 * @example
 * var arr = require('tonal-arr')
 * var toUp = arr.map(function(e) { return e.toUpperCase() })
 * toUp('a b c') // => ['A', 'B', 'C']
 *
 * @example
 * var tonal = require('tonal')
 * tonal.map(tonal.transpose('M3'), 'C D E') // => ['E', 'F#', 'G#']
 */
function map (fn, list) {
  return arguments.length > 1 ? map(fn)(list)
    : function (l) { return asArr(l).map(fn) }
}

/**
 * Compact map: map an array with a function and remove nulls.
 * Can be partially applied.
 * @param {Function} fn
 * @param {Array|String} list
 * @return {Array}
 * @see map
 */
function cMap (fn, list) {
  if (arguments.length === 1) return function (l) { return cMap(fn, list) }
  return map(fn, list).filter(id)
}

/**
 * Return a copy of the array with the null values removed
 * @param {String|Array} list
 * @return {Array}
 */
function compact (arr) { return asArr(arr).filter(id) }

/**
 * Filter an array with a function. Again, almost the same as JavaScript standard
 * filter function but:
 * - It accepts strings as arrays
 * - Can be partially applied
 *
 * @param {Function} fn
 * @param {String|Array} arr
 * @return {Array}
 */
function filter (fn, list) {
  return arguments.length > 1 ? filter(fn)(list)
    : function (l) { return asArr(l).filter(fn) }
}

/**
 * Given a list of notes, return the distance from the first note to the rest.
 * @param {Array|String} notes - the list of notes
 * @return {Array} the intervals
 * @example
 * tonal.harmonics('C E g') // => ['1P', '3M', '5P']
 */
function harmonics (list) {
  var a = asArr(list)
  return a.length ? a.map(tonalDistance.distance(a[0])).filter(id) : a
}

/**
 * Given an array of intervals, create a function that harmonizes a
 * note with this intervals. Given a list of notes, return a function that
 * transpose the notes by an interval.
 *
 * @param {Array|String} ivls - the list of pitches
 * @return {Function} The harmonizer
 * @example
 * import { harmonizer } from 'tonal-arrays'
 * var maj7 = harmonizer('P1 M3 P5 M7')
 * maj7('C') // => ['C', 'E', 'G', 'B']
 * var C = harmonizer('C D E')
 * C('M3') // => ['E', 'G#', 'B']
 */
function harmonizer (list) {
  return function (tonic) {
    return cMap(tonalTranspose.tr(tonic || 'P1'), list)
  }
}

/**
 * Harmonizes a note with an array of intervals. It's a layer of sintatic
 * sugar over `harmonizer`.
 *
 * @function
 * @param {String|Array} ivl - the array of intervals
 * @param {String|Pitch} note - the note to be harmonized
 * @return {Array} the resulting notes
 * @example
 * var tonal = require('tonal')
 * tonal.harmonise('P1 M3 P5 M7', 'C') // => ['C', 'E', 'G', 'B']
 */
var harmonize = function (list, pitch) {
  return arguments.length > 1 ? harmonizer(list)(pitch) : harmonizer(list)
}

// a custom height function that
// - returns -Infinity for non-pitch objects
// - assumes pitch classes has octave -10 (so are sorted before that notes)
var objHeight = function (p) {
  if (!p) return -Infinity
  var f = p[1] * 7
  var o = tonalNotation.isNum(p[2]) ? p[2] : -Math.floor(f / 12) - 10
  return f + o * 12
}

// ascending comparator
function ascComp (a, b) { return objHeight(a) - objHeight(b) }
// descending comparator
function descComp (a, b) { return -ascComp(a, b) }

/**
 * Sort an array or notes or intervals. It uses the JavaScript standard sort
 * function.
 *
 * @param {Boolean|Function} comp - the comparator. `true` means use an
 * ascending comparator, `false` a descending comparator, or you can pass a
 * custom comparator (that receives pitches in array notation)
 * @param {Array|String} arr - the array of notes or intervals
 * @example
 * import { sort } from 'tonal-arrays'
 * sort(true, 'D E C') // => ['C', 'D', 'E']
 * @example
 * var tonal = require('tonal')
 * tonal.sort(false, 'D E C') // => ['E', 'D', 'C']
 */
function sort (comp, list) {
  if (arguments.length > 1) return sort(comp)(list)
  var fn = comp === true || comp === null ? ascComp
    : comp === false ? descComp : comp
  return listFn(function (arr) {
    return arr.sort(fn)
  })
}

/**
 * Randomizes the order of the specified array using the Fisher–Yates shuffle.
 *
 * @function
 * @param {Array|String} arr - the array
 * @return {Array} the shuffled array
 *
 * @example
 * import { shuffle } from 'tonal-arrays'
 * @example
 * var tonal = require('tonal')
 * tonal.shuffle('C D E F')
 */
var shuffle = listFn(function (arr) {
  var i, t
  var m = arr.length
  while (m) {
    i = Math.random() * m-- | 0
    t = arr[m]
    arr[m] = arr[i]
    arr[i] = t
  }
  return arr
})

function trOct (n) { return tonalTranspose.tr(tonalPitch.pitch(0, n, 1)) }

/**
 * Rotates a list a number of times. It's completly agnostic about the
 * contents of the list.
 * @param {Integer} times - the number of rotations
 * @param {Array|String} list - the list to be rotated
 * @return {Array} the rotated array
 */
function rotate (times, list) {
  var arr = asArr(list)
  var len = arr.length
  var n = ((times % len) + len) % len
  return arr.slice(n, len).concat(arr.slice(0, n))
}

/**
 * Rotates an ascending list of pitches n times keeping the ascending property.
 * This functions assumes the list is an ascending list of pitches, and
 * transposes the them to ensure they are ascending after rotation.
 * It can be used, for example, to invert chords.
 *
 * @param {Integer} times - the number of rotations
 * @param {Array|String} list - the list to be rotated
 * @return {Array} the rotated array
 */
function rotateAsc (times, list) {
  return listFn(function (arr) {
    var len = arr.length
    var n = ((times % len) + len) % len
    var head = arr.slice(n, len)
    var tail = arr.slice(0, n)
    // See if the first note of tail is lower than the last of head
    var s = tonalDistance.distInSemitones(head[len - n - 1], tail[0])
    if (s < 0) {
      var octs = Math.floor(s / 12)
      if (times < 0) head = head.map(trOct(octs))
      else tail = tail.map(trOct(-octs))
    }
    return head.concat(tail)
  })(list)
}

/**
 * Select elements from a list.
 *
 * @param {String|Array} numbers - a __1-based__ index of the elements
 * @param {String|Array} list - the list of pitches
 * @return {Array} the selected elements (with nulls if not valid index)
 *
 * @example
 * import { select } from 'tonal-array'
 * select('1 3 5', 'C D E F G A B') // => ['C', 'E', 'G']
 * select('-1 0 1 2 3', 'C D') // => [ null, null, 'C', 'D', null ]
 */
function select (nums, list) {
  if (arguments.length === 1) return function (l) { return select(nums, l) }
  var arr = asArr(list)
  return asArr(nums).map(function (n) {
    return arr[n - 1] || null
  })
}

// #### Transform lists in array notation
function asPitchStr (p) { return tonalPitch.strPitch(p) || p }
function listToStr (v) {
  return tonalPitch.isPitch(v) ? tonalPitch.strPitch(v)
    : tonalNotation.isArr(v) ? v.map(asPitchStr)
    : v
}

/**
 * Decorates a function to so it's first parameter is an array of pitches in
 * array notation. Also, if the return value is a pitch or an array of pitches
 * in array notation, it convert backs to strings.
 *
 * @function
 * @param {Function} fn - the function to decorate
 * @return {Function} the decorated function
 * @example
 * import { listFn } from 'tonal-arrays'
 * var octUp = listFn((p) => { p[2] = p[2] + 1; return p[2] })
 * octUp('C2 D2 E2') // => ['C3', 'D3', 'E3']
 */
function listFn (fn) {
  return function (list) {
    var arr = asArr(list).map(tonalPitch.asPitch)
    var res = fn(arr)
    return listToStr(res)
  }
}

exports.asArr = asArr;
exports.map = map;
exports.cMap = cMap;
exports.compact = compact;
exports.filter = filter;
exports.harmonics = harmonics;
exports.harmonizer = harmonizer;
exports.harmonize = harmonize;
exports.sort = sort;
exports.shuffle = shuffle;
exports.rotate = rotate;
exports.rotateAsc = rotateAsc;
exports.select = select;
exports.listFn = listFn;
},{"tonal-distance":29,"tonal-notation":35,"tonal-pitch":37,"tonal-transpose":39}],29:[function(require,module,exports){
'use strict';

var tonalPitch = require('tonal-pitch');

// substract two pitches
function substr (a, b) {
  if (!a || !b || a[1].length !== b[1].length) return null
  var f = tonalPitch.fifths(b) - tonalPitch.fifths(a)
  if (tonalPitch.isPC(a)) return tonalPitch.pitch(f, -Math.floor(f * 7 / 12), 1)
  var o = tonalPitch.focts(b) - tonalPitch.focts(a)
  var d = tonalPitch.height(b) - tonalPitch.height(a) < 0 ? -1 : 1
  return tonalPitch.pitch(d * f, d * o, d)
}

/**
 * Find distance between two pitches. Both pitches MUST be of the same type.
 * Distances between pitch classes always returns ascending intervals.
 * Distances between intervals substract one from the other.
 *
 * @param {Pitch|String} from - distance from
 * @param {Pitch|String} to - distance to
 * @return {Interval} the distance between pitches
 * @example
 * import { distance } from 'tonal-distance'
 * distance('C2', 'C3') // => 'P8'
 * distance('G', 'B') // => 'M3'
 * // or use tonal
 * var tonal = require('tonal')
 * tonal.distance('M2', 'P5') // => 'P4'
 */
function distance (a, b) {
  if (arguments.length === 1) return function (b) { return distance(a, b) }
  var pa = tonalPitch.asPitch(a)
  var pb = tonalPitch.asPitch(b)
  var i = substr(pa, pb)
  // if a and b are in array notation, no conversion back
  return a === pa && b === pb ? i : tonalPitch.strIvl(i)
}

/**
 * Get the distance between two notes in semitones
 * @param {String|Pitch} from - first note
 * @param {String|Pitch} to - last note
 * @return {Integer} the distance in semitones or null if not valid notes
 * @example
 * import { distInSemitones } from 'tonal-distance'
 * distInSemitones('C3', 'A2') // => -3
 * // or use tonal
 * tonal.distInSemitones('C3', 'G3') // => 7
 */
function distInSemitones (a, b) {
  var i = substr(tonalPitch.asPitch(a), tonalPitch.asPitch(b))
  return i ? tonalPitch.height(i) : null
}

/**
 * An alias for `distance`
 * @function
 */
var interval = distance

exports.distance = distance;
exports.distInSemitones = distInSemitones;
exports.interval = interval;
},{"tonal-pitch":37}],30:[function(require,module,exports){
'use strict';

// Encoding pitches into fifhts/octave notation

function isNum (n) { return typeof n === 'number' }

// Map from letter step to number of fifths starting from 'C':
// { C: 0, D: 2, E: 4, F: -1, G: 1, A: 3, B: 5 }
var FIFTHS = [0, 2, 4, -1, 1, 3, 5]
// Given a number of fifths, return the octaves they span
function fOcts (f) { return Math.floor(f * 7 / 12) }
// Get the number of octaves it span each step
var FIFTH_OCTS = FIFTHS.map(fOcts)

function encode (step, alt, oct) {
  var f = FIFTHS[step] + 7 * alt
  if (!isNum(oct)) return [f]
  var o = oct - FIFTH_OCTS[step] - 4 * alt
  return [f, o]
}

// Return the number of fifths as if it were unaltered
function unaltered (f) {
  var i = (f + 1) % 7
  return i < 0 ? 7 + i : i
}

// We need to get the steps from fifths
// Fifths for CDEFGAB are [ 0, 2, 4, -1, 1, 3, 5 ]
// We add 1 to fifths to avoid negative numbers, so:
// { 0: F, 1: C, 2: G, 3: D, 4: A, 5: E, 6: B}
var STEPS = [3, 0, 4, 1, 5, 2, 6]

function decode (f, o) {
  var step = STEPS[unaltered(f)]
  var alt = Math.floor((f + 1) / 7)
  if (!isNum(o)) return [step, alt]
  var oct = o + 4 * alt + FIFTH_OCTS[step]
  return [step, alt, oct]
}

exports.encode = encode;
exports.decode = decode;
},{}],31:[function(require,module,exports){
'use strict';

var tonalNote = require('tonal-note');
var tonalArray = require('tonal-array');
var tonalMidi = require('tonal-midi');

/**
 * This function filter notes using a scale. Given a scale and a note, it
 * returns the note name if it belongs to the scale or null if not. The
 * note can be given as string or as midi number.
 *
 * This function work with heights instead of names, so the note name returned
 * is not guaranteed to be the same provided (see 'B#3' example)
 *
 * It can be partially applied.
 *
 * @param {String|Array} scale - the scale used to filter
 * @param {String|Pitch|Number} note - the note to be filtered
 * @return {String} the note name or null if note in the pitch classes
 *
 * @example
 * import { scaleFilter } from 'tonal-filter'
 * scaleFilter('C D E', 'C4') // => 'C4'
 * scaleFilter('C D E', 'B#3') // => 'C4'
 * scaleFilter('C D E', 60) // => 'C4'
 * aMajor = scaleFilter('A C# E')
 * [69, 70, 71, 72, 73].map(aMajor) // => [ 'A4', null, null, null, 'C#5' ]
 */
function scaleFilter (notes, m) {
  if (arguments.length > 1) return scaleFilter(notes)(m)
  var scale = tonalArray.map(tonalNote.pc, notes)
  var chromas = tonalArray.map(tonalNote.chroma, scale)
  return function (note) {
    var midi = tonalMidi.toMidi(note)
    var m = midi !== null ? midi - 12 : tonalNote.chroma(note)
    var pcIndex = chromas.indexOf(m % 12)
    return pcIndex > -1 ? scale[pcIndex] + Math.floor(m / 12) : null
  }
}

exports.scaleFilter = scaleFilter;
},{"tonal-array":28,"tonal-midi":34,"tonal-note":36}],32:[function(require,module,exports){
'use strict';

var tonalMidi = require('tonal-midi');

/**
 * Return a function that converts midi or notes names to frequency using
 * equal temperament.
 * @function
 * @param {Float} ref - the tuning reference
 * @return {Function} the frequency calculator. It accepts midi numbers,
 * note names, pitches and returns a float.
 * @example
 * import { toEqualTemp } from 'tonal-freq'
 * const toFreq = toEqualTemp(444)
 * toFreq('A3') // => 222
 */
function toEqualTemp (ref) {
  return function (p) {
    var m = tonalMidi.toMidi(p)
    return m ? Math.pow(2, (m - 69) / 12) * ref : null
  }
}

/**
 * Get the frequency of a pitch using equal temperament scale and A4 equal to 440Hz
 * @function
 * @param {Number|String} note - the note name or midi number
 * @return {Float} the frequency in herzs
 * @example
 * import { toFreq } from 'tonal-freq'
 * toFreq('A4') // => 440
 * // using tonal
 * tonal.toFreq('C4') // => 261.6255653005986
 */
var toFreq = toEqualTemp(440)

/**
 * Create a function that returns a midi number from a frequency using an
 * equal temperament and `ref` frequency as 'A4' frequency.
 *
 * @param {Float} ref - the frequency of A4
 * @return {Function} a function that converts from frequency to midi
 */
function fromEqualTemp (ref) {
  return function (freq) {
    var midi = 12 * (Math.log(freq) - Math.log(ref)) / Math.log(2) + 69
    return Math.round(midi)
  }
}

/**
 * Get note from frequency using a equal temeperament scale and 440Hz as
 * freq reference
 * @param {Float} freq
 * @return {Integer} midi number
 * @function
 */
var midiFromFreq = fromEqualTemp(440)

/**
 * Get note name from frequency using an equal temperament scale with 440Hz
 * as reference
 * @param {Float} freq
 * @return {String} note name
 */
function fromFreq (freq) {
  return tonalMidi.fromMidi(midiFromFreq(freq))
}

/**
 * Get difference in cents between two frequencies. The frequencies can be
 * expressed with hertzs or midi numbers or note names
 * @param {Float|Integer|String} base
 * @param {Float|Integer|String} freq
 * @return {Float} The difference in cents
 * @example
 * import { cents } from 'tonal-freq'
 * cents('C4', 261) // => -4.1444603457298985
 */
function cents (base, freq) {
  var b = toFreq(base) || base
  var f = toFreq(freq) || freq
  return 1200 * (Math.log(f / b) / Math.log(2))
}

exports.toEqualTemp = toEqualTemp;
exports.toFreq = toFreq;
exports.fromEqualTemp = fromEqualTemp;
exports.midiFromFreq = midiFromFreq;
exports.fromFreq = fromFreq;
exports.cents = cents;
},{"tonal-midi":34}],33:[function(require,module,exports){
'use strict';

var tonalPitch = require('tonal-pitch');

/**
 * Get interval name. Can be used to test if it's an interval. It accepts intervals
 * as pitch or string in shorthand notation or tonal notation. It returns always
 * intervals in tonal notation.
 *
 * @param {String|Pitch} ivl
 * @param {String} the interval name or null if not valid interval
 * @example
 * import { ivlName } from 'tonal-interval'
 * ivlName('m-3') // => '-3m'
 * ivlName('3') // => null
 * // part of tonal
 * tonal.ivlName('blah') // => null
 */
function ivlName (ivl) {
  var i = tonalPitch.asIvlPitch(ivl)
  return i ? tonalPitch.strIvl(i) : null
}

/**
 * Get size in semitones of an interval
 * @param {String|Pitch} ivl
 * @return {Integer} the number of semitones or null if not an interval
 * @example
 * import { semitones } from 'tonal-interval'
 * semitones('P4') // => 5
 * // or using tonal
 * tonal.semitones('P5') // => 7
 */
function semitones (ivl) {
  var i = tonalPitch.asIvlPitch(ivl)
  return i ? 7 * tonalPitch.fifths(i) + 12 * tonalPitch.focts(i) : null
}

// interval numbers
var IN = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7]
// interval qualities
var IQ = 'P m M m M P d P m M m M'.split(' ')

/**
 * Get interval name from semitones number. Since there are several interval
 * names for the same number, the name it's arbitraty, but deterministic.
 * @param {Integer} num - the number of semitones (can be negative)
 * @return {String} the interval name
 * @example
 * import { fromSemitones } from 'tonal-interval'
 * fromSemitones(7) // => '5P'
 * // or using tonal
 * tonal.fromSemitones(-7) // => '-5P'
 */
function fromSemitones (num) {
  var d = num < 0 ? -1 : 1
  var n = Math.abs(num)
  var c = n % 12
  var o = Math.floor(n / 12)
  return d * (IN[c] + 7 * o) + IQ[c]
}

var CLASSES = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
/**
 * Get the [interval class](https://en.wikipedia.org/wiki/Interval_class)
 * number of a given interval.
 *
 * In musical set theory, an interval class is the shortest distance in
 * pitch class space between two unordered pitch classes
 *
 * As paramter you can pass an interval in shorthand notation, an interval in
 * array notation or the number of semitones of the interval
 *
 * @param {String|Integer} interval - the interval or the number of semitones
 * @return {Integer} A value between 0 and 6
 *
 * @example
 * const ic = require('interval-class')
 * ic('P8') // => 0
 * ic('m6') // => 4
 * ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'].map(ic) // => [0, 2, 4, 5, 5, 3, 1]
 */
function ic (ivl) {
  var i = tonalPitch.asIvlPitch(ivl)
  var s = i ? tonalPitch.chr(i) : Math.round(ivl)
  return isNaN(s) ? null : CLASSES[Math.abs(s) % 12]
}

var TYPES = 'PMMPPMM'
/**
 * Get interval type. Can be perfectable (1, 4, 5) or majorable (2, 3, 6, 7)
 * @param {String|Pitch} interval
 * @return {String} 'P' for perfectables, 'M' for majorables or null if not
 * valid interval
 * @example
 * tonal.itype('5A') // => 'P'
 */
function itype (ivl) {
  var i = tonalPitch.asIvlPitch(ivl)
  return i ? TYPES[tonalPitch.decode(i)[0]] : null
}

/**
 * Get the [inversion](https://en.wikipedia.org/wiki/Inversion_(music)#Intervals)
 * of an interval.
 *
 * @function
 * @param {String|Pitch} interval - the interval to invert in interval shorthand
 * notation or interval array notation
 * @return {String|Pitch} the inverted interval
 *
 * @example
 * import { invert } from 'tonal-interval'
 * invert('3m') // => '6M'
 * // or using tonal
 * tonal.invert('2M') // => '7m'
 */
var invert = tonalPitch.ivlFn(function (i) {
  var d = tonalPitch.decode(i)
  // d = [step, alt, oct]
  var step = (7 - d[0]) % 7
  var alt = TYPES[d[0]] === 'P' ? -d[1] : -(d[1] + 1)
  return tonalPitch.encode(step, alt, d[2], tonalPitch.dir(i))
})

/**
 * Get the simplified version of an interval.
 *
 * @function
 * @param {String|Array} interval - the interval to simplify
 * @return {String|Array} the simplified interval
 *
 * @example
 * import { simplify } from 'tonal-interval'
 * simplify('9M') // => '2M'
 * ['8P', '9M', '10M', '11P', '12P', '13M', '14M', '15P'].map(simplify)
 * // => [ '8P', '2M', '3M', '4P', '5P', '6M', '7M', '8P' ]
 * simplify('2M') // => '2M'
 * simplify('-2M') // => '7m'
 * // part of tonal
 * tonal.simplify('9m') // => '2m'
 */
var simplify = tonalPitch.ivlFn(function (i) {
  // decode to [step, alt, octave]
  var dec = tonalPitch.decode(i)
  // if it's not 8 reduce the octaves to 0
  if (dec[0] !== 0 || dec[2] !== 1) dec[2] = 0
  // encode back
  return tonalPitch.encode(dec[0], dec[1], dec[2], tonalPitch.dir(i))
})

exports.ivlName = ivlName;
exports.semitones = semitones;
exports.fromSemitones = fromSemitones;
exports.ic = ic;
exports.itype = itype;
exports.invert = invert;
exports.simplify = simplify;
},{"tonal-pitch":37}],34:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('tonal-pitch')) :
  typeof define === 'function' && define.amd ? define(['exports', 'tonal-pitch'], factory) :
  (factory((global.midi = global.midi || {}),global.tonalPitch));
}(this, function (exports,tonalPitch) { 'use strict';

  /**
   * Test if the given number is a valid midi note number
   * @function
   * @param {Object} num - the thing to be tested
   * @return {Boolean} true if it's a valid midi note number
   */
  function isMidiNum (m) {
    if (m === null || Array.isArray(m)) return false
    return m >= 0 && m < 128
  }

  // To match the general midi specification where `C4` is 60 we must add 12 to
  // `height` function:

  /**
   * Get midi number for a pitch
   * @function
   * @param {Array|String} pitch - the pitch
   * @return {Integer} the midi number or null if not valid pitch
   * @example
   * midi('C4') // => 60
   */
  function toMidi (val) {
    var p = tonalPitch.asNotePitch(val)
    return p && !tonalPitch.isPC(p) ? tonalPitch.height(p) + 12
      : isMidiNum(val) ? +val
      : null
  }

  var FLATS = 'C Db D Eb E F Gb G Ab A Bb B'.split(' ')
  var SHARPS = 'C C# D D# E F F# G G# A A# B'.split(' ')

  function fromMidiFn (pcs) {
    return function (m) {
      var pc = pcs[m % 12]
      var o = Math.floor(m / 12) - 1
      return pc + o
    }
  }

  /**
   * Given a midi number, returns a note name. The altered notes will have
   * flats.
   * @function
   * @param {Integer} midi - the midi note number
   * @return {String} the note name
   * @example
   * tonal.fromMidi(61) // => 'Db4'
   */
  var fromMidi = fromMidiFn(FLATS)

  /**
   * Given a midi number, returns a note name. The altered notes will have
   * sharps.
   * @function
   * @param {Integer} midi - the midi note number
   * @return {String} the note name
   * @example
   * tonal.fromMidiS(61) // => 'C#4'
   */
  var fromMidiS = fromMidiFn(SHARPS)

  exports.isMidiNum = isMidiNum;
  exports.toMidi = toMidi;
  exports.fromMidi = fromMidi;
  exports.fromMidiS = fromMidiS;

}));
},{"tonal-pitch":37}],35:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.notation = global.notation || {})));
}(this, function (exports) { 'use strict';

  var isArr = Array.isArray
  function isNum (x) { return typeof x === 'number' }
  function isStr (x) { return typeof x === 'string' }

  // NOTE LETTERS
  // ============

  // Given a letter, return step
  function toStep (l) {
    var s = 'CDEFGAB'.indexOf(l.toUpperCase())
    return s < 0 ? null : s
  }

  /**
   * Is a valid step number
   */
  function isStep (d) { return !(d < 0 || d > 6) }

  /**
   * Given a step, return a letter
   */
  function toLetter (s) {
    return isStep(s) ? 'CDEFGAB'.charAt(s) : null
  }

  // ACCIDENTALS
  // ===========

  function areFlats (s) { return /^b+$/.test(s) }
  function areSharps (s) { return /^#+$/.test(s) }

  function toAlt (s) {
    return s === '' ? 0
      : areFlats(s) ? -s.length
      : areSharps(s) ? s.length
      : null
  }

  function fillStr (s, num) { return Array(num + 1).join(s) }

  function toAcc (n) {
    return n === 0 ? ''
      : n < 0 ? fillStr('b', -n)
      : fillStr('#', n)
  }

  exports.isArr = isArr;
  exports.isNum = isNum;
  exports.isStr = isStr;
  exports.toStep = toStep;
  exports.isStep = isStep;
  exports.toLetter = toLetter;
  exports.areFlats = areFlats;
  exports.areSharps = areSharps;
  exports.toAlt = toAlt;
  exports.toAcc = toAcc;

}));
},{}],36:[function(require,module,exports){
'use strict';

var tonalPitch = require('tonal-pitch');
var tonalTranspose = require('tonal-transpose');

/**
 * Return the chroma of a note. The chroma is the numeric equivalent to the
 * pitch class, where 0 is C, 1 is C# or Db, 2 is D... 11 is B
 *
 * @param {String|Pitch} note
 * @return {Integer} the chroma
 */
function chroma (n) {
  var p = tonalPitch.asNotePitch(n)
  return p ? tonalPitch.chr(p) : null
}

/**
 * Given a note (as string or as array notation) returns a string
 * with the note name in scientific notation or null
 * if not valid note
 *
 * @function
 * @param {Pitch|String}
 * @return {String}
 * @example
 * import { noteName } from 'tonal-notes'
 * ['c', 'db3', '2', 'g+', 'gx4'].map(noteName)
 * // => ['C', 'Db3', null, null, 'G##4']
 *
 * @example
 * var tonal = require('tonal')
 * tonal.noteName('cb2') // => 'Cb2'
 * tonal.map(tonal.noteName, 'c db3 2 g+ gx4')
 */
function noteName (n) {
  var p = tonalPitch.asNotePitch(n)
  return p ? tonalPitch.strNote(p) : null
}

/**
 * Get pitch class of a note. The note can be a string or a pitch array.
 *
 * @function
 * @param {String|Pitch}
 * @return {String} the pitch class
 * @example
 * tonal.pc('Db3') // => 'Db'
 */
function pc (n) {
  var p = tonalPitch.asNotePitch(n)
  return p ? tonalPitch.strNote([ p[0], [ tonalPitch.fifths(p) ] ]) : null
}

var ASC = tonalPitch.parseIvl('2d')
var DESC = tonalPitch.parseIvl('-2d')

/**
 * Get the enharmonics of a note. It returns an array of three elements: the
 * below enharmonic, the note, and the upper enharmonic
 *
 * @param {String} note - the note to get the enharmonics from
 * @return {Array} an array of pitches ordered by distance to the given one
 *
 * @example
 * enharmonics = require('enharmonics')
 * enharmonics('C') // => ['B#', 'C', 'Dbb']
 * enharmonics('A') // => ['G##', 'A', 'Bbb']
 * enharmonics('C#4') // => ['B##3', 'C#4' 'Db4']
 * enharmonics('Db') // => ['C#', 'Db', 'Ebbb'])
 */
function enharmonics (pitch) {
  var notes = []
  notes.push(tonalTranspose.tr(DESC, pitch))
  if (notes[0] === null) return null
  notes.push(pitch)
  notes.push(tonalTranspose.tr(ASC, pitch))
  return notes
}

/**
 * An alias for `enharmonics`
 * @function
 */
var enh = enharmonics

/**
 * Get a simpler enharmonic note name from a note if exists
 *
 * @param {String} note - the note to simplify
 * @return {String} the simplfiied note (if not found, return same note)
 *
 * @example
 * var enharmonics = require('enharmonics')
 * enharmonics.simpleEnh('B#3') // => 'C4'
 */
function simpleEnh (pitch) {
  return enharmonics(pitch).reduce(function (simple, next) {
    if (!simple) return next
    return simple.length > next.length ? next : simple
  }, null)
}

exports.chroma = chroma;
exports.noteName = noteName;
exports.pc = pc;
exports.enharmonics = enharmonics;
exports.enh = enh;
exports.simpleEnh = simpleEnh;
},{"tonal-pitch":37,"tonal-transpose":39}],37:[function(require,module,exports){
'use strict';

var noteParser = require('note-parser');
var intervalNotation = require('interval-notation');
var tonalEncoding = require('tonal-encoding');
var tonalNotation = require('tonal-notation');

/**
 * Create a pitch
 * @param {Integer} fifths - the number of fifths from C or from P1
 * @param {Integer} focts - the number of encoded octaves
 * @param {Integer} dir - (Optional) Only required for intervals. Can be 1 or -1
 * @return {Pitch}
 */
function pitch (fifths, focts, dir) {
  return dir ? ['tnlp', [fifths, focts], dir] : ['tnlp', [fifths, focts]]
}
/**
 * Test if an object is a pitch
 * @param {Pitch}
 * @return {Boolean}
 */
function isPitch (p) { return tonalNotation.isArr(p) && p[0] === 'tnlp' }
/**
 * Encode a pitch
 * @param {Integer} step
 * @param {Integer} alt
 * @param {Integer} oct
 * @param {Integer} dir - (Optional)
 */
function encode$1 (s, a, o, dir) {
  return dir ? ['tnlp', tonalEncoding.encode(s, a, o), dir] : ['tnlp', tonalEncoding.encode(s, a, o)]
}

/**
 * Decode a pitch
 * @param {Pitch} the pitch
 * @return {Array} An array with [step, alt, oct]
 */
function decode$1 (p) {
  return tonalEncoding.decode.apply(null, p[1])
}

/**
 * Get pitch type
 * @param {Pitch}
 * @return {String} 'ivl' or 'note' or null if not a pitch
 */
function pType (p) {
  return !isPitch(p) ? null
    : p[2] ? 'ivl' : 'note'
}
/**
 * Test if is a pitch note (with or without octave)
 * @param {Pitch}
 * @return {Boolean}
 */
function isNotePitch (p) { return pType(p) === 'note' }
/**
 * Test if is an interval
 * @param {Pitch}
 * @return {Boolean}
 */
function isIvlPitch (p) { return pType(p) === 'ivl' }
/**
 * Test if is a pitch class (a pitch note without octave)
 * @param {Pitch}
 * @return {Boolean}
 */
function isPC (p) { return isPitch(p) && p[1].length === 1 }

/**
 * Get direction of a pitch (even for notes)
 * @param {Pitch}
 * @return {Integer} 1 or -1
 */
function dir (p) { return p[2] === -1 ? -1 : 1 }

/**
 * Get encoded fifths from pitch.
 * @param {Pitch}
 * @return {Integer}
 */
function fifths (p) { return p[2] === -1 ? -p[1][0] : p[1][0] }
/**
 * Get encoded octaves from pitch.
 * @param {Pitch}
 * @return {Integer}
 */
function focts (p) { return p[2] === -1 ? -p[1][1] : p[1][1] }
/**
 * Get height of a pitch.
 * @param {Pitch}
 * @return {Integer}
 */
function height (p) { return fifths(p) * 7 + focts(p) * 12 }

/**
 * Get chroma of a pitch. The chroma is a number between 0 and 11 to represent
 * the position of a pitch inside an octave. Is the numeric equivlent of a
 * pitch class.
 *
 * @param {Pitch}
 * @return {Integer}
 */
function chr (p) {
  var f = fifths(p)
  return 7 * f - 12 * Math.floor(f * 7 / 12)
}

// memoize parsers
function memoize (fn) {
  var cache = {}
  return function (str) {
    if (!tonalNotation.isStr(str)) return null
    return cache[str] || (cache[str] = fn(str))
  }
}

/**
 * Parse a note
 * @function
 * @param {String} str
 * @return {Pitch} the pitch or null if not valid note string
 */
var parseNote = memoize(function (s) {
  var p = noteParser.parse(s)
  return p ? encode$1(p.step, p.alt, p.oct) : null
})

/**
 * Parse an interval
 * @function
 * @param {String} str
 * @return {Pitch} the pitch or null if not valid interval string
 */
var parseIvl = memoize(function (s) {
  var p = intervalNotation.parse(s)
  if (!p) return null
  return p ? encode$1(p.simple - 1, p.alt, p.oct, p.dir) : null
})

/**
 * Parse a note or an interval
 * @param {String} str
 * @return {Pitch} the pitch or null if not valid pitch string
 */
function parsePitch (s) { return parseNote(s) || parseIvl(s) }

/**
 * Ensure the given object is a note pitch. If is a string, it will be
 * parsed. If not a note pitch or valid note string, it returns null.
 * @param {Pitch|String}
 * @return {Pitch}
 */
function asNotePitch (p) { return isNotePitch(p) ? p : parseNote(p) }
/**
 * Ensure the given object is a interval pitch. If is a string, it will be
 * parsed. If not a interval pitch or valid interval string, it returns null.
 * @param {Pitch|String}
 * @return {Pitch}
 */
function asIvlPitch (p) { return isIvlPitch(p) ? p : parseIvl(p) }
/**
 * Ensure the given object is a pitch. If is a string, it will be
 * parsed. If not a pitch or valid pitch string, it returns null.
 * @param {Pitch|String}
 * @return {Pitch}
 */
function asPitch (p) { return isPitch(p) ? p : parsePitch(p) }

function octStr (n) { return tonalNotation.isNum(n) ? n : '' }

/**
 * Convert a note pitch to string representation
 * @param {Pitch}
 * @return {String}
 */
function strNote (p) {
  if (!isNotePitch(p)) return null
  var d = decode$1(p)
  // d = [step, alt, oct]
  return tonalNotation.toLetter(d[0]) + tonalNotation.toAcc(d[1]) + octStr(d[2])
}

/**
 * Convert a interval pitch to string representation
 * @param {Pitch}
 * @return {String}
 */
function strIvl (p) {
  if (!isIvlPitch(p)) return null
  // decode to [step, alt, oct]
  var d = decode$1(p)
  // d = [step, alt, oct]
  var num = d[0] + 1 + 7 * d[2]
  return p[2] * num + intervalNotation.altToQ(num, d[1])
}

/**
 * Convert a pitch to string representation (either notes or intervals)
 * @param {Pitch}
 * @return {String}
 */
function strPitch (p) { return strNote(p) || strIvl(p) }

function decorator (is, parse, str) {
  return function (fn) {
    return function (v) {
      var i = is(v)
      // if the value is in pitch notation no conversion
      if (i) return fn(v)
      // else parse the pitch
      var p = parse(v)
      // if parsed, apply function and back to string
      return p ? str(fn(p)) : null
    }
  }
}

/**
 * Decorate a function to work internally with note pitches, even if the
 * parameters are provided as strings. Also it converts back the result
 * to string if a note pitch is returned.
 * @function
 * @param {Function} fn
 * @return {Function} the decorated function
 */
var noteFn = decorator(isNotePitch, parseNote, strNote)
/**
 * Decorate a function to work internally with interval pitches, even if the
 * parameters are provided as strings. Also it converts back the result
 * to string if a interval pitch is returned.
 * @function
 * @param {Function} fn
 * @return {Function} the decorated function
 */
var ivlFn = decorator(isIvlPitch, parseIvl, strIvl)
/**
 * Decorate a function to work internally with pitches, even if the
 * parameters are provided as strings. Also it converts back the result
 * to string if a pitch is returned.
 * @function
 * @param {Function} fn
 * @return {Function} the decorated function
 */
var pitchFn = decorator(isPitch, parsePitch, strPitch)

exports.pitch = pitch;
exports.isPitch = isPitch;
exports.encode = encode$1;
exports.decode = decode$1;
exports.pType = pType;
exports.isNotePitch = isNotePitch;
exports.isIvlPitch = isIvlPitch;
exports.isPC = isPC;
exports.dir = dir;
exports.fifths = fifths;
exports.focts = focts;
exports.height = height;
exports.chr = chr;
exports.parseNote = parseNote;
exports.parseIvl = parseIvl;
exports.parsePitch = parsePitch;
exports.asNotePitch = asNotePitch;
exports.asIvlPitch = asIvlPitch;
exports.asPitch = asPitch;
exports.strNote = strNote;
exports.strIvl = strIvl;
exports.strPitch = strPitch;
exports.noteFn = noteFn;
exports.ivlFn = ivlFn;
exports.pitchFn = pitchFn;
},{"interval-notation":26,"note-parser":27,"tonal-encoding":30,"tonal-notation":35}],38:[function(require,module,exports){
'use strict';

var tonalArray = require('tonal-array');
var tonalTranspose = require('tonal-transpose');
var tonalMidi = require('tonal-midi');
var tonalFilter = require('tonal-filter');

var slice = Array.prototype.slice
function isNum (n) { return typeof n === 'number' }
// convert notes to midi if needed
function asNum (n) { return isNum(n) ? n : tonalMidi.toMidi(n) }
// ascending range
function ascR (b, n) { for (var a = []; n--; a[n] = n + b); return a }
// descending range
function descR (b, n) { for (var a = []; n--; a[n] = b - n); return a }
// create a range between a and b
function ran (a, b) {
  return a === null || b === null ? []
    : a < b ? ascR(a, b - a + 1) : descR(a, a - b + 1)
}

/**
 * Create a numeric range. You supply a list of notes or numbers and it will
 * be conected to create complex ranges.
 *
 * @param {String|Array} list - the list of notes or numbers used
 * @return {Array} an array of numbers or empty array if not vald parameters
 *
 * @example
 * import { range } from 'tonal-range'
 * range('C5 C4') // => [ 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60 ]
 * // it works with numbers
 * range([10, 5]) // => [ 10, 9, 8, 7, 6, 5 ]
 * // complex range
 * range('C4 E4 Bb3') // => [60, 61, 62, 63, 64, 63, 62, 61, 60, 59, 58]
 * // can be expressed with a string or array
 * range('C2 C4 C2') === range(['C2', 'C4', 'C2'])
 * // included in tonal package
 * tonal.range('C2 C3')
 */
function range (list) {
  return tonalArray.asArr(list).map(asNum).reduce(function (r, n, i) {
    if (i === 1) return ran(r, n)
    var last = r[r.length - 1]
    return r.concat(ran(last, n).slice(1))
  })
}

/**
 * Create a range of chromatic notes. The altered notes will use flats.
 *
 * @function
 * @param {String|Array} list - the list of notes or midi note numbers
 * @return {Array} an array of note names
 * @example
 * tonal.chromatic('C2 E2 D2') // => ['C2', 'Db2', 'D2', 'Eb2', 'E2', 'Eb2', 'D2']
 */
function chromatic (list) {
  var args = arguments.length === 1 ? list : slice.call(arguments)
  return tonalArray.cMap(tonalMidi.fromMidi, range(args))
}

/**
 * Create a range with a cycle of fifths
 * @function
 * @param {Integer} the first step from tonic
 * @param {Integer} the last step from tonic (can be negative)
 * @param {String|Pitch} the tonic
 * @return {Array} a range of cycle of fifths
 * @example
 * var range = require('tonal-ranges')
 * range.cycleOfFifths(0, 6, 'C') // => [ 'C', 'G', 'D', 'A', 'E', 'B', 'F#' ])
 */
function cycleOfFifths (s, e, t) {
  return range([s, e]).map(tonalTranspose.trFifths(t))
}

/**
 * Create a scale range. Given a pitch set (a collection of pitch classes),
 * and a start and end it returns a note range.
 *
 * @param {String|Array|Function} scale - the scale to use or a function to
 * convert from midi numbers to note names
 * @param {String|Array} range - a list of notes or midi numbers
 * @return {Array} the scale range, an empty array if not valid source or
 * null if not valid start or end
 * @example
 * var range = require('tonal-ranges')
 * range.scale('C D E F G A B', 'C3 C2')
 * // => [ 'C3', 'B2', 'A2', 'G2', 'F2', 'E2', 'D2', 'C2' ]
 */
function scaleRange (src, list) {
  if (arguments.length === 1) return function (l) { return scaleRange(src, l) }
  var fn = typeof src === 'function' ? src : tonalFilter.scaleFilter(src)
  return tonalArray.cMap(fn, range(list))
}

exports.range = range;
exports.chromatic = chromatic;
exports.cycleOfFifths = cycleOfFifths;
exports.scaleRange = scaleRange;
},{"tonal-array":28,"tonal-filter":31,"tonal-midi":34,"tonal-transpose":39}],39:[function(require,module,exports){
'use strict';

var tonalPitch = require('tonal-pitch');

function trBy (i, p) {
  var t = tonalPitch.pType(p)
  if (!t) return null
  var f = tonalPitch.fifths(i) + tonalPitch.fifths(p)
  if (tonalPitch.isPC(p)) return ['tnlp', [f]]
  var o = tonalPitch.focts(i) + tonalPitch.focts(p)
  if (t === 'note') return ['tnlp', [f, o]]
  var d = tonalPitch.height(i) + tonalPitch.height(p) < 0 ? -1 : 1
  return ['tnlp', [d * f, d * o], d]
}

/**
 * Transpose notes. Can be used to add intervals. At least one of the parameter
 * is expected to be an interval. If not, it returns null.
 *
 * @param {String|Pitch} a - a note or interval
 * @param {String|Pitch} b - a note or interavl
 * @return {String|Pitch} the transposed pitch or null if not valid parameters
 */
function transpose (a, b) {
  if (arguments.length === 1) return function (b) { return transpose(a, b) }
  var pa = tonalPitch.asPitch(a)
  var pb = tonalPitch.asPitch(b)
  var r = tonalPitch.isIvlPitch(pa) ? trBy(pa, pb)
    : tonalPitch.isIvlPitch(pb) ? trBy(pb, pa) : null
  return a === pa && b === pb ? r : tonalPitch.strPitch(r)
}

/**
 * An alias for `transpose`
 * @function
 */
var tr = transpose

/**
 * Transpose a tonic a number of perfect fifths. It can be partially applied.
 *
 * @function
 * @param {Pitch|String} tonic
 * @param {Integer} number - the number of times
 * @return {String|Pitch} the transposed note
 * @example
 * import { trFifths } from 'tonal-transpose'
 * [0, 1, 2, 3, 4].map(trFifths('C')) // => ['C', 'G', 'D', 'A', 'E']
 * // or using tonal
 * tonal.trFifths('G4', 1) // => 'D5'
 */
function trFifths (t, n) {
  if (arguments.length > 1) return trFifths(t)(n)
  return function (n) {
    return tr(t, tonalPitch.pitch(n, 0, 1))
  }
}

exports.transpose = transpose;
exports.tr = tr;
exports.trFifths = trFifths;
},{"tonal-pitch":37}],40:[function(require,module,exports){
'use strict';

var tonalNote = require('tonal-note');
var tonalInterval = require('tonal-interval');
var tonalMidi = require('tonal-midi');
var tonalFreq = require('tonal-freq');
var tonalTranspose = require('tonal-transpose');
var tonalDistance = require('tonal-distance');
var tonalFilter = require('tonal-filter');
var tonalArray = require('tonal-array');
var tonalRange = require('tonal-range');



exports.noteName = tonalNote.noteName;
exports.chroma = tonalNote.chroma;
exports.pc = tonalNote.pc;
exports.enharmonics = tonalNote.enharmonics;
exports.enh = tonalNote.enh;
exports.simpleEnh = tonalNote.simpleEnh;
exports.ivlName = tonalInterval.ivlName;
exports.semitones = tonalInterval.semitones;
exports.fromSemitones = tonalInterval.fromSemitones;
exports.ic = tonalInterval.ic;
exports.itype = tonalInterval.itype;
exports.invert = tonalInterval.invert;
exports.simplify = tonalInterval.simplify;
exports.isMidiNum = tonalMidi.isMidiNum;
exports.toMidi = tonalMidi.toMidi;
exports.fromMidi = tonalMidi.fromMidi;
exports.fromMidiS = tonalMidi.fromMidiS;
exports.toEqualTemp = tonalFreq.toEqualTemp;
exports.toFreq = tonalFreq.toFreq;
exports.midiFromFreq = tonalFreq.midiFromFreq;
exports.fromFreq = tonalFreq.fromFreq;
exports.cents = tonalFreq.cents;
exports.fromEqualTemp = tonalFreq.fromEqualTemp;
exports.transpose = tonalTranspose.transpose;
exports.tr = tonalTranspose.tr;
exports.trFifths = tonalTranspose.trFifths;
exports.distance = tonalDistance.distance;
exports.interval = tonalDistance.interval;
exports.distInSemitones = tonalDistance.distInSemitones;
exports.scaleFilter = tonalFilter.scaleFilter;
exports.asArr = tonalArray.asArr;
exports.map = tonalArray.map;
exports.filter = tonalArray.filter;
exports.listFn = tonalArray.listFn;
exports.harmonizer = tonalArray.harmonizer;
exports.harmonize = tonalArray.harmonize;
exports.harmonics = tonalArray.harmonics;
exports.rotate = tonalArray.rotate;
exports.rotateAsc = tonalArray.rotateAsc;
exports.select = tonalArray.select;
exports.sort = tonalArray.sort;
exports.shuffle = tonalArray.shuffle;
exports.range = tonalRange.range;
exports.chromatic = tonalRange.chromatic;
exports.cycleOfFifths = tonalRange.cycleOfFifths;
exports.scaleRange = tonalRange.scaleRange;
},{"tonal-array":28,"tonal-distance":29,"tonal-filter":31,"tonal-freq":32,"tonal-interval":33,"tonal-midi":34,"tonal-note":36,"tonal-range":38,"tonal-transpose":39}],41:[function(require,module,exports){
module.exports={
    "path": "media/big-piano-long-converted/",
    "videos": [{
        "filename": "A0.mp4",
        "duration": 4.352,
        "volumeInfo": {
            "mean": -27.3,
            "max": -9.5
        },
        "tags": []
    }, {
        "filename": "A1.mp4",
        "duration": 5.91,
        "volumeInfo": {
            "mean": -25.9,
            "max": -7.6
        },
        "tags": []
    }, {
        "filename": "A2.mp4",
        "duration": 6.614,
        "volumeInfo": {
            "mean": -25.1,
            "max": -8
        },
        "tags": []
    }, {
        "filename": "A3.mp4",
        "duration": 5.504,
        "volumeInfo": {
            "mean": -27.8,
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "A4.mp4",
        "duration": 5.483,
        "volumeInfo": {
            "mean": -27.7,
            "max": -9.6
        },
        "tags": []
    }, {
        "filename": "A5.mp4",
        "duration": 4.331,
        "volumeInfo": {
            "mean": -26.9,
            "max": -7.6
        },
        "tags": []
    }, {
        "filename": "A6.mp4",
        "duration": 2.582,
        "volumeInfo": {
            "mean": -25.8,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "A7.mp4",
        "duration": 1.323,
        "volumeInfo": {
            "mean": -31.3,
            "max": -8
        },
        "tags": []
    }, {
        "filename": "Ab1.mp4",
        "duration": 5.184,
        "volumeInfo": {
            "mean": -25,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Ab2.mp4",
        "duration": 6.272,
        "volumeInfo": {
            "mean": -26.4,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Ab3.mp4",
        "duration": 5.696,
        "volumeInfo": {
            "mean": -27.4,
            "max": -9.4
        },
        "tags": []
    }, {
        "filename": "Ab4.mp4",
        "duration": 5.846,
        "volumeInfo": {
            "mean": -28.8,
            "max": -9.4
        },
        "tags": []
    }, {
        "filename": "Ab5.mp4",
        "duration": 4.331,
        "volumeInfo": {
            "mean": -27.4,
            "max": -7.7
        },
        "tags": []
    }, {
        "filename": "Ab6.mp4",
        "duration": 2.603,
        "volumeInfo": {
            "mean": -29.7,
            "max": -7.9
        },
        "tags": []
    }, {
        "filename": "Ab7.mp4",
        "duration": 1.387,
        "volumeInfo": {
            "mean": -29.8,
            "max": -8.8
        },
        "tags": []
    }, {
        "filename": "B0.mp4",
        "duration": 3.712,
        "volumeInfo": {
            "mean": -25.1,
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "B1.mp4",
        "duration": 5.398,
        "volumeInfo": {
            "mean": -25.1,
            "max": -7.9
        },
        "tags": []
    }, {
        "filename": "B2.mp4",
        "duration": 5.846,
        "volumeInfo": {
            "mean": -27.8,
            "max": -8.1
        },
        "tags": []
    }, {
        "filename": "B3.mp4",
        "duration": 6.144,
        "volumeInfo": {
            "mean": -26.2,
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "B4.mp4",
        "duration": 6.614,
        "volumeInfo": {
            "mean": -27.1,
            "max": -7.5
        },
        "tags": []
    }, {
        "filename": "B5.mp4",
        "duration": 4.48,
        "volumeInfo": {
            "mean": -31.4,
            "max": -7.9
        },
        "tags": []
    }, {
        "filename": "B6.mp4",
        "duration": 2.518,
        "volumeInfo": {
            "mean": -29.8,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "B7.mp4",
        "duration": 1.408,
        "volumeInfo": {
            "mean": -34.9,
            "max": -12.4
        },
        "tags": []
    }, {
        "filename": "Bb0.mp4",
        "duration": 4.118,
        "volumeInfo": {
            "mean": -27.7,
            "max": -10.8
        },
        "tags": []
    }, {
        "filename": "Bb1.mp4",
        "duration": 4.502,
        "volumeInfo": {
            "mean": -23,
            "max": -7.7
        },
        "tags": []
    }, {
        "filename": "Bb2.mp4",
        "duration": 5.974,
        "volumeInfo": {
            "mean": -26.1,
            "max": -8.6
        },
        "tags": []
    }, {
        "filename": "Bb3.mp4",
        "duration": 5.547,
        "volumeInfo": {
            "mean": -24.6,
            "max": -7.5
        },
        "tags": []
    }, {
        "filename": "Bb4.mp4",
        "duration": 5.312,
        "volumeInfo": {
            "mean": -28,
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "Bb5.mp4",
        "duration": 4.523,
        "volumeInfo": {
            "mean": -27.7,
            "max": -7.5
        },
        "tags": []
    }, {
        "filename": "Bb6.mp4",
        "duration": 2.582,
        "volumeInfo": {
            "mean": -30.1,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Bb7.mp4",
        "duration": 1.43,
        "volumeInfo": {
            "mean": -31.5,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "C1.mp4",
        "duration": 3.926,
        "volumeInfo": {
            "mean": -28.7,
            "max": -9.2
        },
        "tags": []
    }, {
        "filename": "C2.mp4",
        "duration": 5.974,
        "volumeInfo": {
            "mean": -24.4,
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "C3.mp4",
        "duration": 6.614,
        "volumeInfo": {
            "mean": -27,
            "max": -8.2
        },
        "tags": []
    }, {
        "filename": "C4.mp4",
        "duration": 6.464,
        "volumeInfo": {
            "mean": -27.9,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "C5.mp4",
        "duration": 5.547,
        "volumeInfo": {
            "mean": -32.6,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "C6.mp4",
        "duration": 4.736,
        "volumeInfo": {
            "mean": -27.5,
            "max": -9.7
        },
        "tags": []
    }, {
        "filename": "C7.mp4",
        "duration": 2.582,
        "volumeInfo": {
            "mean": -28.2,
            "max": -8.1
        },
        "tags": []
    }, {
        "filename": "C8.mp4",
        "duration": 4.246,
        "volumeInfo": {
            "mean": -36.2,
            "max": -8.1
        },
        "tags": []
    }, {
        "filename": "D1.mp4",
        "duration": 4.779,
        "volumeInfo": {
            "mean": -26,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "D2.mp4",
        "duration": 4.8,
        "volumeInfo": {
            "mean": -24,
            "max": -7.7
        },
        "tags": []
    }, {
        "filename": "D3.mp4",
        "duration": 6.08,
        "volumeInfo": {
            "mean": -25.6,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "D4.mp4",
        "duration": 7.958,
        "volumeInfo": {
            "mean": -28.2,
            "max": -7.4
        },
        "tags": []
    }, {
        "filename": "D5.mp4",
        "duration": 5.462,
        "volumeInfo": {
            "mean": -26.8,
            "max": -7.3
        },
        "tags": []
    }, {
        "filename": "D6.mp4",
        "duration": 3.734,
        "volumeInfo": {
            "mean": -27.4,
            "max": -9.3
        },
        "tags": []
    }, {
        "filename": "D7.mp4",
        "duration": 2.603,
        "volumeInfo": {
            "mean": -32.3,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Db1.mp4",
        "duration": 3.328,
        "volumeInfo": {
            "mean": -30.9,
            "max": -14.1
        },
        "tags": []
    }, {
        "filename": "Db2.mp4",
        "duration": 5.547,
        "volumeInfo": {
            "mean": -24.5,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Db3.mp4",
        "duration": 6.763,
        "volumeInfo": {
            "mean": -24.8,
            "max": -9
        },
        "tags": []
    }, {
        "filename": "Db4.mp4",
        "duration": 9.984,
        "volumeInfo": {
            "mean": -28.5,
            "max": -8.8
        },
        "tags": []
    }, {
        "filename": "Db5.mp4",
        "duration": 5.782,
        "volumeInfo": {
            "mean": -27,
            "max": -7.8
        },
        "tags": []
    }, {
        "filename": "Db6.mp4",
        "duration": 4.16,
        "volumeInfo": {
            "mean": -30.4,
            "max": -11.9
        },
        "tags": []
    }, {
        "filename": "Db7.mp4",
        "duration": 2.262,
        "volumeInfo": {
            "mean": -27.8,
            "max": -8
        },
        "tags": []
    }, {
        "filename": "E1.mp4",
        "duration": 4.011,
        "volumeInfo": {
            "mean": -24.7,
            "max": -8.1
        },
        "tags": []
    }, {
        "filename": "E2.mp4",
        "duration": 5.824,
        "volumeInfo": {
            "mean": -26.4,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "E3.mp4",
        "duration": 6.72,
        "volumeInfo": {
            "mean": -28.3,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "E4.mp4",
        "duration": 8.256,
        "volumeInfo": {
            "mean": -30.4,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "E5.mp4",
        "duration": 4.843,
        "volumeInfo": {
            "mean": -32,
            "max": -11.3
        },
        "tags": []
    }, {
        "filename": "E6.mp4",
        "duration": 3.392,
        "volumeInfo": {
            "mean": -26.9,
            "max": -7.3
        },
        "tags": []
    }, {
        "filename": "E7.mp4",
        "duration": 2.411,
        "volumeInfo": {
            "mean": -31,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Eb1.mp4",
        "duration": 4.971,
        "volumeInfo": {
            "mean": -22.9,
            "max": -8.1
        },
        "tags": []
    }, {
        "filename": "Eb2.mp4",
        "duration": 4.779,
        "volumeInfo": {
            "mean": -24.7,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Eb3.mp4",
        "duration": 5.632,
        "volumeInfo": {
            "mean": -27.1,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "Eb4.mp4",
        "duration": 7.723,
        "volumeInfo": {
            "mean": -27.9,
            "max": -7.6
        },
        "tags": []
    }, {
        "filename": "Eb5.mp4",
        "duration": 5.014,
        "volumeInfo": {
            "mean": -29.8,
            "max": -10.4
        },
        "tags": []
    }, {
        "filename": "Eb6.mp4",
        "duration": 3.883,
        "volumeInfo": {
            "mean": -28.9,
            "max": -7.6
        },
        "tags": []
    }, {
        "filename": "Eb7.mp4",
        "duration": 2.262,
        "volumeInfo": {
            "mean": -30,
            "max": -8.2
        },
        "tags": []
    }, {
        "filename": "F1.mp4",
        "duration": 5.163,
        "volumeInfo": {
            "mean": -24.9,
            "max": -7.8
        },
        "tags": []
    }, {
        "filename": "F2.mp4",
        "duration": 6.23,
        "volumeInfo": {
            "mean": -24.8,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "F3.mp4",
        "duration": 5.654,
        "volumeInfo": {
            "mean": -27.9,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "F4.mp4",
        "duration": 7.382,
        "volumeInfo": {
            "mean": -28.9,
            "max": -7.3
        },
        "tags": []
    }, {
        "filename": "F5.mp4",
        "duration": 5.27,
        "volumeInfo": {
            "mean": -30.9,
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "F6.mp4",
        "duration": 3.67,
        "volumeInfo": {
            "mean": -30,
            "max": -9.1
        },
        "tags": []
    }, {
        "filename": "F7.mp4",
        "duration": 2.112,
        "volumeInfo": {
            "mean": -34.9,
            "max": -11.7
        },
        "tags": []
    }, {
        "filename": "G1.mp4",
        "duration": 4.864,
        "volumeInfo": {
            "mean": -24.6,
            "max": -8.2
        },
        "tags": []
    }, {
        "filename": "G2.mp4",
        "duration": 5.846,
        "volumeInfo": {
            "mean": -27.3,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "G3.mp4",
        "duration": 6.08,
        "volumeInfo": {
            "mean": -28.2,
            "max": -8
        },
        "tags": []
    }, {
        "filename": "G4.mp4",
        "duration": 6.4,
        "volumeInfo": {
            "mean": -30.1,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "G5.mp4",
        "duration": 3.798,
        "volumeInfo": {
            "mean": -27.6,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "G6.mp4",
        "duration": 2.71,
        "volumeInfo": {
            "mean": -29.4,
            "max": -8.6
        },
        "tags": []
    }, {
        "filename": "G7.mp4",
        "duration": 1.387,
        "volumeInfo": {
            "mean": -30.9,
            "max": -9.4
        },
        "tags": []
    }, {
        "filename": "Gb1.mp4",
        "duration": 5.568,
        "volumeInfo": {
            "mean": -26.2,
            "max": -8.2
        },
        "tags": []
    }, {
        "filename": "Gb2.mp4",
        "duration": 4.544,
        "volumeInfo": {
            "mean": -22.6,
            "max": -8.8
        },
        "tags": []
    }, {
        "filename": "Gb3.mp4",
        "duration": 5.568,
        "volumeInfo": {
            "mean": -26.5,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Gb4.mp4",
        "duration": 7.019,
        "volumeInfo": {
            "mean": -31.4,
            "max": -8.2
        },
        "tags": []
    }, {
        "filename": "Gb5.mp4",
        "duration": 4.971,
        "volumeInfo": {
            "mean": -28.7,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Gb6.mp4",
        "duration": 2.774,
        "volumeInfo": {
            "mean": -28.4,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "Gb7.mp4",
        "duration": 1.418,
        "volumeInfo": {
            "mean": -34.1,
            "max": -11.2
        },
        "tags": []
    }],
    "audio": [],
    "frames": []
}

},{}],42:[function(require,module,exports){
module.exports={"tracks":[[{"time":0,"duration":103.44825,"noteNumber":71,"velocity":100,"programNumber":1},{"time":103.44825,"duration":103.44825,"noteNumber":69,"velocity":100,"programNumber":1},{"time":206.8965,"duration":103.44824999999997,"noteNumber":68,"velocity":100,"programNumber":1},{"time":310.34475,"duration":103.44825000000003,"noteNumber":69,"velocity":100,"programNumber":1},{"time":413.793,"duration":206.89649999999995,"noteNumber":72,"velocity":100,"programNumber":1},{"time":827.586,"duration":103.44825000000003,"noteNumber":74,"velocity":100,"programNumber":1},{"time":931.03425,"duration":103.44825000000003,"noteNumber":72,"velocity":100,"programNumber":1},{"time":1034.4825,"duration":103.44824999999992,"noteNumber":71,"velocity":100,"programNumber":1},{"time":1137.93075,"duration":103.44824999999992,"noteNumber":72,"velocity":100,"programNumber":1},{"time":1241.379,"duration":206.89650000000006,"noteNumber":76,"velocity":100,"programNumber":1},{"time":1655.172,"duration":103.44824999999992,"noteNumber":77,"velocity":100,"programNumber":1},{"time":1758.62025,"duration":103.44824999999992,"noteNumber":76,"velocity":100,"programNumber":1},{"time":1862.0684999999999,"duration":103.44824999999992,"noteNumber":75,"velocity":100,"programNumber":1},{"time":1965.5167499999998,"duration":103.44824999999992,"noteNumber":76,"velocity":100,"programNumber":1},{"time":2068.9649999999997,"duration":103.44824999999992,"noteNumber":83,"velocity":100,"programNumber":1},{"time":2172.4132499999996,"duration":103.44824999999992,"noteNumber":81,"velocity":100,"programNumber":1},{"time":2275.8614999999995,"duration":103.44824999999992,"noteNumber":80,"velocity":100,"programNumber":1},{"time":2379.3097499999994,"duration":103.44824999999992,"noteNumber":81,"velocity":100,"programNumber":1},{"time":2482.7579999999994,"duration":103.44824999999992,"noteNumber":83,"velocity":100,"programNumber":1},{"time":2586.2062499999993,"duration":103.44824999999992,"noteNumber":81,"velocity":100,"programNumber":1},{"time":2689.654499999999,"duration":103.44824999999992,"noteNumber":80,"velocity":100,"programNumber":1},{"time":2793.102749999999,"duration":103.44824999999992,"noteNumber":81,"velocity":100,"programNumber":1},{"time":2896.550999999999,"duration":413.7930000000001,"noteNumber":84,"velocity":100,"programNumber":1},{"time":3310.343999999999,"duration":206.89649999999983,"noteNumber":81,"velocity":100,"programNumber":1},{"time":3517.240499999999,"duration":206.89649999999983,"noteNumber":84,"velocity":100,"programNumber":1},{"time":3724.136999999999,"duration":51.724125000000186,"noteNumber":79,"velocity":100,"programNumber":1},{"time":3775.861124999999,"duration":51.724125000000186,"noteNumber":81,"velocity":100,"programNumber":1},{"time":3827.585249999999,"duration":103.44824999999992,"noteNumber":83,"velocity":100,"programNumber":1},{"time":3931.033499999999,"duration":206.8965000000003,"noteNumber":81,"velocity":100,"programNumber":1},{"time":3931.033499999999,"duration":206.8965000000003,"noteNumber":78,"velocity":100,"programNumber":1},{"time":4137.929999999999,"duration":206.89649999999983,"noteNumber":76,"velocity":100,"programNumber":1},{"time":4137.929999999999,"duration":206.89649999999983,"noteNumber":79,"velocity":100,"programNumber":1},{"time":4344.826499999999,"duration":206.89649999999983,"noteNumber":78,"velocity":100,"programNumber":1},{"time":4344.826499999999,"duration":206.89649999999983,"noteNumber":81,"velocity":100,"programNumber":1},{"time":4551.722999999999,"duration":51.72412499999973,"noteNumber":79,"velocity":100,"programNumber":1},{"time":4603.447124999999,"duration":51.72412499999973,"noteNumber":81,"velocity":100,"programNumber":1},{"time":4655.1712499999985,"duration":103.44825000000037,"noteNumber":83,"velocity":100,"programNumber":1},{"time":4758.619499999999,"duration":206.89649999999983,"noteNumber":81,"velocity":100,"programNumber":1},{"time":4758.619499999999,"duration":206.89649999999983,"noteNumber":78,"velocity":100,"programNumber":1},{"time":4965.515999999999,"duration":206.89649999999983,"noteNumber":76,"velocity":100,"programNumber":1},{"time":4965.515999999999,"duration":206.89649999999983,"noteNumber":79,"velocity":100,"programNumber":1},{"time":5172.4124999999985,"duration":206.89649999999983,"noteNumber":81,"velocity":100,"programNumber":1},{"time":5172.4124999999985,"duration":206.89649999999983,"noteNumber":78,"velocity":100,"programNumber":1},{"time":5379.308999999998,"duration":51.72412499999973,"noteNumber":79,"velocity":100,"programNumber":1},{"time":5431.033124999998,"duration":51.72412499999973,"noteNumber":81,"velocity":100,"programNumber":1},{"time":5482.757249999998,"duration":103.44825000000037,"noteNumber":83,"velocity":100,"programNumber":1},{"time":5586.205499999998,"duration":206.89649999999983,"noteNumber":81,"velocity":100,"programNumber":1},{"time":5586.205499999998,"duration":206.89649999999983,"noteNumber":78,"velocity":100,"programNumber":1},{"time":5793.101999999998,"duration":206.89649999999983,"noteNumber":76,"velocity":100,"programNumber":1},{"time":5793.101999999998,"duration":206.89649999999983,"noteNumber":79,"velocity":100,"programNumber":1},{"time":5999.998499999998,"duration":206.89649999999983,"noteNumber":75,"velocity":100,"programNumber":1},{"time":5999.998499999998,"duration":206.89649999999983,"noteNumber":78,"velocity":100,"programNumber":1},{"time":6206.894999999998,"duration":413.79299999999967,"noteNumber":76,"velocity":100,"programNumber":1},{"time":19862.064,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":19965.51225,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":20068.9605,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":20172.408750000002,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":20275.857000000004,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":1},{"time":20689.65,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":20793.098250000003,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":20896.546500000004,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":20999.994750000005,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":21103.443000000007,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":1},{"time":21517.236000000004,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":21620.684250000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":21724.132500000007,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":21827.58075000001,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":21931.02900000001,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":22034.47725000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":22137.925500000012,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":22241.373750000013,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":22344.822000000015,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":22448.270250000016,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":22551.718500000017,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":22655.16675000002,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":22758.61500000002,"duration":413.7930000000015,"noteNumber":84,"velocity":100,"programNumber":1},{"time":23172.40800000002,"duration":206.89649999999892,"noteNumber":81,"velocity":100,"programNumber":1},{"time":23379.30450000002,"duration":206.89649999999892,"noteNumber":83,"velocity":100,"programNumber":1},{"time":23586.20100000002,"duration":206.89649999999892,"noteNumber":84,"velocity":100,"programNumber":1},{"time":23793.097500000018,"duration":206.89649999999892,"noteNumber":83,"velocity":100,"programNumber":1},{"time":23999.994000000017,"duration":206.89649999999892,"noteNumber":81,"velocity":100,"programNumber":1},{"time":24206.890500000016,"duration":206.89649999999892,"noteNumber":80,"velocity":100,"programNumber":1},{"time":24413.787000000015,"duration":206.89649999999892,"noteNumber":81,"velocity":100,"programNumber":1},{"time":24620.683500000014,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":1},{"time":24827.580000000013,"duration":206.89649999999892,"noteNumber":77,"velocity":100,"programNumber":1},{"time":25034.47650000001,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":1},{"time":25241.37300000001,"duration":413.7930000000015,"noteNumber":72,"velocity":100,"programNumber":1},{"time":25655.166000000012,"duration":51.72412500000064,"noteNumber":72,"velocity":100,"programNumber":1},{"time":25706.890125000013,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":25758.614250000013,"duration":51.72412500000064,"noteNumber":72,"velocity":100,"programNumber":1},{"time":25810.338375000014,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":25862.062500000015,"duration":51.72412500000064,"noteNumber":72,"velocity":100,"programNumber":1},{"time":25913.786625000015,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":25965.510750000016,"duration":51.72412500000064,"noteNumber":69,"velocity":100,"programNumber":1},{"time":26017.234875000016,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":26068.959000000017,"duration":413.7930000000015,"noteNumber":69,"velocity":100,"programNumber":1},{"time":66206.88000000002,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":66310.32825000002,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":66413.77650000002,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":66517.22475000002,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":66620.67300000002,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":66724.12125000003,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":66827.56950000003,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":66931.01775000003,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":67034.46600000003,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":67137.91425000003,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":67241.36250000003,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":67344.81075000003,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":67448.25900000003,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":67551.70725000004,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":67655.15550000004,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":67758.60375000004,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":67862.05200000004,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":67965.50025000004,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":68068.94850000004,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":68172.39675000004,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":68275.84500000004,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":68379.29325000005,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":68482.74150000005,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":68586.18975000005,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":68689.63800000005,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":68793.08625000005,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":68896.53450000005,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":68999.98275000005,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":69103.43100000006,"duration":206.89650000000256,"noteNumber":82,"velocity":100,"programNumber":1},{"time":69310.32750000006,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":69517.22400000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":69620.67225000006,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":69724.12050000006,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":69827.56875000006,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":69931.01700000007,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":70034.46525000007,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":70137.91350000007,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":70241.36175000007,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":70344.81000000007,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":70448.25825000007,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":70551.70650000007,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":70655.15475000007,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":70758.60300000008,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":70862.05125000008,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":70965.49950000008,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":71068.94775000008,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":71172.39600000008,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":71275.84425000008,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":71379.29250000008,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":71482.74075000008,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":71586.18900000009,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":71689.63725000009,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":71793.08550000009,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":71896.53375000009,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":71999.98200000009,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":72103.43025000009,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":72206.8785000001,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":72310.3267500001,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":72413.7750000001,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":1},{"time":105931.0080000001,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":106034.4562500001,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":106137.9045000001,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":106241.35275000011,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":106344.80100000011,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":1},{"time":106758.59400000011,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":106862.04225000012,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":106965.49050000012,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":107068.93875000012,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":107172.38700000012,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":107586.18000000012,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":107689.62825000013,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":107793.07650000013,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":107896.52475000013,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":107999.97300000013,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":108103.42125000013,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":108206.86950000013,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":108310.31775000013,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":108413.76600000013,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":108517.21425000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":108620.66250000014,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":108724.11075000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":108827.55900000014,"duration":413.7930000000051,"noteNumber":84,"velocity":100,"programNumber":1},{"time":109241.35200000014,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":109448.24850000015,"duration":206.89650000000256,"noteNumber":84,"velocity":100,"programNumber":1},{"time":109655.14500000015,"duration":51.724124999993364,"noteNumber":79,"velocity":100,"programNumber":1},{"time":109706.86912500014,"duration":51.724124999993364,"noteNumber":81,"velocity":100,"programNumber":1},{"time":109758.59325000014,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":109862.04150000014,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":109862.04150000014,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":110068.93800000014,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":110068.93800000014,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":1},{"time":110275.83450000014,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":110275.83450000014,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":110482.73100000015,"duration":51.724124999993364,"noteNumber":79,"velocity":100,"programNumber":1},{"time":110534.45512500014,"duration":51.724124999993364,"noteNumber":81,"velocity":100,"programNumber":1},{"time":110586.17925000013,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":110689.62750000013,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":110689.62750000013,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":110896.52400000014,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":110896.52400000014,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":1},{"time":111103.42050000014,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":111103.42050000014,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":111310.31700000014,"duration":51.724124999993364,"noteNumber":79,"velocity":100,"programNumber":1},{"time":111362.04112500013,"duration":51.724124999993364,"noteNumber":81,"velocity":100,"programNumber":1},{"time":111413.76525000013,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":111517.21350000013,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":111517.21350000013,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":111724.11000000013,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":111724.11000000013,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":1},{"time":111931.00650000013,"duration":206.89650000000256,"noteNumber":75,"velocity":100,"programNumber":1},{"time":111931.00650000013,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":112137.90300000014,"duration":413.7930000000051,"noteNumber":76,"velocity":100,"programNumber":1},{"time":125793.07200000015,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":125896.52025000015,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":125999.96850000015,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":126103.41675000015,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":126206.86500000015,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":1},{"time":126620.65800000016,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":126724.10625000016,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":126827.55450000016,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":126931.00275000016,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":127034.45100000016,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":127448.24400000017,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":127551.69225000017,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":127655.14050000017,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":127758.58875000017,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":127862.03700000017,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":127965.48525000017,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":128068.93350000017,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":128172.38175000018,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":128275.83000000018,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":128379.27825000018,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":128482.72650000018,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":128586.17475000018,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":128689.62300000018,"duration":413.7930000000051,"noteNumber":84,"velocity":100,"programNumber":1},{"time":129103.41600000019,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":129310.31250000019,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":129517.20900000019,"duration":206.89650000000256,"noteNumber":84,"velocity":100,"programNumber":1},{"time":129724.1055000002,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":129931.0020000002,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":130137.8985000002,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":1},{"time":130344.7950000002,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":130551.6915000002,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":130758.5880000002,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":1},{"time":130965.48450000021,"duration":206.896499999988,"noteNumber":74,"velocity":100,"programNumber":1},{"time":131172.3810000002,"duration":413.7930000000051,"noteNumber":72,"velocity":100,"programNumber":1},{"time":131586.1740000002,"duration":51.724125000007916,"noteNumber":72,"velocity":100,"programNumber":1},{"time":131637.8981250002,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":131689.62225000022,"duration":51.724125000007916,"noteNumber":72,"velocity":100,"programNumber":1},{"time":131741.34637500023,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":131793.07050000023,"duration":51.724125000007916,"noteNumber":72,"velocity":100,"programNumber":1},{"time":131844.79462500024,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":131896.51875000025,"duration":51.724125000007916,"noteNumber":69,"velocity":100,"programNumber":1},{"time":131948.24287500026,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":131999.96700000027,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":1}],[{"time":413.793,"duration":206.89649999999995,"noteNumber":57,"velocity":100,"programNumber":1},{"time":620.6895,"duration":206.89650000000006,"noteNumber":60,"velocity":100,"programNumber":1},{"time":620.6895,"duration":206.89650000000006,"noteNumber":64,"velocity":100,"programNumber":1},{"time":827.586,"duration":206.89650000000006,"noteNumber":60,"velocity":100,"programNumber":1},{"time":827.586,"duration":206.89650000000006,"noteNumber":64,"velocity":100,"programNumber":1},{"time":1034.4825,"duration":206.89650000000006,"noteNumber":60,"velocity":100,"programNumber":1},{"time":1034.4825,"duration":206.89650000000006,"noteNumber":64,"velocity":100,"programNumber":1},{"time":1241.3790000000001,"duration":206.89650000000006,"noteNumber":57,"velocity":100,"programNumber":1},{"time":1448.2755000000002,"duration":206.89650000000006,"noteNumber":60,"velocity":100,"programNumber":1},{"time":1448.2755000000002,"duration":206.89650000000006,"noteNumber":64,"velocity":100,"programNumber":1},{"time":1655.1720000000003,"duration":206.89650000000006,"noteNumber":60,"velocity":100,"programNumber":1},{"time":1655.1720000000003,"duration":206.89650000000006,"noteNumber":64,"velocity":100,"programNumber":1},{"time":1862.0685000000003,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":1862.0685000000003,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":2068.965,"duration":206.89649999999983,"noteNumber":57,"velocity":100,"programNumber":1},{"time":2275.8615,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":2275.8615,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":2482.758,"duration":206.89649999999983,"noteNumber":57,"velocity":100,"programNumber":1},{"time":2689.6544999999996,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":2689.6544999999996,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":2896.5509999999995,"duration":206.89649999999983,"noteNumber":57,"velocity":100,"programNumber":1},{"time":3103.4474999999993,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":3103.4474999999993,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":3310.343999999999,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":3310.343999999999,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":3517.240499999999,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":3517.240499999999,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":3724.136999999999,"duration":206.89649999999983,"noteNumber":52,"velocity":100,"programNumber":1},{"time":3931.0334999999986,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":3931.0334999999986,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":4137.9299999999985,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":4137.9299999999985,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":4344.826499999998,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":4344.826499999998,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":4551.722999999998,"duration":206.89649999999983,"noteNumber":52,"velocity":100,"programNumber":1},{"time":4758.619499999998,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":4758.619499999998,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":4965.515999999998,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":4965.515999999998,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":5172.412499999998,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":5172.412499999998,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":5379.3089999999975,"duration":206.89649999999983,"noteNumber":52,"velocity":100,"programNumber":1},{"time":5586.205499999997,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":5586.205499999997,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":5793.101999999997,"duration":206.89649999999983,"noteNumber":47,"velocity":100,"programNumber":1},{"time":5999.998499999997,"duration":206.89649999999983,"noteNumber":59,"velocity":100,"programNumber":1},{"time":6206.894999999997,"duration":413.79299999999967,"noteNumber":52,"velocity":100,"programNumber":1},{"time":20275.856999999996,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":20482.753499999995,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":20482.753499999995,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":20689.649999999994,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":20689.649999999994,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":20896.546499999993,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":20896.546499999993,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":21103.442999999992,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":21310.33949999999,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":21310.33949999999,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":21517.23599999999,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":21517.23599999999,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":21724.13249999999,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":21724.13249999999,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":21931.028999999988,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":22137.925499999987,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":22137.925499999987,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":22344.821999999986,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":22551.718499999984,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":1},{"time":22551.718499999984,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":22758.614999999983,"duration":206.89649999999892,"noteNumber":53,"velocity":100,"programNumber":1},{"time":22965.511499999982,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":22965.511499999982,"duration":206.89649999999892,"noteNumber":63,"velocity":100,"programNumber":1},{"time":23172.40799999998,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":23172.40799999998,"duration":206.89649999999892,"noteNumber":63,"velocity":100,"programNumber":1},{"time":23379.30449999998,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":23379.30449999998,"duration":206.89649999999892,"noteNumber":63,"velocity":100,"programNumber":1},{"time":23586.20099999998,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":1},{"time":23793.097499999978,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":23793.097499999978,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":1},{"time":23999.993999999977,"duration":206.89649999999892,"noteNumber":50,"velocity":100,"programNumber":1},{"time":24206.890499999976,"duration":206.89649999999892,"noteNumber":53,"velocity":100,"programNumber":1},{"time":24206.890499999976,"duration":206.89649999999892,"noteNumber":59,"velocity":100,"programNumber":1},{"time":24413.786999999975,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":1},{"time":24620.683499999974,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":1},{"time":24620.683499999974,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":24827.579999999973,"duration":206.89649999999892,"noteNumber":50,"velocity":100,"programNumber":1},{"time":25034.47649999997,"duration":206.89649999999892,"noteNumber":53,"velocity":100,"programNumber":1},{"time":25034.47649999997,"duration":206.89649999999892,"noteNumber":59,"velocity":100,"programNumber":1},{"time":25241.37299999997,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":25241.37299999997,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":1},{"time":25448.26949999997,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":1},{"time":25448.26949999997,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":1},{"time":25655.16599999997,"duration":206.89649999999892,"noteNumber":56,"velocity":100,"programNumber":1},{"time":25655.16599999997,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":1},{"time":25862.062499999967,"duration":206.89649999999892,"noteNumber":56,"velocity":100,"programNumber":1},{"time":25862.062499999967,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":1},{"time":26068.958999999966,"duration":413.7930000000015,"noteNumber":57,"velocity":100,"programNumber":1},{"time":26068.958999999966,"duration":413.7930000000015,"noteNumber":45,"velocity":100,"programNumber":1},{"time":66620.67299999997,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":66827.56949999997,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":66827.56949999997,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":67034.46599999997,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":67034.46599999997,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":67241.36249999997,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":67241.36249999997,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":67448.25899999998,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":67655.15549999998,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":67655.15549999998,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":67862.05199999998,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":68068.94849999998,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":68068.94849999998,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":68275.84499999999,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":68482.74149999999,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":68482.74149999999,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":68689.63799999999,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":68689.63799999999,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":68896.5345,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":68896.5345,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":69103.431,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":69310.3275,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":69310.3275,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":69517.224,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":69517.224,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":69724.1205,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":69724.1205,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":69931.017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":70137.91350000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":70137.91350000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":70344.81000000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":70344.81000000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":70551.70650000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":70551.70650000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":70758.60300000002,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":70965.49950000002,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":70965.49950000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":71172.39600000002,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":71379.29250000003,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":71379.29250000003,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":71586.18900000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":71793.08550000003,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":71999.98200000003,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":72206.87850000004,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":72413.77500000004,"duration":206.89650000000256,"noteNumber":45,"velocity":100,"programNumber":1},{"time":72620.67150000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":106344.80100000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":106551.69750000004,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":106551.69750000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":106758.59400000004,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":106758.59400000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":106965.49050000004,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":106965.49050000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":107172.38700000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":107379.28350000005,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":107379.28350000005,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":107586.18000000005,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":107586.18000000005,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":107793.07650000005,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":107793.07650000005,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":107999.97300000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":108206.86950000006,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":108206.86950000006,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":108413.76600000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":108620.66250000006,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":108620.66250000006,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":108827.55900000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":109034.45550000007,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":109034.45550000007,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":109241.35200000007,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":109241.35200000007,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":109448.24850000007,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":109448.24850000007,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":109655.14500000008,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":109862.04150000008,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":109862.04150000008,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":110068.93800000008,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":110068.93800000008,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":110275.83450000008,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":110275.83450000008,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":110482.73100000009,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":110689.62750000009,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":110689.62750000009,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":110896.52400000009,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":110896.52400000009,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":111103.4205000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":111103.4205000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":111310.3170000001,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":111517.2135000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":111517.2135000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":111724.1100000001,"duration":206.89650000000256,"noteNumber":47,"velocity":100,"programNumber":1},{"time":111931.0065000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":112137.90300000011,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":1},{"time":126206.8650000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":126413.76150000011,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":126413.76150000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":126620.65800000011,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":126620.65800000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":126827.55450000011,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":126827.55450000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":127034.45100000012,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":127241.34750000012,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":127241.34750000012,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":127448.24400000012,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":127448.24400000012,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":127655.14050000013,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":127655.14050000013,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":127862.03700000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":128068.93350000013,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":128068.93350000013,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":128275.83000000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":128482.72650000014,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":128482.72650000014,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":128689.62300000014,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":128896.51950000014,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":128896.51950000014,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":129103.41600000014,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":129103.41600000014,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":129310.31250000015,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":129310.31250000015,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":129517.20900000015,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":129724.10550000015,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":129724.10550000015,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":129931.00200000015,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":130137.89850000016,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":130137.89850000016,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":130344.79500000016,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":1},{"time":130551.69150000016,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":130551.69150000016,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":130758.58800000016,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":130965.48450000017,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":130965.48450000017,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":131172.38100000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":131172.38100000017,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":131379.27750000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":131379.27750000017,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":131586.17400000017,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":131586.17400000017,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":131793.07050000018,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":131793.07050000018,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":131999.96700000018,"duration":413.7930000000051,"noteNumber":57,"velocity":100,"programNumber":1},{"time":131999.96700000018,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":1}],[{"time":6620.688,"duration":103.44825000000037,"noteNumber":71,"velocity":100,"programNumber":1},{"time":6724.1362500000005,"duration":103.44825000000037,"noteNumber":69,"velocity":100,"programNumber":1},{"time":6827.584500000001,"duration":103.44825000000037,"noteNumber":68,"velocity":100,"programNumber":1},{"time":6931.032750000001,"duration":103.44825000000037,"noteNumber":69,"velocity":100,"programNumber":1},{"time":7034.481000000002,"duration":206.89649999999983,"noteNumber":72,"velocity":100,"programNumber":1},{"time":7448.274000000001,"duration":103.44825000000037,"noteNumber":74,"velocity":100,"programNumber":1},{"time":7551.722250000002,"duration":103.44825000000037,"noteNumber":72,"velocity":100,"programNumber":1},{"time":7655.170500000002,"duration":103.44825000000037,"noteNumber":71,"velocity":100,"programNumber":1},{"time":7758.618750000002,"duration":103.44825000000037,"noteNumber":72,"velocity":100,"programNumber":1},{"time":7862.067000000003,"duration":206.89649999999983,"noteNumber":76,"velocity":100,"programNumber":1},{"time":8275.860000000002,"duration":103.44824999999946,"noteNumber":77,"velocity":100,"programNumber":1},{"time":8379.308250000002,"duration":103.44824999999946,"noteNumber":76,"velocity":100,"programNumber":1},{"time":8482.756500000001,"duration":103.44824999999946,"noteNumber":75,"velocity":100,"programNumber":1},{"time":8586.20475,"duration":103.44824999999946,"noteNumber":76,"velocity":100,"programNumber":1},{"time":8689.653,"duration":103.44824999999946,"noteNumber":83,"velocity":100,"programNumber":1},{"time":8793.10125,"duration":103.44824999999946,"noteNumber":81,"velocity":100,"programNumber":1},{"time":8896.5495,"duration":103.44824999999946,"noteNumber":80,"velocity":100,"programNumber":1},{"time":8999.997749999999,"duration":103.44824999999946,"noteNumber":81,"velocity":100,"programNumber":1},{"time":9103.445999999998,"duration":103.44824999999946,"noteNumber":83,"velocity":100,"programNumber":1},{"time":9206.894249999998,"duration":103.44824999999946,"noteNumber":81,"velocity":100,"programNumber":1},{"time":9310.342499999997,"duration":103.44824999999946,"noteNumber":80,"velocity":100,"programNumber":1},{"time":9413.790749999996,"duration":103.44824999999946,"noteNumber":81,"velocity":100,"programNumber":1},{"time":9517.238999999996,"duration":413.79299999999967,"noteNumber":84,"velocity":100,"programNumber":1},{"time":9931.031999999996,"duration":206.89650000000074,"noteNumber":81,"velocity":100,"programNumber":1},{"time":10137.928499999996,"duration":206.89650000000074,"noteNumber":84,"velocity":100,"programNumber":1},{"time":10344.824999999997,"duration":51.72412500000064,"noteNumber":79,"velocity":100,"programNumber":1},{"time":10396.549124999998,"duration":51.72412500000064,"noteNumber":81,"velocity":100,"programNumber":1},{"time":10448.273249999998,"duration":103.44824999999946,"noteNumber":83,"velocity":100,"programNumber":1},{"time":10551.721499999998,"duration":206.89650000000074,"noteNumber":81,"velocity":100,"programNumber":1},{"time":10551.721499999998,"duration":206.89650000000074,"noteNumber":78,"velocity":100,"programNumber":1},{"time":10758.617999999999,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":1},{"time":10758.617999999999,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":1},{"time":10965.5145,"duration":206.89650000000074,"noteNumber":78,"velocity":100,"programNumber":1},{"time":10965.5145,"duration":206.89650000000074,"noteNumber":81,"velocity":100,"programNumber":1},{"time":11172.411,"duration":51.72412500000064,"noteNumber":79,"velocity":100,"programNumber":1},{"time":11224.135125,"duration":51.72412500000064,"noteNumber":81,"velocity":100,"programNumber":1},{"time":11275.859250000001,"duration":103.44824999999946,"noteNumber":83,"velocity":100,"programNumber":1},{"time":11379.3075,"duration":206.89650000000074,"noteNumber":81,"velocity":100,"programNumber":1},{"time":11379.3075,"duration":206.89650000000074,"noteNumber":78,"velocity":100,"programNumber":1},{"time":11586.204000000002,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":1},{"time":11586.204000000002,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":1},{"time":11793.100500000002,"duration":206.89650000000074,"noteNumber":81,"velocity":100,"programNumber":1},{"time":11793.100500000002,"duration":206.89650000000074,"noteNumber":78,"velocity":100,"programNumber":1},{"time":11999.997000000003,"duration":51.72412500000064,"noteNumber":79,"velocity":100,"programNumber":1},{"time":12051.721125000004,"duration":51.72412500000064,"noteNumber":81,"velocity":100,"programNumber":1},{"time":12103.445250000004,"duration":103.44824999999946,"noteNumber":83,"velocity":100,"programNumber":1},{"time":12206.893500000004,"duration":206.89650000000074,"noteNumber":81,"velocity":100,"programNumber":1},{"time":12206.893500000004,"duration":206.89650000000074,"noteNumber":78,"velocity":100,"programNumber":1},{"time":12413.790000000005,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":1},{"time":12413.790000000005,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":1},{"time":12620.686500000005,"duration":206.89650000000074,"noteNumber":75,"velocity":100,"programNumber":1},{"time":12620.686500000005,"duration":206.89650000000074,"noteNumber":78,"velocity":100,"programNumber":1},{"time":12827.583000000006,"duration":413.79299999999967,"noteNumber":76,"velocity":100,"programNumber":1},{"time":33103.44,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":33206.88825,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":33310.336500000005,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":33413.784750000006,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":33517.23300000001,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":1},{"time":33931.02600000001,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":34034.474250000014,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":34137.922500000015,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":34241.37075000002,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":34344.81900000002,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":34758.61200000002,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":34862.060250000024,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":34965.508500000025,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":35068.95675000003,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":35172.40500000003,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":35275.85325000003,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":35379.30150000003,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":35482.74975000003,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":35586.19800000003,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":35689.646250000034,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":35793.094500000036,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":35896.54275000004,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":35999.99100000004,"duration":413.79299999999785,"noteNumber":84,"velocity":100,"programNumber":1},{"time":36413.784000000036,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":36620.68050000004,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":36827.57700000004,"duration":206.89650000000256,"noteNumber":84,"velocity":100,"programNumber":1},{"time":37034.473500000044,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":37241.370000000046,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":37448.26650000005,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":1},{"time":37655.16300000005,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":37862.059500000054,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":38068.95600000006,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":1},{"time":38275.85250000006,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":1},{"time":38482.74900000006,"duration":413.79299999999785,"noteNumber":72,"velocity":100,"programNumber":1},{"time":38896.54200000006,"duration":51.72412500000064,"noteNumber":72,"velocity":100,"programNumber":1},{"time":38948.26612500006,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":38999.99025000006,"duration":51.72412500000064,"noteNumber":72,"velocity":100,"programNumber":1},{"time":39051.71437500006,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":39103.43850000006,"duration":51.72412500000064,"noteNumber":72,"velocity":100,"programNumber":1},{"time":39155.16262500006,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":39206.88675000006,"duration":51.72412500000064,"noteNumber":69,"velocity":100,"programNumber":1},{"time":39258.610875000064,"duration":51.72412500000064,"noteNumber":71,"velocity":100,"programNumber":1},{"time":39310.335000000065,"duration":413.79299999999785,"noteNumber":69,"velocity":100,"programNumber":1},{"time":79448.25600000005,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":79551.70425000005,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":79655.15250000005,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":79758.60075000006,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":79862.04900000006,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":79965.49725000006,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":80068.94550000006,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":80172.39375000006,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":80275.84200000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":80379.29025000006,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":80482.73850000006,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":80586.18675000007,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":80689.63500000007,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":80793.08325000007,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":80896.53150000007,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":80999.97975000007,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":81103.42800000007,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":81206.87625000007,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":81310.32450000008,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":81413.77275000008,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":81517.22100000008,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":81620.66925000008,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":81724.11750000008,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":81827.56575000008,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":81931.01400000008,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":82034.46225000008,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":82137.91050000009,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":82241.35875000009,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":82344.80700000009,"duration":206.89650000000256,"noteNumber":82,"velocity":100,"programNumber":1},{"time":82551.70350000009,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":82758.6000000001,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":82862.0482500001,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":82965.4965000001,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":83068.9447500001,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":83172.3930000001,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":83275.8412500001,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":83379.2895000001,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":83482.7377500001,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":83586.1860000001,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":83689.6342500001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":83793.0825000001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":83896.5307500001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":83999.97900000011,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":84103.42725000011,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":84206.87550000011,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":84310.32375000011,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":84413.77200000011,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":84517.22025000011,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":84620.66850000012,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":84724.11675000012,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":84827.56500000012,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":84931.01325000012,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":85034.46150000012,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":85137.90975000012,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":85241.35800000012,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":85344.80625000013,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":85448.25450000013,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":85551.70275000013,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":85655.15100000013,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":1},{"time":112551.69600000014,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":112655.14425000014,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":112758.59250000014,"duration":103.44825000000128,"noteNumber":68,"velocity":100,"programNumber":1},{"time":112862.04075000015,"duration":103.44825000000128,"noteNumber":69,"velocity":100,"programNumber":1},{"time":112965.48900000015,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":1},{"time":113379.28200000015,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":1},{"time":113482.73025000015,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":113586.17850000015,"duration":103.44825000000128,"noteNumber":71,"velocity":100,"programNumber":1},{"time":113689.62675000016,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":113793.07500000016,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":114206.86800000016,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":114310.31625000016,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":114413.76450000016,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":114517.21275000017,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":114620.66100000017,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":114724.10925000017,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":114827.55750000017,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":114931.00575000017,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":115034.45400000017,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":115137.90225000017,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":115241.35050000018,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":115344.79875000018,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":115448.24700000018,"duration":413.7930000000051,"noteNumber":84,"velocity":100,"programNumber":1},{"time":115862.04000000018,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":116068.93650000019,"duration":206.89650000000256,"noteNumber":84,"velocity":100,"programNumber":1},{"time":116275.83300000019,"duration":51.724124999993364,"noteNumber":79,"velocity":100,"programNumber":1},{"time":116327.55712500018,"duration":51.724124999993364,"noteNumber":81,"velocity":100,"programNumber":1},{"time":116379.28125000017,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":116482.72950000018,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":116482.72950000018,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":116689.62600000018,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":116689.62600000018,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":1},{"time":116896.52250000018,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":116896.52250000018,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":117103.41900000018,"duration":51.724124999993364,"noteNumber":79,"velocity":100,"programNumber":1},{"time":117155.14312500018,"duration":51.724124999993364,"noteNumber":81,"velocity":100,"programNumber":1},{"time":117206.86725000017,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":117310.31550000017,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":117310.31550000017,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":117517.21200000017,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":117517.21200000017,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":1},{"time":117724.10850000018,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":117724.10850000018,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":117931.00500000018,"duration":51.724124999993364,"noteNumber":79,"velocity":100,"programNumber":1},{"time":117982.72912500017,"duration":51.724124999993364,"noteNumber":81,"velocity":100,"programNumber":1},{"time":118034.45325000017,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":118137.90150000017,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":118137.90150000017,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":118344.79800000017,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":118344.79800000017,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":1},{"time":118551.69450000017,"duration":206.89650000000256,"noteNumber":75,"velocity":100,"programNumber":1},{"time":118551.69450000017,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":1},{"time":118758.59100000017,"duration":413.7930000000051,"noteNumber":76,"velocity":100,"programNumber":1},{"time":139034.44800000018,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":1},{"time":139137.89625000017,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":1},{"time":139241.34450000015,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":1},{"time":139344.79275000014,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":1},{"time":139448.24100000013,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":1},{"time":139862.03400000013,"duration":103.44824999998673,"noteNumber":74,"velocity":100,"programNumber":1},{"time":139965.48225000012,"duration":103.44824999998673,"noteNumber":72,"velocity":100,"programNumber":1},{"time":140068.9305000001,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":1},{"time":140172.3787500001,"duration":103.44824999998673,"noteNumber":72,"velocity":100,"programNumber":1},{"time":140275.82700000008,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":140689.62000000008,"duration":103.44824999998673,"noteNumber":77,"velocity":100,"programNumber":1},{"time":140793.06825000007,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":1},{"time":140896.51650000006,"duration":103.44824999998673,"noteNumber":75,"velocity":100,"programNumber":1},{"time":140999.96475000004,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":1},{"time":141103.41300000003,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":1},{"time":141206.86125000002,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":1},{"time":141310.3095,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":1},{"time":141413.75775,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":1},{"time":141517.20599999998,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":1},{"time":141620.65424999996,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":1},{"time":141724.10249999995,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":1},{"time":141827.55074999994,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":1},{"time":141930.99899999992,"duration":413.7930000000051,"noteNumber":84,"velocity":100,"programNumber":1},{"time":142344.79199999993,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":142551.68849999993,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":142758.58499999993,"duration":206.89650000000256,"noteNumber":84,"velocity":100,"programNumber":1},{"time":142965.48149999994,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":1},{"time":143172.37799999994,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":143379.27449999994,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":1},{"time":143586.17099999994,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":1},{"time":143793.06749999995,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":1},{"time":143999.96399999995,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":1},{"time":144206.86049999995,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":1},{"time":144413.75699999995,"duration":413.7930000000051,"noteNumber":72,"velocity":100,"programNumber":1},{"time":144827.54999999996,"duration":51.724125000007916,"noteNumber":72,"velocity":100,"programNumber":1},{"time":144879.27412499997,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":144930.99824999998,"duration":51.724125000007916,"noteNumber":72,"velocity":100,"programNumber":1},{"time":144982.72237499998,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":145034.4465,"duration":51.724125000007916,"noteNumber":72,"velocity":100,"programNumber":1},{"time":145086.170625,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":145137.89475,"duration":51.724125000007916,"noteNumber":69,"velocity":100,"programNumber":1},{"time":145189.61887500001,"duration":51.724125000007916,"noteNumber":71,"velocity":100,"programNumber":1},{"time":145241.34300000002,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":1}],[{"time":7034.481,"duration":206.89649999999983,"noteNumber":57,"velocity":100,"programNumber":1},{"time":7241.3775,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":7241.3775,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":7448.273999999999,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":7448.273999999999,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":7655.170499999999,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":7655.170499999999,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":7862.066999999999,"duration":206.89649999999983,"noteNumber":57,"velocity":100,"programNumber":1},{"time":8068.963499999999,"duration":206.89649999999983,"noteNumber":60,"velocity":100,"programNumber":1},{"time":8068.963499999999,"duration":206.89649999999983,"noteNumber":64,"velocity":100,"programNumber":1},{"time":8275.859999999999,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":8275.859999999999,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":8482.7565,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":8482.7565,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":8689.653,"duration":206.89650000000074,"noteNumber":57,"velocity":100,"programNumber":1},{"time":8896.549500000001,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":8896.549500000001,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":9103.446000000002,"duration":206.89650000000074,"noteNumber":57,"velocity":100,"programNumber":1},{"time":9310.342500000002,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":9310.342500000002,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":9517.239000000003,"duration":206.89650000000074,"noteNumber":57,"velocity":100,"programNumber":1},{"time":9724.135500000004,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":9724.135500000004,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":9931.032000000005,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":9931.032000000005,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":10137.928500000005,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":1},{"time":10137.928500000005,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":10344.825000000006,"duration":206.89650000000074,"noteNumber":52,"velocity":100,"programNumber":1},{"time":10551.721500000007,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":10551.721500000007,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":10758.618000000008,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":10758.618000000008,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":10965.514500000008,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":10965.514500000008,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":11172.41100000001,"duration":206.89650000000074,"noteNumber":52,"velocity":100,"programNumber":1},{"time":11379.30750000001,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":11379.30750000001,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":11586.20400000001,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":11586.20400000001,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":11793.100500000011,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":11793.100500000011,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":11999.997000000012,"duration":206.89650000000074,"noteNumber":52,"velocity":100,"programNumber":1},{"time":12206.893500000013,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":12206.893500000013,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":1},{"time":12413.790000000014,"duration":206.89650000000074,"noteNumber":47,"velocity":100,"programNumber":1},{"time":12620.686500000014,"duration":206.89650000000074,"noteNumber":59,"velocity":100,"programNumber":1},{"time":12827.583000000015,"duration":413.79299999999967,"noteNumber":52,"velocity":100,"programNumber":1},{"time":33517.233000000015,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":33724.12950000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":33724.12950000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":33931.02600000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":33931.02600000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":34137.92250000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":34137.92250000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":34344.819000000025,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":34551.71550000003,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":34551.71550000003,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":34758.61200000003,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":34758.61200000003,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":34965.50850000003,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":34965.50850000003,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":35172.405000000035,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":35379.30150000004,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":35379.30150000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":35586.19800000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":35793.09450000004,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":35793.09450000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":35999.991000000045,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":36206.88750000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":36206.88750000005,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":36413.78400000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":36413.78400000005,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":36620.68050000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":36620.68050000005,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":36827.577000000056,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":37034.47350000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":37034.47350000006,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":37241.37000000006,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":37448.26650000006,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":37448.26650000006,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":37655.163000000066,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":1},{"time":37862.05950000007,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":37862.05950000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":38068.95600000007,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":38275.85250000007,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":38275.85250000007,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":38482.749000000076,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":38482.749000000076,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":38689.64550000008,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":38689.64550000008,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":38896.54200000008,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":38896.54200000008,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":39103.438500000084,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":39103.438500000084,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":39310.33500000009,"duration":413.79299999999785,"noteNumber":57,"velocity":100,"programNumber":1},{"time":39310.33500000009,"duration":413.79299999999785,"noteNumber":45,"velocity":100,"programNumber":1},{"time":79862.04900000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":80068.94550000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":80068.94550000009,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":80275.84200000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":80275.84200000009,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":80482.7385000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":80482.7385000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":80689.6350000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":80896.5315000001,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":80896.5315000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":81103.4280000001,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":81310.3245000001,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":81310.3245000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":81517.2210000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":81724.11750000011,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":81724.11750000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":81931.01400000011,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":81931.01400000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":82137.91050000011,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":82137.91050000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":82344.80700000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":82551.70350000012,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":82551.70350000012,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":82758.60000000012,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":82758.60000000012,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":82965.49650000012,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":82965.49650000012,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":83172.39300000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":83379.28950000013,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":83379.28950000013,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":83586.18600000013,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":83586.18600000013,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":83793.08250000014,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":83793.08250000014,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":83999.97900000014,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":84206.87550000014,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":84206.87550000014,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":84413.77200000014,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":84620.66850000015,"duration":206.89650000000256,"noteNumber":62,"velocity":100,"programNumber":1},{"time":84620.66850000015,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":84827.56500000015,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":85034.46150000015,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":85241.35800000015,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":85448.25450000016,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":85655.15100000016,"duration":206.89650000000256,"noteNumber":45,"velocity":100,"programNumber":1},{"time":85862.04750000016,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":112965.48900000016,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":113172.38550000016,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":113172.38550000016,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":113379.28200000017,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":113379.28200000017,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":113586.17850000017,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":113586.17850000017,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":113793.07500000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":113999.97150000017,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":113999.97150000017,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":114206.86800000018,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":114206.86800000018,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":114413.76450000018,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":114413.76450000018,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":114620.66100000018,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":114827.55750000018,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":114827.55750000018,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":115034.45400000019,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":115241.35050000019,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":115241.35050000019,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":115448.24700000019,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":115655.1435000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":115655.1435000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":115862.0400000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":115862.0400000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":116068.9365000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":116068.9365000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":116275.8330000002,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":116482.7295000002,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":116482.7295000002,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":116689.62600000021,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":116689.62600000021,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":116896.52250000021,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":116896.52250000021,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":117103.41900000021,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":117310.31550000022,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":117310.31550000022,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":117517.21200000022,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":117517.21200000022,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":117724.10850000022,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":117724.10850000022,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":117931.00500000022,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":118137.90150000023,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":118137.90150000023,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":118344.79800000023,"duration":206.89650000000256,"noteNumber":47,"velocity":100,"programNumber":1},{"time":118551.69450000023,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":118758.59100000023,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":1},{"time":139448.24100000024,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":139655.13750000024,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":139655.13750000024,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":139862.03400000025,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":139862.03400000025,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":140068.93050000025,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":140068.93050000025,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":140275.82700000025,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":140482.72350000025,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":140482.72350000025,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":140689.62000000026,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":140689.62000000026,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":140896.51650000026,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":140896.51650000026,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":141103.41300000026,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":141310.30950000026,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":141310.30950000026,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":141517.20600000027,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":141724.10250000027,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":1},{"time":141724.10250000027,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":141930.99900000027,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":142137.89550000028,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":142137.89550000028,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":142344.79200000028,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":142344.79200000028,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":142551.68850000028,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":142551.68850000028,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":142758.58500000028,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":142965.4815000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":142965.4815000003,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":143172.3780000003,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":143379.2745000003,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":143379.2745000003,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":143586.1710000003,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":1},{"time":143793.0675000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":143793.0675000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":143999.9640000003,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":1},{"time":144206.8605000003,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":144206.8605000003,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":144413.7570000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":144413.7570000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":144620.6535000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":144620.6535000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":144827.5500000003,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":144827.5500000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":145034.4465000003,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":145034.4465000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":1},{"time":145241.3430000003,"duration":413.7930000000051,"noteNumber":57,"velocity":100,"programNumber":1},{"time":145241.3430000003,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":1}],[{"time":13241.376,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":0},{"time":13241.376,"duration":206.89650000000074,"noteNumber":72,"velocity":100,"programNumber":0},{"time":13448.272500000001,"duration":206.89650000000074,"noteNumber":77,"velocity":100,"programNumber":0},{"time":13448.272500000001,"duration":206.89650000000074,"noteNumber":74,"velocity":100,"programNumber":0},{"time":13655.169000000002,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":0},{"time":13655.169000000002,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":0},{"time":13862.065500000002,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":0},{"time":13862.065500000002,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":0},{"time":14068.962000000003,"duration":103.44824999999946,"noteNumber":81,"velocity":100,"programNumber":0},{"time":14172.410250000003,"duration":103.44824999999946,"noteNumber":79,"velocity":100,"programNumber":0},{"time":14275.858500000002,"duration":103.44824999999946,"noteNumber":77,"velocity":100,"programNumber":0},{"time":14379.306750000002,"duration":103.44824999999946,"noteNumber":76,"velocity":100,"programNumber":0},{"time":14482.755000000001,"duration":206.89650000000074,"noteNumber":71,"velocity":100,"programNumber":0},{"time":14689.651500000002,"duration":206.89650000000074,"noteNumber":67,"velocity":100,"programNumber":0},{"time":14482.755000000001,"duration":413.7930000000015,"noteNumber":74,"velocity":100,"programNumber":0},{"time":14896.548000000003,"duration":206.89650000000074,"noteNumber":72,"velocity":100,"programNumber":0},{"time":14896.548000000003,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":0},{"time":15103.444500000003,"duration":206.89650000000074,"noteNumber":74,"velocity":100,"programNumber":0},{"time":15103.444500000003,"duration":206.89650000000074,"noteNumber":77,"velocity":100,"programNumber":0},{"time":15310.341000000004,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":0},{"time":15310.341000000004,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":0},{"time":15517.237500000005,"duration":206.89650000000074,"noteNumber":76,"velocity":100,"programNumber":0},{"time":15517.237500000005,"duration":206.89650000000074,"noteNumber":79,"velocity":100,"programNumber":0},{"time":15724.134000000005,"duration":103.44824999999946,"noteNumber":81,"velocity":100,"programNumber":0},{"time":15827.582250000005,"duration":103.44824999999946,"noteNumber":79,"velocity":100,"programNumber":0},{"time":15931.030500000004,"duration":103.44824999999946,"noteNumber":77,"velocity":100,"programNumber":0},{"time":16034.478750000004,"duration":103.44824999999946,"noteNumber":76,"velocity":100,"programNumber":0},{"time":16137.927000000003,"duration":413.7930000000015,"noteNumber":74,"velocity":100,"programNumber":0},{"time":16137.927000000003,"duration":413.7930000000015,"noteNumber":71,"velocity":100,"programNumber":0},{"time":16551.720000000005,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":16551.720000000005,"duration":206.89649999999892,"noteNumber":69,"velocity":100,"programNumber":0},{"time":16758.616500000004,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":0},{"time":16758.616500000004,"duration":206.89649999999892,"noteNumber":71,"velocity":100,"programNumber":0},{"time":16965.513000000003,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":16965.513000000003,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":17172.4095,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":17172.4095,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":17379.306,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":17482.75425,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":17586.202500000003,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":0},{"time":17689.650750000004,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":0},{"time":17793.099000000006,"duration":206.89649999999892,"noteNumber":68,"velocity":100,"programNumber":0},{"time":17999.995500000005,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":0},{"time":17793.099000000006,"duration":413.79299999999785,"noteNumber":71,"velocity":100,"programNumber":0},{"time":18206.892000000003,"duration":206.89649999999892,"noteNumber":69,"velocity":100,"programNumber":0},{"time":18206.892000000003,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":18413.788500000002,"duration":206.89649999999892,"noteNumber":71,"velocity":100,"programNumber":0},{"time":18413.788500000002,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":0},{"time":18620.685,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":18620.685,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":18827.5815,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":18827.5815,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":19034.478,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":19137.92625,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":19241.3745,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":0},{"time":19344.822750000003,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":0},{"time":19448.271000000004,"duration":413.7930000000015,"noteNumber":71,"velocity":100,"programNumber":0},{"time":19448.271000000004,"duration":413.7930000000015,"noteNumber":68,"velocity":100,"programNumber":0},{"time":39724.128000000004,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":39724.128000000004,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":39931.02450000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":39931.02450000001,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":40137.92100000001,"duration":413.79299999999785,"noteNumber":85,"velocity":100,"programNumber":0},{"time":40137.92100000001,"duration":413.79299999999785,"noteNumber":73,"velocity":100,"programNumber":0},{"time":40551.71400000001,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":40551.71400000001,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":40758.61050000001,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":40758.61050000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":40965.50700000001,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":40965.50700000001,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":41172.403500000015,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":41172.403500000015,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":41379.30000000002,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":41379.30000000002,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":41586.19650000002,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":41586.19650000002,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":41793.09300000002,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":41793.09300000002,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":41999.989500000025,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":41999.989500000025,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":42206.88600000003,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":42206.88600000003,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":42413.78250000003,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":42413.78250000003,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":42620.67900000003,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":42620.67900000003,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":42827.575500000035,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":42827.575500000035,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":43034.47200000004,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":43034.47200000004,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":43241.36850000004,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":43241.36850000004,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":43448.26500000004,"duration":413.79299999999785,"noteNumber":85,"velocity":100,"programNumber":0},{"time":43448.26500000004,"duration":413.79299999999785,"noteNumber":73,"velocity":100,"programNumber":0},{"time":43862.05800000004,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":43862.05800000004,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":44068.95450000004,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":44068.95450000004,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":44275.851000000046,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":44275.851000000046,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":44482.74750000005,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":44482.74750000005,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":44689.64400000005,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":44689.64400000005,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":44896.540500000054,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":44896.540500000054,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":45103.437000000056,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":45103.437000000056,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":45310.33350000006,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":45310.33350000006,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":45517.23000000006,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":45517.23000000006,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":45724.126500000064,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":45724.126500000064,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":45931.02300000007,"duration":413.79299999999785,"noteNumber":81,"velocity":100,"programNumber":0},{"time":45931.02300000007,"duration":413.79299999999785,"noteNumber":69,"velocity":100,"programNumber":0},{"time":92689.63200000007,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":92689.63200000007,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":92896.52850000007,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":92896.52850000007,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":93103.42500000008,"duration":413.7930000000051,"noteNumber":85,"velocity":100,"programNumber":0},{"time":93103.42500000008,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":0},{"time":93517.21800000008,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":93517.21800000008,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":93724.11450000008,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":93724.11450000008,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":93931.01100000009,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":93931.01100000009,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":94137.90750000009,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":94137.90750000009,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":94344.80400000009,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":94344.80400000009,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":94551.7005000001,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":94551.7005000001,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":94758.5970000001,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":94758.5970000001,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":94965.4935000001,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":94965.4935000001,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":95172.3900000001,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":95172.3900000001,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":95379.2865000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":95379.2865000001,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":95586.1830000001,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":95586.1830000001,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":95793.07950000011,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":95793.07950000011,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":95999.97600000011,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":95999.97600000011,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":96206.87250000011,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":96206.87250000011,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":96413.76900000012,"duration":413.7930000000051,"noteNumber":85,"velocity":100,"programNumber":0},{"time":96413.76900000012,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":0},{"time":96827.56200000012,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":96827.56200000012,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":97034.45850000012,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":97034.45850000012,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":97241.35500000013,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":97241.35500000013,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":97448.25150000013,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":97448.25150000013,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":97655.14800000013,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":97655.14800000013,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":97862.04450000013,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":97862.04450000013,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":98068.94100000014,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":98068.94100000014,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":98275.83750000014,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":98275.83750000014,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":98482.73400000014,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":98482.73400000014,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":98689.63050000014,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":98689.63050000014,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":98896.52700000015,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":98896.52700000015,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":119172.38400000015,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":119172.38400000015,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":119379.28050000015,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":0},{"time":119379.28050000015,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":119586.17700000016,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":119586.17700000016,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":119793.07350000016,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":119793.07350000016,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":119999.97000000016,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":0},{"time":120103.41825000016,"duration":103.44825000000128,"noteNumber":79,"velocity":100,"programNumber":0},{"time":120206.86650000016,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":120310.31475000017,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":120413.76300000017,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":120620.65950000017,"duration":206.89650000000256,"noteNumber":67,"velocity":100,"programNumber":0},{"time":120413.76300000017,"duration":413.7930000000051,"noteNumber":74,"velocity":100,"programNumber":0},{"time":120827.55600000017,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":120827.55600000017,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":121034.45250000017,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":121034.45250000017,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":0},{"time":121241.34900000018,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":121241.34900000018,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":121448.24550000018,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":121448.24550000018,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":121655.14200000018,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":0},{"time":121758.59025000018,"duration":103.44825000000128,"noteNumber":79,"velocity":100,"programNumber":0},{"time":121862.03850000018,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":121965.48675000019,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":122068.93500000019,"duration":413.7930000000051,"noteNumber":74,"velocity":100,"programNumber":0},{"time":122068.93500000019,"duration":413.7930000000051,"noteNumber":71,"velocity":100,"programNumber":0},{"time":122482.72800000019,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":122482.72800000019,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":122689.6245000002,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":122689.6245000002,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":122896.5210000002,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":122896.5210000002,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":123103.4175000002,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":123103.4175000002,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":123310.3140000002,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":123413.7622500002,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":123517.2105000002,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":0},{"time":123620.6587500002,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":0},{"time":123724.10700000021,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":123931.00350000021,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":123724.10700000021,"duration":413.7930000000051,"noteNumber":71,"velocity":100,"programNumber":0},{"time":124137.90000000021,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":124137.90000000021,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":124344.79650000022,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":124344.79650000022,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":124551.69300000022,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":124551.69300000022,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":124758.58950000022,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":124758.58950000022,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":124965.48600000022,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":125068.93425000022,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":125172.38250000023,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":0},{"time":125275.83075000023,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":0},{"time":125379.27900000023,"duration":413.7930000000051,"noteNumber":71,"velocity":100,"programNumber":0},{"time":125379.27900000023,"duration":413.7930000000051,"noteNumber":68,"velocity":100,"programNumber":0}],[{"time":13655.169,"duration":206.89650000000074,"noteNumber":48,"velocity":100,"programNumber":0},{"time":13862.0655,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":0},{"time":14068.962000000001,"duration":206.89650000000074,"noteNumber":52,"velocity":100,"programNumber":0},{"time":14275.858500000002,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":0},{"time":14482.755000000003,"duration":413.79299999999967,"noteNumber":55,"velocity":100,"programNumber":0},{"time":15310.341000000002,"duration":206.89650000000074,"noteNumber":48,"velocity":100,"programNumber":0},{"time":15517.237500000003,"duration":206.89650000000074,"noteNumber":60,"velocity":100,"programNumber":0},{"time":15724.134000000004,"duration":206.89650000000074,"noteNumber":52,"velocity":100,"programNumber":0},{"time":15931.030500000004,"duration":206.89650000000074,"noteNumber":64,"velocity":100,"programNumber":0},{"time":16137.927000000005,"duration":413.79299999999967,"noteNumber":55,"velocity":100,"programNumber":0},{"time":16965.513000000006,"duration":206.89649999999892,"noteNumber":45,"velocity":100,"programNumber":0},{"time":17172.409500000005,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":0},{"time":17379.306000000004,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":0},{"time":17586.202500000003,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":0},{"time":17793.099000000002,"duration":413.7930000000015,"noteNumber":52,"velocity":100,"programNumber":0},{"time":18620.685000000005,"duration":206.89649999999892,"noteNumber":45,"velocity":100,"programNumber":0},{"time":18827.581500000004,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":0},{"time":19034.478000000003,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":0},{"time":19241.3745,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":0},{"time":19448.271,"duration":413.7930000000015,"noteNumber":52,"velocity":100,"programNumber":0},{"time":40137.921,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":40344.817500000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":40551.71400000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":40758.61050000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":40965.50700000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":41172.403500000015,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":41379.30000000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":41586.19650000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":41793.09300000002,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":41999.989500000025,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":42206.88600000003,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":42413.78250000003,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":42620.67900000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":42827.575500000035,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":43034.47200000004,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":43241.36850000004,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":43448.26500000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":43655.161500000046,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":43862.05800000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":44068.95450000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":44275.85100000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":44482.747500000056,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":44689.64400000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":44896.54050000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":45103.43700000006,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":45310.333500000066,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":45517.23000000007,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":45724.12650000007,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":45931.023000000074,"duration":413.79299999999785,"noteNumber":45,"velocity":100,"programNumber":0},{"time":93103.42500000008,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":93310.32150000008,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":93517.21800000008,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":93724.11450000008,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":93931.01100000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":94137.90750000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":94344.80400000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":94551.7005000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":94758.5970000001,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":94965.4935000001,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":95172.3900000001,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":95379.2865000001,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":95586.1830000001,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":95793.07950000011,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":95999.97600000011,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":96206.87250000011,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":96413.76900000012,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":96620.66550000012,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":96827.56200000012,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":97034.45850000012,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":97241.35500000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":97448.25150000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":97655.14800000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":97862.04450000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":98068.94100000014,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":98275.83750000014,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":98482.73400000014,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":98689.63050000014,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":98896.52700000015,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":0},{"time":119586.17700000016,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":119793.07350000016,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":119999.97000000016,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":120206.86650000016,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":120413.76300000017,"duration":413.7930000000051,"noteNumber":55,"velocity":100,"programNumber":0},{"time":121241.34900000018,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":121448.24550000018,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":121655.14200000018,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":121862.03850000018,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":122068.93500000019,"duration":413.7930000000051,"noteNumber":55,"velocity":100,"programNumber":0},{"time":122896.5210000002,"duration":206.89650000000256,"noteNumber":45,"velocity":100,"programNumber":0},{"time":123103.4175000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":123310.3140000002,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":123517.2105000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":123724.10700000021,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":0},{"time":124551.69300000022,"duration":206.89650000000256,"noteNumber":45,"velocity":100,"programNumber":0},{"time":124758.58950000022,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":124965.48600000022,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":125172.38250000023,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":125379.27900000023,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":0}],[{"time":26482.752,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":26482.752,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":26689.6485,"duration":206.89649999999892,"noteNumber":77,"velocity":100,"programNumber":0},{"time":26689.6485,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":0},{"time":26896.545,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":26896.545,"duration":206.89649999999892,"noteNumber":79,"velocity":100,"programNumber":0},{"time":27103.441499999997,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":27103.441499999997,"duration":206.89649999999892,"noteNumber":79,"velocity":100,"programNumber":0},{"time":27310.337999999996,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":0},{"time":27413.786249999997,"duration":103.44825000000128,"noteNumber":79,"velocity":100,"programNumber":0},{"time":27517.2345,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":27620.68275,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":27724.131,"duration":206.89649999999892,"noteNumber":71,"velocity":100,"programNumber":0},{"time":27931.0275,"duration":206.89649999999892,"noteNumber":67,"velocity":100,"programNumber":0},{"time":27724.131,"duration":413.79299999999785,"noteNumber":74,"velocity":100,"programNumber":0},{"time":28137.924,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":28137.924,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":28344.820499999998,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":0},{"time":28344.820499999998,"duration":206.89649999999892,"noteNumber":77,"velocity":100,"programNumber":0},{"time":28551.716999999997,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":28551.716999999997,"duration":206.89649999999892,"noteNumber":79,"velocity":100,"programNumber":0},{"time":28758.613499999996,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":28758.613499999996,"duration":206.89649999999892,"noteNumber":79,"velocity":100,"programNumber":0},{"time":28965.509999999995,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":0},{"time":29068.958249999996,"duration":103.44825000000128,"noteNumber":79,"velocity":100,"programNumber":0},{"time":29172.406499999997,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":29275.85475,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":29379.303,"duration":413.7930000000015,"noteNumber":74,"velocity":100,"programNumber":0},{"time":29379.303,"duration":413.7930000000015,"noteNumber":71,"velocity":100,"programNumber":0},{"time":29793.096,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":29793.096,"duration":206.89649999999892,"noteNumber":69,"velocity":100,"programNumber":0},{"time":29999.9925,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":0},{"time":29999.9925,"duration":206.89649999999892,"noteNumber":71,"velocity":100,"programNumber":0},{"time":30206.889,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":30206.889,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":30413.785499999998,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":30413.785499999998,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":30620.681999999997,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":30724.13025,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":30827.5785,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":0},{"time":30931.02675,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":0},{"time":31034.475000000002,"duration":206.89649999999892,"noteNumber":68,"velocity":100,"programNumber":0},{"time":31241.3715,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":0},{"time":31034.475000000002,"duration":413.79299999999785,"noteNumber":71,"velocity":100,"programNumber":0},{"time":31448.268,"duration":206.89649999999892,"noteNumber":69,"velocity":100,"programNumber":0},{"time":31448.268,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":31655.1645,"duration":206.89649999999892,"noteNumber":71,"velocity":100,"programNumber":0},{"time":31655.1645,"duration":206.89649999999892,"noteNumber":74,"velocity":100,"programNumber":0},{"time":31862.060999999998,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":31862.060999999998,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":32068.957499999997,"duration":206.89649999999892,"noteNumber":76,"velocity":100,"programNumber":0},{"time":32068.957499999997,"duration":206.89649999999892,"noteNumber":72,"velocity":100,"programNumber":0},{"time":32275.853999999996,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":0},{"time":32379.302249999997,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":0},{"time":32482.7505,"duration":103.44825000000128,"noteNumber":74,"velocity":100,"programNumber":0},{"time":32586.19875,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":0},{"time":32689.647,"duration":413.7930000000015,"noteNumber":71,"velocity":100,"programNumber":0},{"time":32689.647,"duration":413.7930000000015,"noteNumber":68,"velocity":100,"programNumber":0},{"time":46344.816000000006,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":46344.816000000006,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":46551.71250000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":46551.71250000001,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":46758.60900000001,"duration":413.79299999999785,"noteNumber":85,"velocity":100,"programNumber":0},{"time":46758.60900000001,"duration":413.79299999999785,"noteNumber":73,"velocity":100,"programNumber":0},{"time":47172.40200000001,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":47172.40200000001,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":47379.29850000001,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":47379.29850000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":47586.195000000014,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":47586.195000000014,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":47793.09150000002,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":47793.09150000002,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":47999.98800000002,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":47999.98800000002,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":48206.88450000002,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":48206.88450000002,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":48413.781000000025,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":48413.781000000025,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":48620.67750000003,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":48620.67750000003,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":48827.57400000003,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":48827.57400000003,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":49034.47050000003,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":49034.47050000003,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":49241.367000000035,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":49241.367000000035,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":49448.26350000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":49448.26350000004,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":49655.16000000004,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":49655.16000000004,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":49862.05650000004,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":49862.05650000004,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":50068.953000000045,"duration":413.79299999999785,"noteNumber":85,"velocity":100,"programNumber":0},{"time":50068.953000000045,"duration":413.79299999999785,"noteNumber":73,"velocity":100,"programNumber":0},{"time":50482.74600000004,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":50482.74600000004,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":50689.642500000045,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":50689.642500000045,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":50896.53900000005,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":50896.53900000005,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":51103.43550000005,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":51103.43550000005,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":51310.33200000005,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":51310.33200000005,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":51517.228500000056,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":51517.228500000056,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":51724.12500000006,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":51724.12500000006,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":51931.02150000006,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":51931.02150000006,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":52137.91800000006,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":52137.91800000006,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":52344.814500000066,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":52344.814500000066,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":52551.71100000007,"duration":413.79299999999785,"noteNumber":81,"velocity":100,"programNumber":0},{"time":52551.71100000007,"duration":413.79299999999785,"noteNumber":69,"velocity":100,"programNumber":0},{"time":99310.32000000007,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":99310.32000000007,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":99517.21650000007,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":99517.21650000007,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":99724.11300000007,"duration":413.7930000000051,"noteNumber":85,"velocity":100,"programNumber":0},{"time":99724.11300000007,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":0},{"time":100137.90600000008,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":100137.90600000008,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":100344.80250000008,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":100344.80250000008,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":100551.69900000008,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":100551.69900000008,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":100758.59550000008,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":100758.59550000008,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":100965.49200000009,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":100965.49200000009,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":101172.38850000009,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":101172.38850000009,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":101379.28500000009,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":101379.28500000009,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":101586.1815000001,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":101586.1815000001,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":101793.0780000001,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":101793.0780000001,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":101999.9745000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":101999.9745000001,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":102206.8710000001,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":102206.8710000001,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":102413.7675000001,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":102413.7675000001,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":102620.6640000001,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":102620.6640000001,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":102827.56050000011,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":102827.56050000011,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":103034.45700000011,"duration":413.7930000000051,"noteNumber":85,"velocity":100,"programNumber":0},{"time":103034.45700000011,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":0},{"time":103448.25000000012,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":103448.25000000012,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":103655.14650000012,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":103655.14650000012,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":103862.04300000012,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":103862.04300000012,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":104068.93950000012,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":104068.93950000012,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":104275.83600000013,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":104275.83600000013,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":104482.73250000013,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":104482.73250000013,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":104689.62900000013,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":0},{"time":104689.62900000013,"duration":206.89650000000256,"noteNumber":78,"velocity":100,"programNumber":0},{"time":104896.52550000013,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":104896.52550000013,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":105103.42200000014,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":105103.42200000014,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":105310.31850000014,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":105310.31850000014,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":105517.21500000014,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":105517.21500000014,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":132413.76000000015,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":132413.76000000015,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":132620.65650000016,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":0},{"time":132620.65650000016,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":132827.55300000016,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":132827.55300000016,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":133034.44950000016,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":133034.44950000016,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":133241.34600000017,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":133344.79425000015,"duration":103.44824999998673,"noteNumber":79,"velocity":100,"programNumber":0},{"time":133448.24250000014,"duration":103.44824999998673,"noteNumber":77,"velocity":100,"programNumber":0},{"time":133551.69075000013,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":133655.1390000001,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":133862.03550000011,"duration":206.89650000000256,"noteNumber":67,"velocity":100,"programNumber":0},{"time":133655.1390000001,"duration":413.7930000000051,"noteNumber":74,"velocity":100,"programNumber":0},{"time":134068.93200000012,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":134068.93200000012,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":134275.82850000012,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":134275.82850000012,"duration":206.89650000000256,"noteNumber":77,"velocity":100,"programNumber":0},{"time":134482.72500000012,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":134482.72500000012,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":134689.62150000012,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":134689.62150000012,"duration":206.89650000000256,"noteNumber":79,"velocity":100,"programNumber":0},{"time":134896.51800000013,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":134999.9662500001,"duration":103.44824999998673,"noteNumber":79,"velocity":100,"programNumber":0},{"time":135103.4145000001,"duration":103.44824999998673,"noteNumber":77,"velocity":100,"programNumber":0},{"time":135206.8627500001,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":135310.31100000007,"duration":413.7930000000051,"noteNumber":74,"velocity":100,"programNumber":0},{"time":135310.31100000007,"duration":413.7930000000051,"noteNumber":71,"velocity":100,"programNumber":0},{"time":135724.10400000008,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":135724.10400000008,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":135931.00050000008,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":135931.00050000008,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":136137.89700000008,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":136137.89700000008,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":136344.7935000001,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":136344.7935000001,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":136551.6900000001,"duration":103.44824999998673,"noteNumber":77,"velocity":100,"programNumber":0},{"time":136655.13825000008,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":136758.58650000006,"duration":103.44824999998673,"noteNumber":74,"velocity":100,"programNumber":0},{"time":136862.03475000005,"duration":103.44824999998673,"noteNumber":72,"velocity":100,"programNumber":0},{"time":136965.48300000004,"duration":206.89650000000256,"noteNumber":68,"velocity":100,"programNumber":0},{"time":137172.37950000004,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":136965.48300000004,"duration":413.7930000000051,"noteNumber":71,"velocity":100,"programNumber":0},{"time":137379.27600000004,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":137379.27600000004,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":137586.17250000004,"duration":206.89650000000256,"noteNumber":71,"velocity":100,"programNumber":0},{"time":137586.17250000004,"duration":206.89650000000256,"noteNumber":74,"velocity":100,"programNumber":0},{"time":137793.06900000005,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":137793.06900000005,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":137999.96550000005,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":137999.96550000005,"duration":206.89650000000256,"noteNumber":72,"velocity":100,"programNumber":0},{"time":138206.86200000005,"duration":103.44824999998673,"noteNumber":77,"velocity":100,"programNumber":0},{"time":138310.31025000004,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":138413.75850000003,"duration":103.44824999998673,"noteNumber":74,"velocity":100,"programNumber":0},{"time":138517.20675,"duration":103.44824999998673,"noteNumber":72,"velocity":100,"programNumber":0},{"time":138620.655,"duration":413.7930000000051,"noteNumber":71,"velocity":100,"programNumber":0},{"time":138620.655,"duration":413.7930000000051,"noteNumber":68,"velocity":100,"programNumber":0}],[{"time":26896.545,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":0},{"time":27103.441499999997,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":0},{"time":27310.337999999996,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":0},{"time":27517.234499999995,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":0},{"time":27724.130999999994,"duration":413.7930000000015,"noteNumber":55,"velocity":100,"programNumber":0},{"time":28551.716999999997,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":0},{"time":28758.613499999996,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":0},{"time":28965.509999999995,"duration":206.89649999999892,"noteNumber":52,"velocity":100,"programNumber":0},{"time":29172.406499999994,"duration":206.89649999999892,"noteNumber":64,"velocity":100,"programNumber":0},{"time":29379.302999999993,"duration":413.7930000000015,"noteNumber":55,"velocity":100,"programNumber":0},{"time":30206.888999999996,"duration":206.89649999999892,"noteNumber":45,"velocity":100,"programNumber":0},{"time":30413.785499999994,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":0},{"time":30620.681999999993,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":0},{"time":30827.578499999992,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":0},{"time":31034.47499999999,"duration":413.7930000000015,"noteNumber":52,"velocity":100,"programNumber":0},{"time":31862.060999999994,"duration":206.89649999999892,"noteNumber":45,"velocity":100,"programNumber":0},{"time":32068.957499999993,"duration":206.89649999999892,"noteNumber":57,"velocity":100,"programNumber":0},{"time":32275.853999999992,"duration":206.89649999999892,"noteNumber":48,"velocity":100,"programNumber":0},{"time":32482.75049999999,"duration":206.89649999999892,"noteNumber":60,"velocity":100,"programNumber":0},{"time":32689.64699999999,"duration":413.79299999999785,"noteNumber":52,"velocity":100,"programNumber":0},{"time":46758.60899999999,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":46965.50549999999,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":47172.401999999995,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":47379.2985,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":47586.195,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":47793.0915,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":47999.988000000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":48206.88450000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":48413.78100000001,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":48620.67750000001,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":48827.574000000015,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":49034.47050000002,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":49241.36700000002,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":49448.26350000002,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":49655.160000000025,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":49862.05650000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":50068.95300000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":50275.84950000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":50482.746000000036,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":50689.64250000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":50896.53900000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":51103.43550000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":51310.332000000046,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":51517.22850000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":51724.12500000005,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":51931.02150000005,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":52137.918000000056,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":52344.81450000006,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":52551.71100000006,"duration":413.79299999999785,"noteNumber":45,"velocity":100,"programNumber":0},{"time":99724.11300000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":99931.00950000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":100137.90600000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":100344.80250000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":100551.69900000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":100758.59550000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":100965.49200000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":101172.38850000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":101379.28500000008,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":101586.18150000008,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":101793.07800000008,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":101999.97450000008,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":102206.87100000009,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":102413.76750000009,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":102620.66400000009,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":102827.5605000001,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":103034.4570000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":103241.3535000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":103448.2500000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":103655.1465000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":103862.0430000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":104068.93950000011,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":104275.83600000011,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":104482.73250000011,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":104689.62900000012,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":104896.52550000012,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":105103.42200000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":105310.31850000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":105517.21500000013,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":0},{"time":132827.55300000013,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":133034.44950000013,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":133241.34600000014,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":133448.24250000014,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":133655.13900000014,"duration":413.7930000000051,"noteNumber":55,"velocity":100,"programNumber":0},{"time":134482.72500000015,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":134689.62150000015,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":134896.51800000016,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":135103.41450000016,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":0},{"time":135310.31100000016,"duration":413.7930000000051,"noteNumber":55,"velocity":100,"programNumber":0},{"time":136137.89700000017,"duration":206.89650000000256,"noteNumber":45,"velocity":100,"programNumber":0},{"time":136344.79350000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":136551.69000000018,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":136758.58650000018,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":136965.48300000018,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":0},{"time":137793.0690000002,"duration":206.89650000000256,"noteNumber":45,"velocity":100,"programNumber":0},{"time":137999.9655000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":138206.8620000002,"duration":206.89650000000256,"noteNumber":48,"velocity":100,"programNumber":0},{"time":138413.7585000002,"duration":206.89650000000256,"noteNumber":60,"velocity":100,"programNumber":0},{"time":138620.6550000002,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":0}],[{"time":52965.504,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":53068.95225,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":53172.4005,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":53275.848750000005,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":53379.297000000006,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":53482.74525000001,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":53586.19350000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":53689.64175000001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":53793.09000000001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":53896.53825000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":53999.98650000001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":54103.434750000015,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":54206.883000000016,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":54310.33125000002,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":54413.77950000002,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":54517.22775000002,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":54620.67600000002,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":54724.12425000002,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":54827.572500000024,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":54931.020750000025,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":55034.46900000003,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":55137.91725000003,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":55241.36550000003,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":55344.81375000003,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":55448.26200000003,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":55551.71025000003,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":55655.158500000034,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":55758.606750000035,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":55862.05500000004,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":55965.50325000004,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":56068.95150000004,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":56172.39975000004,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":56275.84800000004,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":56379.29625000004,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":56482.744500000044,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":56586.192750000046,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":56689.64100000005,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":56793.08925000005,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":56896.53750000005,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":56999.98575000005,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":57103.43400000005,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":57206.88225000005,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":57310.330500000055,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":57413.778750000056,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":57517.22700000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":57620.67525000006,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":57724.12350000006,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":57827.57175000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":57931.02000000006,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":58034.46825000006,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":58137.916500000065,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":58241.364750000066,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":58344.81300000007,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":58448.26125000007,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":58551.70950000007,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":58655.15775000007,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":58758.60600000007,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":58862.054250000074,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":58965.502500000075,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":59068.95075000008,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":59172.39900000008,"duration":413.79299999999785,"noteNumber":73,"velocity":100,"programNumber":1},{"time":72827.56800000007,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":72931.01625000007,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":73034.46450000007,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":73137.91275000008,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":73241.36100000008,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":73344.80925000008,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":73448.25750000008,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":73551.70575000008,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":73655.15400000008,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":73758.60225000008,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":73862.05050000008,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":73965.49875000009,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":74068.94700000009,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":74172.39525000009,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":74275.84350000009,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":74379.29175000009,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":74482.74000000009,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":74586.1882500001,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":74689.6365000001,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":74793.0847500001,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":74896.5330000001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":74999.9812500001,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":75103.4295000001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":75206.8777500001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":75310.3260000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":75413.7742500001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":75517.2225000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":75620.6707500001,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":75724.11900000011,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":75827.56725000011,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":75931.01550000011,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":76034.46375000011,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":76137.91200000011,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":76241.36025000011,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":76344.80850000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":76448.25675000012,"duration":103.44825000000128,"noteNumber":82,"velocity":100,"programNumber":1},{"time":76551.70500000012,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":76655.15325000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":76758.60150000012,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":76862.04975000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":76965.49800000012,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":77068.94625000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":77172.39450000013,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":77275.84275000013,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":77379.29100000013,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":77482.73925000013,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":77586.18750000013,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":77689.63575000013,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":77793.08400000013,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":77896.53225000013,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":77999.98050000014,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":78103.42875000014,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":78206.87700000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":78310.32525000014,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":78413.77350000014,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":78517.22175000014,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":78620.67000000014,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":78724.11825000015,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":78827.56650000015,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":78931.01475000015,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":79034.46300000015,"duration":413.7930000000051,"noteNumber":78,"velocity":100,"programNumber":1}],[{"time":53379.297,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":53586.1935,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":53586.1935,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":53793.090000000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":53793.090000000004,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":53999.986500000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":53999.986500000006,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":54206.88300000001,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":54413.77950000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":54413.77950000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":54620.676000000014,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":54620.676000000014,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":54827.57250000002,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":54827.57250000002,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":55034.46900000002,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":55241.36550000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":55241.36550000002,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":55448.262000000024,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":55448.262000000024,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":55655.15850000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":55655.15850000003,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":55862.05500000003,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":56068.95150000003,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":56068.95150000003,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":56275.848000000035,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":56275.848000000035,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":56482.74450000004,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":56482.74450000004,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":56689.64100000004,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":56896.53750000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":56896.53750000004,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":57103.434000000045,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":57103.434000000045,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":57310.33050000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":57310.33050000005,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":57517.22700000005,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":57724.12350000005,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":57724.12350000005,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":57931.020000000055,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":57931.020000000055,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":58137.91650000006,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":58137.91650000006,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":58344.81300000006,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":58551.70950000006,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":58551.70950000006,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":1},{"time":58758.606000000065,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":58758.606000000065,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":1},{"time":58965.50250000007,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":58965.50250000007,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":1},{"time":59172.39900000007,"duration":413.79299999999785,"noteNumber":61,"velocity":100,"programNumber":1},{"time":59172.39900000007,"duration":413.79299999999785,"noteNumber":64,"velocity":100,"programNumber":1},{"time":73241.36100000006,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":73448.25750000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":73448.25750000007,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":73655.15400000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":73655.15400000007,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":73862.05050000007,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":73862.05050000007,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":74068.94700000007,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":74275.84350000008,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":74275.84350000008,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":74482.74000000008,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":74482.74000000008,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":74689.63650000008,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":74689.63650000008,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":74896.53300000008,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":75103.42950000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":75103.42950000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":75310.32600000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":75310.32600000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":75517.22250000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":75517.22250000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":75724.1190000001,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":75931.0155000001,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":75931.0155000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":76137.9120000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":76137.9120000001,"duration":206.89650000000256,"noteNumber":55,"velocity":100,"programNumber":1},{"time":76344.8085000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":76344.8085000001,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":76551.7050000001,"duration":206.89650000000256,"noteNumber":47,"velocity":100,"programNumber":1},{"time":76758.6015000001,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":76758.6015000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":76965.49800000011,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":76965.49800000011,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":77172.39450000011,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":77172.39450000011,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":77379.29100000011,"duration":206.89650000000256,"noteNumber":47,"velocity":100,"programNumber":1},{"time":77586.18750000012,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":77586.18750000012,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":77793.08400000012,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":77793.08400000012,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":77999.98050000012,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":77999.98050000012,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":78206.87700000012,"duration":206.89650000000256,"noteNumber":49,"velocity":100,"programNumber":1},{"time":78413.77350000013,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":78413.77350000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":78620.67000000013,"duration":206.89650000000256,"noteNumber":49,"velocity":100,"programNumber":1},{"time":78827.56650000013,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":78827.56650000013,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":79034.46300000013,"duration":413.7930000000051,"noteNumber":54,"velocity":100,"programNumber":1},{"time":79034.46300000013,"duration":413.7930000000051,"noteNumber":57,"velocity":100,"programNumber":1}],[{"time":59586.192,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":59689.640250000004,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":59793.088500000005,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":59896.53675000001,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":59999.98500000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":60103.43325000001,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":60206.88150000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":60310.32975000001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":60413.77800000001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":60517.226250000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":60620.674500000016,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":60724.12275000002,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":60827.57100000002,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":60931.01925000002,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":61034.46750000002,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":61137.91575000002,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":61241.36400000002,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":61344.812250000025,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":61448.260500000026,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":61551.70875000003,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":61655.15700000003,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":61758.60525000003,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":61862.05350000003,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":61965.50175000003,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":62068.95000000003,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":62172.398250000035,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":62275.846500000036,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":62379.29475000004,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":62482.74300000004,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":62586.19125000004,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":62689.63950000004,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":62793.08775000004,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":62896.536000000044,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":62999.984250000045,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":63103.432500000046,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":63206.88075000005,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":63310.32900000005,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":63413.77725000005,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":63517.22550000005,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":63620.67375000005,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":63724.122000000054,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":63827.570250000055,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":63931.01850000006,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":64034.46675000006,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":64137.91500000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":64241.36325000006,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":64344.81150000006,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":64448.25975000006,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":64551.708000000064,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":64655.156250000065,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":64758.60450000007,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":64862.05275000007,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":64965.50100000007,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":65068.94925000007,"duration":103.44825000000128,"noteNumber":76,"velocity":100,"programNumber":1},{"time":65172.39750000007,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":65275.84575000007,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":65379.294000000074,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":65482.742250000076,"duration":103.448249999994,"noteNumber":73,"velocity":100,"programNumber":1},{"time":65586.19050000007,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":65689.63875000007,"duration":103.44825000000128,"noteNumber":72,"velocity":100,"programNumber":1},{"time":65793.08700000007,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":1},{"time":86068.94400000008,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":86172.39225000008,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":86275.84050000008,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":86379.28875000008,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":86482.73700000008,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":86586.18525000008,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":86689.63350000008,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":86793.08175000008,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":86896.53000000009,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":86999.97825000009,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":87103.42650000009,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":87206.87475000009,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":87310.32300000009,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":87413.77125000009,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":87517.2195000001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":87620.6677500001,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":87724.1160000001,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":87827.5642500001,"duration":103.44825000000128,"noteNumber":75,"velocity":100,"programNumber":1},{"time":87931.0125000001,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":88034.4607500001,"duration":103.44825000000128,"noteNumber":73,"velocity":100,"programNumber":1},{"time":88137.9090000001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":88241.3572500001,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":88344.8055000001,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":88448.2537500001,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":88551.7020000001,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":88655.15025000011,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":88758.59850000011,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":88862.04675000011,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":88965.49500000011,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":89068.94325000011,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":89172.39150000011,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":89275.83975000012,"duration":103.44825000000128,"noteNumber":84,"velocity":100,"programNumber":1},{"time":89379.28800000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":89482.73625000012,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":89586.18450000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":89689.63275000012,"duration":103.44825000000128,"noteNumber":82,"velocity":100,"programNumber":1},{"time":89793.08100000012,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":89896.52925000012,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":89999.97750000012,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":90103.42575000013,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":90206.87400000013,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":90310.32225000013,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":90413.77050000013,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":90517.21875000013,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":90620.66700000013,"duration":103.44825000000128,"noteNumber":86,"velocity":100,"programNumber":1},{"time":90724.11525000013,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":90827.56350000013,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":90931.01175000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":91034.46000000014,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":91137.90825000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":91241.35650000014,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":91344.80475000014,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":91448.25300000014,"duration":103.44825000000128,"noteNumber":81,"velocity":100,"programNumber":1},{"time":91551.70125000014,"duration":103.44825000000128,"noteNumber":83,"velocity":100,"programNumber":1},{"time":91655.14950000015,"duration":103.44825000000128,"noteNumber":85,"velocity":100,"programNumber":1},{"time":91758.59775000015,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":91862.04600000015,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":91965.49425000015,"duration":103.44825000000128,"noteNumber":78,"velocity":100,"programNumber":1},{"time":92068.94250000015,"duration":103.44825000000128,"noteNumber":80,"velocity":100,"programNumber":1},{"time":92172.39075000015,"duration":103.44825000000128,"noteNumber":77,"velocity":100,"programNumber":1},{"time":92275.83900000015,"duration":413.7930000000051,"noteNumber":78,"velocity":100,"programNumber":1}],[{"time":59999.985,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":60206.8815,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":60206.8815,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":60413.778000000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":60413.778000000006,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":60620.67450000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":60620.67450000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":60827.57100000001,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":61034.46750000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":61034.46750000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":61241.364000000016,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":61241.364000000016,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":61448.26050000002,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":61448.26050000002,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":61655.15700000002,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":61862.05350000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":61862.05350000002,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":62068.950000000026,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":62068.950000000026,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":62275.84650000003,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":62275.84650000003,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":62482.74300000003,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":62689.639500000034,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":62689.639500000034,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":62896.53600000004,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":62896.53600000004,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":63103.43250000004,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":63103.43250000004,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":63310.32900000004,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":63517.225500000044,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":63517.225500000044,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":63724.12200000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":63724.12200000005,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":63931.01850000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":63931.01850000005,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":64137.91500000005,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":64344.811500000054,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":64344.811500000054,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":64551.70800000006,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":64551.70800000006,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":64758.60450000006,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":64758.60450000006,"duration":206.89650000000256,"noteNumber":64,"velocity":100,"programNumber":1},{"time":64965.50100000006,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":65172.397500000065,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":65172.397500000065,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":1},{"time":65379.29400000007,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":65379.29400000007,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":1},{"time":65586.19050000007,"duration":206.89650000000256,"noteNumber":63,"velocity":100,"programNumber":1},{"time":65586.19050000007,"duration":206.89650000000256,"noteNumber":66,"velocity":100,"programNumber":1},{"time":65793.08700000007,"duration":413.7930000000051,"noteNumber":61,"velocity":100,"programNumber":1},{"time":65793.08700000007,"duration":413.7930000000051,"noteNumber":64,"velocity":100,"programNumber":1},{"time":86482.73700000008,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":86689.63350000008,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":86689.63350000008,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":86896.53000000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":86896.53000000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":87103.42650000009,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":87103.42650000009,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":87310.32300000009,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":87517.2195000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":87517.2195000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":87724.1160000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":87724.1160000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":87931.0125000001,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":87931.0125000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":88137.9090000001,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":88344.8055000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":88344.8055000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":88551.7020000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":88551.7020000001,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":88758.59850000011,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":88758.59850000011,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":88965.49500000011,"duration":206.89650000000256,"noteNumber":53,"velocity":100,"programNumber":1},{"time":89172.39150000011,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":89172.39150000011,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":89379.28800000012,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":89379.28800000012,"duration":206.89650000000256,"noteNumber":55,"velocity":100,"programNumber":1},{"time":89586.18450000012,"duration":206.89650000000256,"noteNumber":61,"velocity":100,"programNumber":1},{"time":89586.18450000012,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":89793.08100000012,"duration":206.89650000000256,"noteNumber":47,"velocity":100,"programNumber":1},{"time":89999.97750000012,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":89999.97750000012,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":90206.87400000013,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":90206.87400000013,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":90413.77050000013,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":90413.77050000013,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":90620.66700000013,"duration":206.89650000000256,"noteNumber":47,"velocity":100,"programNumber":1},{"time":90827.56350000013,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":90827.56350000013,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":91034.46000000014,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":91034.46000000014,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":91241.35650000014,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":91241.35650000014,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":91448.25300000014,"duration":206.89650000000256,"noteNumber":49,"velocity":100,"programNumber":1},{"time":91655.14950000015,"duration":206.89650000000256,"noteNumber":54,"velocity":100,"programNumber":1},{"time":91655.14950000015,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":1},{"time":91862.04600000015,"duration":206.89650000000256,"noteNumber":49,"velocity":100,"programNumber":1},{"time":92068.94250000015,"duration":206.89650000000256,"noteNumber":56,"velocity":100,"programNumber":1},{"time":92068.94250000015,"duration":206.89650000000256,"noteNumber":59,"velocity":100,"programNumber":1},{"time":92275.83900000015,"duration":413.7930000000051,"noteNumber":54,"velocity":100,"programNumber":1},{"time":92275.83900000015,"duration":413.7930000000051,"noteNumber":57,"velocity":100,"programNumber":1}],[{"time":145655.136,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":145758.58424999999,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":145862.03249999997,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":145965.48074999996,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":146068.92899999995,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":146172.37724999993,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":146482.72199999992,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":146586.1702499999,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":146689.6184999999,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":146793.06674999988,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":146896.51499999987,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":146999.96324999986,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":147103.41149999984,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":147206.85974999983,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":147310.30799999982,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":147413.7562499998,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":147517.2044999998,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":147620.65274999978,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":147724.10099999976,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":147827.54924999975,"duration":103.44824999998673,"noteNumber":78,"velocity":100,"programNumber":0},{"time":147930.99749999974,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":148034.44574999972,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":148137.8939999997,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":148241.3422499997,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":148344.79049999968,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":148448.23874999967,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":148551.68699999966,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":148655.13524999964,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":148758.58349999963,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":148862.03174999962,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":148965.4799999996,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":149068.9282499996,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":149172.37649999958,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":149275.82474999956,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":149379.27299999955,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":149482.72124999954,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":149793.06599999953,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":149896.5142499995,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":149999.9624999995,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":150103.4107499995,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":150206.85899999947,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":150310.30724999946,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":150413.75549999945,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":150517.20374999943,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":150620.65199999942,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":150724.1002499994,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":150827.5484999994,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":150930.99674999938,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":151034.44499999937,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":151137.89324999935,"duration":103.44824999998673,"noteNumber":78,"velocity":100,"programNumber":0},{"time":151241.34149999934,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":151344.78974999933,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":151448.2379999993,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":151551.6862499993,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":151655.1344999993,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":151758.58274999927,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":151862.03099999926,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":151862.03099999926,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":152275.82399999927,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":152379.27224999925,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":152482.72049999924,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":152586.16874999923,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":152689.6169999992,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":152793.0652499992,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":153103.4099999992,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":153206.85824999918,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":153310.30649999916,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":153413.75474999915,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":153517.20299999914,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":153620.65124999912,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":153724.0994999991,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":153827.5477499991,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":153930.99599999908,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":154034.44424999907,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":154137.89249999906,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":154241.34074999904,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":154344.78899999903,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":154448.23724999902,"duration":103.44824999998673,"noteNumber":78,"velocity":100,"programNumber":0},{"time":154551.685499999,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":154655.133749999,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":154758.58199999898,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":154862.03024999896,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":154965.47849999895,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":155068.92674999894,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":155172.37499999892,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":155275.8232499989,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":155379.2714999989,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":155482.71974999888,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":155586.16799999887,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":155689.61624999886,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":155793.06449999884,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":155896.51274999883,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":155999.96099999882,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":156103.4092499988,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":156413.7539999988,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":156517.20224999878,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":156620.65049999877,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":156724.09874999875,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":156827.54699999874,"duration":103.44824999998673,"noteNumber":73,"velocity":100,"programNumber":0},{"time":156930.99524999873,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":157034.4434999987,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":157137.8917499987,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":157241.3399999987,"duration":103.44824999998673,"noteNumber":69,"velocity":100,"programNumber":0},{"time":157344.78824999867,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":157448.23649999866,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":157551.68474999865,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":157655.13299999863,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":157758.58124999862,"duration":103.44824999998673,"noteNumber":78,"velocity":100,"programNumber":0},{"time":157862.0294999986,"duration":103.44824999998673,"noteNumber":71,"velocity":100,"programNumber":0},{"time":157965.4777499986,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":158068.92599999858,"duration":103.44824999998673,"noteNumber":68,"velocity":100,"programNumber":0},{"time":158172.37424999857,"duration":103.44824999998673,"noteNumber":80,"velocity":100,"programNumber":0},{"time":158275.82249999855,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":158379.27074999854,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":158482.71899999853,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":158482.71899999853,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":158896.51199999853,"duration":310.3447499999893,"noteNumber":85,"velocity":100,"programNumber":0},{"time":159206.85674999852,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":158896.51199999853,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":159379.2704999985,"duration":344.82749999998487,"noteNumber":81,"velocity":100,"programNumber":0},{"time":159310.3049999985,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":159344.7877499985,"duration":379.31024999998044,"noteNumber":76,"velocity":100,"programNumber":0},{"time":159413.7532499985,"duration":724.1377499999944,"noteNumber":85,"velocity":100,"programNumber":0},{"time":160206.85649999848,"duration":344.82749999998487,"noteNumber":81,"velocity":100,"programNumber":0},{"time":160137.8909999985,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":160172.37374999849,"duration":379.31024999998044,"noteNumber":76,"velocity":100,"programNumber":0},{"time":160241.33924999848,"duration":724.1377499999944,"noteNumber":85,"velocity":100,"programNumber":0},{"time":160965.47699999847,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":161068.92524999846,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":161172.37349999844,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":161275.82174999843,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":161379.26999999842,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":161482.7182499984,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":161586.1664999984,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":161689.61474999838,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":161793.06299999836,"duration":775.8618750000023,"noteNumber":86,"velocity":100,"programNumber":0},{"time":161793.06299999836,"duration":775.8618750000023,"noteNumber":81,"velocity":100,"programNumber":0},{"time":161793.06299999836,"duration":775.8618750000023,"noteNumber":78,"velocity":100,"programNumber":0},{"time":162568.92487499837,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":162620.64899999838,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":162620.64899999838,"duration":155.17237499999464,"noteNumber":81,"velocity":100,"programNumber":0},{"time":162620.64899999838,"duration":155.17237499999464,"noteNumber":85,"velocity":100,"programNumber":0},{"time":162775.82137499837,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":162827.54549999838,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":162827.54549999838,"duration":155.17237499999464,"noteNumber":81,"velocity":100,"programNumber":0},{"time":162827.54549999838,"duration":155.17237499999464,"noteNumber":85,"velocity":100,"programNumber":0},{"time":162982.71787499837,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":163034.44199999838,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":163034.44199999838,"duration":155.17237499999464,"noteNumber":81,"velocity":100,"programNumber":0},{"time":163034.44199999838,"duration":155.17237499999464,"noteNumber":85,"velocity":100,"programNumber":0},{"time":163189.61437499837,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":163241.33849999838,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":163241.33849999838,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":163241.33849999838,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":163448.23499999839,"duration":620.6895000000077,"noteNumber":83,"velocity":100,"programNumber":0},{"time":164068.9244999984,"duration":206.89650000000256,"noteNumber":88,"velocity":100,"programNumber":0},{"time":163448.23499999839,"duration":827.5860000000102,"noteNumber":76,"velocity":100,"programNumber":0},{"time":163448.23499999839,"duration":827.5860000000102,"noteNumber":80,"velocity":100,"programNumber":0},{"time":164344.7864999984,"duration":344.82749999998487,"noteNumber":81,"velocity":100,"programNumber":0},{"time":164275.8209999984,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":164310.3037499984,"duration":379.31024999998044,"noteNumber":76,"velocity":100,"programNumber":0},{"time":164379.26924999838,"duration":724.1377499999944,"noteNumber":85,"velocity":100,"programNumber":0},{"time":165172.37249999837,"duration":344.82749999998487,"noteNumber":81,"velocity":100,"programNumber":0},{"time":165103.40699999838,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":165137.88974999837,"duration":379.31024999998044,"noteNumber":76,"velocity":100,"programNumber":0},{"time":165206.85524999836,"duration":724.1377499999944,"noteNumber":85,"velocity":100,"programNumber":0},{"time":165930.99299999836,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":166034.44124999834,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":166137.88949999833,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":166241.33774999832,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":166344.7859999983,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":166448.2342499983,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":166551.68249999828,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":166655.13074999826,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":166758.57899999825,"duration":775.8618750000023,"noteNumber":86,"velocity":100,"programNumber":0},{"time":166758.57899999825,"duration":775.8618750000023,"noteNumber":81,"velocity":100,"programNumber":0},{"time":166758.57899999825,"duration":775.8618750000023,"noteNumber":78,"velocity":100,"programNumber":0},{"time":167534.44087499825,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":167586.16499999826,"duration":775.8618750000023,"noteNumber":76,"velocity":100,"programNumber":0},{"time":167586.16499999826,"duration":775.8618750000023,"noteNumber":81,"velocity":100,"programNumber":0},{"time":167586.16499999826,"duration":775.8618750000023,"noteNumber":85,"velocity":100,"programNumber":0},{"time":168362.02687499826,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":168413.75099999827,"duration":155.17237499999464,"noteNumber":83,"velocity":100,"programNumber":0},{"time":168413.75099999827,"duration":155.17237499999464,"noteNumber":80,"velocity":100,"programNumber":0},{"time":168413.75099999827,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":168568.92337499827,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":168620.64749999827,"duration":155.17237499999464,"noteNumber":83,"velocity":100,"programNumber":0},{"time":168620.64749999827,"duration":155.17237499999464,"noteNumber":80,"velocity":100,"programNumber":0},{"time":168620.64749999827,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":168775.81987499827,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":168827.54399999828,"duration":155.17237499999464,"noteNumber":83,"velocity":100,"programNumber":0},{"time":168827.54399999828,"duration":155.17237499999464,"noteNumber":80,"velocity":100,"programNumber":0},{"time":168827.54399999828,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":168982.71637499827,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":169034.44049999828,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":169034.44049999828,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":169034.44049999828,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":169241.33699999828,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":169655.1299999983,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":169758.57824999827,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":169862.02649999826,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":169965.47474999825,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":170068.92299999823,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":170172.37124999822,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":170275.8194999982,"duration":620.6895000000077,"noteNumber":85,"velocity":100,"programNumber":0},{"time":170896.50899999822,"duration":103.44824999998673,"noteNumber":76,"velocity":100,"programNumber":0},{"time":170999.9572499982,"duration":103.44824999998673,"noteNumber":81,"velocity":100,"programNumber":0},{"time":171103.4054999982,"duration":620.6895000000077,"noteNumber":85,"velocity":100,"programNumber":0},{"time":171724.0949999982,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":171827.54324999818,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":171930.99149999817,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":172034.43974999816,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":172137.88799999814,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":172241.33624999813,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":172344.78449999812,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":172448.2327499981,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":172551.6809999981,"duration":775.8618750000023,"noteNumber":86,"velocity":100,"programNumber":0},{"time":173327.5428749981,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":173379.2669999981,"duration":155.17237499999464,"noteNumber":85,"velocity":100,"programNumber":0},{"time":173534.4393749981,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":173586.1634999981,"duration":155.17237499999464,"noteNumber":85,"velocity":100,"programNumber":0},{"time":173741.3358749981,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":173793.0599999981,"duration":155.17237499999464,"noteNumber":85,"velocity":100,"programNumber":0},{"time":173948.2323749981,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":173999.9564999981,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":174206.8529999981,"duration":620.6895000000077,"noteNumber":83,"velocity":100,"programNumber":0},{"time":174827.54249999812,"duration":206.89650000000256,"noteNumber":88,"velocity":100,"programNumber":0},{"time":175103.4044999981,"duration":344.82749999998487,"noteNumber":81,"velocity":100,"programNumber":0},{"time":175034.43899999812,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":175068.92174999812,"duration":379.31024999998044,"noteNumber":76,"velocity":100,"programNumber":0},{"time":175137.8872499981,"duration":724.1377499999944,"noteNumber":85,"velocity":100,"programNumber":0},{"time":175930.9904999981,"duration":344.82749999998487,"noteNumber":81,"velocity":100,"programNumber":0},{"time":175862.0249999981,"duration":413.792999999976,"noteNumber":73,"velocity":100,"programNumber":0},{"time":175896.5077499981,"duration":379.31024999998044,"noteNumber":76,"velocity":100,"programNumber":0},{"time":175965.4732499981,"duration":724.1377499999944,"noteNumber":85,"velocity":100,"programNumber":0},{"time":176689.61099999808,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":176793.05924999807,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":176896.50749999806,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":176999.95574999804,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":177103.40399999803,"duration":103.44824999998673,"noteNumber":86,"velocity":100,"programNumber":0},{"time":177206.85224999802,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":177310.300499998,"duration":103.44824999998673,"noteNumber":83,"velocity":100,"programNumber":0},{"time":177413.748749998,"duration":103.44824999998673,"noteNumber":85,"velocity":100,"programNumber":0},{"time":177517.19699999798,"duration":775.8618750000023,"noteNumber":86,"velocity":100,"programNumber":0},{"time":177517.19699999798,"duration":775.8618750000023,"noteNumber":81,"velocity":100,"programNumber":0},{"time":177517.19699999798,"duration":775.8618750000023,"noteNumber":78,"velocity":100,"programNumber":0},{"time":178293.05887499798,"duration":51.724125000007916,"noteNumber":86,"velocity":100,"programNumber":0},{"time":178344.782999998,"duration":775.8618750000023,"noteNumber":76,"velocity":100,"programNumber":0},{"time":178344.782999998,"duration":775.8618750000023,"noteNumber":81,"velocity":100,"programNumber":0},{"time":178344.782999998,"duration":775.8618750000023,"noteNumber":85,"velocity":100,"programNumber":0},{"time":179120.644874998,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":179172.368999998,"duration":155.17237499999464,"noteNumber":83,"velocity":100,"programNumber":0},{"time":179172.368999998,"duration":155.17237499999464,"noteNumber":80,"velocity":100,"programNumber":0},{"time":179172.368999998,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":179327.541374998,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":179379.265499998,"duration":155.17237499999464,"noteNumber":83,"velocity":100,"programNumber":0},{"time":179379.265499998,"duration":155.17237499999464,"noteNumber":80,"velocity":100,"programNumber":0},{"time":179379.265499998,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":179534.437874998,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":179586.161999998,"duration":155.17237499999464,"noteNumber":83,"velocity":100,"programNumber":0},{"time":179586.161999998,"duration":155.17237499999464,"noteNumber":80,"velocity":100,"programNumber":0},{"time":179586.161999998,"duration":155.17237499999464,"noteNumber":76,"velocity":100,"programNumber":0},{"time":179741.334374998,"duration":51.724125000007916,"noteNumber":85,"velocity":100,"programNumber":0},{"time":179793.058499998,"duration":206.89650000000256,"noteNumber":83,"velocity":100,"programNumber":0},{"time":179793.058499998,"duration":206.89650000000256,"noteNumber":80,"velocity":100,"programNumber":0},{"time":179793.058499998,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":179999.954999998,"duration":620.6895000000077,"noteNumber":69,"velocity":100,"programNumber":0},{"time":179999.954999998,"duration":620.6895000000077,"noteNumber":81,"velocity":100,"programNumber":0},{"time":179999.954999998,"duration":620.6895000000077,"noteNumber":76,"velocity":100,"programNumber":0},{"time":179999.954999998,"duration":620.6895000000077,"noteNumber":73,"velocity":100,"programNumber":0},{"time":180620.64449999802,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":180620.64449999802,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":180827.54099999802,"duration":620.6895000000077,"noteNumber":69,"velocity":100,"programNumber":0},{"time":180827.54099999802,"duration":620.6895000000077,"noteNumber":81,"velocity":100,"programNumber":0},{"time":181448.23049999803,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":181448.23049999803,"duration":206.89650000000256,"noteNumber":88,"velocity":100,"programNumber":0},{"time":181655.12699999803,"duration":620.6895000000077,"noteNumber":69,"velocity":100,"programNumber":0},{"time":181655.12699999803,"duration":620.6895000000077,"noteNumber":81,"velocity":100,"programNumber":0},{"time":182275.81649999804,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":182275.81649999804,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":182482.71299999804,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":182482.71299999804,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":182689.60949999804,"duration":206.89650000000256,"noteNumber":73,"velocity":100,"programNumber":0},{"time":182689.60949999804,"duration":206.89650000000256,"noteNumber":85,"velocity":100,"programNumber":0},{"time":182896.50599999804,"duration":206.89650000000256,"noteNumber":69,"velocity":100,"programNumber":0},{"time":182896.50599999804,"duration":206.89650000000256,"noteNumber":81,"velocity":100,"programNumber":0},{"time":183103.40249999805,"duration":206.89650000000256,"noteNumber":76,"velocity":100,"programNumber":0},{"time":183103.40249999805,"duration":206.89650000000256,"noteNumber":88,"velocity":100,"programNumber":0},{"time":183310.29899999805,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":183310.29899999805,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":183724.09199999805,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":183724.09199999805,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":183724.09199999805,"duration":413.7930000000051,"noteNumber":76,"velocity":100,"programNumber":0},{"time":183724.09199999805,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":0},{"time":184137.88499999806,"duration":413.7930000000051,"noteNumber":69,"velocity":100,"programNumber":0},{"time":184137.88499999806,"duration":413.7930000000051,"noteNumber":81,"velocity":100,"programNumber":0},{"time":184137.88499999806,"duration":413.7930000000051,"noteNumber":76,"velocity":100,"programNumber":0},{"time":184137.88499999806,"duration":413.7930000000051,"noteNumber":73,"velocity":100,"programNumber":0}],[{"time":146068.929,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":146275.8255,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":146482.722,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":146689.6185,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":146896.515,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":147103.41150000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":147310.30800000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":147517.20450000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":147724.10100000002,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":147930.99750000003,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":148137.89400000003,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":148344.79050000003,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":148551.68700000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":148758.58350000004,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":148965.48000000004,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":149172.37650000004,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":149379.27300000004,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":149586.16950000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":149793.06600000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":149999.96250000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":150206.85900000005,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":150413.75550000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":150620.65200000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":150827.54850000006,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":151034.44500000007,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":151241.34150000007,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":151448.23800000007,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":151655.13450000007,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":151862.03100000008,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":0},{"time":152689.6170000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":152896.5135000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":153103.4100000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":153310.3065000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":153517.2030000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":153724.0995000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":153930.9960000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":154137.8925000001,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":154344.7890000001,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":154551.6855000001,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":154758.5820000001,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":154965.4785000001,"duration":206.89650000000256,"noteNumber":51,"velocity":100,"programNumber":0},{"time":155172.37500000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":155379.27150000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":155586.16800000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":155793.06450000012,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":155999.96100000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":156206.85750000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":156413.75400000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":156620.65050000013,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":156827.54700000014,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":157034.44350000014,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":157241.34000000014,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":157448.23650000014,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":157655.13300000015,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":157862.02950000015,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":158068.92600000015,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":158275.82250000015,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":158482.71900000016,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":158689.61550000016,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":158896.51200000016,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":159103.40850000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":159310.30500000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":159517.20150000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":159724.09800000017,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":159930.99450000018,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":160137.89100000018,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":160344.78750000018,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":160551.68400000018,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":160758.5805000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":160965.4770000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":161172.3735000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":161379.2700000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":161586.1665000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":161793.0630000002,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":161999.9595000002,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":162206.8560000002,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":162413.7525000002,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":162620.6490000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":162827.5455000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":163034.4420000002,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":163241.33850000022,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":163448.23500000022,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":163655.13150000022,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":163862.02800000022,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":164068.92450000023,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":164275.82100000023,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":164482.71750000023,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":164689.61400000023,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":164896.51050000024,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":165103.40700000024,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":165310.30350000024,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":165517.20000000024,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":165724.09650000025,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":165930.99300000025,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":166137.88950000025,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":166344.78600000025,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":166551.68250000026,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":166758.57900000026,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":166965.47550000026,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":167172.37200000026,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":167379.26850000027,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":167586.16500000027,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":167793.06150000027,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":167999.95800000028,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":168206.85450000028,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":168413.75100000028,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":168620.64750000028,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":168827.5440000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":169034.4405000003,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":169241.3370000003,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":169344.78525000028,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":169448.23350000026,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":169551.68175000025,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":169655.13000000024,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":169758.57825000022,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":169862.0265000002,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":169965.4747500002,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":170068.92300000018,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":170172.37125000017,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":170275.81950000016,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":170379.26775000014,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":170482.71600000013,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":170586.16425000012,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":170689.6125000001,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":170793.0607500001,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":170896.50900000008,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":170999.95725000006,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":171103.40550000005,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":171206.85375000004,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":171310.30200000003,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":171413.75025,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":171517.1985,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":171620.64674999999,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":171724.09499999997,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":171827.54324999996,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":171930.99149999995,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":172034.43974999993,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":172137.88799999992,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":172241.3362499999,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":172344.7844999999,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":172448.23274999988,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":172551.68099999987,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":172655.12924999985,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":172758.57749999984,"duration":103.44824999998673,"noteNumber":62,"velocity":100,"programNumber":0},{"time":172862.02574999983,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":172965.4739999998,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":173068.9222499998,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":173172.3704999998,"duration":103.44824999998673,"noteNumber":62,"velocity":100,"programNumber":0},{"time":173275.81874999977,"duration":103.44824999998673,"noteNumber":66,"velocity":100,"programNumber":0},{"time":173379.26699999976,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":173482.71524999975,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":173586.16349999973,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":173689.61174999972,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":173793.0599999997,"duration":103.44824999998673,"noteNumber":57,"velocity":100,"programNumber":0},{"time":173896.5082499997,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":173999.95649999968,"duration":103.44824999998673,"noteNumber":61,"velocity":100,"programNumber":0},{"time":174103.40474999967,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":174206.85299999965,"duration":103.44824999998673,"noteNumber":52,"velocity":100,"programNumber":0},{"time":174310.30124999964,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":174413.74949999963,"duration":103.44824999998673,"noteNumber":59,"velocity":100,"programNumber":0},{"time":174517.1977499996,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":174620.6459999996,"duration":103.44824999998673,"noteNumber":52,"velocity":100,"programNumber":0},{"time":174724.0942499996,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":174827.54249999957,"duration":103.44824999998673,"noteNumber":59,"velocity":100,"programNumber":0},{"time":174930.99074999956,"duration":103.44824999998673,"noteNumber":64,"velocity":100,"programNumber":0},{"time":175034.43899999955,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":175241.33549999955,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":175448.23199999955,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":175655.12849999956,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":175862.02499999956,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":176068.92149999956,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":176275.81799999956,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":176482.71449999957,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":176689.61099999957,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":176896.50749999957,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":177103.40399999957,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":177310.30049999958,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":177517.19699999958,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":177724.09349999958,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":177930.98999999958,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":178137.8864999996,"duration":206.89650000000256,"noteNumber":50,"velocity":100,"programNumber":0},{"time":178344.7829999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":178551.6794999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":178758.5759999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":178965.4724999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":179172.3689999996,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":179379.2654999996,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":179586.1619999996,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":179793.0584999996,"duration":206.89650000000256,"noteNumber":52,"velocity":100,"programNumber":0},{"time":179999.9549999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":180206.8514999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":180413.7479999996,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":180620.64449999962,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":180827.54099999962,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":181034.43749999962,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":181241.33399999962,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":181448.23049999963,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":181655.12699999963,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":181862.02349999963,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":182068.91999999963,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":182275.81649999964,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":182482.71299999964,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":182689.60949999964,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":182896.50599999964,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":183103.40249999965,"duration":206.89650000000256,"noteNumber":57,"velocity":100,"programNumber":0},{"time":183310.29899999965,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":0},{"time":183724.09199999965,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":0},{"time":183724.09199999965,"duration":413.7930000000051,"noteNumber":57,"velocity":100,"programNumber":0},{"time":183724.09199999965,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":0},{"time":183724.09199999965,"duration":413.7930000000051,"noteNumber":49,"velocity":100,"programNumber":0},{"time":184137.88499999966,"duration":413.7930000000051,"noteNumber":45,"velocity":100,"programNumber":0},{"time":184137.88499999966,"duration":413.7930000000051,"noteNumber":57,"velocity":100,"programNumber":0},{"time":184137.88499999966,"duration":413.7930000000051,"noteNumber":52,"velocity":100,"programNumber":0},{"time":184137.88499999966,"duration":413.7930000000051,"noteNumber":49,"velocity":100,"programNumber":0}]]}
},{}]},{},[25]);
