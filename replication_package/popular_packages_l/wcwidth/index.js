// wcwidth.js

function wcwidth(char) {
  const code = char.codePointAt(0);
  if (code === 0) return 0;
  if (isControl(code)) return -1;
  if (isWide(code)) return 2;
  return 1;
}

function wcswidth(str) {
  let width = 0;
  for (let char of str) {
    const w = wcwidth(char);
    if (w < 0) return -1;
    width += w;
  }
  return width;
}

function isControl(code) {
  return (code < 32 || (code >= 0x7f && code < 0xa0));
}

function isWide(code) {
  // These ranges are a simple and not exhaustive representation 
  // of wide character definitions.
  return (
    (code >= 0x1100 && (
      code <= 0x115f ||  // Hangul Jamo init.
      code === 0x2329 || code === 0x232a ||
      (code >= 0x2e80 && code <= 0xa4cf &&
        code !== 0x303f) ||  // CJK excluding YI
      (code >= 0xac00 && code <= 0xd7a3) ||  // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) ||  // CJK Compatibility Ideographs
      (code >= 0xfe10 && code <= 0xfe19) ||  // Vertical forms
      (code >= 0xfe30 && code <= 0xfe6f) ||  // CJK Compatibility Forms
      (code >= 0xff00 && code <= 0xff60) ||  // Fullwidth Forms
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x20000 && code <= 0x2fffd) ||
      (code >= 0x30000 && code <= 0x3fffd)
    ))
  );
}

// Export functions for public use.
module.exports = { wcwidth, wcswidth };

// Example Usage
console.log(wcwidth('한'));    // => 2
console.log(wcswidth('한글')); // => 4
