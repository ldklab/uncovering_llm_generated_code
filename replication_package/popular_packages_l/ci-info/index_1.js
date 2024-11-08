const ciInfo = {
  isCI: false,
  name: null,
  isPR: null
};

const VENDORS = [
  { name: 'Travis CI', constant: 'TRAVIS', env: 'TRAVIS', isPR: 'TRAVIS_PULL_REQUEST' },
  { name: 'CircleCI', constant: 'CIRCLE', env: 'CIRCLECI', isPR: 'CIRCLE_PULL_REQUEST' },
  { name: 'GitHub Actions', constant: 'GITHUB_ACTIONS', env: 'GITHUB_ACTIONS', isPR: 'GITHUB_EVENT_NAME' },
  { name: 'Jenkins CI', constant: 'JENKINS', env: 'JENKINS_URL', isPR: 'CHANGE_ID' },
  // More vendors can be added here
];

ciInfo.isCI = VENDORS.some(vendor => process.env[vendor.env] !== undefined);

if (ciInfo.isCI) {
  const currentVendor = VENDORS.find(vendor => process.env[vendor.env] !== undefined);
  if (currentVendor) {
    ciInfo.name = currentVendor.name;
    ciInfo.isPR = currentVendor.isPR ? !!process.env[currentVendor.isPR] && process.env[currentVendor.isPR] !== 'false' : null;
    VENDORS.forEach(vendor => {
      ciInfo[vendor.constant] = vendor.name === ciInfo.name;
    });
  }
} else {
  VENDORS.forEach(vendor => {
    ciInfo[vendor.constant] = false;
  });
}

if (ciInfo.isCI) {
  console.log('The name of the CI server is:', ciInfo.name);
} else {
  console.log('This program is not running on a CI server');
}
```