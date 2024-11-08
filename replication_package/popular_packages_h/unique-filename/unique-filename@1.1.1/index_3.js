'use strict';
const path = require('path');
const uniqueSlug = require('unique-slug');

module.exports = function createFilePath(filepath, prefix = '', uniq) {
  const slug = uniqueSlug(uniq);
  const prefixWithSeparator = prefix ? `${prefix}-` : '';
  const finalPath = path.join(filepath, `${prefixWithSeparator}${slug}`);
  return finalPath;
};
