const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[dotenv][DEBUG] ${message}`);
}

const NEWLINE = '\n';
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINES_MATCH = /\n|\r|\r\n/;

function parse(src, options) {
  const debug = options && options.debug;
  const result = {};

  src.toString().split(NEWLINES_MATCH).forEach((line, index) => {
    const matched = line.match(RE_INI_KEY_VAL);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(RE_NEWLINES, NEWLINE);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else {
        value = value.trim();
      }

      result[key] = value;
    } else if (debug) {
      log(`Line ${index + 1} did not match the key-value format: ${line}`);
    }
  });

  return result;
}

function config(options = {}) {
  const dotenvPath = options.path || path.resolve(process.cwd(), '.env');
  const encoding = options.encoding || 'utf8';
  const debug = options.debug || false;

  try {
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

    Object.keys(parsed).forEach((key) => {
      if (!(key in process.env)) {
        process.env[key] = parsed[key];
      } else if (debug) {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
      }
    });

    return { parsed };
  } catch (error) {
    return { error };
  }
}

module.exports = { config, parse };
