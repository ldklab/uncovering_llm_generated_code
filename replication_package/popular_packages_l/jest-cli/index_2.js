class MiniJest {
  constructor() {
    this.testCases = [];
    this.snapshots = {};
  }
  
  test(description, callback) {
    this.testCases.push({ description, callback });
  }

  runTests() {
    const failedTests = [];
    const passedTests = [];
    
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

    [...failedTests, ...this.testCases].forEach(executeTest);
  }

  snapshot(name, value) {
    const serialized = JSON.stringify(value, null, 2);
    if (!this.snapshots[name]) {
      this.snapshots[name] = serialized;
      console.log(`New snapshot created: ${name}`);
    } else if (this.snapshots[name] !== serialized) {
      throw new Error(`Snapshot "${name}" does not match.`);
    }
  }
}

// Example usage
const miniJest = new MiniJest();

miniJest.test('simple addition', () => {
  const result = 1 + 1;
  if (result !== 2) throw new Error('Addition test failed');
});

miniJest.test('snapshot test', () => {
  const tree = { type: 'div', props: { className: 'container' }, children: [] };
  miniJest.snapshot('div-structure', tree);
});

miniJest.runTests();
