markdown
// Required Dependencies
const htmlCharacterMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  // Extend map for non-ASCII and other characters with named references as required
};
// Reverse map for decoding
const reverseHtmlCharacterMap = Object.entries(htmlCharacterMap).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

// Helper function to encode text based on mode and level options
function encode(text, options = {}) {
  const { mode = 'specialChars', level = 'all', numeric = 'decimal' } = options;
  let entityMap = {};

  // Determine which characters to encode
  switch (mode) {
    case 'specialChars':
      entityMap = htmlCharacterMap;
      break;
    // Additional cases for other modes
  }
  return text.replace(
    /[<>&"']/g, // Regex should match characters from entityMap
    (char) => entityMap[char] || char
  );
}

// Helper function to decode text based on level and scope options
function decode(text, options = {}) {
  const { level = 'all', scope = 'body' } = options;
  let entityMap = reverseHtmlCharacterMap;

  // Determine replacements based on scope
  let regex = /&[^;\s]*;?/g; // Simple regex for entities
  return text.replace(regex, (entity) => entityMap[entity] || entity);
}

// Single entity decoder
function decodeEntity(entity, options = {}) {
  const { level = 'all' } = options;
  return reverseHtmlCharacterMap[entity] || entity;
}

export { encode, decode, decodeEntity };
