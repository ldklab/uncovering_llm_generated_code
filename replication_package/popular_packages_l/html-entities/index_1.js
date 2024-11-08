// Character maps for HTML encoding and decoding
const htmlCharacterMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const reverseHtmlCharacterMap = Object.fromEntries(
  Object.entries(htmlCharacterMap).map(([key, value]) => [value, key])
);

// Function to encode special HTML characters in a string
function encode(text, options = {}) {
  const { mode = 'specialChars' } = options;
  const entityMap = mode === 'specialChars' ? htmlCharacterMap : {};
  return text.replace(/[<>&"']/g, (char) => entityMap[char] || char);
}

// Function to decode HTML entities in a string
function decode(text, options = {}) {
  const entityMap = reverseHtmlCharacterMap;
  return text.replace(/&[^;\s]*;?/g, (entity) => entityMap[entity] || entity);
}

// Function to decode a single HTML entity
function decodeEntity(entity, options = {}) {
  return reverseHtmlCharacterMap[entity] || entity;
}

export { encode, decode, decodeEntity };
