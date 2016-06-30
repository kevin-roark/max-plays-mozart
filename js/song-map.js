
module.exports = function songMap (songName) {
  var backingMIDIPath, backingMP3Path, guitarJSONPath;
  switch (songName) {
    case 'thunder':
      backingMIDIPath = null;
      backingMP3Path = 'thunder_back.mp3';
      guitarJSONPath = 'thunder_guitar_133.json';
      break;

    case 'california':
      backingMIDIPath = 'california-backing.mid';
      backingMP3Path = 'california-backing-mp3.mp3';
      guitarJSONPath = 'california-organ.json';
      break;

    case 'come':
      backingMIDIPath = 'come-backing.mid';
      backingMP3Path = 'come-backing-mp3.mp3';
      guitarJSONPath = 'come-guitar.json';
      break;

    case 'europa':
      backingMIDIPath = 'europa-backing.mid';
      backingMP3Path = 'europa-backing-mp3.mp3';
      guitarJSONPath = 'europa-guitar.json';
      break;

    case 'lithium1':
      backingMIDIPath = 'lithium-backing1.mid';
      backingMP3Path = 'lithium-backing1-mp3.mp3';
      guitarJSONPath = 'lithium-guitar1.json';
      break;

    case 'lithium2':
      backingMIDIPath = 'lithium-backing2.mid';
      backingMP3Path = 'lithium-backing2-mp3.mp3';
      guitarJSONPath = 'lithium-guitar2.json';
      break;

    case 'hallowed':
      backingMIDIPath = 'hallowed-backing.mid';
      backingMP3Path = 'hallowed-backing-mp3.mp3';
      guitarJSONPath = 'hallowed-guitar.json';
      break;

    case 'risingsun':
      backingMIDIPath = 'risingsun-backing.mid';
      backingMP3Path = 'risingsun-backing-mp3.mp3';
      guitarJSONPath = 'risingsun-guitar.json';
      break;

    case 'sweetchild':
      backingMIDIPath = 'sweetchild-backing.mid';
      backingMP3Path = 'sweetchild-backing.mp3';
      guitarJSONPath = 'sweetchild-guitar.json';
      break;

    case 'wayward':
      backingMIDIPath = 'wayward-backing.mid';
      backingMP3Path = 'wayward-backing-mp3.mp3';
      guitarJSONPath = 'wayward-guitar.json';
      break;

    case 'crazy':
    default:
      backingMIDIPath = 'crazy_backing.mid';
      backingMP3Path = 'crazy_backing.mp3';
      guitarJSONPath = 'crazy_guitar.json';
      break;
  }

  return {
    backingMIDI: absolutePath(backingMIDIPath),
    backingMP3: absolutePath(backingMP3Path),
    guitarJSON: absolutePath(guitarJSONPath)
  };
}

function absolutePath (path) {
  return path ? '../songs/' + path : null;
}
