// emoji-regex/index.js

const getEmojiPattern = require('emoji-test-regex-pattern'); // Hypothetical module

// Function to generate regex for emoji matching
function generateEmojiRegex() {
  // Retrieve the emoji regex pattern
  const emojiRegexPattern = getEmojiPattern(); // Assume the module returns a regex pattern string
  return new RegExp(emojiRegexPattern, 'gu'); // Create a RegExp object with global and unicode flags
}

module.exports = generateEmojiRegex; // Export the function for external use
