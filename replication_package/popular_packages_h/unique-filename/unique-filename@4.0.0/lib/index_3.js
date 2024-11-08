const path = require('path');
const uniqueSlug = require('unique-slug');

module.exports = function createUniquePath(basePath, optionalPrefix, uniqueInput) {
  const prefixPart = optionalPrefix ? `${optionalPrefix}-` : '';
  const uniquePart = uniqueSlug(uniqueInput);
  return path.join(basePath, `${prefixPart}${uniquePart}`);
};
