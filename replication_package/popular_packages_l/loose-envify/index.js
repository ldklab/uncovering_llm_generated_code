// loose-envify.js

const fs = require('fs');
const jsTokens = require('js-tokens');

function looseEnvify(file, env) {
  const src = fs.readFileSync(file, 'utf8');
  const replaced = replaceEnvVars(src, env);
  fs.writeFileSync(file, replaced, 'utf8');
}

function replaceEnvVars(src, env) {
  return src.replace(jsTokens, function(match, type) {
    if (type === 'IdentifierName' && match.startsWith('process.env')) {
      const key = match.slice(12); // extract the environment variable key
      if (env.hasOwnProperty(key)) {
        return JSON.stringify(env[key]);
      }
    }
    return match;
  });
}

// CLI interface
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
// node loose-envify.js path/to/your.js
```
```