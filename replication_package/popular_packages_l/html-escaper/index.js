markdown
// html-escaper.js
const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

const unescapeMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
  '&quot;': '"'
};

const escaper = /[&<>'"]/g;
const unescaper = /&(amp|lt|gt|#39|quot);/g;

function escape(str) {
  return str.replace(escaper, match => escapeMap[match]);
}

function unescape(str) {
  return str.replace(unescaper, match => unescapeMap[match]);
}

export { escape, unescape };
