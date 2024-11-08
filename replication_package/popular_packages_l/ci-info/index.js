var ci = require('ci-info');

if (ci.isCI) {
  console.log('The name of the CI server is:', ci.name);
} else {
  console.log('This program is not running on a CI server');
}
```

Below is the implementation of this package:

```markdown
// ci-info/index.js

const VENDORS = [
  { name: 'Travis CI', constant: 'TRAVIS', env: 'TRAVIS', isPR: 'TRAVIS_PULL_REQUEST' },
  { name: 'CircleCI', constant: 'CIRCLE', env: 'CIRCLECI', isPR: 'CIRCLE_PULL_REQUEST' },
  { name: 'GitHub Actions', constant: 'GITHUB_ACTIONS', env: 'GITHUB_ACTIONS', isPR: 'GITHUB_EVENT_NAME' },
  { name: 'Jenkins CI', constant: 'JENKINS', env: 'JENKINS_URL', isPR: 'CHANGE_ID' },
  // ... include other vendors as per the README
];

const ciInfo = {};

ciInfo.isCI = VENDORS.some(v => process.env[v.env] !== undefined);

ciInfo.name = null;
ciInfo.isPR = null;

if (ciInfo.isCI) {
  const vendor = VENDORS.find(v => process.env[v.env] !== undefined);
  ciInfo.name = vendor.name;
  ciInfo.isPR = vendor.isPR ? !!process.env[vendor.isPR] && process.env[vendor.isPR] !== 'false' : null;
  VENDORS.forEach(v => {
    ciInfo[v.constant] = v.name === ciInfo.name;
  });
  if (!ciInfo[vendor.constant]) {
    ciInfo[vendor.constant] = true;
  }
} else {
  VENDORS.forEach(v => {
    ciInfo[v.constant] = false;
  });
}

module.exports = ciInfo;

```

The code uses standard Node.js techniques to check environment variables predefined by the CI environments to determine which CI, if any, is currently running the code. The constants and detection conditions are tailored to match the information provided in the README.