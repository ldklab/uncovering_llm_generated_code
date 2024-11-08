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
  const debug = Boolean(options && options.debug);
  const obj = {};

  src.toString().split(NEWLINES_MATCH).forEach((line, idx) => {
    const keyValueArr = line.match(RE_INI_KEY_VAL);
    if (keyValueArr != null) {
      const key = keyValueArr[1];
      let val = (keyValueArr[2] || '');
      const end = val.length - 1;
      const isDoubleQuoted = val[0] === '"' && val[end] === '"';
      const isSingleQuoted = val[0] === "'" && val[end] === "'";

      if (isSingleQuoted || isDoubleQuoted) {
        val = val.substring(1, end);
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

function config(options) {
  let dotenvPath = path.resolve(process.cwd(), '.env');
  let encoding = 'utf8';
  let debug = false;

  if (options) {
    if (options.path != null) {
      dotenvPath = options.path;
    }
    if (options.encoding != null) {
      encoding = options.encoding;
    }
    if (options.debug != null) {
      debug = true;
    }
  }

  try {
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

    Object.keys(parsed).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key];
      } else if (debug) {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
      }
    });

    return { parsed };
  } catch (e) {
    return { error: e };
  }
}

module.exports.config = config;
module.exports.parse = parse;
