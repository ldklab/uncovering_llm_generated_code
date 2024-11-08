const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

const getVersionStr = query => {
  if (query === 1) return "1.0";
  return typeof query === 'number' ? String(query) : query;
};

const electronToChromium = query => {
  const number = getVersionStr(query);
  return number.split('.').length > 2 ? fullVersions[number] : versions[number] || undefined;
};

const chromiumToElectron = query => {
  const number = getVersionStr(query);
  return number.split('.').length > 2 ? fullChromiumVersions[number] : chromiumVersions[number] || undefined;
};

const electronToBrowserList = query => {
  const number = getVersionStr(query);
  return versions[number] ? `Chrome >= ${versions[number]}` : undefined;
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
