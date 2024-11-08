class SimpleTestFramework {
  constructor() {
    this.testCases = [];
    this.snapshots = {};
  }
  
  addTest(description, executeTest) {
    this.testCases.push({ description, executeTest });
  }

  executeTests() {
    const failedTests = [];
    const passedTests = [];
  
    const execute = ({ description, executeTest }) => {
      try {
        executeTest();
        passedTests.push({ description });
        console.log(`✓ ${description}`);
      } catch (error) {
        failedTests.push({ description });
        console.error(`✗ ${description}`);
        console.error(`\t${error.message}`);
      }
    };
  
    failedTests.forEach(execute);
    this.testCases.forEach(execute);
  }

  validateSnapshot(snapshotName, value) {
    const serialized = JSON.stringify(value, null, 2);
    const existingSnapshot = this.snapshots[snapshotName];
  
    if (!existingSnapshot) {
      this.snapshots[snapshotName] = serialized;
      console.log(`Created new snapshot: ${snapshotName}`);
    } else if (existingSnapshot !== serialized) {
      throw new Error(`Mismatch found in snapshot: "${snapshotName}".`);
    }
  }
}

// Usage example
const testFramework = new SimpleTestFramework();

testFramework.addTest('addition works', () => {
  const result = 1 + 1;
  if (result !== 2) throw new Error('Failed addition test');
});

testFramework.addTest('validate snapshot', () => {
  const componentTree = { type: 'div', props: { className: 'container' }, children: [] };
  testFramework.validateSnapshot('component-structure', componentTree);
});

testFramework.executeTests();
