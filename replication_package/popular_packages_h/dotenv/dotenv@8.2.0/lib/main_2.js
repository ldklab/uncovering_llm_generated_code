const fs = require('fs');
const path = require('path');

function log(message) { 
  console.log(`[dotenv][DEBUG] ${message}`);
}

const NEWLINE = '\n';
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINES_MATCH = /\n|\r|\r\n/;

// Parse function converts the .env content into an object
function parse(src, options) {
  const debug = options?.debug || false;
  const obj = {};

  src.toString().split(NEWLINES_MATCH).forEach((line, idx) => {
    const keyValueArr = line.match(RE_INI_KEY_VAL);
    if (keyValueArr) {
      let [ , key, val = ''] = keyValueArr;
      const isDoubleQuoted = val.startsWith('"') && val.endsWith('"');
      const isSingleQuoted = val.startsWith("'") && val.endsWith("'");

      if (isSingleQuoted || isDoubleQuoted) {
        val = val.slice(1, -1);

        if (isDoubleQuoted) {
          val = val.replace(RE_NEWLINES, NEWLINE);
        }
      } else {
        val = val.trim();
      }
      
      obj[key] = val;
    } else if (debug) {
      log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
    }
  });

  return obj;
}

// Config function reads .env file and populates process.env
function config(options = {}) {
  const dotenvPath = options.path || path.resolve(process.cwd(), '.env');
  const encoding = options.encoding || 'utf8';
  const debug = options.debug || false;

  try {
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

    for (const key of Object.keys(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = parsed[key];
      } else if (debug) {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
      }
    }

    return { parsed };
  } catch (error) {
    return { error };
  }
}

module.exports.config = config;
module.exports.parse = parse;
