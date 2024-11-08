(function(global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.eastasianwidth = factory();
  }
}(this, function() {
  var eaw = {};

  eaw.eastAsianWidth = function(character) {
    var codePoint = character.codePointAt(0);

    if (0xD800 <= codePoint && codePoint <= 0xDBFF) { // Check surrogate pair
      var high = codePoint;
      var low = character.codePointAt(1) || 0;
      if (0xDC00 <= low && low <= 0xDFFF) {
        codePoint = ((high & 0x3FF) << 10) | (low & 0x3FF) | 0x10000;
      }
    }

    if ([0x3000, 0xFF01, 0xFFE0, 0xFFE6].includes(codePoint) || 
       (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
       (0xFFE0 <= codePoint && codePoint <= 0xFFE6)) return 'F';

    if ((0x20A9 === codePoint) ||
        (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
        // [omitted for brevity, same conditions for 'H', 'W', 'Na', 'A']
        (0x100000 <= codePoint && codePoint <= 0x10FFFD)) return 'A';

    return 'N';
  };

  eaw.characterLength = function(character) {
    var code = this.eastAsianWidth(character);
    return (code === 'F' || code === 'W' || code === 'A') ? 2 : 1;
  };

  function stringToArray(string) {
    return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
  }

  eaw.length = function(string) {
    var characters = stringToArray(string);
    return characters.reduce((len, char) => len + this.characterLength(char), 0);
  };

  eaw.slice = function(text, start = 0, end = 1) {
    var textLen = eaw.length(text);

    start = start < 0 ? textLen + start : start;
    end = end < 0 ? textLen + end : end;

    var result = '';
    var eawLen = 0;
    var chars = stringToArray(text);

    for (var i = 0; i < chars.length; i++) {
      var char = chars[i];
      var charLen = eaw.characterLength(char);

      if (eawLen >= start) {
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

  return eaw;
}));
