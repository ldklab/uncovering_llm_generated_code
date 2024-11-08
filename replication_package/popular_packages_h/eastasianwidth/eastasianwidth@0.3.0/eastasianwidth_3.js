var eaw = {};

if (typeof module === 'undefined') {
  window.eastasianwidth = eaw;
} else {
  module.exports = eaw;
}

eaw.eastAsianWidth = function(character) {
  let x = character.charCodeAt(0);
  let y = (character.length === 2) ? character.charCodeAt(1) : 0;
  let codePoint = x;

  if ((0xD800 <= x && x <= 0xDBFF) && (0xDC00 <= y && y <= 0xDFFF)) {
    x &= 0x3FF;
    y &= 0x3FF;
    codePoint = (x << 10) | y;
    codePoint += 0x10000;
  }

  if ([0x3000, ...range(0xFF01, 0xFF60), ...range(0xFFE0, 0xFFE6)].includes(codePoint)) {
    return 'F';
  }
  if ([0x20A9, ...range(0xFF61, 0xFFBE), ...range(0xFFC2, 0xFFC7), ...range(0xFFCA, 0xFFCF), 
      ...range(0xFFD2, 0xFFD7), ...range(0xFFDA, 0xFFDC), ...range(0xFFE8, 0xFFEE)].includes(codePoint)) {
    return 'H';
  }
  if ([...range(0x1100, 0x115F), ...range(0x11A3, 0x11A7), ...range(0x11FA, 0x11FF),
      ...range(0x2329, 0x232A), ...range(0x2E80, 0x2E99), ...range(0x2E9B, 0x2EF3),
      ...range(0x2F00, 0x2FD5), ...range(0x2FF0, 0x2FFB), ...range(0x3001, 0x303E),
      ...range(0x3041, 0x3096), ...range(0x3099, 0x30FF), ...range(0x3105, 0x312D),
      ...range(0x3131, 0x318E), ...range(0x3190, 0x31BA), ...range(0x31C0, 0x31E3),
      ...range(0x31F0, 0x321E), ...range(0x3220, 0x3247), ...range(0x3250, 0x32FE),
      ...range(0x3300, 0x4DBF), ...range(0x4E00, 0xA48C), ...range(0xA490, 0xA4C6),
      ...range(0xA960, 0xA97C), ...range(0xAC00, 0xD7A3), ...range(0xD7B0, 0xD7C6), 
      ...range(0xD7CB, 0xD7FB), ...range(0xF900, 0xFAFF), ...range(0xFE10, 0xFE19),
      ...range(0xFE30, 0xFE52), ...range(0xFE54, 0xFE66), ...range(0xFE68, 0xFE6B),
      ...range(0x1B000, 0x1B001), ...range(0x1F200, 0x1F202), ...range(0x1F210, 0x1F23A),
      ...range(0x1F240, 0x1F248), ...range(0x1F250, 0x1F251), ...range(0x20000, 0x2F73F),
      ...range(0x2B740, 0x2FFFD), ...range(0x30000, 0x3FFFD)].some(range => range.includes(codePoint))) {
    return 'W';
  }
  if ([...range(0x0020, 0x007E), 0x00A2, 0x00A3, 0x00A5, 0x00A6, 0x00AC, 0x00AF,
      ...range(0x27E6, 0x27ED), ...range(0x2985, 0x2986)].some(range => range.includes(codePoint))) {
    return 'Na';
  }
  if ([0x00A1, 0x00A4, ...range(0x00A7, 0x00A8), 0x00AA, ...range(0x00AD, 0x00AE),
      ...range(0x00B0, 0x00B4), ...range(0x00B6, 0x00BA), ...range(0x00BC, 0x00BF),
      0x00C6, 0x00D0, ...range(0x00D7, 0x00D8), ...range(0x00DE, 0x00E1), 0x00E6,
      ...range(0x00E8, 0x00EA), ...range(0x00EC, 0x00ED), 0x00F0, ...range(0x00F2, 0x00F3),
      ...range(0x00F7, 0x00FA), 0x00FC, 0x00FE, 0x0101, 0x0111, 0x0113, 0x011B,
      ...range(0x0126, 0x0127), 0x012B, ...range(0x0131, 0x0133), 0x0138,
      ...range(0x013F, 0x0142), 0x0144, ...range(0x0148, 0x014B), 0x014D,
      ...range(0x0152, 0x0153), ...range(0x0166, 0x0167), 0x016B, 0x01CE, 
      ...range(0x01D0, 0x01DC), 0x0251, 0x0261, 0x02C4, 0x02C7, 
      ...range(0x02C9, 0x02CB), 0x02CD, 0x02D0, ...range(0x02D8, 0x02DB),
      0x02DD, 0x02DF, ...range(0x0300, 0x036F), ...range(0x0391, 0x03A9),
      0x0401, ...range(0x0410, 0x044F), 0x0451, 0x2010, ...range(0x2013, 0x2016), 
      ...range(0x2018, 0x201D), ...range(0x2020, 0x2022), ...range(0x2024, 0x2027),
      0x2030, ...range(0x2032, 0x2033), 0x2035, 0x203B, 0x203E, 0x2074,
      0x207F, ...range(0x2081, 0x2084), 0x20AC, 0x2103, 0x2105, 0x2109, 
      0x2113, 0x2116, ...range(0x2121, 0x2122)], ...range(0x2153, 0x2154),
      0x2189, ...range(0x2190, 0x2199), ...range(0x21D2, 0x21E7),
      ...range(0x2200, 0x2220), ...range(0x2223, 0x2225),
      ...range(0x2234, 0x2237)].includes(codePoint)) {
    return 'A';
  }

  return 'N';
};

eaw.characterLength = function(character) {
  return this.eastAsianWidth(character) === 'F' || 
    this.eastAsianWidth(character) === 'W' || 
    this.eastAsianWidth(character) === 'A' ? 2 : 1;
};

function stringToArray(string) {
  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

eaw.length = function(string) {
  let characters = stringToArray(string);
  return characters.reduce((acc, char) => acc + this.characterLength(char), 0);
};

eaw.slice = function(text, start, end) {
  const textLen = this.length(text);
  start = start ?? 0;
  end = end ?? textLen;
  start = start < 0 ? textLen + start : start;
  end = end < 0 ? textLen + end : end;

  let result = '', eawLen = 0;
  const chars = stringToArray(text);

  for (const char of chars) {
    const charLen = this.characterLength(char);
    if (eawLen >= start - (charLen === 2 ? 1 : 0) && (eawLen + charLen <= end)) {
      result += char;
    } else if (eawLen >= end) {
      break;
    }
    eawLen += charLen;
  }
  return result;
};

function range(start, end) {
  return Array.from({length: end - start + 1}, (_, i) => start + i);
}
