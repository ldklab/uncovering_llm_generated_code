// wcwidth.js

function wcwidth(character) {
  const codePoint = character.codePointAt(0);
  
  if (codePoint === 0) return 0; // Null character
  if (isControlCharacter(codePoint)) return -1; // Control characters
  if (isWideCharacter(codePoint)) return 2; // Wide characters
  
  return 1; // Regular characters
}

function wcswidth(string) {
  let totalWidth = 0;
  
  for (const character of string) {
    const charWidth = wcwidth(character);
    if (charWidth < 0) return -1; // In case of control character

    totalWidth += charWidth;
  }
  
  return totalWidth;
}

function isControlCharacter(code) {
  return (code < 32 || (code >= 0x7f && code < 0xa0));
}

function isWideCharacter(code) {
  return (
    (code >= 0x1100 && (
      code <= 0x115f ||  // Hangul Jamo initialization
      code === 0x2329 || code === 0x232a ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||  // CJK, excluding YI
      (code >= 0xac00 && code <= 0xd7a3) ||  // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) ||  // CJK Compatibility Ideographs
      (code >= 0xfe10 && code <= 0xfe19) ||  // Vertical Forms
      (code >= 0xfe30 && code <= 0xfe6f) ||  // CJK Compatibility Forms
      (code >= 0xff00 && code <= 0xff60) ||  // Fullwidth Forms
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x20000 && code <= 0x2fffd) ||
      (code >= 0x30000 && code <= 0x3fffd)
    ))
  );
}

module.exports = { wcwidth, wcswidth };

// Example Usage
console.log(wcwidth('한'));    // Output: 2
console.log(wcswidth('한글')); // Output: 4
