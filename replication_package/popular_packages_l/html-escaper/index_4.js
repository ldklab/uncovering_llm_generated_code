// html-escaper.js

// Mappings for escaping and unescaping
const htmlEscapeChars = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

const htmlUnescapeChars = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
  '&quot;': '"'
};

// Regular expressions for finding escape and unescape patterns
const escapePattern = /[&<>'"]/g;
const unescapePattern = /&(amp|lt|gt|#39|quot);/g;

// Function to escape HTML characters
function escapeHtml(string) {
  return string.replace(escapePattern, match => htmlEscapeChars[match]);
}

// Function to unescape HTML characters
function unescapeHtml(string) {
  return string.replace(unescapePattern, match => htmlUnescapeChars[match]);
}

// Exporting the escape and unescape functions
export { escapeHtml as escape, unescapeHtml as unescape };
