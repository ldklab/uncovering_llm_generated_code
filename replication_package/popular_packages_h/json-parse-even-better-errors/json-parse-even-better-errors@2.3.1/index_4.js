'use strict'

const charToHex = char => {
  const hex = char.charCodeAt(0).toString(16).toUpperCase();
  return '0x' + (hex.length % 2 ? '0' : '') + hex;
};

const buildParseError = (error, text, context) => {
  if (!text) {
    return {
      message: `${error.message} while parsing empty string`,
      position: 0,
    };
  }
  
  const badTokenMatch = error.message.match(/^Unexpected token (.) .*position\s+(\d+)/i);
  const errorIndex = badTokenMatch ? parseInt(badTokenMatch[2])
    : error.message.match(/^Unexpected end of JSON.*/i) ? text.length - 1
    : null;

  const msg = badTokenMatch ? error.message.replace(/^Unexpected token ./, `Unexpected token ${JSON.stringify(badTokenMatch[1])} (${charToHex(badTokenMatch[1])})`)
    : error.message;

  if (errorIndex !== null && errorIndex !== undefined) {
    const start = errorIndex <= context ? 0 : errorIndex - context;
    const end = errorIndex + context >= text.length ? text.length : errorIndex + context;
    const snippet = (start === 0 ? '' : '...') + text.slice(start, end) + (end === text.length ? '' : '...');
    const near = text === snippet ? '' : 'near ';
    
    return {
      message: `${msg} while parsing ${near}${JSON.stringify(snippet)}`,
      position: errorIndex,
    };
  } else {
    return {
      message: `${msg} while parsing '${text.slice(0, context * 2)}'`,
      position: 0,
    };
  }
};

class JSONParseError extends SyntaxError {
  constructor (error, text, context = 20, caller) {
    const errorDetails = buildParseError(error, text, context);
    super(errorDetails.message);
    Object.assign(this, errorDetails);
    this.code = 'EJSONPARSE';
    this.systemError = error;
    Error.captureStackTrace(this, caller || this.constructor);
  }

  get name() { return this.constructor.name; }
  set name(_) {}
  get [Symbol.toStringTag]() { return this.constructor.name; }
}

const kIndent = Symbol.for('indent');
const kNewline = Symbol.for('newline');
const formatRE = /^\s*[{\[]((?:\r?\n)+)([\s\t]*)/;
const emptyRE = /^(?:\{\}|\[\])((?:\r?\n)+)?$/;

const parseJson = (text, reviver, context = 20) => {
  const content = stripBOM(text);
  try {
    const [, newline = '\n', indent = '  '] = content.match(emptyRE) || content.match(formatRE) || [, '', ''];
    const result = JSON.parse(content, reviver);
    if (result && typeof result === 'object') {
      result[kNewline] = newline;
      result[kIndent] = indent;
    }
    return result;
  } catch (error) {
    if (typeof text !== 'string' && !Buffer.isBuffer(text)) {
      throw Object.assign(new TypeError(`Cannot parse ${Array.isArray(text) && text.length === 0 ? 'an empty array' : String(text)}`), {
        code: 'EJSONPARSE',
        systemError: error,
      });
    }
    throw new JSONParseError(error, content, context, parseJson);
  }
};

const stripBOM = text => String(text).replace(/^\uFEFF/, '');

module.exports = parseJson;
parseJson.JSONParseError = JSONParseError;

parseJson.noExceptions = (text, reviver) => {
  try {
    return JSON.parse(stripBOM(text), reviver);
  } catch {}
};
