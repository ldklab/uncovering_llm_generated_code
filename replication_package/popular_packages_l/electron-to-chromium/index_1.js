// electron-to-chromium/index.js
const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

/**
 * Maps an Electron version to a corresponding Chromium version.
 * @param {string} version - The Electron version.
 * @returns {string|undefined} - The Chromium version or undefined if not found.
 */
function electronToChromium(version) {
  return fullVersions[version] || versions[version];
}

/**
 * Maps a Chromium version to a corresponding Electron version.
 * @param {string} version - The Chromium version.
 * @returns {string|undefined} - The Electron version or undefined if not found.
 */
function chromiumToElectron(version) {
  return fullChromiumVersions[version] || chromiumVersions[version];
}

/**
 * Converts an Electron version to a Browserlist-compatible Chrome version string.
 * @param {string} version - The Electron version.
 * @returns {string|undefined} - The Browserlist string or undefined if not found.
 */
function electronToBrowserList(version) {
  console.warn('electronToBrowserList is deprecated.');
  const chromeVersion = electronToChromium(version);
  return chromeVersion ? `Chrome >= ${chromeVersion}` : undefined;
}

module.exports = {
  versions,
  fullVersions,
  chromiumVersions,
  fullChromiumVersions,
  electronToChromium,
  chromiumToElectron,
  electronToBrowserList,
};

// electron-to-chromium/versions.js
module.exports = {
  '1.4': '53',
  '1.5': '54',
};

// electron-to-chromium/full-versions.js
module.exports = {
  '1.4.11': '53.0.2785.143',
  '1.5.0': '54.0.2840.100',
};

// electron-to-chromium/chromium-versions.js
module.exports = {
  '53': '1.4',
  '54': '1.5',
};

// electron-to-chromium/full-chromium-versions.js
module.exports = {
  '53.0.2785.143': ['1.4.11'],
  '54.0.2840.101': ['1.5.0', '1.5.1'],
};

// Note: Additional build and test scripts may be implemented as necessary.
```