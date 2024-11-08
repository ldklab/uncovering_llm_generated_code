class SimpleTestFramework {
  constructor() {
    this.testCases = [];
    this.snapshots = {};
  }

  // Method to define a test case
  addTest(description, callback) {
    this.testCases.push({ description, callback });
  }

  // Method to execute all tests, prioritize re-running failed tests
  executeTests() {
    const failedTests = [];
    const runTestCase = (testCase) => {
      try {
        testCase.callback();
        console.log(`✓ ${testCase.description}`);
      } catch (error) {
        failedTests.push(testCase);
        console.error(`✗ ${testCase.description}`, `\n\t${error.message}`);
      }
    };

    // Prioritize running failed tests first, followed by all tests
    failedTests.concat(this.testCases).forEach(runTestCase);
  }

  // Method to verify or create a snapshot
  verifySnapshot(name, value) {
    const serializedValue = JSON.stringify(value, null, 2);
    if (this.snapshots[name] === undefined) {
      this.snapshots[name] = serializedValue;
      console.log(`New snapshot created: ${name}`);
    } else if (this.snapshots[name] !== serializedValue) {
      throw new Error(`Snapshot "${name}" mismatch.`);
    }
  }
}

// Example usage
const testFramework = new SimpleTestFramework();

// Define tests
testFramework.addTest('Simple addition test', () => {
  if (1 + 1 !== 2) throw new Error('Addition test failed');
});

testFramework.addTest('Snapshot test', () => {
  const exampleTree = { type: 'div', props: { className: 'container' }, children: [] };
  testFramework.verifySnapshot('example-structure', exampleTree);
});

// Execute all tests
testFramework.executeTests();
