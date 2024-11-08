json
// package.json
{
  "name": "@aws-sdk/util-user-agent-browser",
  "version": "1.0.0",
  "description": "An internal package for handling user agent strings in browsers for the AWS SDK",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {},
  "dependencies": {}
}

// index.js
class UserAgentGenerator {
  static getUserAgent() {
    const isBrowser = typeof navigator !== 'undefined';
    const userAgent = isBrowser ? navigator.userAgent : 'node';
    const platform = isBrowser ? navigator.platform : 'Node.js';
    const language = isBrowser ? navigator.language : 'en-US';

    return `aws-sdk-browser/1.0 (${platform}; ${language}) ${userAgent}`;
  }
}

module.exports = { UserAgentGenerator };

// example.js
const { UserAgentGenerator } = require('./index.js');

console.log(UserAgentGenerator.getUserAgent());
