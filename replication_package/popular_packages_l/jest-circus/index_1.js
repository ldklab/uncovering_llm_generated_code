// MyEnvironment.js
const { TestEnvironment } = require('jest-environment-node');

class MyEnvironment extends TestEnvironment {
  constructor(config) {
    super(config);
  }

  async handleTestEvent(event) {
    if (event.name === 'test_start') {
      console.log(`Test started: ${event.test.name}`);
    }
  }

  async setup() {
    await super.setup();
    console.log('Environment setup complete.');
  }

  async teardown() {
    console.log('Environment teardown complete.');
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MyEnvironment;

// jest.config.js
module.exports = {
  testEnvironment: './MyEnvironment',
  testRunner: 'jest-circus/runner',
};

// package.json
{
  "name": "jest-custom-env-project",
  "version": "1.0.0",
  "description": "A Jest project with a custom environment using jest-circus",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^27.0.0",
    "jest-circus": "^27.0.0"
  }
}
