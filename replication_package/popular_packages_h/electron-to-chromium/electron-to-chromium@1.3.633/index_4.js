const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

function electronToChromium(query) {
  const number = getQueryString(query);
  return number.split('.').length > 2 ? fullVersions[number] : versions[number] || undefined;
}

function chromiumToElectron(query) {
  const number = getQueryString(query);
  return number.split('.').length > 2 ? fullChromiumVersions[number] : chromiumVersions[number] || undefined;
}

function electronToBrowserList(query) {
  const number = getQueryString(query);
  return versions[number] ? `Chrome >= ${versions[number]}` : undefined;
}

function getQueryString(query) {
  let number = query;
  if (query === 1) { number = "1.0"; }
  if (typeof query === 'number') { number = number.toString(); }
  return number;
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