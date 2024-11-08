const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

function electronToChromium(query) {
  const number = standardizeQuery(query);
  return number.includes('.') && number.split('.').length > 2 
    ? fullVersions[number] 
    : versions[number] || undefined;
}

function chromiumToElectron(query) {
  const number = standardizeQuery(query);
  return number.includes('.') && number.split('.').length > 2 
    ? fullChromiumVersions[number] 
    : chromiumVersions[number] || undefined;
}

function electronToBrowserList(query) {
  const number = standardizeQuery(query);
  return versions[number] ? `Chrome >= ${versions[number]}` : undefined;
}

function standardizeQuery(query) {
  if (query === 1) return "1.0";
  return typeof query === 'number' ? String(query) : query;
}

module.exports = {
  versions,
  fullVersions,
  chromiumVersions,
  fullChromiumVersions,
  electronToChromium,
  electronToBrowserList,
  chromiumToElectron
};
