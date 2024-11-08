const crypto = require('crypto');
const path = require('path');

function generateUniquePart(uniqstr) {
  return uniqstr
    ? crypto.createHash('sha256').update(uniqstr).digest('hex').slice(0, 8)
    : crypto.randomBytes(4).toString('hex');
}

function uniqueFilename(dir, fileprefix = '', uniqstr = null) {
  const uniquePart = generateUniquePart(uniqstr);
  const filename = fileprefix ? `${fileprefix}-${uniquePart}` : uniquePart;
  return path.join(dir, filename);
}

module.exports = uniqueFilename;
