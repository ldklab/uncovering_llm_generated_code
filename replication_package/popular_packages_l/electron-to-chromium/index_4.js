// electron-to-chromium/index.js
const versions = require('./versions');
const fullVersions = require('./full-versions');
const chromiumVersions = require('./chromium-versions');
const fullChromiumVersions = require('./full-chromium-versions');

function electronToChromium(query) {
  return fullVersions[query] || versions[query] || undefined;
}

function chromiumToElectron(query) {
  return fullChromiumVersions[query] || chromiumVersions[query] || undefined;
}

function electronToBrowserList(query) {
  console.warn('electronToBrowserList is deprecated.');
  const chromeVersion = electronToChromium(query);
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

// Optionally add build.js and test scripts if required for updating and testing package functionality.
```