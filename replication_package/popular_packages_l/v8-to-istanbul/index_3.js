markdown
mkdir v8-to-istanbul
cd v8-to-istanbul
npm init -y

# Install necessary packages for testing
npm install mocha chai --save-dev

# index.js
const fs = require('fs').promises;
const path = require('path');

class V8ToIstanbul {
  constructor(sourceFilePath) {
    if (!sourceFilePath) throw new Error('Source file path is required');
    this.sourceFilePath = sourceFilePath;
    this.coverageInfo = [];
    this.source = '';
  }

  async load() {
    const absolutePath = path.resolve(this.sourceFilePath);
    this.source = await fs.readFile(absolutePath, 'utf8');
  }

  applyCoverage(coverageArray) {
    if (!Array.isArray(coverageArray)) {
      throw new Error('Coverage data should be an array');
    }
    this.coverageInfo = coverageArray;
  }

  toIstanbul() {
    const lines = this.source.split('\n');
    const istanbulCoverage = lines.map((line, index) => ({
      lineNumber: index + 1,
      coverageCount: 0,
    }));

    this.coverageInfo.forEach((entry) => {
      entry.ranges.forEach((range) => {
        const startLine = this.offsetToLine(range.startOffset);
        const endLine = this.offsetToLine(range.endOffset);
        for (let i = startLine; i <= endLine; i++) {
          istanbulCoverage[i].coverageCount += range.count;
        }
      });
    });

    return { path: this.sourceFilePath, lines: istanbulCoverage };
  }

  offsetToLine(offset) {
    const lines = this.source.slice(0, offset).split('\n');
    return lines.length - 1;
  }
}

module.exports = (sourceFilePath) => new V8ToIstanbul(sourceFilePath);

# Update package.json
sed -i 's/"scripts": {/"scripts": { "test": "mocha",/' package.json

# Create the test file: test/coverage.spec.js
mkdir test
echo "
const chai = require('chai');
const expect = chai.expect;
const v8toIstanbul = require('../index');

describe('V8ToIstanbul', () => {
  it('should convert V8 coverage data to Istanbul format', async () => {
    const converter = v8toIstanbul('./test/sample.js');
    await converter.load();
    converter.applyCoverage([
      {
        functionName: '',
        ranges: [
          { startOffset: 0, endOffset: 10, count: 1 },
          { startOffset: 20, endOffset: 30, count: 2 }
        ],
        isBlockCoverage: true,
      }
    ]);
    const istanbulData = converter.toIstanbul();
    expect(istanbulData).to.have.property('lines');
  });
});
" > test/coverage.spec.js

# Create a sample source file for testing
echo "const a = 1;\nconsole.log(a);" > test/sample.js
