const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

const getQueryString = (query) => {
  if (query === 1) return "1.0";
  return typeof query === 'number' ? query.toString() : query;
};

const electronToChromium = (query) => {
  const versionString = getQueryString(query);
  return versionString.includes('.') ? fullVersions[versionString] : versions[versionString];
};

const chromiumToElectron = (query) => {
  const versionString = getQueryString(query);
  return versionString.includes('.') ? fullChromiumVersions[versionString] : chromiumVersions[versionString];
};

const electronToBrowserList = (query) => {
  const versionString = getQueryString(query);
  return versions[versionString] ? `Chrome >= ${versions[versionString]}` : undefined;
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
