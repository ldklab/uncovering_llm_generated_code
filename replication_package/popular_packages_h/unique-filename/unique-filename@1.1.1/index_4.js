'use strict';
const path = require('path');
const uniqueSlug = require('unique-slug');

function generateFilePath(basePath, prefix, uniqInput) {
  const slug = uniqueSlug(uniqInput);
  const formattedPrefix = prefix ? `${prefix}-` : '';
  return path.join(basePath, `${formattedPrefix}${slug}`);
}

module.exports = generateFilePath;
