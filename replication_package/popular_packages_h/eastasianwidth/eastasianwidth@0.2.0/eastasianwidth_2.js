const eaw = {};

if (typeof module === 'undefined') {
  window.eastasianwidth = eaw;
} else {
  module.exports = eaw;
}

eaw.eastAsianWidth = function(character) {
  let codePoint = character.codePointAt(0);

  if (character.length === 2) {
    const secondCodePoint = character.codePointAt(1);
    if (0xD800 <= codePoint && codePoint <= 0xDBFF && 0xDC00 <= secondCodePoint && secondCodePoint <= 0xDFFF) {
      codePoint = ((codePoint & 0x3FF) << 10 | (secondCodePoint & 0x3FF)) + 0x10000;
    }
  }

  if (
    (codePoint === 0x3000) ||
    (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
    (0xFFE0 <= codePoint && codePoint <= 0xFFE6)
  ) return 'F';
  
  if (
    (codePoint === 0x20A9) ||
    (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
    (0xFFC2 <= codePoint && codePoint <= 0xFFC7) ||
    (0xFFCA <= codePoint && codePoint <= 0xFFCF) ||
    (0xFFD2 <= codePoint && codePoint <= 0xFFD7) ||
    (0xFFDA <= codePoint && codePoint <= 0xFFDC) ||
    (0xFFE8 <= codePoint && codePoint <= 0xFFEE)
  ) return 'H';

  if (
    (0x1100 <= codePoint && codePoint <= 0x115F) ||
    (0x11A3 <= codePoint && codePoint <= 0x11A7) ||
    (0x11FA <= codePoint && codePoint <= 0x11FF) ||
    (0x2329 <= codePoint && codePoint <= 0x232A) ||
    (0x2E80 <= codePoint && codePoint <= 0x2E99) ||
    (0x2E9B <= codePoint && codePoint <= 0x2EF3) ||
    (0x2F00 <= codePoint && codePoint <= 0x2FD5) ||
    (0x2FF0 <= codePoint && codePoint <= 0x2FFB) ||
    (0x3001 <= codePoint && codePoint <= 0x303E) ||
    (0x3041 <= codePoint && codePoint <= 0x3096) ||
    (0x3099 <= codePoint && codePoint <= 0x30FF) ||
    (0x3105 <= codePoint && codePoint <= 0x312D) ||
    (0x3131 <= codePoint && codePoint <= 0x318E) ||
    (0x3190 <= codePoint && codePoint <= 0x31BA) ||
    (0x31C0 <= codePoint && codePoint <= 0x31E3) ||
    (0x31F0 <= codePoint && codePoint <= 0x321E) ||
    (0x3220 <= codePoint && codePoint <= 0x3247) ||
    (0x3250 <= codePoint && codePoint <= 0x32FE) ||
    (0x3300 <= codePoint && codePoint <= 0x4DBF) ||
    (0x4E00 <= codePoint && codePoint <= 0xA48C) ||
    (0xA490 <= codePoint && codePoint <= 0xA4C6) ||
    (0xA960 <= codePoint && codePoint <= 0xA97C) ||
    (0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
    (0xD7B0 <= codePoint && codePoint <= 0xD7C6) ||
    (0xD7CB <= codePoint && codePoint <= 0xD7FB) ||
    (0xF900 <= codePoint && codePoint <= 0xFAFF) ||
    (0xFE10 <= codePoint && codePoint <= 0xFE19) ||
    (0xFE30 <= codePoint && codePoint <= 0xFE52) ||
    (0xFE54 <= codePoint && codePoint <= 0xFE66) ||
    (0xFE68 <= codePoint && codePoint <= 0xFE6B) ||
    (0x1B000 <= codePoint && codePoint <= 0x1B001) ||
    (0x1F200 <= codePoint && codePoint <= 0x1F202) ||
    (0x1F210 <= codePoint && codePoint <= 0x1F23A) ||
    (0x1F240 <= codePoint && codePoint <= 0x1F248) ||
    (0x1F250 <= codePoint && codePoint <= 0x1F251) ||
    (0x20000 <= codePoint && codePoint <= 0x2F73F) ||
    (0x2B740 <= codePoint && codePoint <= 0x2FFFD) ||
    (0x30000 <= codePoint && codePoint <= 0x3FFFD)
  ) return 'W';

  if (
    (0x0020 <= codePoint && codePoint <= 0x007E) ||
    (0x00A2 <= codePoint && codePoint <= 0x00A3) ||
    (0x00A5 <= codePoint && codePoint <= 0x00A6) ||
    (codePoint === 0x00AC) ||
    (codePoint === 0x00AF) ||
    (0x27E6 <= codePoint && codePoint <= 0x27ED) ||
    (0x2985 <= codePoint && codePoint <= 0x2986)
  ) return 'Na';

  if (
    (codePoint === 0x00A1) ||
    (codePoint === 0x00A4) ||
    (0x00A7 <= codePoint && codePoint <= 0x00A8) ||
    (codePoint === 0x00AA) ||
    (0x00AD <= codePoint && codePoint <= 0x00AE) ||
    (0x00B0 <= codePoint && codePoint <= 0x00B4) ||
    (0x00B6 <= codePoint && codePoint <= 0x00BA) ||
    (0x00BC <= codePoint && codePoint <= 0x00BF) ||
    (codePoint === 0x00C6) ||
    (codePoint === 0x00D0) ||
    (0x00D7 <= codePoint && codePoint <= 0x00D8) ||
    (0x00DE <= codePoint && codePoint <= 0x00E1) ||
    (codePoint === 0x00E6) ||
    (0x00E8 <= codePoint && codePoint <= 0x00EA) ||
    (0x00EC <= codePoint && codePoint <= 0x00ED) ||
    (codePoint === 0x00F0) ||
    (0x00F2 <= codePoint && codePoint <= 0x00F3) ||
    (0x00F7 <= codePoint && codePoint <= 0x00FA) ||
    (codePoint === 0x00FC) ||
    (codePoint === 0x00FE) ||
    (codePoint === 0x0101) ||
    (codePoint === 0x0111) ||
    (codePoint === 0x0113) ||
    (codePoint === 0x011B) ||
    (0x0126 <= codePoint && codePoint <= 0x0127) ||
    (codePoint === 0x012B) ||
    (0x0131 <= codePoint && codePoint <= 0x0133) ||
    (codePoint === 0x0138) ||
    (0x013F <= codePoint && codePoint <= 0x0142) ||
    (codePoint === 0x0144) ||
    (0x0148 <= codePoint && codePoint <= 0x014B) ||
    (codePoint === 0x014D) ||
    (0x0152 <= codePoint && codePoint <= 0x0153) ||
    (0x0166 <= codePoint && codePoint <= 0x0167) ||
    (codePoint === 0x016B) ||
    (codePoint === 0x01CE) ||
    (codePoint === 0x01D0) ||
    (codePoint === 0x01D2) ||
    (codePoint === 0x01D4) ||
    (codePoint === 0x01D6) ||
    (codePoint === 0x01D8) ||
    (codePoint === 0x01DA) ||
    (codePoint === 0x01DC) ||
    (codePoint === 0x0251) ||
    (codePoint === 0x0261) ||
    (codePoint === 0x02C4) ||
    (codePoint === 0x02C7) ||
    (0x02C9 <= codePoint && codePoint <= 0x02CB) ||
    (codePoint === 0x02CD) ||
    (codePoint === 0x02D0) ||
    (0x02D8 <= codePoint && codePoint <= 0x02DB) ||
    (codePoint === 0x02DD) ||
    (codePoint === 0x02DF) ||
    (0x0300 <= codePoint && codePoint <= 0x036F) ||
    (0x0391 <= codePoint && codePoint <= 0x03A1) ||
    (0x03A3 <= codePoint && codePoint <= 0x03A9) ||
    (0x03B1 <= codePoint && codePoint <= 0x03C1) ||
    (0x03C3 <= codePoint && codePoint <= 0x03C9) ||
    (codePoint === 0x0401) ||
    (0x0410 <= codePoint && codePoint <= 0x044F) ||
    (codePoint === 0x0451) ||
    (codePoint === 0x2010) ||
    (0x2013 <= codePoint && codePoint <= 0x2016) ||
    (0x2018 <= codePoint && codePoint <= 0x2019) ||
    (0x201C <= codePoint && codePoint <= 0x201D) ||
    (0x2020 <= codePoint && codePoint <= 0x2022) ||
    (0x2024 <= codePoint && codePoint <= 0x2027) ||
    (codePoint === 0x2030) ||
    (0x2032 <= codePoint && codePoint <= 0x2033) ||
    (codePoint === 0x2035) ||
    (codePoint === 0x203B) ||
    (codePoint === 0x203E) ||
    (codePoint === 0x2074) ||
    (codePoint === 0x207F) ||
    (0x2081 <= codePoint && codePoint <= 0x2084) ||
    (codePoint === 0x20AC) ||
    (codePoint === 0x2103) ||
    (codePoint === 0x2105) ||
    (codePoint === 0x2109) ||
    (codePoint === 0x2113) ||
    (codePoint === 0x2116) ||
    (0x2121 <= codePoint && codePoint <= 0x2122) ||
    (codePoint === 0x2126) ||
    (codePoint === 0x212B) ||
    (0x2153 <= codePoint && codePoint <= 0x2154) ||
    (0x215B <= codePoint && codePoint <= 0x215E) ||
    (0x2160 <= codePoint && codePoint <= 0x216B) ||
    (0x2170 <= codePoint && codePoint <= 0x2179) ||
    (codePoint === 0x2189) ||
    (0x2190 <= codePoint && codePoint <= 0x2199) ||
    (0x21B8 <= codePoint && codePoint <= 0x21B9) ||
    (codePoint === 0x21D2) ||
    (codePoint === 0x21D4) ||
    (codePoint === 0x21E7) ||
    (codePoint === 0x2200) ||
    (0x2202 <= codePoint && codePoint <= 0x2203) ||
    (0x2207 <= codePoint && codePoint <= 0x2208) ||
    (codePoint === 0x220B) ||
    (codePoint === 0x220F) ||
    (codePoint === 0x2211) ||
    (codePoint === 0x2215) ||
    (codePoint === 0x221A) ||
    (0x221D <= codePoint && codePoint <= 0x2220) ||
    (codePoint === 0x2223) ||
    (codePoint === 0x2225) ||
    (0x2227 <= codePoint && codePoint <= 0x222C) ||
    (codePoint === 0x222E) ||
    (0x2234 <= codePoint && codePoint <= 0x2237) ||
    (0x223C <= codePoint && codePoint <= 0x223D) ||
    (codePoint === 0x2248) ||
    (codePoint === 0x224C) ||
    (codePoint === 0x2252) ||
    (0x2260 <= codePoint && codePoint <= 0x2261) ||
    (0x2264 <= codePoint && codePoint <= 0x2267) ||
    (0x226A <= codePoint && codePoint <= 0x226B) ||
    (0x226E <= codePoint && codePoint <= 0x226F) ||
    (0x2282 <= codePoint && codePoint <= 0x2283) ||
    (0x2286 <= codePoint && codePoint <= 0x2287) ||
    (codePoint === 0x2295) ||
    (codePoint === 0x2299) ||
    (codePoint === 0x22A5) ||
    (codePoint === 0x22BF) ||
    (codePoint === 0x2312) ||
    (0x2460 <= codePoint && codePoint <= 0x24E9) ||
    (0x24EB <= codePoint && codePoint <= 0x254B) ||
    (0x2550 <= codePoint && codePoint <= 0x2573) ||
    (0x2580 <= codePoint && codePoint <= 0x258F) ||
    (0x2592 <= codePoint && codePoint <= 0x2595) ||
    (0x25A0 <= codePoint && codePoint <= 0x25A1) ||
    (0x25A3 <= codePoint && codePoint <= 0x25A9) ||
    (0x25B2 <= codePoint && codePoint <= 0x25B3) ||
    (0x25B6 <= codePoint && codePoint <= 0x25B7) ||
    (0x25BC <= codePoint && codePoint <= 0x25BD) ||
    (0x25C0 <= codePoint && codePoint <= 0x25C1) ||
    (0x25C6 <= codePoint && codePoint <= 0x25C8) ||
    (codePoint === 0x25CB) ||
    (0x25CE <= codePoint && codePoint <= 0x25D1) ||
    (0x25E2 <= codePoint && codePoint <= 0x25E5) ||
    (codePoint === 0x25EF) ||
    (0x2605 <= codePoint && codePoint <= 0x2606) ||
    (codePoint === 0x2609) ||
    (0x260E <= codePoint && codePoint <= 0x260F) ||
    (0x2614 <= codePoint && codePoint <= 0x2615) ||
    (codePoint === 0x261C) ||
    (codePoint === 0x261E) ||
    (codePoint === 0x2640) ||
    (codePoint === 0x2642) ||
    (0x2660 <= codePoint && codePoint <= 0x2661) ||
    (0x2663 <= codePoint && codePoint <= 0x2665) ||
    (0x2667 <= codePoint && codePoint <= 0x266A) ||
    (0x266C <= codePoint && codePoint <= 0x266D) ||
    (codePoint === 0x266F) ||
    (0x269E <= codePoint && codePoint <= 0x269F) ||
    (0x26BE <= codePoint && codePoint <= 0x26BF) ||
    (0x26C4 <= codePoint && codePoint <= 0x26CD) ||
    (0x26CF <= codePoint && codePoint <= 0x26E1) ||
    (codePoint === 0x26E3) ||
    (0x26E8 <= codePoint && codePoint <= 0x26FF) ||
    (codePoint === 0x273D) ||
    (codePoint === 0x2757) ||
    (0x2776 <= codePoint && codePoint <= 0x277F) ||
    (0x2B55 <= codePoint && codePoint <= 0x2B59) ||
    (0x3248 <= codePoint && codePoint <= 0x324F) ||
    (0xE000 <= codePoint && codePoint <= 0xF8FF) ||
    (0xFE00 <= codePoint && codePoint <= 0xFE0F) ||
    (codePoint === 0xFFFD) ||
    (0x1F100 <= codePoint && codePoint <= 0x1F10A) ||
    (0x1F110 <= codePoint && codePoint <= 0x1F12D) ||
    (0x1F130 <= codePoint && codePoint <= 0x1F169) ||
    (0x1F170 <= codePoint && codePoint <= 0x1F19A) ||
    (0xE0100 <= codePoint && codePoint <= 0xE01EF) ||
    (0xF0000 <= codePoint && codePoint <= 0xFFFFD) ||
    (0x100000 <= codePoint && codePoint <= 0x10FFFD)
  ) return 'A';

  return 'N';
};

eaw.characterLength = function(character) {
  const widthCategory = this.eastAsianWidth(character);
  return (widthCategory === 'F' || widthCategory === 'W' || widthCategory === 'A') ? 2 : 1;
};

function stringToArray(string) {
  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

eaw.length = function(string) {
  const characters = stringToArray(string);
  return characters.reduce((total, char) => total + this.characterLength(char), 0);
};

eaw.slice = function(text, start = 0, end = 1) {
  const textLen = eaw.length(text);
  if (start < 0) start += textLen;
  if (end < 0) end += textLen;

  let result = '';
  let eawLen = 0;
  const chars = stringToArray(text);

  for (const char of chars) {
    const charLen = eaw.characterLength(char);
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
