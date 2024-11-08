// emoji-regex/index.js

const emojiPatternGenerator = require('emoji-test-regex-pattern'); // Hypothetical module

// Function to create a regular expression for emoji matching
function generateEmojiRegex() {
  // Obtain the emoji pattern from the hypothetical module
  const emojiPattern = emojiPatternGenerator(); // Hypothetical function to get the pattern
  // Create and return a regex object using the pattern with global and Unicode flags
  return new RegExp(emojiPattern, 'gu');
}

// Export the generateEmojiRegex function as a module
module.exports = generateEmojiRegex;
