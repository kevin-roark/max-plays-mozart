
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

    case 'aqua':
      backingMIDIPath = 'aqua-backing.mid';
      backingMP3Path = 'aqua-backing.mp3';
      guitarJSONPath = 'aqua-guitar.json';
      break;

    case 'balloon':
      backingMIDIPath = 'balloon-backing.mid';
      backingMP3Path = 'balloon-backing.mp3';
      guitarJSONPath = 'balloon-guitar.json';
      break;

    case 'black':
      backingMIDIPath = 'black-backing.mid';
      backingMP3Path = 'black-backing.mp3';
      guitarJSONPath = 'black-guitar.json';
      break;

    case 'crying':
      backingMIDIPath = 'crying-backing.mid';
      backingMP3Path = 'crying-backing.mp3';
      guitarJSONPath = 'crying-guitar.json';
      break;

    case 'dark':
      backingMIDIPath = 'dark-backing.mid';
      backingMP3Path = 'dark-backing.mp3';
      guitarJSONPath = 'dark-guitar.json';
      break;

    case 'deep':
      backingMIDIPath = 'deep-backing.mid';
      backingMP3Path = 'deep-backing.mp3';
      guitarJSONPath = 'deep-guitar.json';
      break;

    case 'fear':
      backingMIDIPath = 'fear-backing.mid';
      backingMP3Path = 'fear-backing.mp3';
      guitarJSONPath = 'fear-guitar.json';
      break;

    case 'feeling':
      backingMIDIPath = 'feeling-backing.mid';
      backingMP3Path = 'feeling-backing.mp3';
      guitarJSONPath = 'feeling-guitar.json';
      break;

    case 'flow':
      backingMIDIPath = 'flow-backing.mid';
      backingMP3Path = 'flow-backing.mp3';
      guitarJSONPath = 'flow-guitar.json';
      break;

    case 'jungle':
      backingMIDIPath = 'jungle-backing.mid';
      backingMP3Path = 'jungle-backing.mp3';
      guitarJSONPath = 'jungle-guitar.json';
      break;

    case 'name':
      backingMIDIPath = 'name-backing.mid';
      backingMP3Path = 'name-backing.mp3';
      guitarJSONPath = 'name-guitar.json';
      break;

    case 'name2':
      backingMIDIPath = 'name-backing.mid';
      backingMP3Path = 'name-backing.mp3';
      guitarJSONPath = 'name-guitar2.json';
      break;

    case 'sandman':
      backingMIDIPath = 'sandman-backing.mid';
      backingMP3Path = 'sandman-backing.mp3';
      guitarJSONPath = 'sandman-guitar.json';
      break;

    case 'seven':
      backingMIDIPath = 'seven-backing.mid';
      backingMP3Path = 'seven-backing.mp3';
      guitarJSONPath = 'seven-guitar.json';
      break;

    case 'still':
      backingMIDIPath = 'still-backing.mid';
      backingMP3Path = 'still-backing.mp3';
      guitarJSONPath = 'still-guitar.json';
      break;

    case 'sweet':
      backingMIDIPath = 'sweet-backing.mid';
      backingMP3Path = 'sweet-backing.mp3';
      guitarJSONPath = 'sweet-guitar.json';
      break;

    case 'tripper':
      backingMIDIPath = 'tripper-backing.mid';
      backingMP3Path = 'tripper-backing.mp3';
      guitarJSONPath = 'tripper-guitar.json';
      break;

    case 'wuthering-piano':
      backingMIDIPath = 'wuthering-pianobacking.mid';
      backingMP3Path = 'wuthering-pianobacking.mp3';
      guitarJSONPath = 'wuthering-piano.json';
      break;

    case 'wuthering-voice':
      backingMIDIPath = 'wuthering-voicebacking.mid';
      backingMP3Path = 'wuthering-voicebacking.mp3';
      guitarJSONPath = 'wuthering-voice.json';
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
