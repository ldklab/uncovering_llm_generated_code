// emoji-regex/index.js

const emojiPattern = require('emoji-test-regex-pattern'); // Hypothetical module

// Function to generate regex pattern
function createEmojiRegex() {
  // Generate the regex pattern using the `emoji-test-regex-pattern` module
  const pattern = emojiPattern(); // Hypothetical function call
  return new RegExp(pattern, 'gu');
}

module.exports = createEmojiRegex;
