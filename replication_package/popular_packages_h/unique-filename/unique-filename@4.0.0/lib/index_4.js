const path = require('path');
const uniqueSlug = require('unique-slug');

function generateFilePath(filepath, prefix = '', uniq) {
  const slug = uniqueSlug(uniq);
  const prefixString = prefix ? `${prefix}-` : '';
  return path.join(filepath, `${prefixString}${slug}`);
}

module.exports = generateFilePath;
