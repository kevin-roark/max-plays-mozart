
module.exports = function songMap (songName) {
  var backingMIDIPath, backingMP3Path, guitarJSONPath;
  var backingOffset = 0;
  switch (songName) {
    case 'thunder':
      backingMIDIPath = null;
      backingMP3Path = 'thunder_back.mp3';
      guitarJSONPath = 'thunder_guitar_133.json';
      backingOffset = -90;
      break;

    case 'california':
      backingMIDIPath = 'california-backing.mid';
      backingMP3Path = 'california-backing-mp3.mp3';
      guitarJSONPath = 'california-organ.json';
      backingOffset = -5;
      break;

    case 'come':
      backingMIDIPath = 'come-backing.mid';
      backingMP3Path = 'come-backing-mp3.mp3';
      guitarJSONPath = 'come-guitar.json';
      backingOffset = 20;
      break;

    case 'europa':
      backingMIDIPath = 'europa-backing.mid';
      backingMP3Path = 'europa-backing-mp3.mp3';
      guitarJSONPath = 'europa-guitar.json';
      backingOffset = 15;
      break;

    case 'lithium1':
      backingMIDIPath = 'lithium-backing1.mid';
      backingMP3Path = 'lithium-backing1-mp3.mp3';
      guitarJSONPath = 'lithium-guitar1.json';
      backingOffset = 50;
      break;

    case 'lithium2':
      backingMIDIPath = 'lithium-backing2.mid';
      backingMP3Path = 'lithium-backing2-mp3.mp3';
      guitarJSONPath = 'lithium-guitar2.json';
      backingOffset = 50;
      break;

    case 'hallowed':
      backingMIDIPath = 'hallowed-backing.mid';
      backingMP3Path = 'hallowed-backing-mp3.mp3';
      guitarJSONPath = 'hallowed-guitar.json';
      backingOffset = 5;
      break;

    case 'risingsun':
      backingMIDIPath = 'risingsun-backing.mid';
      backingMP3Path = 'risingsun-backing-mp3.mp3';
      guitarJSONPath = 'risingsun-guitar.json';
      backingOffset = 1600;
      break;

    case 'sweetchild':
      backingMIDIPath = 'sweetchild-backing.mid';
      backingMP3Path = 'sweetchild-backing.mp3';
      guitarJSONPath = 'sweetchild-guitar.json';
      backingOffset = -930;
      break;

    case 'wayward':
      backingMIDIPath = 'wayward-backing.mid';
      backingMP3Path = 'wayward-backing-mp3.mp3';
      guitarJSONPath = 'wayward-guitar.json';
      backingOffset = 10;
      break;

    case 'crazy':
    default:
      backingMIDIPath = 'crazy_backing.mid';
      backingMP3Path = 'crazy_backing.mp3';
      guitarJSONPath = 'crazy_guitar.json';
      backingOffset = 15;
      break;
  }

  return {
    backingMIDI: absolutePath(backingMIDIPath),
    backingMP3: absolutePath(backingMP3Path),
    guitarJSON: absolutePath(guitarJSONPath),
    backingOffset: backingOffset
  };
}

function absolutePath (path) {
  return path ? '../songs/' + path : null;
}
