// Jest-like minimal testing framework
class Jest {
  constructor() {
    this.testCases = [];
    this.snapshots = {};
  }

  // Register a test case with a description and callback function
  test(description, callback) {
    this.testCases.push({ description, callback });
  }

  // Execute all test cases, prioritizing rerunning failed tests
  runTests() {
    let failedTests = [];
    let passedTests = [];

    const executeTest = (testCase) => {
      try {
        testCase.callback();
        passedTests.push(testCase);
        console.log(`✓ ${testCase.description}`);
      } catch (error) {
        failedTests.push(testCase);
        console.error(`✗ ${testCase.description}`);
        console.error(`\t${error.message}`);
      }
    };

    // Prioritize rerunning failed tests
    failedTests.forEach(executeTest);
    this.testCases.forEach(executeTest);
  }

  // Create or validate snapshots for given values
  snapshot(name, value) {
    const serializedValue = JSON.stringify(value, null, 2);
    const existingSnapshot = this.snapshots[name];

    if (!existingSnapshot) {
      // Create a new snapshot if none exists
      this.snapshots[name] = serializedValue;
      console.log(`New snapshot created: ${name}`);
    } else if (existingSnapshot !== serializedValue) {
      throw new Error(`Snapshot "${name}" does not match.`);
    }
  }
}

// Example usage of the Jest-like framework
const jest = new Jest();

// Register test cases
jest.test('simple addition', () => {
  const result = 1 + 1;
  if (result !== 2) throw new Error('Addition test failed');
});

jest.test('snapshot test', () => {
  const reactTree = { type: 'div', props: { className: 'container' }, children: [] };
  jest.snapshot('react-structure', reactTree);
});

// Execute all registered tests
jest.runTests();
