// loose-envify.js

const fs = require('fs');
const jsTokens = require('js-tokens');

function looseEnvify(file, env) {
  const sourceCode = fs.readFileSync(file, 'utf8');
  const updatedCode = replaceEnvironmentVariables(sourceCode, env);
  fs.writeFileSync(file, updatedCode, 'utf8');
}

function replaceEnvironmentVariables(source, environment) {
  return source.replace(jsTokens, function(token, tokenType) {
    if (tokenType === 'IdentifierName' && token.startsWith('process.env')) {
      const variableName = token.slice(12); // Extract the variable name from process.env
      if (environment.hasOwnProperty(variableName)) {
        return JSON.stringify(environment[variableName]);
      }
    }
    return token;
  });
}

// Command-line interface handling
if (require.main === module) {
  const arguments = process.argv.slice(2);
  const filename = arguments[0];
  const environmentVariables = process.env;

  if (!filename) {
    console.error('Usage: loose-envify <file>');
    process.exit(1);
  }

  looseEnvify(filename, environmentVariables);
}

module.exports = looseEnvify;

// Example usage:
// node loose-envify.js path/to/your.js
```