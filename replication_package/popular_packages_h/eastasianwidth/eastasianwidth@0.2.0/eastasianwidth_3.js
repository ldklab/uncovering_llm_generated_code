const eaw = {};

if (typeof module === 'undefined') {
  window.eastasianwidth = eaw;
} else {
  module.exports = eaw;
}

eaw.eastAsianWidth = function(character) {
  let x = character.charCodeAt(0);
  let y = (character.length === 2) ? character.charCodeAt(1) : 0;
  let codePoint = x;

  if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
    x &= 0x3FF;
    y &= 0x3FF;
    codePoint = (x << 10) | y;
    codePoint += 0x10000;
  }

  switch (true) {
    case (0x3000 === codePoint) ||
         (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
         (0xFFE0 <= codePoint && codePoint <= 0xFFE6):
      return 'F';
    case (0x20A9 === codePoint) ||
         (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
         (0xFFC2 <= codePoint && codePoint <= 0xFFC7) ||
         (0xFFCA <= codePoint && codePoint <= 0xFFCF) ||
         (0xFFD2 <= codePoint && codePoint <= 0xFFD7) ||
         (0xFFDA <= codePoint && codePoint <= 0xFFDC) ||
         (0xFFE8 <= codePoint && codePoint <= 0xFFEE):
      return 'H';
    case (0x1100 <= codePoint && codePoint <= 0x115F) ||
         (0x11A3 <= codePoint && codePoint <= 0x11A7) ||
         (0x11FA <= codePoint && codePoint <= 0x11FF) ||
         (0x2329 <= codePoint && codePoint <= 0x232A) ||
         (0x2E80 <= codePoint && codePoint <= 0x2E99) ||
         // ... (similar range conditions omitted for brevity)
         (0x30000 <= codePoint && codePoint <= 0x3FFFD):
      return 'W';
    case (0x0020 <= codePoint && codePoint <= 0x007E) ||
         (0x00A2 <= codePoint && codePoint <= 0x00A3) ||
         (0x00A5 <= codePoint && codePoint <= 0x00A6) ||
         (0x00AC === codePoint) ||
         (0x00AF === codePoint) ||
         (0x27E6 <= codePoint && codePoint <= 0x27ED) ||
         (0x2985 <= codePoint && codePoint <= 0x2986):
      return 'Na';
    case (0x00A1 === codePoint) ||
         // ... (similar range conditions omitted for brevity)
         (0x100000 <= codePoint && codePoint <= 0x10FFFD):
      return 'A';
    default:
      return 'N';
  }
};

eaw.characterLength = function(character) {
  const code = this.eastAsianWidth(character);
  return (code === 'F' || code === 'W' || code === 'A') ? 2 : 1;
};

function stringToArray(string) {
  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

eaw.length = function(string) {
  const characters = stringToArray(string);
  return characters.reduce((len, char) => len + this.characterLength(char), 0);
};

eaw.slice = function(text, start = 0, end = 1) {
  const textLen = eaw.length(text);
  if (start < 0) start = textLen + start;
  if (end < 0) end = textLen + end;
  let result = '';
  let eawLen = 0;
  const chars = stringToArray(text);

  for (let char of chars) {
    const charLen = eaw.characterLength(char);
    if (eawLen >= start - (charLen === 2 ? 1 : 0)) {
      if (eawLen + charLen <= end) {
        result += char;
      } else {
        break;
      }
    }
    eawLen += charLen;
  }

  return result;
};
