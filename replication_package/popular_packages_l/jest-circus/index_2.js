// my-custom-environment.js
const { TestEnvironment } = require('jest-environment-node');

class MyCustomEnvironment extends TestEnvironment {
  constructor(config) {
    super(config);
  }

  async handleTestEvent(event, state) {
    if (event.name === 'test_start') {
      console.log(`Test started: ${event.test.name}`);
    }
    // Other event handling can be added here
  }

  async setup() {
    await super.setup();
    console.log('Custom environment setup.');
  }

  async teardown() {
    console.log('Custom environment teardown.');
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MyCustomEnvironment;

// jest.config.js
module.exports = {
  testEnvironment: './my-custom-environment',
  testRunner: 'jest-circus/runner',
};

// package.json
{
  "name": "my-jest-project",
  "version": "1.0.0",
  "description": "A sample project using custom Jest environment with jest-circus",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^27.0.0",
    "jest-circus": "^27.0.0"
  }
}
