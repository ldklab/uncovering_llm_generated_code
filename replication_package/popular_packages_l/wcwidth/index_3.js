// widthCalculator.js

// Function for single character width calculation
function calculateCharWidth(character) {
  const codePoint = character.codePointAt(0);
  if (codePoint === 0) return 0; // Null character
  if (isControlCharacter(codePoint)) return -1; // Control characters
  if (isWideCharacter(codePoint)) return 2; // Wide characters
  return 1; // Regular character width
}

// Function for calculating the width of a string
function calculateStringWidth(inputString) {
  let totalWidth = 0;
  for (let character of inputString) {
    const charWidth = calculateCharWidth(character);
    if (charWidth < 0) return -1; // Return -1 if a control character is encountered
    totalWidth += charWidth;
  }
  return totalWidth;
}

// Helper function to check for control characters
function isControlCharacter(codePoint) {
  return codePoint < 32 || (codePoint >= 0x7F && codePoint < 0xA0);
}

// Helper function to check for wide characters
function isWideCharacter(codePoint) {
  // Recognized wide character ranges
  return (
    (codePoint >= 0x1100 && (
      codePoint <= 0x115F || // Hangul Jamo init.
      codePoint === 0x2329 || codePoint === 0x232A ||
      (codePoint >= 0x2E80 && codePoint <= 0xA4CF && codePoint !== 0x303F) || // CJK excluding YI
      (codePoint >= 0xAC00 && codePoint <= 0xD7A3) || // Hangul Syllables
      (codePoint >= 0xF900 && codePoint <= 0xFAFF) || // CJK Compatibility Ideographs
      (codePoint >= 0xFE10 && codePoint <= 0xFE19) || // Vertical forms
      (codePoint >= 0xFE30 && codePoint <= 0xFE6F) || // CJK Compatibility Forms
      (codePoint >= 0xFF00 && codePoint <= 0xFF60) ||
      (codePoint >= 0xFFE0 && codePoint <= 0xFFE6) ||
      (codePoint >= 0x20000 && codePoint <= 0x2FFFD) ||
      (codePoint >= 0x30000 && codePoint <= 0x3FFFD)
    ))
  );
}

// Export functions for usage in other modules
module.exports = {
  calculateCharWidth,
  calculateStringWidth,
};

// Example demonstrating usage
console.log(calculateCharWidth('한'));    // Output: 2
console.log(calculateStringWidth('한글')); // Output: 4
