// html-escaper.js
const escapeMap = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ["'", '&#39;'],
  ['"', '&quot;']
]);

const unescapeMap = new Map([
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&#39;', "'"],
  ['&quot;', '"']
]);

const escaper = /[&<>'"]/g;
const unescaper = /&(amp|lt|gt|#39|quot);/g;

function escape(str) {
  return str.replace(escaper, match => escapeMap.get(match));
}

function unescape(str) {
  return str.replace(unescaper, match => unescapeMap.get(match));
}

export { escape, unescape };
