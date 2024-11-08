json
// package.json
{
  "name": "ts-api-utils",
  "version": "1.0.0",
  "description": "Utility functions for working with TypeScript's API",
  "main": "index.js",
  "types": "index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "mocha --require ts-node/register test/**/*.test.ts"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/JoshuaKGoldberg/ts-api-utils.git"
  },
  "keywords": [
    "typescript",
    "utilities",
    "api"
  ],
  "author": "Joshua K Goldberg",
  "license": "MIT",
  "dependencies": {
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "ts-node": "^10.0.0",
    "mocha": "^9.0.0",
    "chai": "^4.0.0" // Added chai as it is used in tests
  }
}
