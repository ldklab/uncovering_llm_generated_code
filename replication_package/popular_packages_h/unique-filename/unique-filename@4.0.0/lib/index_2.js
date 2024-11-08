const path = require('path');
const uniqueSlug = require('unique-slug');

function generateUniqueFilePath(filepath, prefix = '', uniq) {
  const prefixPart = prefix ? `${prefix}-` : '';
  const uniqueFilename = `${prefixPart}${uniqueSlug(uniq)}`;
  return path.join(filepath, uniqueFilename);
}

module.exports = generateUniqueFilePath;
