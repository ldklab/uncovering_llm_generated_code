// Required Dependencies
const htmlCharacterMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};

// Reverse map for decoding
const reverseHtmlCharacterMap = Object.fromEntries(
  Object.entries(htmlCharacterMap).map(([key, value]) => [value, key])
);

// Helper function to encode text based on mode options
function encode(text, { mode = 'specialChars' } = {}) {
  const entityMap = htmlCharacterMap;
  
  switch (mode) {
    case 'specialChars':
      return text.replace(/[&<>"']/g, (char) => entityMap[char] || char);
    // Additional cases for other modes can be added here
  }

  return text; // Fallback if mode not matched
}

// Helper function to decode text using regex for entities
function decode(text) {
  return text.replace(/&[^;\s]+;?/g, (entity) => reverseHtmlCharacterMap[entity] || entity);
}

// Single entity decoder
function decodeEntity(entity) {
  return reverseHtmlCharacterMap[entity] || entity;
}

export { encode, decode, decodeEntity };
