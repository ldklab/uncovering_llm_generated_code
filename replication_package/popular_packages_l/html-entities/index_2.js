// Required Dependencies
const htmlCharacterMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
  // Additional mappings can be added as needed
};

// Reverse map for decoding
const reverseHtmlCharacterMap = {};
for (const [char, entity] of Object.entries(htmlCharacterMap)) {
  reverseHtmlCharacterMap[entity] = char;
}

// Helper function to encode special characters into HTML entities
function encode(text, options = {}) {
  const { mode = 'specialChars' } = options;
  const entityMap = mode === 'specialChars' ? htmlCharacterMap : {};

  return text.replace(/[&<>"']/g, (char) => entityMap[char] || char);
}

// Helper function to decode HTML entities back to characters
function decode(text, options = {}) {
  const entityMap = reverseHtmlCharacterMap;
  return text.replace(/&[^;\s]*;?/g, (entity) => entityMap[entity] || entity);
}

// Function to decode a single HTML entity string to its character
function decodeEntity(entity, options = {}) {
  return reverseHtmlCharacterMap[entity] || entity;
}

module.exports = { encode, decode, decodeEntity };
