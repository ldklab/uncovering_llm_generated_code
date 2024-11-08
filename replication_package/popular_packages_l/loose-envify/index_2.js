const fs = require('fs');
const jsTokens = require('js-tokens');

function looseEnvify(filePath, envVars) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const updatedContent = replaceEnvironmentVariables(fileContent, envVars);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

function replaceEnvironmentVariables(sourceCode, environmentVariables) {
  return sourceCode.replace(jsTokens, (token, tokenType) => {
    if (tokenType === 'IdentifierName' && token.startsWith('process.env')) {
      const envKey = token.slice(12); // Get the environment variable name
      if (environmentVariables.hasOwnProperty(envKey)) {
        return JSON.stringify(environmentVariables[envKey]);
      }
    }
    return token;
  });
}

if (require.main === module) {
  const argumentsList = process.argv.slice(2);
  const filePath = argumentsList[0];
  const environmentVariables = process.env;

  if (!filePath) {
    console.error('Usage: loose-envify <file>');
    process.exit(1);
  }

  looseEnvify(filePath, environmentVariables);
}

module.exports = looseEnvify;

// Example usage:
// node loose-envify.js path/to/your.js
```