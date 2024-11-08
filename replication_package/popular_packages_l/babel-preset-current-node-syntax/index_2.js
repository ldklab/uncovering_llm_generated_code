// index.js
const semver = require('semver');
const babelParser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

function getCurrentNodeVersion() {
  return process.versions.node;
}

function loadTestFixtures() {
  const fixturesFilePath = path.join(__dirname, 'test', 'fixtures.json');
  const fixturesContent = fs.readFileSync(fixturesFilePath, 'utf-8');
  return JSON.parse(fixturesContent);
}

function validateSyntaxCompatibility() {
  const currentNodeVersion = getCurrentNodeVersion();
  const testFixtures = loadTestFixtures();

  testFixtures.forEach(({ code, minNodeVersion, name }) => {
    if (semver.gte(currentNodeVersion, minNodeVersion)) {
      try {
        babelParser.parse(code, { sourceType: 'module' });
        console.log(`PASS: ${name}`);
      } catch (error) {
        console.error(`FAIL: ${name} - Parsing error occurred.`);
        console.error(error);
      }
    } else {
      try {
        babelParser.parse(code, { sourceType: 'module' });
        console.error(`FAIL: ${name} - Node.js version too low to support this syntax.`);
      } catch {
        console.log(`PASS: ${name} - Expected failure on unsupported syntax.`);
      }
    }
  });
}

validateSyntaxCompatibility();
