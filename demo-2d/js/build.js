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
module.exports={"tracks":[[{"time":571.428,"duration":136.904625,"noteNumber":57,"velocity":127,"programNumber":40},{"time":714.285,"duration":1714.284,"noteNumber":57,"velocity":127,"programNumber":40},{"time":2428.569,"duration":71.42849999999999,"noteNumber":60,"velocity":127,"programNumber":40},{"time":2499.9975,"duration":71.42849999999999,"noteNumber":64,"velocity":127,"programNumber":40},{"time":2571.426,"duration":71.42849999999999,"noteNumber":69,"velocity":127,"programNumber":40},{"time":2642.8545,"duration":71.42849999999999,"noteNumber":72,"velocity":127,"programNumber":40},{"time":2714.283,"duration":71.42849999999999,"noteNumber":76,"velocity":127,"programNumber":40},{"time":2785.7115,"duration":71.42849999999999,"noteNumber":81,"velocity":127,"programNumber":40},{"time":2857.14,"duration":71.42849999999999,"noteNumber":84,"velocity":127,"programNumber":40},{"time":2928.5685,"duration":71.42849999999999,"noteNumber":88,"velocity":127,"programNumber":40},{"time":2999.997,"duration":761.904,"noteNumber":93,"velocity":127,"programNumber":40},{"time":3857.1389999999997,"duration":71.42849999999999,"noteNumber":91,"velocity":60,"programNumber":40},{"time":3928.5674999999997,"duration":71.42849999999999,"noteNumber":89,"velocity":60,"programNumber":40},{"time":3999.9959999999996,"duration":71.42849999999999,"noteNumber":88,"velocity":60,"programNumber":40},{"time":4071.4244999999996,"duration":71.42850000000044,"noteNumber":86,"velocity":60,"programNumber":40},{"time":4142.853,"duration":71.42849999999999,"noteNumber":84,"velocity":60,"programNumber":40},{"time":4214.2815,"duration":71.42849999999999,"noteNumber":83,"velocity":60,"programNumber":40},{"time":4285.71,"duration":71.42849999999999,"noteNumber":81,"velocity":60,"programNumber":40},{"time":4357.1385,"duration":71.42849999999999,"noteNumber":80,"velocity":60,"programNumber":40},{"time":4428.567,"duration":71.42849999999999,"noteNumber":77,"velocity":60,"programNumber":40},{"time":4499.9955,"duration":71.42849999999999,"noteNumber":76,"velocity":60,"programNumber":40},{"time":4571.424,"duration":71.42849999999999,"noteNumber":74,"velocity":60,"programNumber":40},{"time":4642.8525,"duration":71.42849999999999,"noteNumber":72,"velocity":60,"programNumber":40},{"time":4714.281,"duration":71.42849999999999,"noteNumber":71,"velocity":60,"programNumber":40},{"time":4785.7095,"duration":71.42849999999999,"noteNumber":69,"velocity":60,"programNumber":40},{"time":4857.138,"duration":71.42849999999999,"noteNumber":68,"velocity":60,"programNumber":40},{"time":4928.5665,"duration":71.42849999999999,"noteNumber":65,"velocity":60,"programNumber":40},{"time":4999.995,"duration":71.42849999999999,"noteNumber":64,"velocity":60,"programNumber":40},{"time":5071.4235,"duration":71.42849999999999,"noteNumber":62,"velocity":60,"programNumber":40},{"time":5142.852,"duration":71.42849999999999,"noteNumber":60,"velocity":60,"programNumber":40},{"time":5214.2805,"duration":71.42849999999999,"noteNumber":59,"velocity":60,"programNumber":40},{"time":5285.709,"duration":761.9039999999995,"noteNumber":57,"velocity":60,"programNumber":40},{"time":6142.851,"duration":71.42849999999999,"noteNumber":60,"velocity":127,"programNumber":40},{"time":6214.2795,"duration":71.42849999999999,"noteNumber":64,"velocity":127,"programNumber":40},{"time":6285.708,"duration":71.42849999999999,"noteNumber":69,"velocity":127,"programNumber":40},{"time":6357.1365,"duration":71.42849999999999,"noteNumber":72,"velocity":127,"programNumber":40},{"time":6428.565,"duration":71.42849999999999,"noteNumber":76,"velocity":127,"programNumber":40},{"time":6499.9935,"duration":71.42849999999999,"noteNumber":81,"velocity":127,"programNumber":40},{"time":6571.422,"duration":71.42849999999999,"noteNumber":84,"velocity":127,"programNumber":40},{"time":6642.8505,"duration":71.42849999999999,"noteNumber":88,"velocity":127,"programNumber":40},{"time":6714.2789999999995,"duration":71.42849999999999,"noteNumber":93,"velocity":127,"programNumber":40},{"time":6785.7074999999995,"duration":761.9039999999995,"noteNumber":96,"velocity":127,"programNumber":40},{"time":7642.849499999999,"duration":71.42849999999999,"noteNumber":95,"velocity":60,"programNumber":40},{"time":7714.277999999999,"duration":71.42849999999999,"noteNumber":93,"velocity":60,"programNumber":40},{"time":7785.706499999999,"duration":71.42849999999999,"noteNumber":92,"velocity":60,"programNumber":40},{"time":7857.134999999999,"duration":71.42849999999999,"noteNumber":89,"velocity":60,"programNumber":40},{"time":7928.563499999999,"duration":71.42849999999999,"noteNumber":88,"velocity":60,"programNumber":40},{"time":7999.991999999999,"duration":71.42849999999999,"noteNumber":86,"velocity":60,"programNumber":40},{"time":8071.420499999999,"duration":71.42849999999999,"noteNumber":84,"velocity":60,"programNumber":40},{"time":8142.848999999999,"duration":71.4285000000009,"noteNumber":83,"velocity":60,"programNumber":40},{"time":8214.2775,"duration":71.42849999999999,"noteNumber":81,"velocity":60,"programNumber":40},{"time":8285.706,"duration":71.42849999999999,"noteNumber":80,"velocity":60,"programNumber":40},{"time":8357.1345,"duration":71.42849999999999,"noteNumber":77,"velocity":60,"programNumber":40},{"time":8428.563,"duration":71.42849999999999,"noteNumber":76,"velocity":60,"programNumber":40},{"time":8499.9915,"duration":71.42849999999999,"noteNumber":74,"velocity":60,"programNumber":40},{"time":8571.42,"duration":71.42849999999999,"noteNumber":72,"velocity":60,"programNumber":40},{"time":8642.8485,"duration":71.42849999999999,"noteNumber":71,"velocity":60,"programNumber":40},{"time":8714.277,"duration":71.42849999999999,"noteNumber":69,"velocity":60,"programNumber":40},{"time":8785.7055,"duration":71.42849999999999,"noteNumber":68,"velocity":60,"programNumber":40},{"time":8857.134,"duration":71.42849999999999,"noteNumber":65,"velocity":60,"programNumber":40},{"time":8928.5625,"duration":71.42849999999999,"noteNumber":64,"velocity":60,"programNumber":40},{"time":8999.991,"duration":71.42849999999999,"noteNumber":62,"velocity":60,"programNumber":40},{"time":9071.4195,"duration":71.42849999999999,"noteNumber":60,"velocity":60,"programNumber":40},{"time":9142.848,"duration":71.42849999999999,"noteNumber":59,"velocity":60,"programNumber":40},{"time":9214.2765,"duration":761.9040000000005,"noteNumber":57,"velocity":60,"programNumber":40},{"time":10071.4185,"duration":71.42849999999999,"noteNumber":60,"velocity":127,"programNumber":40},{"time":10142.847,"duration":71.42849999999999,"noteNumber":64,"velocity":127,"programNumber":40},{"time":10214.2755,"duration":71.42849999999999,"noteNumber":69,"velocity":127,"programNumber":40},{"time":10285.704,"duration":71.42849999999999,"noteNumber":72,"velocity":127,"programNumber":40},{"time":10357.1325,"duration":71.42849999999999,"noteNumber":76,"velocity":127,"programNumber":40},{"time":10428.561,"duration":71.42849999999999,"noteNumber":81,"velocity":127,"programNumber":40},{"time":10499.9895,"duration":71.42849999999999,"noteNumber":84,"velocity":127,"programNumber":40},{"time":10571.418,"duration":71.42849999999999,"noteNumber":88,"velocity":127,"programNumber":40},{"time":10642.8465,"duration":71.42849999999999,"noteNumber":93,"velocity":127,"programNumber":40},{"time":10714.275,"duration":71.42849999999999,"noteNumber":96,"velocity":127,"programNumber":40},{"time":10785.7035,"duration":761.9040000000005,"noteNumber":100,"velocity":127,"programNumber":40},{"time":11642.8455,"duration":71.42849999999999,"noteNumber":98,"velocity":60,"programNumber":40},{"time":11714.274,"duration":71.42849999999999,"noteNumber":96,"velocity":60,"programNumber":40},{"time":11785.7025,"duration":71.42849999999999,"noteNumber":95,"velocity":60,"programNumber":40},{"time":11857.131,"duration":71.42849999999999,"noteNumber":93,"velocity":60,"programNumber":40},{"time":11928.5595,"duration":71.42849999999999,"noteNumber":92,"velocity":60,"programNumber":40},{"time":11999.988,"duration":71.42849999999999,"noteNumber":89,"velocity":60,"programNumber":40},{"time":12071.4165,"duration":71.42849999999999,"noteNumber":88,"velocity":60,"programNumber":40},{"time":12142.845,"duration":71.42849999999999,"noteNumber":86,"velocity":60,"programNumber":40},{"time":12214.2735,"duration":71.42849999999999,"noteNumber":84,"velocity":60,"programNumber":40},{"time":12285.702,"duration":71.42849999999999,"noteNumber":83,"velocity":60,"programNumber":40},{"time":12357.1305,"duration":71.42849999999999,"noteNumber":81,"velocity":60,"programNumber":40},{"time":12428.559,"duration":71.42849999999999,"noteNumber":80,"velocity":60,"programNumber":40},{"time":12499.9875,"duration":71.42849999999999,"noteNumber":77,"velocity":60,"programNumber":40},{"time":12571.416,"duration":71.42849999999999,"noteNumber":76,"velocity":60,"programNumber":40},{"time":12642.8445,"duration":71.42849999999999,"noteNumber":74,"velocity":60,"programNumber":40},{"time":12714.273,"duration":71.42849999999999,"noteNumber":72,"velocity":60,"programNumber":40},{"time":12785.7015,"duration":71.42849999999999,"noteNumber":71,"velocity":60,"programNumber":40},{"time":12857.13,"duration":71.42849999999999,"noteNumber":69,"velocity":60,"programNumber":40},{"time":12928.5585,"duration":71.42849999999999,"noteNumber":68,"velocity":60,"programNumber":40},{"time":12999.987,"duration":71.42849999999999,"noteNumber":65,"velocity":60,"programNumber":40},{"time":13071.4155,"duration":71.42849999999999,"noteNumber":64,"velocity":60,"programNumber":40},{"time":13142.844,"duration":71.42849999999999,"noteNumber":62,"velocity":60,"programNumber":40},{"time":13214.2725,"duration":71.42849999999999,"noteNumber":60,"velocity":60,"programNumber":40},{"time":13285.701,"duration":71.42849999999999,"noteNumber":59,"velocity":60,"programNumber":40},{"time":13357.1295,"duration":761.9040000000005,"noteNumber":57,"velocity":60,"programNumber":40},{"time":14214.271499999999,"duration":71.42849999999999,"noteNumber":60,"velocity":127,"programNumber":40},{"time":14285.699999999999,"duration":71.42849999999999,"noteNumber":64,"velocity":127,"programNumber":40},{"time":14357.128499999999,"duration":71.42849999999999,"noteNumber":69,"velocity":127,"programNumber":40},{"time":14428.556999999999,"duration":71.42849999999999,"noteNumber":72,"velocity":127,"programNumber":40},{"time":14499.985499999999,"duration":71.42849999999999,"noteNumber":76,"velocity":127,"programNumber":40},{"time":14571.413999999999,"duration":71.42849999999999,"noteNumber":81,"velocity":127,"programNumber":40},{"time":14642.842499999999,"duration":71.42849999999999,"noteNumber":84,"velocity":127,"programNumber":40},{"time":14714.270999999999,"duration":71.42849999999999,"noteNumber":88,"velocity":127,"programNumber":40},{"time":14785.699499999999,"duration":71.42849999999999,"noteNumber":93,"velocity":127,"programNumber":40},{"time":14857.127999999999,"duration":71.42849999999999,"noteNumber":96,"velocity":127,"programNumber":40},{"time":14928.556499999999,"duration":71.42849999999999,"noteNumber":100,"velocity":127,"programNumber":40},{"time":14999.984999999999,"duration":761.9040000000005,"noteNumber":105,"velocity":127,"programNumber":40},{"time":15857.126999999999,"duration":71.42849999999999,"noteNumber":103,"velocity":60,"programNumber":40},{"time":15928.555499999999,"duration":71.42849999999999,"noteNumber":101,"velocity":60,"programNumber":40},{"time":15999.983999999999,"duration":71.42849999999999,"noteNumber":100,"velocity":60,"programNumber":40},{"time":16071.412499999999,"duration":71.42849999999999,"noteNumber":98,"velocity":60,"programNumber":40},{"time":16142.840999999999,"duration":71.42849999999999,"noteNumber":96,"velocity":60,"programNumber":40},{"time":16214.269499999999,"duration":71.42849999999999,"noteNumber":95,"velocity":60,"programNumber":40},{"time":16285.697999999999,"duration":71.42849999999999,"noteNumber":93,"velocity":60,"programNumber":40},{"time":16357.126499999998,"duration":71.4285000000018,"noteNumber":92,"velocity":60,"programNumber":40},{"time":16428.555,"duration":71.4285000000018,"noteNumber":89,"velocity":60,"programNumber":40},{"time":16499.983500000002,"duration":71.4285000000018,"noteNumber":88,"velocity":60,"programNumber":40},{"time":16571.412000000004,"duration":71.4285000000018,"noteNumber":86,"velocity":60,"programNumber":40},{"time":16642.840500000006,"duration":71.4285000000018,"noteNumber":84,"velocity":60,"programNumber":40},{"time":16714.269000000008,"duration":71.4285000000018,"noteNumber":83,"velocity":60,"programNumber":40},{"time":16785.69750000001,"duration":71.4285000000018,"noteNumber":81,"velocity":60,"programNumber":40},{"time":16857.12600000001,"duration":71.4285000000018,"noteNumber":80,"velocity":60,"programNumber":40},{"time":16928.554500000013,"duration":71.4285000000018,"noteNumber":77,"velocity":60,"programNumber":40},{"time":16999.983000000015,"duration":71.4285000000018,"noteNumber":76,"velocity":60,"programNumber":40},{"time":17071.411500000017,"duration":71.4285000000018,"noteNumber":74,"velocity":60,"programNumber":40},{"time":17142.84000000002,"duration":71.4285000000018,"noteNumber":72,"velocity":60,"programNumber":40},{"time":17214.26850000002,"duration":71.4285000000018,"noteNumber":71,"velocity":60,"programNumber":40},{"time":17285.697000000022,"duration":71.4285000000018,"noteNumber":69,"velocity":60,"programNumber":40},{"time":17357.125500000024,"duration":71.4285000000018,"noteNumber":68,"velocity":60,"programNumber":40},{"time":17428.554000000026,"duration":71.4285000000018,"noteNumber":65,"velocity":60,"programNumber":40},{"time":17499.982500000027,"duration":71.4285000000018,"noteNumber":64,"velocity":60,"programNumber":40},{"time":17571.41100000003,"duration":71.4285000000018,"noteNumber":62,"velocity":60,"programNumber":40},{"time":17642.83950000003,"duration":71.4285000000018,"noteNumber":60,"velocity":60,"programNumber":40},{"time":17714.268000000033,"duration":65.47612500000105,"noteNumber":59,"velocity":60,"programNumber":40},{"time":17785.696500000035,"duration":450,"noteNumber":57,"velocity":63,"programNumber":40},{"time":18235.696500000035,"duration":62.5,"noteNumber":58,"velocity":63,"programNumber":40},{"time":18298.196500000035,"duration":71.4285000000018,"noteNumber":59,"velocity":66,"programNumber":40},{"time":18369.625000000036,"duration":83.33324999999968,"noteNumber":60,"velocity":69,"programNumber":40},{"time":18452.958250000036,"duration":44.910124999998516,"noteNumber":61,"velocity":72,"programNumber":40},{"time":18497.868375000035,"duration":44.910124999998516,"noteNumber":62,"velocity":75,"programNumber":40},{"time":18542.778500000033,"duration":44.910124999998516,"noteNumber":63,"velocity":78,"programNumber":40},{"time":18587.68862500003,"duration":44.910124999998516,"noteNumber":64,"velocity":81,"programNumber":40},{"time":18632.59875000003,"duration":44.910124999998516,"noteNumber":65,"velocity":84,"programNumber":40},{"time":18677.50887500003,"duration":44.910124999998516,"noteNumber":66,"velocity":87,"programNumber":40},{"time":18722.419000000027,"duration":44.910124999998516,"noteNumber":67,"velocity":90,"programNumber":40},{"time":18767.329125000026,"duration":44.910124999998516,"noteNumber":68,"velocity":93,"programNumber":40},{"time":18812.239250000024,"duration":44.910124999998516,"noteNumber":69,"velocity":96,"programNumber":40},{"time":18857.149375000023,"duration":44.910124999998516,"noteNumber":70,"velocity":99,"programNumber":40},{"time":18902.05950000002,"duration":44.910124999998516,"noteNumber":71,"velocity":102,"programNumber":40},{"time":18946.96962500002,"duration":44.910124999998516,"noteNumber":72,"velocity":105,"programNumber":40},{"time":18991.87975000002,"duration":44.910124999998516,"noteNumber":73,"velocity":108,"programNumber":40},{"time":19036.789875000017,"duration":44.910124999998516,"noteNumber":74,"velocity":111,"programNumber":40},{"time":19081.700000000015,"duration":44.910124999998516,"noteNumber":75,"velocity":115,"programNumber":40},{"time":19126.610125000014,"duration":44.910124999998516,"noteNumber":76,"velocity":119,"programNumber":40},{"time":19171.520250000012,"duration":44.910124999998516,"noteNumber":77,"velocity":123,"programNumber":40},{"time":19216.43037500001,"duration":44.910124999998516,"noteNumber":78,"velocity":127,"programNumber":40},{"time":19261.34050000001,"duration":44.910124999998516,"noteNumber":79,"velocity":127,"programNumber":40},{"time":19306.250625000008,"duration":44.910124999998516,"noteNumber":80,"velocity":127,"programNumber":40},{"time":19351.160750000006,"duration":44.910124999998516,"noteNumber":81,"velocity":127,"programNumber":40},{"time":19396.070875000005,"duration":44.910124999998516,"noteNumber":80,"velocity":127,"programNumber":40},{"time":19440.981000000003,"duration":44.910124999998516,"noteNumber":79,"velocity":124,"programNumber":40},{"time":19485.891125000002,"duration":44.910124999998516,"noteNumber":78,"velocity":121,"programNumber":40},{"time":19530.80125,"duration":44.910124999998516,"noteNumber":77,"velocity":118,"programNumber":40},{"time":19575.711375,"duration":44.910124999998516,"noteNumber":76,"velocity":115,"programNumber":40},{"time":19620.621499999997,"duration":44.910124999998516,"noteNumber":75,"velocity":112,"programNumber":40},{"time":19665.531624999996,"duration":44.910124999998516,"noteNumber":74,"velocity":109,"programNumber":40},{"time":19710.441749999994,"duration":44.910124999998516,"noteNumber":73,"velocity":106,"programNumber":40},{"time":19755.351874999993,"duration":44.910124999998516,"noteNumber":72,"velocity":103,"programNumber":40},{"time":19800.26199999999,"duration":44.910124999998516,"noteNumber":71,"velocity":100,"programNumber":40},{"time":19845.17212499999,"duration":44.910124999998516,"noteNumber":70,"velocity":97,"programNumber":40},{"time":19890.08224999999,"duration":44.910124999998516,"noteNumber":69,"velocity":93,"programNumber":40},{"time":19934.992374999987,"duration":44.910124999998516,"noteNumber":68,"velocity":89,"programNumber":40},{"time":19979.902499999986,"duration":44.910124999998516,"noteNumber":67,"velocity":85,"programNumber":40},{"time":20024.812624999984,"duration":44.910124999998516,"noteNumber":66,"velocity":81,"programNumber":40},{"time":20069.722749999983,"duration":44.910124999998516,"noteNumber":65,"velocity":77,"programNumber":40},{"time":20114.63287499998,"duration":44.910124999998516,"noteNumber":64,"velocity":73,"programNumber":40},{"time":20159.54299999998,"duration":44.910124999998516,"noteNumber":63,"velocity":69,"programNumber":40},{"time":20204.453124999978,"duration":44.910124999998516,"noteNumber":62,"velocity":65,"programNumber":40},{"time":20249.363249999977,"duration":44.910124999998516,"noteNumber":61,"velocity":61,"programNumber":40},{"time":20294.273374999975,"duration":44.910124999998516,"noteNumber":60,"velocity":57,"programNumber":40},{"time":20339.183499999974,"duration":44.910124999998516,"noteNumber":59,"velocity":53,"programNumber":40},{"time":20384.093624999972,"duration":41.16761458333349,"noteNumber":58,"velocity":49,"programNumber":40},{"time":20429.00374999997,"duration":538.9215000000004,"noteNumber":57,"velocity":45,"programNumber":40},{"time":20967.92524999997,"duration":86.077739583332,"noteNumber":60,"velocity":108,"programNumber":40},{"time":20967.92524999997,"duration":86.077739583332,"noteNumber":64,"velocity":108,"programNumber":40},{"time":21057.745499999968,"duration":299.40083333333314,"noteNumber":72,"velocity":108,"programNumber":40},{"time":21057.745499999968,"duration":299.40083333333314,"noteNumber":81,"velocity":108,"programNumber":40},{"time":21776.307499999966,"duration":63.622677083334565,"noteNumber":57,"velocity":92,"programNumber":40},{"time":21866.127749999967,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":21955.947999999968,"duration":59.8801666666659,"noteNumber":64,"velocity":92,"programNumber":40},{"time":22045.76824999997,"duration":59.8801666666659,"noteNumber":60,"velocity":92,"programNumber":40},{"time":22135.58849999997,"duration":63.622677083334565,"noteNumber":59,"velocity":92,"programNumber":40},{"time":22225.40874999997,"duration":63.622677083334565,"noteNumber":62,"velocity":92,"programNumber":40},{"time":22315.22899999997,"duration":59.8801666666659,"noteNumber":64,"velocity":92,"programNumber":40},{"time":22405.04924999997,"duration":59.8801666666659,"noteNumber":62,"velocity":92,"programNumber":40},{"time":22494.86949999997,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":22584.689749999972,"duration":63.622677083334565,"noteNumber":69,"velocity":92,"programNumber":40},{"time":22674.509999999973,"duration":63.622677083334565,"noteNumber":67,"velocity":92,"programNumber":40},{"time":22764.330249999974,"duration":59.8801666666659,"noteNumber":65,"velocity":92,"programNumber":40},{"time":22854.150499999974,"duration":63.622677083334565,"noteNumber":64,"velocity":92,"programNumber":40},{"time":22943.970749999975,"duration":63.622677083334565,"noteNumber":62,"velocity":92,"programNumber":40},{"time":23033.790999999976,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":23123.611249999976,"duration":59.8801666666659,"noteNumber":59,"velocity":92,"programNumber":40},{"time":23213.431499999977,"duration":63.622677083334565,"noteNumber":57,"velocity":92,"programNumber":40},{"time":23303.251749999978,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":23393.07199999998,"duration":59.8801666666659,"noteNumber":64,"velocity":92,"programNumber":40},{"time":23482.89224999998,"duration":59.8801666666659,"noteNumber":60,"velocity":92,"programNumber":40},{"time":23572.71249999998,"duration":63.622677083334565,"noteNumber":59,"velocity":92,"programNumber":40},{"time":23662.53274999998,"duration":63.622677083334565,"noteNumber":62,"velocity":92,"programNumber":40},{"time":23752.35299999998,"duration":59.8801666666659,"noteNumber":64,"velocity":92,"programNumber":40},{"time":23842.17324999998,"duration":59.8801666666659,"noteNumber":62,"velocity":92,"programNumber":40},{"time":23931.993499999982,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":24021.813749999983,"duration":63.622677083334565,"noteNumber":69,"velocity":92,"programNumber":40},{"time":24111.633999999984,"duration":63.622677083334565,"noteNumber":67,"velocity":92,"programNumber":40},{"time":24201.454249999984,"duration":59.8801666666659,"noteNumber":65,"velocity":92,"programNumber":40},{"time":24291.274499999985,"duration":63.622677083334565,"noteNumber":64,"velocity":92,"programNumber":40},{"time":24381.094749999986,"duration":63.622677083334565,"noteNumber":62,"velocity":92,"programNumber":40},{"time":24470.914999999986,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":24560.735249999987,"duration":59.8801666666659,"noteNumber":59,"velocity":92,"programNumber":40},{"time":24650.555499999988,"duration":63.622677083334565,"noteNumber":57,"velocity":92,"programNumber":40},{"time":24740.37574999999,"duration":63.622677083334565,"noteNumber":61,"velocity":92,"programNumber":40},{"time":24830.19599999999,"duration":59.8801666666659,"noteNumber":64,"velocity":92,"programNumber":40},{"time":24920.01624999999,"duration":59.8801666666659,"noteNumber":61,"velocity":92,"programNumber":40},{"time":25009.83649999999,"duration":63.622677083334565,"noteNumber":57,"velocity":92,"programNumber":40},{"time":25099.65674999999,"duration":63.622677083334565,"noteNumber":62,"velocity":92,"programNumber":40},{"time":25189.47699999999,"duration":59.8801666666659,"noteNumber":65,"velocity":92,"programNumber":40},{"time":25279.297249999992,"duration":59.8801666666659,"noteNumber":62,"velocity":92,"programNumber":40},{"time":25369.117499999993,"duration":63.622677083334565,"noteNumber":55,"velocity":92,"programNumber":40},{"time":25458.937749999994,"duration":63.622677083334565,"noteNumber":59,"velocity":92,"programNumber":40},{"time":25548.757999999994,"duration":63.622677083334565,"noteNumber":65,"velocity":92,"programNumber":40},{"time":25638.578249999995,"duration":59.8801666666659,"noteNumber":59,"velocity":92,"programNumber":40},{"time":25728.398499999996,"duration":63.622677083334565,"noteNumber":55,"velocity":92,"programNumber":40},{"time":25818.218749999996,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":25908.038999999997,"duration":63.622677083334565,"noteNumber":64,"velocity":92,"programNumber":40},{"time":25997.859249999998,"duration":59.8801666666659,"noteNumber":60,"velocity":92,"programNumber":40},{"time":26087.6795,"duration":63.622677083334565,"noteNumber":56,"velocity":92,"programNumber":40},{"time":26177.49975,"duration":63.622677083334565,"noteNumber":59,"velocity":92,"programNumber":40},{"time":26267.32,"duration":59.8801666666659,"noteNumber":65,"velocity":92,"programNumber":40},{"time":26357.14025,"duration":59.8801666666659,"noteNumber":62,"velocity":92,"programNumber":40},{"time":26446.9605,"duration":63.622677083334565,"noteNumber":60,"velocity":92,"programNumber":40},{"time":26536.78075,"duration":63.622677083334565,"noteNumber":57,"velocity":92,"programNumber":40},{"time":26626.601000000002,"duration":59.8801666666659,"noteNumber":69,"velocity":92,"programNumber":40},{"time":26716.421250000003,"duration":59.8801666666659,"noteNumber":63,"velocity":92,"programNumber":40},{"time":26806.241500000004,"duration":63.622677083334565,"noteNumber":64,"velocity":92,"programNumber":40},{"time":26896.061750000004,"duration":63.622677083334565,"noteNumber":68,"velocity":92,"programNumber":40},{"time":26985.882000000005,"duration":63.622677083334565,"noteNumber":71,"velocity":92,"programNumber":40},{"time":27075.702250000006,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":27165.522500000006,"duration":63.622677083334565,"noteNumber":80,"velocity":92,"programNumber":40},{"time":27255.342750000007,"duration":63.622677083334565,"noteNumber":83,"velocity":92,"programNumber":40},{"time":27345.163000000008,"duration":63.622677083334565,"noteNumber":86,"velocity":92,"programNumber":40},{"time":27434.98325000001,"duration":59.8801666666659,"noteNumber":88,"velocity":92,"programNumber":40},{"time":27524.80350000001,"duration":63.622677083334565,"noteNumber":69,"velocity":92,"programNumber":40},{"time":27614.62375000001,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":27704.44400000001,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":27794.26425000001,"duration":59.8801666666659,"noteNumber":72,"velocity":92,"programNumber":40},{"time":27884.08450000001,"duration":63.622677083334565,"noteNumber":71,"velocity":92,"programNumber":40},{"time":27973.904750000012,"duration":63.622677083334565,"noteNumber":74,"velocity":92,"programNumber":40},{"time":28063.725000000013,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":28153.545250000014,"duration":59.8801666666659,"noteNumber":74,"velocity":92,"programNumber":40},{"time":28243.365500000014,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":28333.185750000015,"duration":63.622677083334565,"noteNumber":81,"velocity":92,"programNumber":40},{"time":28423.006000000016,"duration":63.622677083334565,"noteNumber":79,"velocity":92,"programNumber":40},{"time":28512.826250000016,"duration":59.8801666666659,"noteNumber":77,"velocity":92,"programNumber":40},{"time":28602.646500000017,"duration":63.622677083334565,"noteNumber":76,"velocity":92,"programNumber":40},{"time":28692.466750000018,"duration":63.622677083334565,"noteNumber":74,"velocity":92,"programNumber":40},{"time":28782.28700000002,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":28872.10725000002,"duration":59.8801666666659,"noteNumber":71,"velocity":92,"programNumber":40},{"time":28961.92750000002,"duration":63.622677083334565,"noteNumber":69,"velocity":92,"programNumber":40},{"time":29051.74775000002,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":29141.56800000002,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":29231.38825000002,"duration":59.8801666666659,"noteNumber":72,"velocity":92,"programNumber":40},{"time":29321.208500000022,"duration":63.622677083334565,"noteNumber":71,"velocity":92,"programNumber":40},{"time":29411.028750000023,"duration":63.622677083334565,"noteNumber":74,"velocity":92,"programNumber":40},{"time":29500.849000000024,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":29590.669250000024,"duration":59.8801666666659,"noteNumber":74,"velocity":92,"programNumber":40},{"time":29680.489500000025,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":29770.309750000026,"duration":63.622677083334565,"noteNumber":81,"velocity":92,"programNumber":40},{"time":29860.130000000026,"duration":63.622677083334565,"noteNumber":79,"velocity":92,"programNumber":40},{"time":29949.950250000027,"duration":59.8801666666659,"noteNumber":77,"velocity":92,"programNumber":40},{"time":30039.770500000028,"duration":63.622677083334565,"noteNumber":76,"velocity":92,"programNumber":40},{"time":30129.59075000003,"duration":63.622677083334565,"noteNumber":74,"velocity":92,"programNumber":40},{"time":30219.41100000003,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":30309.23125000003,"duration":59.8801666666659,"noteNumber":71,"velocity":92,"programNumber":40},{"time":30399.05150000003,"duration":63.622677083334565,"noteNumber":69,"velocity":92,"programNumber":40},{"time":30488.87175000003,"duration":63.622677083334565,"noteNumber":73,"velocity":92,"programNumber":40},{"time":30578.692000000032,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":30668.512250000033,"duration":59.8801666666659,"noteNumber":73,"velocity":92,"programNumber":40},{"time":30758.332500000033,"duration":63.622677083334565,"noteNumber":81,"velocity":92,"programNumber":40},{"time":30848.152750000034,"duration":63.622677083334565,"noteNumber":79,"velocity":92,"programNumber":40},{"time":30937.973000000035,"duration":59.8801666666659,"noteNumber":77,"velocity":92,"programNumber":40},{"time":31027.793250000035,"duration":59.8801666666659,"noteNumber":76,"velocity":92,"programNumber":40},{"time":31117.613500000036,"duration":63.622677083334565,"noteNumber":73,"velocity":92,"programNumber":40},{"time":31207.433750000037,"duration":63.622677083334565,"noteNumber":74,"velocity":92,"programNumber":40},{"time":31297.254000000037,"duration":63.622677083334565,"noteNumber":83,"velocity":92,"programNumber":40},{"time":31387.074250000038,"duration":59.8801666666659,"noteNumber":81,"velocity":92,"programNumber":40},{"time":31476.89450000004,"duration":63.622677083334565,"noteNumber":79,"velocity":92,"programNumber":40},{"time":31566.71475000004,"duration":63.622677083334565,"noteNumber":77,"velocity":92,"programNumber":40},{"time":31656.53500000004,"duration":63.622677083334565,"noteNumber":76,"velocity":92,"programNumber":40},{"time":31746.35525000004,"duration":59.8801666666659,"noteNumber":74,"velocity":92,"programNumber":40},{"time":31836.17550000004,"duration":63.622677083334565,"noteNumber":72,"velocity":92,"programNumber":40},{"time":31925.995750000042,"duration":63.622677083334565,"noteNumber":71,"velocity":92,"programNumber":40},{"time":32015.816000000043,"duration":59.8801666666659,"noteNumber":69,"velocity":92,"programNumber":40},{"time":32105.636250000043,"duration":59.8801666666659,"noteNumber":67,"velocity":92,"programNumber":40},{"time":32195.456500000044,"duration":63.622677083334565,"noteNumber":66,"velocity":92,"programNumber":40},{"time":32285.276750000045,"duration":63.622677083334565,"noteNumber":67,"velocity":92,"programNumber":40},{"time":32375.097000000045,"duration":59.8801666666659,"noteNumber":69,"velocity":92,"programNumber":40},{"time":32464.917250000046,"duration":59.8801666666659,"noteNumber":65,"velocity":92,"programNumber":40},{"time":32554.737500000047,"duration":63.622677083334565,"noteNumber":64,"velocity":92,"programNumber":40},{"time":32644.557750000047,"duration":63.622677083334565,"noteNumber":67,"velocity":92,"programNumber":40},{"time":32734.378000000048,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":32824.198250000045,"duration":59.88016666666954,"noteNumber":64,"velocity":92,"programNumber":40},{"time":32914.01850000005,"duration":63.62267708333093,"noteNumber":62,"velocity":92,"programNumber":40},{"time":33003.838750000046,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":33093.65900000004,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":33183.47925000004,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":33273.299500000045,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":33363.11975000004,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":33452.94000000004,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":33542.76025000004,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":33632.58050000005,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":33722.400750000044,"duration":63.62267708333093,"noteNumber":62,"velocity":92,"programNumber":40},{"time":33812.22100000004,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":33902.041250000046,"duration":59.88016666666954,"noteNumber":59,"velocity":92,"programNumber":40},{"time":33991.86150000005,"duration":63.62267708333093,"noteNumber":57,"velocity":92,"programNumber":40},{"time":34081.68175000005,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":34171.502000000044,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":34261.32225000004,"duration":59.88016666666954,"noteNumber":57,"velocity":92,"programNumber":40},{"time":34351.142500000045,"duration":63.62267708333093,"noteNumber":56,"velocity":92,"programNumber":40},{"time":34440.96275000004,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":34530.78300000004,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":34620.60325000004,"duration":59.88016666666954,"noteNumber":56,"velocity":92,"programNumber":40},{"time":34710.42350000004,"duration":63.62267708333093,"noteNumber":55,"velocity":92,"programNumber":40},{"time":34800.24375000004,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":34890.064000000035,"duration":59.88016666666954,"noteNumber":65,"velocity":92,"programNumber":40},{"time":34979.88425000004,"duration":59.88016666666954,"noteNumber":59,"velocity":92,"programNumber":40},{"time":35069.70450000004,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":35159.52475000004,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":35249.34500000004,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":35339.16525000004,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":35428.985500000046,"duration":63.62267708333093,"noteNumber":62,"velocity":92,"programNumber":40},{"time":35518.80575000004,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":35608.62600000004,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":35698.44625000004,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":35788.26650000004,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":35878.08675000004,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":35967.907000000036,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":36057.72725000003,"duration":59.88016666666954,"noteNumber":76,"velocity":92,"programNumber":40},{"time":36147.54750000004,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":36237.367750000034,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":36327.18800000003,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":36417.008250000035,"duration":59.88016666666954,"noteNumber":77,"velocity":92,"programNumber":40},{"time":36506.82850000004,"duration":63.62267708333093,"noteNumber":66,"velocity":92,"programNumber":40},{"time":36596.64875000004,"duration":63.62267708333093,"noteNumber":75,"velocity":92,"programNumber":40},{"time":36686.469000000034,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":36776.28925000004,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":36866.10950000004,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":36955.92975000004,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":37045.75000000004,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":37135.57025000003,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":37225.39050000004,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":37315.210750000035,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":37405.03100000003,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":37494.85125000003,"duration":59.88016666666954,"noteNumber":71,"velocity":92,"programNumber":40},{"time":37584.67150000003,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":37674.49175000003,"duration":63.62267708333093,"noteNumber":84,"velocity":92,"programNumber":40},{"time":37764.31200000003,"duration":59.88016666666954,"noteNumber":83,"velocity":92,"programNumber":40},{"time":37854.13225000003,"duration":59.88016666666954,"noteNumber":81,"velocity":92,"programNumber":40},{"time":37943.952500000036,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":38033.77275000003,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":38123.59300000003,"duration":59.88016666666954,"noteNumber":76,"velocity":92,"programNumber":40},{"time":38213.413250000034,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":38303.23350000004,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":38393.053750000036,"duration":63.62267708333093,"noteNumber":83,"velocity":92,"programNumber":40},{"time":38482.87400000003,"duration":63.62267708333093,"noteNumber":81,"velocity":92,"programNumber":40},{"time":38572.69425000003,"duration":59.88016666666954,"noteNumber":79,"velocity":92,"programNumber":40},{"time":38662.514500000034,"duration":63.62267708333093,"noteNumber":78,"velocity":92,"programNumber":40},{"time":38752.33475000003,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":38842.15500000003,"duration":63.62267708333093,"noteNumber":75,"velocity":92,"programNumber":40},{"time":38931.975250000025,"duration":59.88016666666954,"noteNumber":71,"velocity":92,"programNumber":40},{"time":39021.79550000003,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":39111.615750000026,"duration":63.62267708333093,"noteNumber":81,"velocity":92,"programNumber":40},{"time":39201.43600000002,"duration":59.88016666666954,"noteNumber":79,"velocity":92,"programNumber":40},{"time":39291.25625000003,"duration":59.88016666666954,"noteNumber":77,"velocity":92,"programNumber":40},{"time":39381.07650000003,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":39470.89675000003,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":39560.717000000026,"duration":59.88016666666954,"noteNumber":73,"velocity":92,"programNumber":40},{"time":39650.53725000003,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":39740.357500000035,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":39830.17775000003,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":39919.99800000003,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":40009.818250000026,"duration":59.88016666666954,"noteNumber":76,"velocity":92,"programNumber":40},{"time":40099.63850000003,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":40189.45875000003,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":40279.279000000024,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":40369.09925000002,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":40458.919500000025,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":40548.73975000002,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":40638.56000000002,"duration":59.88016666666954,"noteNumber":76,"velocity":92,"programNumber":40},{"time":40728.380250000024,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":40818.20050000003,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":40908.020750000025,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":40997.84100000002,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":41087.66125000003,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":41177.48150000003,"duration":63.62267708333093,"noteNumber":66,"velocity":92,"programNumber":40},{"time":41267.30175000003,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":41357.122000000025,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":41446.94225000002,"duration":59.88016666666954,"noteNumber":75,"velocity":92,"programNumber":40},{"time":41536.762500000026,"duration":63.62267708333093,"noteNumber":78,"velocity":92,"programNumber":40},{"time":41626.58275000002,"duration":63.62267708333093,"noteNumber":81,"velocity":92,"programNumber":40},{"time":41716.40300000002,"duration":63.62267708333093,"noteNumber":84,"velocity":92,"programNumber":40},{"time":41806.22325000002,"duration":59.88016666666954,"noteNumber":78,"velocity":92,"programNumber":40},{"time":41896.04350000002,"duration":63.62267708333093,"noteNumber":84,"velocity":92,"programNumber":40},{"time":41985.86375000002,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":42075.684000000016,"duration":59.88016666666954,"noteNumber":76,"velocity":92,"programNumber":40},{"time":42165.50425000002,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":42255.324500000024,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":42345.14475000002,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":42434.96500000002,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":42524.78525000002,"duration":59.88016666666954,"noteNumber":55,"velocity":92,"programNumber":40},{"time":42614.60550000003,"duration":63.62267708333093,"noteNumber":83,"velocity":92,"programNumber":40},{"time":42704.425750000024,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":42794.24600000002,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":42884.06625000002,"duration":59.88016666666954,"noteNumber":71,"velocity":92,"programNumber":40},{"time":42973.88650000002,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":43063.70675000002,"duration":63.62267708333093,"noteNumber":62,"velocity":92,"programNumber":40},{"time":43153.52700000002,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":43243.34725000001,"duration":59.88016666666954,"noteNumber":55,"velocity":92,"programNumber":40},{"time":43333.16750000002,"duration":63.62267708333093,"noteNumber":57,"velocity":92,"programNumber":40},{"time":43422.987750000015,"duration":63.62267708333093,"noteNumber":84,"velocity":92,"programNumber":40},{"time":43512.80800000001,"duration":63.62267708333093,"noteNumber":83,"velocity":92,"programNumber":40},{"time":43602.62825000001,"duration":59.88016666666954,"noteNumber":82,"velocity":92,"programNumber":40},{"time":43692.44850000001,"duration":63.62267708333093,"noteNumber":81,"velocity":92,"programNumber":40},{"time":43782.26875000001,"duration":63.62267708333093,"noteNumber":80,"velocity":92,"programNumber":40},{"time":43872.08900000001,"duration":59.88016666666954,"noteNumber":79,"velocity":92,"programNumber":40},{"time":43961.90925000001,"duration":59.88016666666954,"noteNumber":78,"velocity":92,"programNumber":40},{"time":44051.729500000016,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":44141.54975000001,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":44231.37000000001,"duration":63.62267708333093,"noteNumber":75,"velocity":92,"programNumber":40},{"time":44321.19025000001,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":44411.01050000001,"duration":63.62267708333093,"noteNumber":73,"velocity":92,"programNumber":40},{"time":44500.83075000001,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":44590.651000000005,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":44680.47125,"duration":59.88016666666954,"noteNumber":70,"velocity":92,"programNumber":40},{"time":44770.29150000001,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":44860.111750000004,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":44949.932,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":45039.752250000005,"duration":59.88016666666954,"noteNumber":66,"velocity":92,"programNumber":40},{"time":45129.57250000001,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":45219.392750000006,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":45309.213,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":45399.03325000001,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":45488.85350000001,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":45578.67375000001,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":45668.494000000006,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":45758.31425,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":45848.13450000001,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":45937.954750000004,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":46027.775,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":46117.59525,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":46207.4155,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":46297.23575,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":46387.056,"duration":59.88016666666954,"noteNumber":55,"velocity":92,"programNumber":40},{"time":46476.87625,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":46566.696500000005,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":46656.51675,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":46746.337,"duration":59.88016666666954,"noteNumber":65,"velocity":92,"programNumber":40},{"time":46836.157250000004,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":46925.97750000001,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":47015.797750000005,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":47105.618,"duration":63.62267708333093,"noteNumber":55,"velocity":92,"programNumber":40},{"time":47195.43825,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":47285.2585,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":47375.07875,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":47464.899,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":47554.719249999995,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":47644.5395,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":47734.359749999996,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":47824.17999999999,"duration":59.88016666666954,"noteNumber":64,"velocity":92,"programNumber":40},{"time":47914.00025,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":48003.8205,"duration":63.62267708333093,"noteNumber":58,"velocity":92,"programNumber":40},{"time":48093.64075,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":48183.460999999996,"duration":59.88016666666954,"noteNumber":64,"velocity":92,"programNumber":40},{"time":48273.28125,"duration":59.88016666666954,"noteNumber":58,"velocity":92,"programNumber":40},{"time":48363.101500000004,"duration":63.62267708333093,"noteNumber":57,"velocity":92,"programNumber":40},{"time":48452.92175,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":48542.742,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":48632.562249999995,"duration":59.88016666666954,"noteNumber":57,"velocity":92,"programNumber":40},{"time":48722.3825,"duration":63.62267708333093,"noteNumber":55,"velocity":92,"programNumber":40},{"time":48812.20275,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":48902.022999999994,"duration":63.62267708333093,"noteNumber":58,"velocity":92,"programNumber":40},{"time":48991.84324999999,"duration":59.88016666666954,"noteNumber":55,"velocity":92,"programNumber":40},{"time":49081.663499999995,"duration":63.62267708333093,"noteNumber":57,"velocity":92,"programNumber":40},{"time":49171.48374999999,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":49261.30399999999,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":49351.12424999999,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":49440.9445,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":49530.764749999995,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":49620.58499999999,"duration":59.88016666666954,"noteNumber":73,"velocity":92,"programNumber":40},{"time":49710.405249999996,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":49800.2255,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":49890.04575,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":49979.865999999995,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":50069.68624999999,"duration":59.88016666666954,"noteNumber":65,"velocity":92,"programNumber":40},{"time":50159.506499999996,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":50249.32674999999,"duration":63.62267708333093,"noteNumber":73,"velocity":92,"programNumber":40},{"time":50339.14699999999,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":50428.96724999999,"duration":59.88016666666954,"noteNumber":64,"velocity":92,"programNumber":40},{"time":50518.78749999999,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":50608.60774999999,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":50698.427999999985,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":50788.24824999999,"duration":59.88016666666954,"noteNumber":65,"velocity":92,"programNumber":40},{"time":50878.068499999994,"duration":63.62267708333093,"noteNumber":63,"velocity":92,"programNumber":40},{"time":50967.88874999999,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":51057.70899999999,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":51147.52924999999,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":51237.3495,"duration":63.62267708333093,"noteNumber":62,"velocity":92,"programNumber":40},{"time":51327.169749999994,"duration":63.62267708333093,"noteNumber":70,"velocity":92,"programNumber":40},{"time":51416.98999999999,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":51506.81024999999,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":51596.63049999999,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":51686.45074999999,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":51776.270999999986,"duration":63.62267708333093,"noteNumber":63,"velocity":92,"programNumber":40},{"time":51866.09124999998,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":51955.91149999999,"duration":63.62267708333093,"noteNumber":62,"velocity":92,"programNumber":40},{"time":52045.731749999984,"duration":63.62267708333093,"noteNumber":82,"velocity":92,"programNumber":40},{"time":52135.55199999998,"duration":59.88016666666954,"noteNumber":77,"velocity":92,"programNumber":40},{"time":52225.372249999986,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":52315.19249999999,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":52405.01274999999,"duration":63.62267708333093,"noteNumber":81,"velocity":92,"programNumber":40},{"time":52494.832999999984,"duration":59.88016666666954,"noteNumber":78,"velocity":92,"programNumber":40},{"time":52584.65324999999,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":52674.47349999999,"duration":63.62267708333093,"noteNumber":70,"velocity":92,"programNumber":40},{"time":52764.29374999999,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":52854.11399999999,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":52943.934249999984,"duration":59.88016666666954,"noteNumber":70,"velocity":92,"programNumber":40},{"time":53033.75449999999,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":53123.574749999985,"duration":63.62267708333093,"noteNumber":78,"velocity":92,"programNumber":40},{"time":53213.39499999998,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":53303.21524999998,"duration":59.88016666666954,"noteNumber":69,"velocity":92,"programNumber":40},{"time":53393.03549999998,"duration":63.62267708333093,"noteNumber":70,"velocity":92,"programNumber":40},{"time":53482.85574999998,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":53572.67599999998,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":53662.49624999998,"duration":59.88016666666954,"noteNumber":70,"velocity":92,"programNumber":40},{"time":53752.316499999986,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":53842.13674999998,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":53931.95699999998,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":54021.777249999985,"duration":59.88016666666954,"noteNumber":68,"velocity":92,"programNumber":40},{"time":54111.59749999999,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":54201.417749999986,"duration":63.62267708333093,"noteNumber":75,"velocity":92,"programNumber":40},{"time":54291.23799999998,"duration":63.62267708333093,"noteNumber":70,"velocity":92,"programNumber":40},{"time":54381.05824999998,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":54470.878499999984,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":54560.69874999998,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":54650.51899999998,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":54740.339249999975,"duration":59.88016666666954,"noteNumber":65,"velocity":92,"programNumber":40},{"time":54830.15949999998,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":54919.97974999998,"duration":63.62267708333093,"noteNumber":87,"velocity":92,"programNumber":40},{"time":55009.799999999974,"duration":59.88016666666954,"noteNumber":82,"velocity":92,"programNumber":40},{"time":55099.62024999998,"duration":59.88016666666954,"noteNumber":79,"velocity":92,"programNumber":40},{"time":55189.44049999998,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":55279.26074999998,"duration":63.62267708333093,"noteNumber":86,"velocity":92,"programNumber":40},{"time":55369.08099999998,"duration":59.88016666666954,"noteNumber":83,"velocity":92,"programNumber":40},{"time":55458.90124999998,"duration":59.88016666666954,"noteNumber":77,"velocity":92,"programNumber":40},{"time":55548.721499999985,"duration":63.62267708333093,"noteNumber":75,"velocity":92,"programNumber":40},{"time":55638.54174999998,"duration":63.62267708333093,"noteNumber":84,"velocity":92,"programNumber":40},{"time":55728.36199999998,"duration":63.62267708333093,"noteNumber":79,"velocity":92,"programNumber":40},{"time":55818.182249999976,"duration":59.88016666666954,"noteNumber":75,"velocity":92,"programNumber":40},{"time":55908.00249999998,"duration":63.62267708333093,"noteNumber":74,"velocity":92,"programNumber":40},{"time":55997.82274999998,"duration":63.62267708333093,"noteNumber":83,"velocity":92,"programNumber":40},{"time":56087.642999999975,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":56177.46324999997,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":56267.283499999976,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":56357.10374999997,"duration":63.62267708333093,"noteNumber":84,"velocity":92,"programNumber":40},{"time":56446.92399999997,"duration":59.88016666666954,"noteNumber":83,"velocity":92,"programNumber":40},{"time":56536.744249999974,"duration":59.88016666666954,"noteNumber":82,"velocity":92,"programNumber":40},{"time":56626.56449999998,"duration":63.62267708333093,"noteNumber":81,"velocity":92,"programNumber":40},{"time":56716.384749999976,"duration":63.62267708333093,"noteNumber":80,"velocity":92,"programNumber":40},{"time":56806.20499999997,"duration":59.88016666666954,"noteNumber":79,"velocity":92,"programNumber":40},{"time":56896.02524999998,"duration":59.88016666666954,"noteNumber":78,"velocity":92,"programNumber":40},{"time":56985.84549999998,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":57075.66574999998,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":57165.485999999975,"duration":63.62267708333093,"noteNumber":75,"velocity":92,"programNumber":40},{"time":57255.30624999997,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":57345.12649999998,"duration":63.62267708333093,"noteNumber":73,"velocity":92,"programNumber":40},{"time":57434.946749999974,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":57524.76699999997,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":57614.58724999997,"duration":59.88016666666954,"noteNumber":70,"velocity":92,"programNumber":40},{"time":57704.40749999997,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":57794.22774999997,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":57884.047999999966,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":57973.86824999997,"duration":59.88016666666954,"noteNumber":66,"velocity":92,"programNumber":40},{"time":58063.688499999975,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":58153.50874999997,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":58243.32899999997,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":58333.14924999997,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":58422.96949999998,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":58512.789749999974,"duration":63.62267708333093,"noteNumber":63,"velocity":92,"programNumber":40},{"time":58602.60999999997,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":58692.43024999997,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":58782.25049999997,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":58872.07074999997,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":58961.89099999997,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":59051.711249999964,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":59141.53149999997,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":59231.351749999965,"duration":63.62267708333093,"noteNumber":80,"velocity":92,"programNumber":40},{"time":59321.17199999996,"duration":59.88016666666954,"noteNumber":79,"velocity":92,"programNumber":40},{"time":59410.99224999997,"duration":59.88016666666954,"noteNumber":78,"velocity":92,"programNumber":40},{"time":59500.81249999997,"duration":63.62267708333093,"noteNumber":77,"velocity":92,"programNumber":40},{"time":59590.63274999997,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":59680.452999999965,"duration":59.88016666666954,"noteNumber":75,"velocity":92,"programNumber":40},{"time":59770.27324999997,"duration":59.88016666666954,"noteNumber":74,"velocity":92,"programNumber":40},{"time":59860.09349999997,"duration":63.62267708333093,"noteNumber":73,"velocity":92,"programNumber":40},{"time":59949.91374999997,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":60039.73399999997,"duration":63.62267708333093,"noteNumber":71,"velocity":92,"programNumber":40},{"time":60129.554249999965,"duration":59.88016666666954,"noteNumber":70,"velocity":92,"programNumber":40},{"time":60219.37449999997,"duration":63.62267708333093,"noteNumber":69,"velocity":92,"programNumber":40},{"time":60309.194749999966,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":60399.01499999996,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":60488.83524999996,"duration":59.88016666666954,"noteNumber":66,"velocity":92,"programNumber":40},{"time":60578.655499999964,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":60668.47574999996,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":60758.29599999996,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":60848.11624999996,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":60937.93649999997,"duration":63.62267708333093,"noteNumber":61,"velocity":92,"programNumber":40},{"time":61027.756749999964,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":61117.57699999996,"duration":59.88016666666954,"noteNumber":59,"velocity":92,"programNumber":40},{"time":61207.397249999965,"duration":59.88016666666954,"noteNumber":58,"velocity":92,"programNumber":40},{"time":61297.21749999997,"duration":63.62267708333093,"noteNumber":56,"velocity":92,"programNumber":40},{"time":61387.03774999997,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":61476.857999999964,"duration":63.62267708333093,"noteNumber":63,"velocity":92,"programNumber":40},{"time":61566.67824999996,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":61656.498499999965,"duration":63.62267708333093,"noteNumber":55,"velocity":92,"programNumber":40},{"time":61746.31874999996,"duration":63.62267708333093,"noteNumber":63,"velocity":92,"programNumber":40},{"time":61836.13899999996,"duration":63.62267708333093,"noteNumber":61,"velocity":92,"programNumber":40},{"time":61925.959249999956,"duration":59.88016666666954,"noteNumber":58,"velocity":92,"programNumber":40},{"time":62015.77949999996,"duration":63.62267708333093,"noteNumber":56,"velocity":92,"programNumber":40},{"time":62105.59974999996,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":62195.419999999955,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":62285.24024999996,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":62375.06049999996,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":62464.88074999996,"duration":63.62267708333093,"noteNumber":66,"velocity":92,"programNumber":40},{"time":62554.70099999996,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":62644.52124999996,"duration":59.88016666666954,"noteNumber":60,"velocity":92,"programNumber":40},{"time":62734.341499999966,"duration":63.62267708333093,"noteNumber":58,"velocity":92,"programNumber":40},{"time":62824.16174999996,"duration":63.62267708333093,"noteNumber":70,"velocity":92,"programNumber":40},{"time":62913.98199999996,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":63003.80224999996,"duration":59.88016666666954,"noteNumber":61,"velocity":92,"programNumber":40},{"time":63093.62249999996,"duration":63.62267708333093,"noteNumber":59,"velocity":92,"programNumber":40},{"time":63183.44274999996,"duration":63.62267708333093,"noteNumber":68,"velocity":92,"programNumber":40},{"time":63273.262999999955,"duration":63.62267708333093,"noteNumber":65,"velocity":92,"programNumber":40},{"time":63363.08324999995,"duration":59.88016666666954,"noteNumber":62,"velocity":92,"programNumber":40},{"time":63452.90349999996,"duration":63.62267708333093,"noteNumber":60,"velocity":92,"programNumber":40},{"time":63542.723749999954,"duration":63.62267708333093,"noteNumber":72,"velocity":92,"programNumber":40},{"time":63632.54399999995,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":63722.36424999995,"duration":59.88016666666954,"noteNumber":63,"velocity":92,"programNumber":40},{"time":63812.18449999995,"duration":63.62267708333093,"noteNumber":61,"velocity":92,"programNumber":40},{"time":63902.00474999995,"duration":63.62267708333093,"noteNumber":70,"velocity":92,"programNumber":40},{"time":63991.824999999946,"duration":59.88016666666954,"noteNumber":67,"velocity":92,"programNumber":40},{"time":64081.64524999995,"duration":59.88016666666954,"noteNumber":61,"velocity":92,"programNumber":40},{"time":64171.465499999955,"duration":63.62267708333093,"noteNumber":58,"velocity":92,"programNumber":40},{"time":64261.28574999995,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":64351.10599999995,"duration":63.62267708333093,"noteNumber":64,"velocity":92,"programNumber":40},{"time":64440.926249999946,"duration":59.88016666666954,"noteNumber":72,"velocity":92,"programNumber":40},{"time":64530.74649999995,"duration":63.62267708333093,"noteNumber":67,"velocity":92,"programNumber":40},{"time":64620.56674999995,"duration":63.62267708333093,"noteNumber":76,"velocity":92,"programNumber":40},{"time":64712.415177083276,"duration":66.40625,"noteNumber":72,"velocity":92,"programNumber":40},{"time":64807.047177083274,"duration":66.66666666666424,"noteNumber":82,"velocity":92,"programNumber":40},{"time":64903.65392708327,"duration":66.40625,"noteNumber":80,"velocity":92,"programNumber":40},{"time":64999.22684374994,"duration":81.73068749999948,"noteNumber":77,"velocity":92,"programNumber":40},{"time":65120.73021874994,"duration":95.23799999999756,"noteNumber":72,"velocity":92,"programNumber":40},{"time":65265.968218749935,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":65398.5438854166,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":65536.8013229166,"duration":106.25,"noteNumber":65,"velocity":92,"programNumber":40},{"time":65691.6623854166,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":65828.0258854166,"duration":90.90899999999965,"noteNumber":65,"velocity":92,"programNumber":40},{"time":65964.38938541661,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":66100.7528854166,"duration":96.59081249999872,"noteNumber":61,"velocity":92,"programNumber":40},{"time":66237.1163854166,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":66373.47988541659,"duration":90.90899999999965,"noteNumber":58,"velocity":92,"programNumber":40},{"time":66509.84338541659,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":66646.20688541658,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":66782.57038541658,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":66918.93388541657,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":67055.29738541658,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":67191.66088541657,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":67328.02438541656,"duration":90.90899999999965,"noteNumber":65,"velocity":92,"programNumber":40},{"time":67464.38788541657,"duration":90.90899999999965,"noteNumber":63,"velocity":92,"programNumber":40},{"time":67600.75138541657,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":67737.11488541657,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":67873.47838541656,"duration":90.90899999999965,"noteNumber":79,"velocity":92,"programNumber":40},{"time":68009.84188541656,"duration":90.90899999999965,"noteNumber":75,"velocity":92,"programNumber":40},{"time":68146.20538541657,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":68282.56888541656,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":68418.93238541656,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":68555.29588541655,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":68691.65938541655,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":68828.02288541655,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":68964.38638541654,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":69100.74988541653,"duration":90.90899999999965,"noteNumber":63,"velocity":92,"programNumber":40},{"time":69237.11338541654,"duration":96.59081249999872,"noteNumber":61,"velocity":92,"programNumber":40},{"time":69373.47688541653,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":69509.84038541652,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":69646.20388541653,"duration":90.90899999999965,"noteNumber":65,"velocity":92,"programNumber":40},{"time":69782.56738541654,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":69918.93088541653,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":70055.29438541652,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":70191.65788541653,"duration":90.90899999999965,"noteNumber":66,"velocity":92,"programNumber":40},{"time":70328.02138541653,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":70464.38488541653,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":70600.74838541652,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":70737.11188541651,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":70873.47538541652,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":71009.83888541651,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":71146.2023854165,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":71282.5658854165,"duration":90.90899999999965,"noteNumber":63,"velocity":92,"programNumber":40},{"time":71418.9293854165,"duration":96.59081249999872,"noteNumber":61,"velocity":92,"programNumber":40},{"time":71555.2928854165,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":71691.65638541649,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":71828.01988541649,"duration":90.90899999999965,"noteNumber":65,"velocity":92,"programNumber":40},{"time":71964.3833854165,"duration":96.59081249999872,"noteNumber":61,"velocity":92,"programNumber":40},{"time":72100.74688541649,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":72237.11038541648,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":72373.47388541649,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":72509.8373854165,"duration":96.59081249999872,"noteNumber":62,"velocity":92,"programNumber":40},{"time":72646.20088541649,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":72782.56438541648,"duration":96.59081249999872,"noteNumber":71,"velocity":92,"programNumber":40},{"time":72918.92788541647,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":73055.29138541648,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":73191.65488541647,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":73328.01838541646,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":73464.38188541646,"duration":90.90899999999965,"noteNumber":66,"velocity":92,"programNumber":40},{"time":73600.74538541646,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":73737.10888541646,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":73873.47238541645,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":74009.83588541645,"duration":90.90899999999965,"noteNumber":67,"velocity":92,"programNumber":40},{"time":74146.19938541646,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":74282.56288541645,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":74418.92638541645,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":74555.28988541645,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":74691.65338541646,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":74828.01688541645,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":74964.38038541644,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":75100.74388541644,"duration":90.90899999999965,"noteNumber":72,"velocity":92,"programNumber":40},{"time":75237.10738541644,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":75373.47088541643,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":75509.83438541643,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":75646.19788541642,"duration":90.90899999999965,"noteNumber":65,"velocity":92,"programNumber":40},{"time":75782.56138541643,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":75918.92488541642,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":76055.28838541641,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":76191.65188541642,"duration":90.90899999999965,"noteNumber":67,"velocity":92,"programNumber":40},{"time":76328.01538541642,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":76464.37888541642,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":76600.74238541641,"duration":90.90899999999965,"noteNumber":73,"velocity":92,"programNumber":40},{"time":76737.10588541641,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":76873.46938541642,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":77009.83288541641,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":77146.1963854164,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":77282.5598854164,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":77418.9233854164,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":77555.2868854164,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":77691.65038541639,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":77828.01388541638,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":77964.37738541639,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":78100.74088541638,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":78237.10438541637,"duration":90.90899999999965,"noteNumber":72,"velocity":92,"programNumber":40},{"time":78373.46788541638,"duration":90.90899999999965,"noteNumber":66,"velocity":92,"programNumber":40},{"time":78509.83138541639,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":78646.19488541638,"duration":96.59081249999872,"noteNumber":77,"velocity":92,"programNumber":40},{"time":78782.55838541637,"duration":90.90899999999965,"noteNumber":73,"velocity":92,"programNumber":40},{"time":78918.92188541638,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":79055.28538541638,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":79191.64888541638,"duration":96.59081249999872,"noteNumber":77,"velocity":92,"programNumber":40},{"time":79328.01238541637,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":79464.37588541636,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":79600.73938541637,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":79737.10288541636,"duration":96.59081249999872,"noteNumber":78,"velocity":92,"programNumber":40},{"time":79873.46638541635,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":80009.82988541634,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":80146.19338541635,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":80282.55688541634,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":80418.92038541634,"duration":90.90899999999965,"noteNumber":73,"velocity":92,"programNumber":40},{"time":80555.28388541634,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":80691.64738541635,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":80828.01088541634,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":80964.37438541633,"duration":90.90899999999965,"noteNumber":61,"velocity":92,"programNumber":40},{"time":81100.73788541634,"duration":90.90899999999965,"noteNumber":58,"velocity":92,"programNumber":40},{"time":81237.10138541635,"duration":96.59081249999872,"noteNumber":59,"velocity":92,"programNumber":40},{"time":81373.46488541634,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":81509.82838541633,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":81646.19188541632,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":81782.55538541633,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":81918.91888541632,"duration":96.59081249999872,"noteNumber":78,"velocity":92,"programNumber":40},{"time":82055.28238541631,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":82191.6458854163,"duration":90.90899999999965,"noteNumber":87,"velocity":92,"programNumber":40},{"time":82328.00938541631,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":82464.3728854163,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":82600.7363854163,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":82737.0998854163,"duration":90.90899999999965,"noteNumber":67,"velocity":92,"programNumber":40},{"time":82873.46338541631,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":83009.8268854163,"duration":96.59081249999872,"noteNumber":61,"velocity":92,"programNumber":40},{"time":83146.1903854163,"duration":90.90899999999965,"noteNumber":58,"velocity":92,"programNumber":40},{"time":83282.5538854163,"duration":90.90899999999965,"noteNumber":55,"velocity":92,"programNumber":40},{"time":83418.91738541631,"duration":96.59081249999872,"noteNumber":56,"velocity":92,"programNumber":40},{"time":83555.2808854163,"duration":96.59081249999872,"noteNumber":59,"velocity":92,"programNumber":40},{"time":83691.6443854163,"duration":96.59081249999872,"noteNumber":63,"velocity":92,"programNumber":40},{"time":83828.00788541629,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":83964.37138541629,"duration":96.59081249999872,"noteNumber":71,"velocity":92,"programNumber":40},{"time":84100.73488541628,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":84237.09838541628,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":84373.46188541627,"duration":90.90899999999965,"noteNumber":83,"velocity":92,"programNumber":40},{"time":84509.82538541628,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":84646.18888541627,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":84782.55238541626,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":84918.91588541627,"duration":90.90899999999965,"noteNumber":68,"velocity":92,"programNumber":40},{"time":85055.27938541627,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":85191.64288541627,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":85328.00638541626,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":85464.36988541626,"duration":90.90899999999965,"noteNumber":69,"velocity":92,"programNumber":40},{"time":85600.73338541627,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":85737.09688541626,"duration":96.59081249999872,"noteNumber":71,"velocity":92,"programNumber":40},{"time":85873.46038541626,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":86009.82388541625,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":86146.18738541625,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":86282.55088541625,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":86418.91438541624,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":86555.27788541623,"duration":90.90899999999965,"noteNumber":72,"velocity":92,"programNumber":40},{"time":86691.64138541624,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":86828.00488541623,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":86964.36838541622,"duration":90.90899999999965,"noteNumber":78,"velocity":92,"programNumber":40},{"time":87100.73188541623,"duration":90.90899999999965,"noteNumber":73,"velocity":92,"programNumber":40},{"time":87237.09538541624,"duration":96.59081249999872,"noteNumber":71,"velocity":92,"programNumber":40},{"time":87373.45888541623,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":87509.82238541622,"duration":90.90899999999965,"noteNumber":78,"velocity":92,"programNumber":40},{"time":87646.18588541623,"duration":90.90899999999965,"noteNumber":75,"velocity":92,"programNumber":40},{"time":87782.54938541623,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":87918.91288541623,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":88055.27638541622,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":88191.63988541621,"duration":90.90899999999965,"noteNumber":75,"velocity":92,"programNumber":40},{"time":88328.00338541622,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":88464.36688541621,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":88600.7303854162,"duration":96.59081249999872,"noteNumber":82,"velocity":92,"programNumber":40},{"time":88737.0938854162,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":88873.4573854162,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":89009.8208854162,"duration":96.59081249999872,"noteNumber":78,"velocity":92,"programNumber":40},{"time":89146.18438541619,"duration":90.90899999999965,"noteNumber":83,"velocity":92,"programNumber":40},{"time":89282.54788541619,"duration":90.90899999999965,"noteNumber":78,"velocity":92,"programNumber":40},{"time":89418.9113854162,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":89555.27488541619,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":89691.63838541618,"duration":90.90899999999965,"noteNumber":83,"velocity":92,"programNumber":40},{"time":89828.00188541619,"duration":90.90899999999965,"noteNumber":80,"velocity":92,"programNumber":40},{"time":89964.3653854162,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":90100.72888541619,"duration":96.59081249999872,"noteNumber":79,"velocity":92,"programNumber":40},{"time":90237.09238541618,"duration":96.59081249999872,"noteNumber":82,"velocity":92,"programNumber":40},{"time":90373.45588541617,"duration":90.90899999999965,"noteNumber":79,"velocity":92,"programNumber":40},{"time":90509.81938541618,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":90646.18288541617,"duration":96.59081249999872,"noteNumber":78,"velocity":92,"programNumber":40},{"time":90782.54638541616,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":90918.90988541616,"duration":90.90899999999965,"noteNumber":78,"velocity":92,"programNumber":40},{"time":91055.27338541616,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":91191.63688541616,"duration":96.59081249999872,"noteNumber":77,"velocity":92,"programNumber":40},{"time":91328.00038541615,"duration":90.90899999999965,"noteNumber":80,"velocity":92,"programNumber":40},{"time":91464.36388541615,"duration":90.90899999999965,"noteNumber":77,"velocity":92,"programNumber":40},{"time":91600.72738541616,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":91737.09088541615,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":91873.45438541615,"duration":90.90899999999965,"noteNumber":81,"velocity":92,"programNumber":40},{"time":92009.81788541615,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":92146.18138541616,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":92282.54488541615,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":92418.90838541614,"duration":96.59081249999872,"noteNumber":78,"velocity":92,"programNumber":40},{"time":92555.27188541614,"duration":90.90899999999965,"noteNumber":75,"velocity":92,"programNumber":40},{"time":92691.63538541614,"duration":96.59081249999872,"noteNumber":71,"velocity":92,"programNumber":40},{"time":92827.99888541613,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":92964.36238541613,"duration":96.59081249999872,"noteNumber":79,"velocity":92,"programNumber":40},{"time":93100.72588541612,"duration":90.90899999999965,"noteNumber":74,"velocity":92,"programNumber":40},{"time":93237.08938541613,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":93373.45288541612,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":93509.81638541611,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":93646.17988541612,"duration":90.90899999999965,"noteNumber":73,"velocity":92,"programNumber":40},{"time":93782.54338541612,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":93918.90688541612,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":94055.27038541611,"duration":90.90899999999965,"noteNumber":77,"velocity":92,"programNumber":40},{"time":94191.63388541611,"duration":90.90899999999965,"noteNumber":72,"velocity":92,"programNumber":40},{"time":94327.99738541612,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":94464.36088541611,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":94600.7243854161,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":94737.0878854161,"duration":90.90899999999965,"noteNumber":72,"velocity":92,"programNumber":40},{"time":94873.4513854161,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":95009.8148854161,"duration":96.59081249999872,"noteNumber":71,"velocity":92,"programNumber":40},{"time":95146.17838541609,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":95282.54188541608,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":95418.90538541609,"duration":96.59081249999872,"noteNumber":67,"velocity":92,"programNumber":40},{"time":95555.26888541608,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":95691.63238541607,"duration":90.90899999999965,"noteNumber":73,"velocity":92,"programNumber":40},{"time":95827.99588541608,"duration":90.90899999999965,"noteNumber":70,"velocity":92,"programNumber":40},{"time":95964.35938541609,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":96100.72288541608,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":96237.08638541607,"duration":90.90899999999965,"noteNumber":74,"velocity":92,"programNumber":40},{"time":96373.44988541608,"duration":90.90899999999965,"noteNumber":69,"velocity":92,"programNumber":40},{"time":96509.81338541608,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":96646.17688541608,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":96782.54038541607,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":96918.90388541606,"duration":90.90899999999965,"noteNumber":69,"velocity":92,"programNumber":40},{"time":97055.26738541607,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":97191.63088541606,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":97327.99438541605,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":97464.35788541604,"duration":90.90899999999965,"noteNumber":69,"velocity":92,"programNumber":40},{"time":97600.72138541605,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":97737.08488541604,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":97873.44838541604,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":98009.81188541604,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":98146.17538541605,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":98282.53888541604,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":98418.90238541603,"duration":90.90899999999965,"noteNumber":88,"velocity":92,"programNumber":40},{"time":98555.26588541604,"duration":90.90899999999965,"noteNumber":92,"velocity":92,"programNumber":40},{"time":98691.62938541605,"duration":96.59081249999872,"noteNumber":77,"velocity":92,"programNumber":40},{"time":98827.99288541604,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":98964.35638541603,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":99100.71988541602,"duration":90.90899999999965,"noteNumber":81,"velocity":92,"programNumber":40},{"time":99237.08338541603,"duration":96.59081249999872,"noteNumber":77,"velocity":92,"programNumber":40},{"time":99373.44688541602,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":99509.81038541601,"duration":96.59081249999872,"noteNumber":87,"velocity":92,"programNumber":40},{"time":99646.173885416,"duration":90.90899999999965,"noteNumber":81,"velocity":92,"programNumber":40},{"time":99782.53738541601,"duration":96.59081249999872,"noteNumber":76,"velocity":92,"programNumber":40},{"time":99918.900885416,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":100055.264385416,"duration":90.90899999999965,"noteNumber":83,"velocity":92,"programNumber":40},{"time":100191.627885416,"duration":90.90899999999965,"noteNumber":88,"velocity":92,"programNumber":40},{"time":100327.99138541601,"duration":96.59081249999872,"noteNumber":92,"velocity":92,"programNumber":40},{"time":100464.354885416,"duration":96.59081249999872,"noteNumber":95,"velocity":92,"programNumber":40},{"time":100600.718385416,"duration":90.90899999999965,"noteNumber":100,"velocity":92,"programNumber":40},{"time":100737.081885416,"duration":90.90899999999965,"noteNumber":104,"velocity":92,"programNumber":40},{"time":100873.44538541601,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":101009.808885416,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":101146.172385416,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":101282.53588541599,"duration":90.90899999999965,"noteNumber":84,"velocity":92,"programNumber":40},{"time":101418.89938541599,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":101555.26288541598,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":101691.62638541598,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":101827.98988541597,"duration":90.90899999999965,"noteNumber":86,"velocity":92,"programNumber":40},{"time":101964.35338541598,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":102100.71688541597,"duration":96.59081249999872,"noteNumber":93,"velocity":92,"programNumber":40},{"time":102237.08038541596,"duration":90.90899999999965,"noteNumber":91,"velocity":92,"programNumber":40},{"time":102373.44388541597,"duration":90.90899999999965,"noteNumber":89,"velocity":92,"programNumber":40},{"time":102509.80738541597,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":102646.17088541597,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":102782.53438541596,"duration":90.90899999999965,"noteNumber":84,"velocity":92,"programNumber":40},{"time":102918.89788541596,"duration":90.90899999999965,"noteNumber":83,"velocity":92,"programNumber":40},{"time":103055.26138541597,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":103191.62488541596,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":103327.98838541596,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":103464.35188541595,"duration":90.90899999999965,"noteNumber":84,"velocity":92,"programNumber":40},{"time":103600.71538541596,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":103737.07888541595,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":103873.44238541594,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":104009.80588541593,"duration":90.90899999999965,"noteNumber":86,"velocity":92,"programNumber":40},{"time":104146.16938541594,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":104282.53288541593,"duration":96.59081249999872,"noteNumber":93,"velocity":92,"programNumber":40},{"time":104418.89638541592,"duration":90.90899999999965,"noteNumber":91,"velocity":92,"programNumber":40},{"time":104555.25988541593,"duration":90.90899999999965,"noteNumber":89,"velocity":92,"programNumber":40},{"time":104691.62338541594,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":104827.98688541593,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":104964.35038541592,"duration":90.90899999999965,"noteNumber":85,"velocity":92,"programNumber":40},{"time":105100.71388541593,"duration":90.90899999999965,"noteNumber":81,"velocity":92,"programNumber":40},{"time":105237.07738541593,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":105373.44088541593,"duration":96.59081249999872,"noteNumber":91,"velocity":92,"programNumber":40},{"time":105509.80438541592,"duration":96.59081249999872,"noteNumber":89,"velocity":92,"programNumber":40},{"time":105646.16788541591,"duration":90.90899999999965,"noteNumber":88,"velocity":92,"programNumber":40},{"time":105782.53138541592,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":105918.89488541591,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":106055.2583854159,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":106191.6218854159,"duration":90.90899999999965,"noteNumber":79,"velocity":92,"programNumber":40},{"time":106327.9853854159,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":106464.3488854159,"duration":96.59081249999872,"noteNumber":89,"velocity":92,"programNumber":40},{"time":106600.71238541589,"duration":90.90899999999965,"noteNumber":88,"velocity":92,"programNumber":40},{"time":106737.07588541589,"duration":90.90899999999965,"noteNumber":86,"velocity":92,"programNumber":40},{"time":106873.4393854159,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":107009.80288541589,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":107146.16638541588,"duration":90.90899999999965,"noteNumber":81,"velocity":92,"programNumber":40},{"time":107282.52988541589,"duration":90.90899999999965,"noteNumber":77,"velocity":92,"programNumber":40},{"time":107418.8933854159,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":107555.25688541589,"duration":96.59081249999872,"noteNumber":88,"velocity":92,"programNumber":40},{"time":107691.62038541588,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":107827.98388541587,"duration":90.90899999999965,"noteNumber":84,"velocity":92,"programNumber":40},{"time":107964.34738541588,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":108100.71088541587,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":108237.07438541586,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":108373.43788541586,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":108509.80138541586,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":108646.16488541586,"duration":96.59081249999872,"noteNumber":86,"velocity":92,"programNumber":40},{"time":108782.52838541585,"duration":90.90899999999965,"noteNumber":84,"velocity":92,"programNumber":40},{"time":108918.89188541585,"duration":90.90899999999965,"noteNumber":83,"velocity":92,"programNumber":40},{"time":109055.25538541586,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":109191.61888541585,"duration":96.59081249999872,"noteNumber":79,"velocity":92,"programNumber":40},{"time":109327.98238541585,"duration":90.90899999999965,"noteNumber":77,"velocity":92,"programNumber":40},{"time":109464.34588541585,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":109600.70938541586,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":109737.07288541585,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":109873.43638541584,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":110009.79988541584,"duration":90.90899999999965,"noteNumber":78,"velocity":92,"programNumber":40},{"time":110146.16338541584,"duration":96.59081249999872,"noteNumber":75,"velocity":92,"programNumber":40},{"time":110282.52688541583,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":110418.89038541583,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":110555.25388541582,"duration":90.90899999999965,"noteNumber":63,"velocity":92,"programNumber":40},{"time":110691.61738541583,"duration":96.59081249999872,"noteNumber":84,"velocity":92,"programNumber":40},{"time":110827.98088541582,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":110964.34438541581,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":111100.70788541582,"duration":90.90899999999965,"noteNumber":72,"velocity":92,"programNumber":40},{"time":111237.07138541582,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":111373.43488541582,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":111509.79838541581,"duration":90.90899999999965,"noteNumber":60,"velocity":92,"programNumber":40},{"time":111646.16188541582,"duration":90.90899999999965,"noteNumber":57,"velocity":92,"programNumber":40},{"time":111782.52538541582,"duration":96.59081249999872,"noteNumber":83,"velocity":92,"programNumber":40},{"time":111918.88888541581,"duration":96.59081249999872,"noteNumber":80,"velocity":92,"programNumber":40},{"time":112055.2523854158,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":112191.6158854158,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":112327.9793854158,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":112464.3428854158,"duration":96.59081249999872,"noteNumber":62,"velocity":92,"programNumber":40},{"time":112600.70638541579,"duration":96.59081249999872,"noteNumber":59,"velocity":92,"programNumber":40},{"time":112737.06988541578,"duration":90.90899999999965,"noteNumber":56,"velocity":92,"programNumber":40},{"time":112873.43338541579,"duration":96.59081249999872,"noteNumber":57,"velocity":92,"programNumber":40},{"time":113009.79688541578,"duration":96.59081249999872,"noteNumber":81,"velocity":92,"programNumber":40},{"time":113146.16038541577,"duration":90.90899999999965,"noteNumber":80,"velocity":92,"programNumber":40},{"time":113282.52388541578,"duration":90.90899999999965,"noteNumber":79,"velocity":92,"programNumber":40},{"time":113418.88738541579,"duration":96.59081249999872,"noteNumber":78,"velocity":92,"programNumber":40},{"time":113555.25088541578,"duration":96.59081249999872,"noteNumber":77,"velocity":92,"programNumber":40},{"time":113691.61438541577,"duration":90.90899999999965,"noteNumber":76,"velocity":92,"programNumber":40},{"time":113827.97788541578,"duration":90.90899999999965,"noteNumber":75,"velocity":92,"programNumber":40},{"time":113964.34138541578,"duration":96.59081249999872,"noteNumber":74,"velocity":92,"programNumber":40},{"time":114100.70488541578,"duration":96.59081249999872,"noteNumber":73,"velocity":92,"programNumber":40},{"time":114237.06838541577,"duration":96.59081249999872,"noteNumber":72,"velocity":92,"programNumber":40},{"time":114373.43188541576,"duration":90.90899999999965,"noteNumber":71,"velocity":92,"programNumber":40},{"time":114509.79538541577,"duration":96.59081249999872,"noteNumber":70,"velocity":92,"programNumber":40},{"time":114646.15888541576,"duration":96.59081249999872,"noteNumber":69,"velocity":92,"programNumber":40},{"time":114782.52238541575,"duration":96.59081249999872,"noteNumber":68,"velocity":92,"programNumber":40},{"time":114918.88588541574,"duration":90.90899999999965,"noteNumber":67,"velocity":92,"programNumber":40},{"time":115055.24938541575,"duration":96.59081249999872,"noteNumber":66,"velocity":92,"programNumber":40},{"time":115191.61288541574,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":115327.97638541574,"duration":90.90899999999965,"noteNumber":64,"velocity":92,"programNumber":40},{"time":115464.33988541574,"duration":90.90899999999965,"noteNumber":63,"velocity":92,"programNumber":40},{"time":115600.70338541575,"duration":96.59081249999872,"noteNumber":62,"velocity":92,"programNumber":40},{"time":115737.06688541574,"duration":96.59081249999872,"noteNumber":61,"velocity":92,"programNumber":40},{"time":115873.43038541573,"duration":90.90899999999965,"noteNumber":60,"velocity":92,"programNumber":40},{"time":116009.79388541574,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":116146.15738541575,"duration":96.59081249999872,"noteNumber":57,"velocity":92,"programNumber":40},{"time":116282.52088541574,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":116418.88438541573,"duration":96.59081249999872,"noteNumber":65,"velocity":92,"programNumber":40},{"time":116555.24788541572,"duration":90.90899999999965,"noteNumber":64,"velocity":92,"programNumber":40},{"time":116691.61138541573,"duration":96.59081249999872,"noteNumber":56,"velocity":92,"programNumber":40},{"time":116827.97488541572,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":116964.33838541571,"duration":96.59081249999872,"noteNumber":62,"velocity":92,"programNumber":40},{"time":117100.7018854157,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":117237.06538541571,"duration":96.59081249999872,"noteNumber":57,"velocity":92,"programNumber":40},{"time":117373.4288854157,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":117509.7923854157,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":117646.1558854157,"duration":90.90899999999965,"noteNumber":62,"velocity":92,"programNumber":40},{"time":117782.51938541571,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":117918.8828854157,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":118055.2463854157,"duration":90.90899999999965,"noteNumber":56,"velocity":92,"programNumber":40},{"time":118191.6098854157,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":118327.97338541571,"duration":96.59081249999872,"noteNumber":57,"velocity":92,"programNumber":40},{"time":118464.3368854157,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":118600.7003854157,"duration":96.59081249999872,"noteNumber":59,"velocity":92,"programNumber":40},{"time":118737.06388541569,"duration":90.90899999999965,"noteNumber":62,"velocity":92,"programNumber":40},{"time":118873.42738541569,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":119009.79088541568,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":119146.15438541568,"duration":96.59081249999872,"noteNumber":56,"velocity":92,"programNumber":40},{"time":119282.51788541567,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":119418.88138541568,"duration":96.59081249999872,"noteNumber":57,"velocity":92,"programNumber":40},{"time":119555.24488541567,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":119691.60838541566,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":119827.97188541567,"duration":90.90899999999965,"noteNumber":62,"velocity":92,"programNumber":40},{"time":119964.33538541567,"duration":90.90899999999965,"noteNumber":60,"velocity":92,"programNumber":40},{"time":120100.69888541568,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":120237.06238541567,"duration":90.90899999999965,"noteNumber":56,"velocity":92,"programNumber":40},{"time":120373.42588541568,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":120509.78938541569,"duration":96.59081249999872,"noteNumber":57,"velocity":92,"programNumber":40},{"time":120646.15288541568,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":120782.51638541567,"duration":96.59081249999872,"noteNumber":59,"velocity":92,"programNumber":40},{"time":120918.87988541566,"duration":90.90899999999965,"noteNumber":62,"velocity":92,"programNumber":40},{"time":121055.24338541567,"duration":96.59081249999872,"noteNumber":60,"velocity":92,"programNumber":40},{"time":121191.60688541566,"duration":96.59081249999872,"noteNumber":64,"velocity":92,"programNumber":40},{"time":121327.97038541565,"duration":96.59081249999872,"noteNumber":56,"velocity":92,"programNumber":40},{"time":121464.33388541565,"duration":90.90899999999965,"noteNumber":59,"velocity":92,"programNumber":40},{"time":121600.69738541565,"duration":1636.3619999999937,"noteNumber":57,"velocity":127,"programNumber":40},{"time":123237.05938541565,"duration":68.18175000000338,"noteNumber":61,"velocity":127,"programNumber":40},{"time":123305.24113541565,"duration":68.18175000000338,"noteNumber":64,"velocity":127,"programNumber":40},{"time":123373.42288541565,"duration":68.18175000000338,"noteNumber":69,"velocity":127,"programNumber":40},{"time":123441.60463541566,"duration":68.18175000000338,"noteNumber":73,"velocity":127,"programNumber":40},{"time":123509.78638541566,"duration":68.18175000000338,"noteNumber":76,"velocity":127,"programNumber":40},{"time":123577.96813541566,"duration":68.18175000000338,"noteNumber":81,"velocity":127,"programNumber":40},{"time":123646.14988541567,"duration":68.18175000000338,"noteNumber":85,"velocity":127,"programNumber":40},{"time":123714.33163541567,"duration":68.18175000000338,"noteNumber":88,"velocity":127,"programNumber":40},{"time":123782.51338541567,"duration":727.2719999999972,"noteNumber":93,"velocity":127,"programNumber":40},{"time":124600.69438541567,"duration":68.18175000000338,"noteNumber":92,"velocity":60,"programNumber":40},{"time":124668.87613541567,"duration":68.18175000000338,"noteNumber":90,"velocity":60,"programNumber":40},{"time":124737.05788541568,"duration":68.18175000000338,"noteNumber":88,"velocity":60,"programNumber":40},{"time":124805.23963541568,"duration":68.18175000000338,"noteNumber":86,"velocity":60,"programNumber":40},{"time":124873.42138541568,"duration":68.18175000000338,"noteNumber":85,"velocity":60,"programNumber":40},{"time":124941.60313541569,"duration":68.18175000000338,"noteNumber":83,"velocity":60,"programNumber":40},{"time":125009.78488541569,"duration":68.18175000000338,"noteNumber":81,"velocity":60,"programNumber":40},{"time":125077.9666354157,"duration":68.18175000000338,"noteNumber":80,"velocity":60,"programNumber":40},{"time":125146.1483854157,"duration":68.18175000000338,"noteNumber":78,"velocity":60,"programNumber":40},{"time":125214.3301354157,"duration":68.18175000000338,"noteNumber":76,"velocity":60,"programNumber":40},{"time":125282.5118854157,"duration":68.18175000000338,"noteNumber":74,"velocity":60,"programNumber":40},{"time":125350.69363541571,"duration":68.18175000000338,"noteNumber":73,"velocity":60,"programNumber":40},{"time":125418.87538541571,"duration":68.18175000000338,"noteNumber":71,"velocity":60,"programNumber":40},{"time":125487.05713541571,"duration":68.18175000000338,"noteNumber":69,"velocity":60,"programNumber":40},{"time":125555.23888541572,"duration":68.18175000000338,"noteNumber":68,"velocity":60,"programNumber":40},{"time":125623.42063541572,"duration":68.18175000000338,"noteNumber":66,"velocity":60,"programNumber":40},{"time":125691.60238541572,"duration":68.18175000000338,"noteNumber":64,"velocity":60,"programNumber":40},{"time":125759.78413541573,"duration":68.18175000000338,"noteNumber":62,"velocity":60,"programNumber":40},{"time":125827.96588541573,"duration":68.18175000000338,"noteNumber":61,"velocity":60,"programNumber":40},{"time":125896.14763541573,"duration":68.18175000000338,"noteNumber":59,"velocity":60,"programNumber":40},{"time":125964.32938541574,"duration":727.2719999999972,"noteNumber":57,"velocity":60,"programNumber":40},{"time":126782.51038541574,"duration":68.18175000000338,"noteNumber":61,"velocity":127,"programNumber":40},{"time":126850.69213541574,"duration":68.18175000000338,"noteNumber":64,"velocity":127,"programNumber":40},{"time":126918.87388541574,"duration":68.18175000000338,"noteNumber":69,"velocity":127,"programNumber":40},{"time":126987.05563541575,"duration":68.18175000000338,"noteNumber":73,"velocity":127,"programNumber":40},{"time":127055.23738541575,"duration":68.18175000000338,"noteNumber":76,"velocity":127,"programNumber":40},{"time":127123.41913541575,"duration":68.18175000000338,"noteNumber":81,"velocity":127,"programNumber":40},{"time":127191.60088541576,"duration":68.18175000000338,"noteNumber":85,"velocity":127,"programNumber":40},{"time":127259.78263541576,"duration":68.18175000000338,"noteNumber":88,"velocity":127,"programNumber":40},{"time":127327.96438541576,"duration":68.18175000000338,"noteNumber":93,"velocity":127,"programNumber":40},{"time":127396.14613541577,"duration":727.2719999999972,"noteNumber":97,"velocity":127,"programNumber":40},{"time":128214.32713541576,"duration":68.18175000000338,"noteNumber":95,"velocity":60,"programNumber":40},{"time":128282.50888541577,"duration":68.18175000000338,"noteNumber":93,"velocity":60,"programNumber":40},{"time":128350.69063541577,"duration":68.18175000000338,"noteNumber":92,"velocity":60,"programNumber":40},{"time":128418.87238541577,"duration":68.18175000000338,"noteNumber":90,"velocity":60,"programNumber":40},{"time":128487.05413541578,"duration":68.18175000000338,"noteNumber":88,"velocity":60,"programNumber":40},{"time":128555.23588541578,"duration":68.18175000000338,"noteNumber":86,"velocity":60,"programNumber":40},{"time":128623.41763541578,"duration":68.18175000000338,"noteNumber":85,"velocity":60,"programNumber":40},{"time":128691.59938541579,"duration":68.18175000000338,"noteNumber":83,"velocity":60,"programNumber":40},{"time":128759.78113541579,"duration":68.18175000000338,"noteNumber":81,"velocity":60,"programNumber":40},{"time":128827.96288541579,"duration":68.18175000000338,"noteNumber":80,"velocity":60,"programNumber":40},{"time":128896.1446354158,"duration":68.18175000000338,"noteNumber":78,"velocity":60,"programNumber":40},{"time":128964.3263854158,"duration":68.18175000000338,"noteNumber":76,"velocity":60,"programNumber":40},{"time":129032.5081354158,"duration":68.18175000000338,"noteNumber":74,"velocity":60,"programNumber":40},{"time":129100.6898854158,"duration":68.18175000000338,"noteNumber":73,"velocity":60,"programNumber":40},{"time":129168.87163541581,"duration":68.18175000000338,"noteNumber":71,"velocity":60,"programNumber":40},{"time":129237.05338541581,"duration":68.18175000000338,"noteNumber":69,"velocity":60,"programNumber":40},{"time":129305.23513541582,"duration":68.18175000000338,"noteNumber":68,"velocity":60,"programNumber":40},{"time":129373.41688541582,"duration":68.18175000000338,"noteNumber":66,"velocity":60,"programNumber":40},{"time":129441.59863541582,"duration":68.18175000000338,"noteNumber":64,"velocity":60,"programNumber":40},{"time":129509.78038541583,"duration":68.18175000000338,"noteNumber":62,"velocity":60,"programNumber":40},{"time":129577.96213541583,"duration":68.18175000000338,"noteNumber":61,"velocity":60,"programNumber":40},{"time":129646.14388541583,"duration":68.18175000000338,"noteNumber":59,"velocity":60,"programNumber":40},{"time":129714.32563541584,"duration":727.2719999999972,"noteNumber":57,"velocity":60,"programNumber":40},{"time":130532.50663541583,"duration":68.18175000000338,"noteNumber":61,"velocity":127,"programNumber":40},{"time":130600.68838541584,"duration":68.18175000000338,"noteNumber":64,"velocity":127,"programNumber":40},{"time":130668.87013541584,"duration":68.18175000000338,"noteNumber":69,"velocity":127,"programNumber":40},{"time":130737.05188541584,"duration":68.18175000000338,"noteNumber":73,"velocity":127,"programNumber":40},{"time":130805.23363541585,"duration":68.18175000000338,"noteNumber":76,"velocity":127,"programNumber":40},{"time":130873.41538541585,"duration":68.18175000000338,"noteNumber":81,"velocity":127,"programNumber":40},{"time":130941.59713541585,"duration":68.18175000000338,"noteNumber":85,"velocity":127,"programNumber":40},{"time":131009.77888541586,"duration":68.18175000000338,"noteNumber":88,"velocity":127,"programNumber":40},{"time":131077.96063541586,"duration":68.18174999998882,"noteNumber":93,"velocity":127,"programNumber":40},{"time":131146.14238541585,"duration":68.18174999998882,"noteNumber":97,"velocity":127,"programNumber":40},{"time":131214.32413541584,"duration":727.2719999999972,"noteNumber":100,"velocity":127,"programNumber":40},{"time":132032.50513541585,"duration":68.18174999998882,"noteNumber":98,"velocity":60,"programNumber":40},{"time":132100.68688541584,"duration":68.18174999998882,"noteNumber":97,"velocity":60,"programNumber":40},{"time":132168.86863541583,"duration":68.18174999998882,"noteNumber":95,"velocity":60,"programNumber":40},{"time":132237.05038541582,"duration":68.18174999998882,"noteNumber":93,"velocity":60,"programNumber":40},{"time":132305.2321354158,"duration":68.18174999998882,"noteNumber":92,"velocity":60,"programNumber":40},{"time":132373.4138854158,"duration":68.18174999998882,"noteNumber":90,"velocity":60,"programNumber":40},{"time":132441.59563541578,"duration":68.18174999998882,"noteNumber":88,"velocity":60,"programNumber":40},{"time":132509.77738541577,"duration":68.18174999998882,"noteNumber":86,"velocity":60,"programNumber":40},{"time":132577.95913541576,"duration":68.18174999998882,"noteNumber":85,"velocity":60,"programNumber":40},{"time":132646.14088541575,"duration":68.18174999998882,"noteNumber":83,"velocity":60,"programNumber":40},{"time":132714.32263541574,"duration":68.18174999998882,"noteNumber":81,"velocity":60,"programNumber":40},{"time":132782.50438541573,"duration":68.18174999998882,"noteNumber":80,"velocity":60,"programNumber":40},{"time":132850.68613541572,"duration":68.18174999998882,"noteNumber":78,"velocity":60,"programNumber":40},{"time":132918.8678854157,"duration":68.18174999998882,"noteNumber":76,"velocity":60,"programNumber":40},{"time":132987.0496354157,"duration":68.18174999998882,"noteNumber":74,"velocity":60,"programNumber":40},{"time":133055.23138541568,"duration":68.18174999998882,"noteNumber":73,"velocity":60,"programNumber":40},{"time":133123.41313541567,"duration":68.18174999998882,"noteNumber":71,"velocity":60,"programNumber":40},{"time":133191.59488541566,"duration":68.18174999998882,"noteNumber":69,"velocity":60,"programNumber":40},{"time":133259.77663541565,"duration":68.18174999998882,"noteNumber":68,"velocity":60,"programNumber":40},{"time":133327.95838541564,"duration":68.18174999998882,"noteNumber":66,"velocity":60,"programNumber":40},{"time":133396.14013541563,"duration":68.18174999998882,"noteNumber":64,"velocity":60,"programNumber":40},{"time":133464.32188541561,"duration":68.18174999998882,"noteNumber":62,"velocity":60,"programNumber":40},{"time":133532.5036354156,"duration":68.18174999998882,"noteNumber":61,"velocity":60,"programNumber":40},{"time":133600.6853854156,"duration":68.18174999998882,"noteNumber":59,"velocity":60,"programNumber":40},{"time":133668.86713541558,"duration":727.2719999999972,"noteNumber":57,"velocity":60,"programNumber":40},{"time":134487.0481354156,"duration":68.18174999998882,"noteNumber":61,"velocity":127,"programNumber":40},{"time":134555.22988541558,"duration":68.18174999998882,"noteNumber":64,"velocity":127,"programNumber":40},{"time":134623.41163541557,"duration":68.18174999998882,"noteNumber":69,"velocity":127,"programNumber":40},{"time":134691.59338541556,"duration":68.18174999998882,"noteNumber":73,"velocity":127,"programNumber":40},{"time":134759.77513541555,"duration":68.18174999998882,"noteNumber":76,"velocity":127,"programNumber":40},{"time":134827.95688541554,"duration":68.18174999998882,"noteNumber":81,"velocity":127,"programNumber":40},{"time":134896.13863541553,"duration":68.18174999998882,"noteNumber":85,"velocity":127,"programNumber":40},{"time":134964.3203854155,"duration":68.18174999998882,"noteNumber":88,"velocity":127,"programNumber":40},{"time":135032.5021354155,"duration":68.18174999998882,"noteNumber":93,"velocity":127,"programNumber":40},{"time":135100.6838854155,"duration":68.18174999998882,"noteNumber":97,"velocity":127,"programNumber":40},{"time":135168.86563541548,"duration":68.18174999998882,"noteNumber":100,"velocity":127,"programNumber":40},{"time":135237.04738541547,"duration":727.2719999999972,"noteNumber":105,"velocity":127,"programNumber":40},{"time":136055.22838541548,"duration":68.18174999998882,"noteNumber":104,"velocity":60,"programNumber":40},{"time":136123.41013541547,"duration":68.18174999998882,"noteNumber":102,"velocity":60,"programNumber":40},{"time":136191.59188541546,"duration":68.18174999998882,"noteNumber":100,"velocity":60,"programNumber":40},{"time":136259.77363541545,"duration":68.18174999998882,"noteNumber":98,"velocity":60,"programNumber":40},{"time":136327.95538541544,"duration":68.18174999998882,"noteNumber":97,"velocity":60,"programNumber":40},{"time":136396.13713541543,"duration":68.18174999998882,"noteNumber":95,"velocity":60,"programNumber":40},{"time":136464.3188854154,"duration":68.18174999998882,"noteNumber":93,"velocity":60,"programNumber":40},{"time":136532.5006354154,"duration":68.18174999998882,"noteNumber":92,"velocity":60,"programNumber":40},{"time":136600.6823854154,"duration":68.18174999998882,"noteNumber":90,"velocity":60,"programNumber":40},{"time":136668.86413541538,"duration":68.18174999998882,"noteNumber":88,"velocity":60,"programNumber":40},{"time":136737.04588541537,"duration":68.18174999998882,"noteNumber":86,"velocity":60,"programNumber":40},{"time":136805.22763541536,"duration":68.18174999998882,"noteNumber":85,"velocity":60,"programNumber":40},{"time":136873.40938541535,"duration":68.18174999998882,"noteNumber":83,"velocity":60,"programNumber":40},{"time":136941.59113541534,"duration":68.18174999998882,"noteNumber":81,"velocity":60,"programNumber":40},{"time":137009.77288541532,"duration":68.18174999998882,"noteNumber":80,"velocity":60,"programNumber":40},{"time":137077.9546354153,"duration":68.18174999998882,"noteNumber":78,"velocity":60,"programNumber":40},{"time":137146.1363854153,"duration":68.18174999998882,"noteNumber":76,"velocity":60,"programNumber":40},{"time":137214.3181354153,"duration":68.18174999998882,"noteNumber":74,"velocity":60,"programNumber":40},{"time":137282.49988541528,"duration":68.18174999998882,"noteNumber":73,"velocity":60,"programNumber":40},{"time":137350.68163541527,"duration":68.18174999998882,"noteNumber":71,"velocity":60,"programNumber":40},{"time":137418.86338541526,"duration":68.18174999998882,"noteNumber":69,"velocity":60,"programNumber":40},{"time":137487.04513541525,"duration":68.18174999998882,"noteNumber":68,"velocity":60,"programNumber":40},{"time":137555.22688541524,"duration":68.18174999998882,"noteNumber":66,"velocity":60,"programNumber":40},{"time":137623.40863541522,"duration":68.18174999998882,"noteNumber":64,"velocity":60,"programNumber":40},{"time":137691.5903854152,"duration":68.18174999998882,"noteNumber":62,"velocity":60,"programNumber":40},{"time":137759.7721354152,"duration":68.18174999998882,"noteNumber":61,"velocity":60,"programNumber":40},{"time":137827.9538854152,"duration":62.499937499989755,"noteNumber":59,"velocity":60,"programNumber":40},{"time":137896.13563541518,"duration":409.09049999999115,"noteNumber":57,"velocity":63,"programNumber":40},{"time":138305.22613541517,"duration":68.18174999998882,"noteNumber":58,"velocity":63,"programNumber":40},{"time":138373.40788541516,"duration":68.18174999998882,"noteNumber":59,"velocity":66,"programNumber":40},{"time":138441.58963541515,"duration":68.18174999998882,"noteNumber":60,"velocity":69,"programNumber":40},{"time":138509.77138541514,"duration":68.18174999998882,"noteNumber":61,"velocity":72,"programNumber":40},{"time":138577.95313541513,"duration":68.18174999998882,"noteNumber":62,"velocity":75,"programNumber":40},{"time":138646.13488541511,"duration":68.18174999998882,"noteNumber":63,"velocity":78,"programNumber":40},{"time":138714.3166354151,"duration":68.18174999998882,"noteNumber":64,"velocity":81,"programNumber":40},{"time":138782.4983854151,"duration":68.18174999998882,"noteNumber":65,"velocity":84,"programNumber":40},{"time":138850.68013541508,"duration":68.18174999998882,"noteNumber":66,"velocity":87,"programNumber":40},{"time":138918.86188541507,"duration":68.18174999998882,"noteNumber":67,"velocity":90,"programNumber":40},{"time":138987.04363541506,"duration":68.18174999998882,"noteNumber":68,"velocity":93,"programNumber":40},{"time":139055.22538541505,"duration":68.18174999998882,"noteNumber":69,"velocity":96,"programNumber":40},{"time":139123.40713541504,"duration":68.18174999998882,"noteNumber":70,"velocity":99,"programNumber":40},{"time":139191.58888541503,"duration":68.18174999998882,"noteNumber":71,"velocity":102,"programNumber":40},{"time":139259.770635415,"duration":68.18174999998882,"noteNumber":72,"velocity":105,"programNumber":40},{"time":139327.952385415,"duration":68.18174999998882,"noteNumber":73,"velocity":108,"programNumber":40},{"time":139396.134135415,"duration":68.18174999998882,"noteNumber":74,"velocity":111,"programNumber":40},{"time":139464.31588541498,"duration":68.18174999998882,"noteNumber":75,"velocity":115,"programNumber":40},{"time":139532.49763541497,"duration":68.18174999998882,"noteNumber":76,"velocity":119,"programNumber":40},{"time":139600.67938541496,"duration":68.18174999998882,"noteNumber":77,"velocity":123,"programNumber":40},{"time":139668.86113541495,"duration":68.18174999998882,"noteNumber":78,"velocity":127,"programNumber":40},{"time":139737.04288541494,"duration":68.18174999998882,"noteNumber":79,"velocity":127,"programNumber":40},{"time":139805.22463541492,"duration":68.18174999998882,"noteNumber":80,"velocity":127,"programNumber":40},{"time":139873.4063854149,"duration":68.18174999998882,"noteNumber":81,"velocity":127,"programNumber":40},{"time":139941.5881354149,"duration":68.18174999998882,"noteNumber":80,"velocity":127,"programNumber":40},{"time":140009.7698854149,"duration":68.18174999998882,"noteNumber":79,"velocity":124,"programNumber":40},{"time":140077.95163541488,"duration":68.18174999998882,"noteNumber":78,"velocity":121,"programNumber":40},{"time":140146.13338541487,"duration":68.18174999998882,"noteNumber":77,"velocity":118,"programNumber":40},{"time":140214.31513541486,"duration":68.18174999998882,"noteNumber":76,"velocity":115,"programNumber":40},{"time":140282.49688541485,"duration":68.18174999998882,"noteNumber":75,"velocity":112,"programNumber":40},{"time":140350.67863541484,"duration":68.18174999998882,"noteNumber":74,"velocity":109,"programNumber":40},{"time":140418.86038541482,"duration":68.18174999998882,"noteNumber":73,"velocity":106,"programNumber":40},{"time":140487.0421354148,"duration":68.18174999998882,"noteNumber":72,"velocity":103,"programNumber":40},{"time":140555.2238854148,"duration":68.18174999998882,"noteNumber":71,"velocity":100,"programNumber":40},{"time":140623.4056354148,"duration":68.18174999998882,"noteNumber":70,"velocity":97,"programNumber":40},{"time":140691.58738541478,"duration":68.18174999998882,"noteNumber":69,"velocity":93,"programNumber":40},{"time":140759.76913541477,"duration":68.18174999998882,"noteNumber":68,"velocity":89,"programNumber":40},{"time":140827.95088541476,"duration":68.18174999998882,"noteNumber":67,"velocity":85,"programNumber":40},{"time":140896.13263541475,"duration":68.18174999998882,"noteNumber":66,"velocity":81,"programNumber":40},{"time":140964.31438541473,"duration":68.18174999998882,"noteNumber":65,"velocity":77,"programNumber":40},{"time":141032.49613541472,"duration":68.18174999998882,"noteNumber":64,"velocity":73,"programNumber":40},{"time":141100.6778854147,"duration":68.18174999998882,"noteNumber":63,"velocity":69,"programNumber":40},{"time":141168.8596354147,"duration":68.18174999998882,"noteNumber":62,"velocity":65,"programNumber":40},{"time":141237.0413854147,"duration":68.18174999998882,"noteNumber":61,"velocity":61,"programNumber":40},{"time":141305.22313541468,"duration":68.18174999998882,"noteNumber":60,"velocity":57,"programNumber":40},{"time":141373.40488541467,"duration":68.18174999998882,"noteNumber":59,"velocity":53,"programNumber":40},{"time":141441.58663541466,"duration":62.499937499989755,"noteNumber":58,"velocity":49,"programNumber":40},{"time":141509.76838541465,"duration":818.1810000000114,"noteNumber":57,"velocity":45,"programNumber":40},{"time":142327.94938541466,"duration":130.68168750000768,"noteNumber":61,"velocity":108,"programNumber":40},{"time":142327.94938541466,"duration":130.68168750000768,"noteNumber":64,"velocity":108,"programNumber":40},{"time":142464.31288541466,"duration":727.2719999999972,"noteNumber":73,"velocity":108,"programNumber":40},{"time":142464.31288541466,"duration":727.2719999999972,"noteNumber":81,"velocity":108,"programNumber":40}]]}
},{}],26:[function(require,module,exports){

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

},{"../../frampton/dist/web-frampton":22,"../caprice5.json":25,"../piano_long.json":42,"tonal":41}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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
},{"tonal-distance":30,"tonal-notation":36,"tonal-pitch":38,"tonal-transpose":40}],30:[function(require,module,exports){
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
},{"tonal-pitch":38}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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
},{"tonal-array":29,"tonal-midi":35,"tonal-note":37}],33:[function(require,module,exports){
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
},{"tonal-midi":35}],34:[function(require,module,exports){
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
},{"tonal-pitch":38}],35:[function(require,module,exports){
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
},{"tonal-pitch":38}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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
},{"tonal-pitch":38,"tonal-transpose":40}],38:[function(require,module,exports){
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
},{"interval-notation":27,"note-parser":28,"tonal-encoding":31,"tonal-notation":36}],39:[function(require,module,exports){
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
},{"tonal-array":29,"tonal-filter":32,"tonal-midi":35,"tonal-transpose":40}],40:[function(require,module,exports){
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
},{"tonal-pitch":38}],41:[function(require,module,exports){
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
},{"tonal-array":29,"tonal-distance":30,"tonal-filter":32,"tonal-freq":33,"tonal-interval":34,"tonal-midi":35,"tonal-note":37,"tonal-range":39,"tonal-transpose":40}],42:[function(require,module,exports){
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
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "A4.mp4",
        "duration": 5.483,
        "volumeInfo": {
            "mean": -27.7,
            "max": -9.7
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
            "max": -8.8
        },
        "tags": []
    }, {
        "filename": "A7.mp4",
        "duration": 1.323,
        "volumeInfo": {
            "mean": -31.3,
            "max": -7.9
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
            "max": -8.3
        },
        "tags": []
    }, {
        "filename": "Ab3.mp4",
        "duration": 5.696,
        "volumeInfo": {
            "mean": -27.4,
            "max": -9.5
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
            "max": -8.1
        },
        "tags": []
    }, {
        "filename": "Ab7.mp4",
        "duration": 1.387,
        "volumeInfo": {
            "mean": -29.9,
            "max": -8.9
        },
        "tags": []
    }, {
        "filename": "B0.mp4",
        "duration": 3.712,
        "volumeInfo": {
            "mean": -25.1,
            "max": -8.4
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
            "max": -8
        },
        "tags": []
    }, {
        "filename": "B6.mp4",
        "duration": 2.518,
        "volumeInfo": {
            "mean": -29.8,
            "max": -8.6
        },
        "tags": []
    }, {
        "filename": "B7.mp4",
        "duration": 1.408,
        "volumeInfo": {
            "mean": -35,
            "max": -12.5
        },
        "tags": []
    }, {
        "filename": "Bb0.mp4",
        "duration": 4.118,
        "volumeInfo": {
            "mean": -27.7,
            "max": -10.7
        },
        "tags": []
    }, {
        "filename": "Bb1.mp4",
        "duration": 4.502,
        "volumeInfo": {
            "mean": -23.1,
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
            "mean": -28.1,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "Bb5.mp4",
        "duration": 4.523,
        "volumeInfo": {
            "mean": -27.7,
            "max": -7.6
        },
        "tags": []
    }, {
        "filename": "Bb6.mp4",
        "duration": 2.582,
        "volumeInfo": {
            "mean": -30.2,
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
            "mean": -27.1,
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
            "mean": -32.7,
            "max": -8.7
        },
        "tags": []
    }, {
        "filename": "C6.mp4",
        "duration": 4.736,
        "volumeInfo": {
            "mean": -27.5,
            "max": -9.6
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
            "mean": -36.4,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "D1.mp4",
        "duration": 4.779,
        "volumeInfo": {
            "mean": -26,
            "max": -8.9
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
            "max": -7.5
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
            "mean": -32.4,
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
            "max": -8.7
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
            "max": -8.2
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
            "mean": -28.4,
            "max": -8.5
        },
        "tags": []
    }, {
        "filename": "E4.mp4",
        "duration": 8.256,
        "volumeInfo": {
            "mean": -30.4,
            "max": -8.4
        },
        "tags": []
    }, {
        "filename": "E5.mp4",
        "duration": 4.843,
        "volumeInfo": {
            "mean": -32,
            "max": -11.4
        },
        "tags": []
    }, {
        "filename": "E6.mp4",
        "duration": 3.392,
        "volumeInfo": {
            "mean": -26.9,
            "max": -7.4
        },
        "tags": []
    }, {
        "filename": "E7.mp4",
        "duration": 2.411,
        "volumeInfo": {
            "mean": -31,
            "max": -9.3
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
            "mean": -24.8,
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
            "max": -7.9
        },
        "tags": []
    }, {
        "filename": "F2.mp4",
        "duration": 6.23,
        "volumeInfo": {
            "mean": -24.9,
            "max": -8.3
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
            "max": -11.6
        },
        "tags": []
    }, {
        "filename": "G1.mp4",
        "duration": 4.864,
        "volumeInfo": {
            "mean": -24.7,
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
            "max": -8.6
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
            "max": -8.8
        },
        "tags": []
    }, {
        "filename": "G7.mp4",
        "duration": 1.387,
        "volumeInfo": {
            "mean": -31,
            "max": -9.4
        },
        "tags": []
    }, {
        "filename": "Gb1.mp4",
        "duration": 5.568,
        "volumeInfo": {
            "mean": -26.2,
            "max": -8.3
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

},{}]},{},[26]);
