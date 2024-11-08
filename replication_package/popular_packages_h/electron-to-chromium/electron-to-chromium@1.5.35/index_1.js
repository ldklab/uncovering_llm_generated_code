const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

const electronToChromium = (query) => {
  const number = getQueryString(query);
  return number.includes('.') ? fullVersions[number] : versions[number];
};

const chromiumToElectron = (query) => {
  const number = getQueryString(query);
  return number.includes('.') ? fullChromiumVersions[number] : chromiumVersions[number];
};

const electronToBrowserList = (query) => {
  const number = getQueryString(query);
  return versions[number] ? `Chrome >= ${versions[number]}` : undefined;
};

const getQueryString = (query) => {
  if (query === 1) return "1.0";
  return typeof query === 'number' ? query.toString() : query;
};

module.exports = {
  versions,
  fullVersions,
  chromiumVersions,
  fullChromiumVersions,
  electronToChromium,
  electronToBrowserList,
  chromiumToElectron
};
