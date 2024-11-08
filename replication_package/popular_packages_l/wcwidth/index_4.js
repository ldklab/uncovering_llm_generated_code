// widthCalculator.js

function charWidth(char) {
  const codePoint = char.codePointAt(0);
  if (codePoint === 0) return 0;
  if (isControlChar(codePoint)) return -1;
  if (isWideChar(codePoint)) return 2;
  return 1;
}

function stringWidth(text) {
  let totalWidth = 0;
  for (const char of text) {
    const charWidthValue = charWidth(char);
    if (charWidthValue < 0) return -1;
    totalWidth += charWidthValue;
  }
  return totalWidth;
}

function isControlChar(codePoint) {
  return (codePoint < 32 || (codePoint >= 0x7f && codePoint < 0xa0));
}

function isWideChar(codePoint) {
  return (
    (codePoint >= 0x1100 && (
      codePoint <= 0x115f ||  // Hangul Jamo init.
      codePoint === 0x2329 || codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf && codePoint !== 0x303f) ||  // CJK excluding YI
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||  // Hangul Syllables
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||  // CJK Compatibility Ideographs
      (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||  // Vertical forms
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||  // CJK Compatibility Forms
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||  // Fullwidth Forms
      (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
      (codePoint >= 0x20000 && codePoint <= 0x2fffd) ||
      (codePoint >= 0x30000 && codePoint <= 0x3fffd)
    ))
  );
}

module.exports = { charWidth, stringWidth };

// Example Usage
console.log(charWidth('한'));    // => 2
console.log(stringWidth('한글')); // => 4
