var eaw = {};

if (typeof module === 'undefined') {
  window.eastasianwidth = eaw;
} else {
  module.exports = eaw;
}

eaw.eastAsianWidth = function(character) {
  let x = character.charCodeAt(0);
  let y = character.length === 2 ? character.charCodeAt(1) : 0;
  let codePoint = x;

  if (x >= 0xD800 && x <= 0xDBFF && y >= 0xDC00 && y <= 0xDFFF) {
    codePoint = ((x & 0x3FF) << 10) | (y & 0x3FF) + 0x10000;
  }

  const fullWidthChecks = [
    { single: 0x3000 },
    { range: [0xFF01, 0xFF60] },
    { range: [0xFFE0, 0xFFE6] }
  ];
  
  const halfWidthChecks = [
    { single: 0x20A9 },
    { range: [0xFF61, 0xFFBE] },
    { range: [0xFFC2, 0xFFC7] },
    { range: [0xFFCA, 0xFFCF] },
    { range: [0xFFD2, 0xFFD7] },
    { range: [0xFFDA, 0xFFDC] },
    { range: [0xFFE8, 0xFFEE] }
  ];
  
  const wideChecks = [
    { range: [0x1100, 0x115F] },
    { range: [0x11A3, 0x11A7] },
    { range: [0x11FA, 0x11FF] },
    { single: [0x2329, 0x232A] },
    { range: [0x2E80, 0x2E99] },
    { range: [0x2E9B, 0x2EF3] },
    { range: [0x2F00, 0x2FD5] },
    { range: [0x2FF0, 0x2FFB] },
    { range: [0x3001, 0x303E] },
    { range: [0x3041, 0x3096] },
    { range: [0x3099, 0x30FF] },
    { range: [0x3105, 0x312D] },
    { range: [0x3131, 0x318E] },
    { range: [0x3190, 0x31BA] },
    { range: [0x31C0, 0x31E3] },
    { range: [0x31F0, 0x321E] },
    { range: [0x3220, 0x3247] },
    { range: [0x3250, 0x32FE] },
    { range: [0x3300, 0x4DBF] },
    { range: [0x4E00, 0xA48C] },
    { range: [0xA490, 0xA4C6] },
    { range: [0xA960, 0xA97C] },
    { range: [0xAC00, 0xD7A3] },
    { range: [0xD7B0, 0xD7C6] },
    { range: [0xD7CB, 0xD7FB] },
    { range: [0xF900, 0xFAFF] },
    { range: [0xFE10, 0xFE19] },
    { range: [0xFE30, 0xFE52] },
    { range: [0xFE54, 0xFE66] },
    { range: [0xFE68, 0xFE6B] },
    { range: [0x1B000, 0x1B001] },
    { range: [0x1F200, 0x1F202] },
    { range: [0x1F210, 0x1F23A] },
    { range: [0x1F240, 0x1F248] },
    { range: [0x1F250, 0x1F251] },
    { range: [0x20000, 0x2F73F] },
    { range: [0x2B740, 0x2FFFD] },
    { range: [0x30000, 0x3FFFD] }
  ];

  const narrowChecks = [
    { range: [0x0020, 0x007E] },
    { range: [0x00A2, 0x00A3] },
    { range: [0x00A5, 0x00A6] },
    { single: 0x00AC },
    { single: 0x00AF },
    { range: [0x27E6, 0x27ED] },
    { range: [0x2985, 0x2986] }
  ];

  const ambiguousChecks = [
    { single: 0x00A1 },
    { single: 0x00A4 },
    { range: [0x00A7, 0x00A8] },
    { single: 0x00AA },
    { range: [0x00AD, 0x00AE] },
    { range: [0x00B0, 0x00B4] },
    { range: [0x00B6, 0x00BA] },
    { range: [0x00BC, 0x00BF] },
    { single: 0x00C6 },
    { single: 0x00D0 },
    { range: [0x00D7, 0x00D8] },
    { range: [0x00DE, 0x00E1] },
    { single: 0x00E6 },
    { range: [0x00E8, 0x00EA] },
    { range: [0x00EC, 0x00ED] },
    { single: 0x00F0 },
    { range: [0x00F2, 0x00F3] },
    { range: [0x00F7, 0x00FA] },
    { single: 0x00FC },
    { single: 0x00FE },
    { single: 0x0101 },
    { single: 0x0111 },
    { single: 0x0113 },
    { single: 0x011B },
    { range: [0x0126, 0x0127] },
    { single: 0x012B },
    { range: [0x0131, 0x0133] },
    { single: 0x0138 },
    { range: [0x013F, 0x0142] },
    { single: 0x0144 },
    { range: [0x0148, 0x014B] },
    { single: 0x014D },
    { range: [0x0152, 0x0153] },
    { range: [0x0166, 0x0167] },
    { single: 0x016B },
    { single: 0x01CE },
    { single: 0x01D0 },
    { single: 0x01D2 },
    { single: 0x01D4 },
    { single: 0x01D6 },
    { single: 0x01D8 },
    { single: 0x01DA },
    { single: 0x01DC },
    { single: 0x0251 },
    { single: 0x0261 },
    { single: 0x02C4 },
    { single: 0x02C7 },
    { range: [0x02C9, 0x02CB] },
    { single: 0x02CD },
    { single: 0x02D0 },
    { range: [0x02D8, 0x02DB] },
    { single: 0x02DD },
    { single: 0x02DF },
    { range: [0x0300, 0x036F] },
    { range: [0x0391, 0x03A1] },
    { range: [0x03A3, 0x03A9] },
    { range: [0x03B1, 0x03C1] },
    { range: [0x03C3, 0x03C9] },
    { single: 0x0401 },
    { range: [0x0410, 0x044F] },
    { single: 0x0451 },
    { single: 0x2010 },
    { range: [0x2013, 0x2016] },
    { range: [0x2018, 0x2019] },
    { range: [0x201C, 0x201D] },
    { range: [0x2020, 0x2022] },
    { range: [0x2024, 0x2027] },
    { single: 0x2030 },
    { range: [0x2032, 0x2033] },
    { single: 0x2035 },
    { single: 0x203B },
    { single: 0x203E },
    { single: 0x2074 },
    { single: 0x207F },
    { range: [0x2081, 0x2084] },
    { single: 0x20AC },
    { single: 0x2103 },
    { single: 0x2105 },
    { single: 0x2109 },
    { single: 0x2113 },
    { single: 0x2116 },
    { range: [0x2121, 0x2122] },
    { single: 0x2126 },
    { single: 0x212B },
    { range: [0x2153, 0x2154] },
    { range: [0x215B, 0x215E] },
    { range: [0x2160, 0x216B] },
    { range: [0x2170, 0x2179] },
    { single: 0x2189 },
    { range: [0x2190, 0x2199] },
    { range: [0x21B8, 0x21B9] },
    { single: 0x21D2 },
    { single: 0x21D4 },
    { single: 0x21E7 },
    { single: 0x2200 },
    { range: [0x2202, 0x2203] },
    { range: [0x2207, 0x2208] },
    { single: 0x220B },
    { single: 0x220F },
    { single: 0x2211 },
    { single: 0x2215 },
    { single: 0x221A },
    { range: [0x221D, 0x2220] },
    { single: 0x2223 },
    { single: 0x2225 },
    { range: [0x2227, 0x222C] },
    { single: 0x222E },
    { range: [0x2234, 0x2237] },
    { range: [0x223C, 0x223D] },
    { single: 0x2248 },
    { single: 0x224C },
    { single: 0x2252 },
    { range: [0x2260, 0x2261] },
    { range: [0x2264, 0x2267] },
    { range: [0x226A, 0x226B] },
    { range: [0x226E, 0x226F] },
    { range: [0x2282, 0x2283] },
    { range: [0x2286, 0x2287] },
    { single: 0x2295 },
    { single: 0x2299 },
    { single: 0x22A5 },
    { single: 0x22BF },
    { single: 0x2312 },
    { range: [0x2460, 0x24E9] },
    { range: [0x24EB, 0x254B] },
    { range: [0x2550, 0x2573] },
    { range: [0x2580, 0x258F] },
    { range: [0x2592, 0x2595] },
    { range: [0x25A0, 0x25A1] },
    { range: [0x25A3, 0x25A9] },
    { range: [0x25B2, 0x25B3] },
    { range: [0x25B6, 0x25B7] },
    { range: [0x25BC, 0x25BD] },
    { range: [0x25C0, 0x25C1] },
    { range: [0x25C6, 0x25C8] },
    { single: 0x25CB },
    { range: [0x25CE, 0x25D1] },
    { range: [0x25E2, 0x25E5] },
    { single: 0x25EF },
    { range: [0x2605, 0x2606] },
    { single: 0x2609 },
    { range: [0x260E, 0x260F] },
    { range: [0x2614, 0x2615] },
    { single: 0x261C },
    { single: 0x261E },
    { single: 0x2640 },
    { single: 0x2642 },
    { range: [0x2660, 0x2661] },
    { range: [0x2663, 0x2665] },
    { range: [0x2667, 0x266A] },
    { range: [0x266C, 0x266D] },
    { single: 0x266F },
    { range: [0x269E, 0x269F] },
    { range: [0x26BE, 0x26BF] },
    { range: [0x26C4, 0x26CD] },
    { range: [0x26CF, 0x26E1] },
    { single: 0x26E3 },
    { range: [0x26E8, 0x26FF] },
    { single: 0x273D },
    { single: 0x2757 },
    { range: [0x2776, 0x277F] },
    { range: [0x2B55, 0x2B59] },
    { range: [0x3248, 0x324F] },
    { range: [0xE000, 0xF8FF] },
    { range: [0xFE00, 0xFE0F] },
    { single: 0xFFFD },
    { range: [0x1F100, 0x1F10A] },
    { range: [0x1F110, 0x1F12D] },
    { range: [0x1F130, 0x1F169] },
    { range: [0x1F170, 0x1F19A] },
    { range: [0xE0100, 0xE01EF] },
    { range: [0xF0000, 0xFFFFD] },
    { range: [0x100000, 0x10FFFD] }
  ];

  // Helper function for checking character category
  const isInCategory = (checks, codePoint) => 
    checks.some(check => 
      ('single' in check && check.single === codePoint) ||
      ('range' in check && codePoint >= check.range[0] && codePoint <= check.range[1])
    );

  if (isInCategory(fullWidthChecks, codePoint)) return 'F';
  if (isInCategory(halfWidthChecks, codePoint)) return 'H';
  if (isInCategory(wideChecks, codePoint)) return 'W';
  if (isInCategory(narrowChecks, codePoint)) return 'Na';
  if (isInCategory(ambiguousChecks, codePoint)) return 'A';

  return 'N';
};

eaw.characterLength = function(character) {
  const widthChar = this.eastAsianWidth(character);
  return (widthChar === 'F' || widthChar === 'W' || widthChar === 'A') ? 2 : 1;
};

function stringToArray(string) {
  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

eaw.length = function(string) {
  const characters = stringToArray(string);
  return characters.reduce((len, char) => len + this.characterLength(char), 0);
};

eaw.slice = function(text, start = 0, end = 1) {
  const totalLen = eaw.length(text);
  start = start < 0 ? totalLen + start : start;
  end = end < 0 ? totalLen + end : end;

  let accumulatedLen = 0;
  let result = '';
  const characters = stringToArray(text);

  for (const char of characters) {
    const charLen = eaw.characterLength(char);
    if (accumulatedLen >= start) {
      if (accumulatedLen + charLen <= end) {
        result += char;
      } else {
        break;
      }
    }
    accumulatedLen += charLen;
  }

  return result;
};
