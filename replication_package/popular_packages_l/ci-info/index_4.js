// Custom implementation of CI environment detection
const VENDORS = [
  { name: 'Travis CI', env: 'TRAVIS', isPR: 'TRAVIS_PULL_REQUEST' },
  { name: 'CircleCI', env: 'CIRCLECI', isPR: 'CIRCLE_PULL_REQUEST' },
  { name: 'GitHub Actions', env: 'GITHUB_ACTIONS', isPR: 'GITHUB_EVENT_NAME' },
  { name: 'Jenkins CI', env: 'JENKINS_URL', isPR: 'CHANGE_ID' },
  // Additional vendors could be added here
];

function detectCI() {
  for (const vendor of VENDORS) {
    if (process.env[vendor.env] !== undefined) {
      return vendor.name;
    }
  }
  return null;
}

const ciName = detectCI();

if (ciName) {
  console.log('The name of the CI server is:', ciName);
} else {
  console.log('This program is not running on a CI server');
}
```

This rewritten code encapsulates the CI detection logic in a `detectCI` function which iterates over predefined vendors and checks for specific environment variables. If it finds an active CI environment, it returns the name of the service; otherwise, it returns `null`. The main script uses this function to determine and print whether it is running on a CI server and which one it is, if applicable.