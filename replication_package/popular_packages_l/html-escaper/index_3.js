// html-escaper.js
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
  '&quot;': '"'
};

function escape(str) {
  return str.replace(/[&<>'"]/g, char => htmlEntities[char]);
}

function unescape(str) {
  return str.replace(/&(amp|lt|gt|#39|quot);/g, entity => htmlEntities[entity]);
}

export { escape, unescape };
