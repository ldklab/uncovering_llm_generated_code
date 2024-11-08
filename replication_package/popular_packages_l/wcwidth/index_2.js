// wcwidth.js

function getCharWidth(character) {
  const charCode = character.codePointAt(0);
  if (charCode === 0) return 0;
  if (isControlCharacter(charCode)) return -1;
  return isWideCharacter(charCode) ? 2 : 1;
}

function getStringWidth(text) {
  let totalWidth = 0;
  for (const character of text) {
    const charWidth = getCharWidth(character);
    if (charWidth < 0) return -1;
    totalWidth += charWidth;
  }
  return totalWidth;
}

function isControlCharacter(charCode) {
  return (charCode < 32 || (charCode >= 0x7f && charCode < 0xa0));
}

function isWideCharacter(charCode) {
  return (
    (charCode >= 0x1100 && (
      charCode <= 0x115f ||  // Hangul Jamo initial
      charCode === 0x2329 || charCode === 0x232a ||
      (charCode >= 0x2e80 && charCode <= 0xa4cf && charCode !== 0x303f) ||
      (charCode >= 0xac00 && charCode <= 0xd7a3) ||  // Hangul Syllables
      (charCode >= 0xf900 && charCode <= 0xfaff) ||  // CJK Compatibility Ideographs
      (charCode >= 0xfe10 && charCode <= 0xfe19) ||  // Vertical forms
      (charCode >= 0xfe30 && charCode <= 0xfe6f) ||  // CJK Compatibility Forms
      (charCode >= 0xff00 && charCode <= 0xff60) ||  // Fullwidth Forms
      (charCode >= 0xffe0 && charCode <= 0xffe6) ||
      (charCode >= 0x20000 && charCode <= 0x2fffd) ||
      (charCode >= 0x30000 && charCode <= 0x3fffd)
    ))
  );
}

module.exports = { getCharWidth, getStringWidth };

// Example Usage
console.log(getCharWidth('한'));    // => 2
console.log(getStringWidth('한글')); // => 4
