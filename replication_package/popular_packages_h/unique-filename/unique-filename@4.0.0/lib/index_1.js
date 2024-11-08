const path = require('path');
const uniqueSlug = require('unique-slug');

function generateFilePath(filepath, prefix, uniq) {
  const slug = uniqueSlug(uniq);
  const prefixedSlug = prefix ? `${prefix}-${slug}` : slug;
  return path.join(filepath, prefixedSlug);
}

module.exports = generateFilePath;
