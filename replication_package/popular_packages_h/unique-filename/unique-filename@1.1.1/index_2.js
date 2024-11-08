'use strict';
const path = require('path');
const uniqueSlug = require('unique-slug');

module.exports = function generateUniquePath(filepath, prefix = '', uniq) {
  const slug = uniqueSlug(uniq);
  const prefixedSlug = prefix ? `${prefix}-${slug}` : slug;
  return path.join(filepath, prefixedSlug);
};
