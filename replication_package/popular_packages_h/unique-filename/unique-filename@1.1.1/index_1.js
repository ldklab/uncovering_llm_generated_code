'use strict';
const path = require('path');
const uniqueSlug = require('unique-slug');

function generateUniqueFilePath(filepath, prefix, uniq) {
  const slug = uniqueSlug(uniq);
  const prefixedSlug = prefix ? `${prefix}-` : '';
  return path.join(filepath, `${prefixedSlug}${slug}`);
}

module.exports = generateUniqueFilePath;
