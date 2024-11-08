// loose-envify.js

const fs = require('fs');
const jsTokens = require('js-tokens');

/**
 * Replaces process.env variables in a JavaScript file with actual environment values.
 * @param {string} file - Path to the JavaScript file to process.
 * @param {object} env - Environment variables object.
 */
function looseEnvify(file, env) {
  const src = fs.readFileSync(file, 'utf8');
  const replaced = replaceEnvVars(src, env);
  fs.writeFileSync(file, replaced, 'utf8');
}

/**
 * Replaces occurrences of process.env variables in the source code with values from the provided environment object.
 * @param {string} src - Source code as a string.
 * @param {object} env - Environment variables object.
 * @returns {string} - Transformed source code.
 */
function replaceEnvVars(src, env) {
  return src.replace(jsTokens, (match, type) => {
    if (type === 'IdentifierName' && match.startsWith('process.env')) {
      const key = match.slice(12); // Extracts the environment variable key
      if (env.hasOwnProperty(key)) {
        return JSON.stringify(env[key]);
      }
    }
    return match;
  });
}

// CLI interface for directly using the script from the command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args[0];
  const env = process.env;

  if (!file) {
    console.error('Usage: loose-envify <file>');
    process.exit(1);
  }

  looseEnvify(file, env);
}

module.exports = looseEnvify;

// Usage example:
// node loose-envify.js path/to/file.js
```