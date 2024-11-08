// Required Dependencies
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

function encode(text, options = {}) {
  const { mode = 'specialChars' } = options;
  const entityMap = mode === 'specialChars' ? htmlCharacterMap : {};

  return text.replace(
    /[<>&"']/g,
    (char) => entityMap[char] || char
  );
}

function decode(text, options = {}) {
  const regex = /&[^;\s]*;?/g;
  return text.replace(regex, (entity) => reverseHtmlCharacterMap[entity] || entity);
}

function decodeEntity(entity, options = {}) {
  return reverseHtmlCharacterMap[entity] || entity;
}

export { encode, decode, decodeEntity };
