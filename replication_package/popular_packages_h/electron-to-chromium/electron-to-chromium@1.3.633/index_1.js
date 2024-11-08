const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

const getQueryString = (query) => {
  return typeof query === 'number' ? query.toString() : query === 1 ? "1.0" : query;
};

const electronToChromium = (query) => {
  const number = getQueryString(query);
  return number.split('.').length > 2 ? fullVersions[number] : versions[number] || undefined;
};

const chromiumToElectron = (query) => {
  const number = getQueryString(query);
  return number.split('.').length > 2 ? fullChromiumVersions[number] : chromiumVersions[number] || undefined;
};

const electronToBrowserList = (query) => {
  const number = getQueryString(query);
  return versions[number] ? `Chrome >= ${versions[number]}` : undefined;
};

module.exports = {
  versions,
  fullVersions,
  chromiumVersions,
  fullChromiumVersions,
  electronToChromium,
  chromiumToElectron,
  electronToBrowserList
};
