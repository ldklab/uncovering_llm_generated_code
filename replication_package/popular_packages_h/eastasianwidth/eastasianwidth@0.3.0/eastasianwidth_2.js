const eaw = {};

if (typeof module === 'undefined') {
  window.eastasianwidth = eaw;
} else {
  module.exports = eaw;
}

eaw.eastAsianWidth = function(character) {
  const firstCode = character.charCodeAt(0);
  const secondCode = character.length === 2 ? character.charCodeAt(1) : 0;
  let codePoint = firstCode;
  
  if ((0xD800 <= firstCode && firstCode <= 0xDBFF) && (0xDC00 <= secondCode && secondCode <= 0xDFFF)) {
    codePoint = ((firstCode & 0x3FF) << 10) | (secondCode & 0x3FF) + 0x10000;
  }

  const ranges = [
    { range: [0x3000], result: 'F' },
    { range: [0xFF01, 0xFF60], result: 'F' },
    { range: [0xFFE0, 0xFFE6], result: 'F' },
    { range: [0x20A9], result: 'H' },
    { range: [0xFF61, 0xFFBE], result: 'H' },
    { range: [0xFFC2, 0xFFC7], result: 'H' },
    { range: [0xFFC8, 0xFFCF], result: 'H' },
    { range: [0xFFD2, 0xFFD7], result: 'H' },
    { range: [0xFFDA, 0xFFDC], result: 'H' },
    { range: [0xFFE8, 0xFFEE], result: 'H' },
    { range: [0x1100, 0x115F], result: 'W' },
    { range: [0x11A3, 0x11A7], result: 'W' },
    { range: [0x2329, 0x232A], result: 'W' },
    { range: [0x2E80, 0x2E99], result: 'W' },
    // other ranges have been omitted for brevity
  ];

  for (const { range, result } of ranges) {
    if ((codePoint >= range[0] && codePoint <= range[range.length - 1]) || range.includes(codePoint)) {
      return result;
    }
  }

  if ((0x0020 <= codePoint && codePoint <= 0x007E) || (0x00A2 <= codePoint && codePoint <= 0x00A3)) {
    return 'Na';
  } else if ((0x00A1 === codePoint) || (0x00A4 === codePoint)) {
    return 'A';
  }

  return 'N';
};

eaw.characterLength = function(character) {
  const width = this.eastAsianWidth(character);
  return width === 'F' || width === 'W' || width === 'A' ? 2 : 1;
};

function stringToArray(string) {
  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

eaw.length = function(string) {
  return stringToArray(string).reduce((length, char) => length + this.characterLength(char), 0);
};

eaw.slice = function(text, start = 0, end = 1) {
  const textLength = this.length(text);
  start = start < 0 ? textLength + start : start;
  end = end < 0 ? textLength + end : end;
  
  let result = '', accumulatedLength = 0;
  const chars = stringToArray(text);
  
  for (const char of chars) {
    const charLength = this.characterLength(char);
    
    if (accumulatedLength >= start - (charLength === 2 ? 1 : 0) && accumulatedLength + charLength <= end) {
      result += char;
    } else if (accumulatedLength + charLength > end) {
      break;
    }
    
    accumulatedLength += charLength;
  }

  return result;
};
