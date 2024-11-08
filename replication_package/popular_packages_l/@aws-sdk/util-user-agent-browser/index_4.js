json
// package.json
{
  "name": "@aws-sdk/util-user-agent-browser",
  "version": "1.0.0",
  "description": "An internal package for handling user agent strings in browsers for the AWS SDK",
  "main": "index.js",
  "scripts": {
    "start": "node example.js"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {},
  "dependencies": {}
}

// index.js
class UserAgentGenerator {
  static getUserAgent() {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'node';
    const platform = typeof navigator !== 'undefined' ? navigator.platform : 'Node.js';
    const language = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

    return `aws-sdk-browser/1.0 (${platform}; ${language}) ${userAgent}`;
  }
}

module.exports = { UserAgentGenerator };

// example.js
const { UserAgentGenerator } = require('./index.js');

console.log(UserAgentGenerator.getUserAgent());
