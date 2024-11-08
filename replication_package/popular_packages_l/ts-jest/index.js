// package.json
{
  "name": "ts-jest-sample",
  "version": "1.0.0",
  "description": "A simple Jest transformer for TypeScript",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^27.0.0",
    "typescript": "^4.0.0",
    "@types/jest": "^27.0.0"
  },
  "license": "MIT"
}

// jest.config.js
module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest-transformer'
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
};

// ts-jest-transformer.js
const ts = require('typescript');

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts')) {
      const transpileOptions = {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          sourceMap: true
        }
      };
      const { outputText, sourceMapText } = ts.transpileModule(src, transpileOptions);
      return outputText;
    }
    return src;
  }
};

// Sample TypeScript test case
// __tests__/sum.test.ts
function sum(a: number, b: number): number {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

// Command to run the tests:
// npx jest
