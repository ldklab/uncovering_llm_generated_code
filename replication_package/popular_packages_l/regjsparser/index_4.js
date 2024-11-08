// File: index.js
const parse = (pattern, flags = '', options = {}) => {
  return {
    type: 'RegExp',
    pattern: pattern,
    flags: flags,
    options: options,
    tree: `ParsedTree(${pattern}, flags: '${flags}', options: ${JSON.stringify(options)})`
  };
};

module.exports = {
  parse
};

if (require.main === module) {
  console.log(parse('^a'));
  console.log(parse('^a', '', { unicodePropertyEscape: true, namedGroups: true, lookbehind: true }));
}

// File: test/test.js
const assert = require('assert');
const { parse } = require('../index.js');

describe('RegJSParser', () => {
  it('should parse without options', () => {
    const tree = parse('^a');
    assert.strictEqual(tree.pattern, '^a');
  });

  it('should parse with options', () => {
    const tree = parse('^a', '', { namedGroups: true });
    assert.strictEqual(tree.options.namedGroups, true);
  });
});

// File: test/update-fixtures.js
const fs = require('fs');
const { parse } = require('../index.js');

const updateFixtures = () => {
  const patterns = ['a', '^a', '(a|b)'];
  const fixtures = patterns.map((pattern) => ({
    pattern,
    tree: parse(pattern)
  }));

  fs.writeFileSync('test/fixtures.json', JSON.stringify(fixtures, null, 2));
  console.log('Fixtures updated');
};

if (require.main === module) {
  updateFixtures();
}

// File: package.json
{
  "name": "regjsparser",
  "version": "1.0.0",
  "description": "Parsing the JavaScript's RegExp in JavaScript.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "dependencies": {},
  "devDependencies": {
    "mocha": "^10.0.0"
  },
  "author": "",
  "license": "ISC"
}
