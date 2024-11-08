// Jest-like minimal testing framework
class Jest {
  constructor() {
    this.testCases = [];
    this.snapshots = {};
  }
  
  // Method to define a test case
  test(description, callback) {
    this.testCases.push({ description, callback });
  }

  // Method to run all tests, re-running failed tests first
  runTests() {
    let failedTests = [];
    let passedTests = [];

    const runTestCase = (testCase) => {
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

    // Run previously failed tests first
    failedTests.forEach(runTestCase);
    this.testCases.forEach(runTestCase);
  }

  // Method to create or check a snapshot
  snapshot(name, value) {
    const serializedValue = JSON.stringify(value, null, 2);
    const currentSnapshot = this.snapshots[name];

    if (!currentSnapshot) {
      // Generate new snapshot
      this.snapshots[name] = serializedValue;
      console.log(`New snapshot created: ${name}`);
    } else if (currentSnapshot !== serializedValue) {
      throw new Error(`Snapshot "${name}" does not match.`);
    }
  }
}

// Example usage
const jest = new Jest();

// Define tests
jest.test('simple addition', () => {
  const result = 1 + 1;
  if (result !== 2) throw new Error('Addition test failed');
});

jest.test('snapshot test', () => {
  const reactTree = { type: 'div', props: { className: 'container' }, children: [] };
  jest.snapshot('react-structure', reactTree);
});

// Run all tests
jest.runTests();
