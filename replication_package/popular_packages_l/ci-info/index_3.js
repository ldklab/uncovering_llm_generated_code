const ciInfo = require('ci-info');

if (ciInfo.isCI) {
  console.log('The name of the CI server is:', ciInfo.name);
} else {
  console.log('This program is not running on a CI server');
}

// ci-info/index.js

const VENDORS = [
  { name: 'Travis CI', env: 'TRAVIS', constant: 'TRAVIS', isPR: 'TRAVIS_PULL_REQUEST' },
  { name: 'CircleCI', env: 'CIRCLECI', constant: 'CIRCLE', isPR: 'CIRCLE_PULL_REQUEST' },
  { name: 'GitHub Actions', env: 'GITHUB_ACTIONS', constant: 'GITHUB_ACTIONS', isPR: 'GITHUB_EVENT_NAME' },
  { name: 'Jenkins CI', env: 'JENKINS_URL', constant: 'JENKINS', isPR: 'CHANGE_ID' },
  // Additional CI systems can be specified here...
];

const ciInfo = {
  isCI: VENDORS.some(vendor => process.env[vendor.env] !== undefined),
  name: null,
  isPR: null
};

if (ciInfo.isCI) {
  const detectedVendor = VENDORS.find(vendor => process.env[vendor.env] !== undefined);
  ciInfo.name = detectedVendor.name;
  ciInfo.isPR = detectedVendor.isPR ? Boolean(process.env[detectedVendor.isPR]) && process.env[detectedVendor.isPR] !== 'false' : null;
  VENDORS.forEach(vendor => {
    ciInfo[vendor.constant] = vendor.name === ciInfo.name;
  });
} else {
  VENDORS.forEach(vendor => {
    ciInfo[vendor.constant] = false;
  });
}

module.exports = ciInfo;
```