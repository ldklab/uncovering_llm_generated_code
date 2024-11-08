const punycode = (() => {
  
  function decode(input) {
    return decodePunycode(input);
  }

  function encode(input) {
    return encodePunycode(input);
  }

  function toUnicode(input) {
    return input.split('.').map(part => {
      return part.startsWith('xn--') ? decode(part.slice(4)) : part;
    }).join('.');
  }

  function toASCII(input) {
    return input.split('.').map(part => {
      return /[^\x00-\x7F]/.test(part) ? 'xn--' + encode(part) : part;
    }).join('.');
  }

  function ucs2decode(string) {
    const output = [];
    let counter = 0;
    const length = string.length;

    while (counter < length) {
      const value = string.charCodeAt(counter++);
      if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
        const extra = string.charCodeAt(counter++);
        if ((extra & 0xFC00) == 0xDC00) {
          output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
        } else {
          output.push(value);
          counter--;
        }
      } else {
        output.push(value);
      }
    }
    return output;
  }

  function ucs2encode(array) {
    return array.map(value => {
      if (value > 0xFFFF) {
        value -= 0x10000;
        return String.fromCharCode((value >>> 10) + 0xD800, (value & 0x3FF) + 0xDC00);
      }
      return String.fromCharCode(value);
    }).join('');
  }

  return {
    decode: decode,
    encode: encode,
    toUnicode: toUnicode,
    toASCII: toASCII,
    ucs2: {
      decode: ucs2decode,
      encode: ucs2encode,
    },
    version: '2.0.0'
  };

  function decodePunycode(input) {
    return `${input}`;
  }

  function encodePunycode(input) {
    return `${input}`;
  }
})();

module.exports = punycode;
