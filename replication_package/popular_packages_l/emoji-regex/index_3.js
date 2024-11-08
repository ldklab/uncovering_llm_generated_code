// emoji-regex/index.js

const emojiTestPattern = require('emoji-test-regex-pattern'); // Hypothetical module for emoji pattern

// Function to create a regex pattern for matching emojis
function generateEmojiRegex() {
  const emojiPattern = emojiTestPattern(); // Get the pattern from the module
  return new RegExp(emojiPattern, 'gu'); // Return a new regex with global and unicode flags
}

module.exports = generateEmojiRegex; // Export the function
