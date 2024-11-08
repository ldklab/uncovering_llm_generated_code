// A hypothetical module providing an emoji regex pattern
const emojiPatternProvider = require('emoji-test-regex-pattern');

// Function to create a regex for matching emojis
function generateEmojiRegex() {
  // Obtain the emoji pattern from the provider module
  const emojiPattern = emojiPatternProvider();
  // Construct and return a RegExp object using the obtained pattern
  return new RegExp(emojiPattern, 'gu');
}

// Export the generateEmojiRegex function as a module
module.exports = generateEmojiRegex;
