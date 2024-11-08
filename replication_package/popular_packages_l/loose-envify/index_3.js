// loose-envify.js

const fs = require('fs');
const jsTokens = require('js-tokens');

function looseEnvify(filePath, environment) {
  try {
    const source = fs.readFileSync(filePath, 'utf8');
    const updatedSource = processSource(source, environment);
    fs.writeFileSync(filePath, updatedSource, 'utf8');
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function processSource(sourceCode, environment) {
  return sourceCode.replace(jsTokens, (token, type) => {
    if (type === 'IdentifierName' && token.startsWith('process.env')) {
      const variableKey = token.substring(12);
      if (environment.hasOwnProperty(variableKey)) {
        return JSON.stringify(environment[variableKey]);
      }
    }
    return token;
  });
}

if (require.main === module) {
  const [filePath] = process.argv.slice(2);
  const envVariables = process.env;

  if (!filePath) {
    console.error('Usage: node loose-envify.js <file>');
    process.exit(1);
  }

  looseEnvify(filePath, envVariables);
}

module.exports = looseEnvify;

// Usage example:
// node loose-envify.js path/to/your.js
```