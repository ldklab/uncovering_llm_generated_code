'use strict';

const hexify = char => {
  const hex = char.charCodeAt(0).toString(16).toUpperCase();
  return '0x' + (hex.length % 2 ? '0' : '') + hex;
};

const parseError = (error, text, context) => {
  if (!text) {
    return {
      message: `${error.message} while parsing empty string`,
      position: 0,
    };
  }

  const badToken = error.message.match(/^Unexpected token (.) .*position\s+(\d+)/i);
  const errorIndex = badToken ? +badToken[2]
    : error.message.match(/^Unexpected end of JSON.*/i) ? text.length - 1
    : null;

  const message = badToken 
    ? error.message.replace(/^Unexpected token ./, `Unexpected token ${JSON.stringify(badToken[1])} (${hexify(badToken[1])})`)
    : error.message;

  if (errorIndex !== null) {
    const start = Math.max(0, errorIndex - context);
    const end = Math.min(text.length, errorIndex + context);
    const slice = (start === 0 ? '' : '...') + text.slice(start, end) + (end === text.length ? '' : '...');
    const near = text === slice ? '' : 'near ';
    return {
      message: `${message} while parsing ${near}${JSON.stringify(slice)}`,
      position: errorIndex,
    }
  } else {
    return {
      message: `${message} while parsing '${text.slice(0, context * 2)}'`,
      position: 0,
    }
  }
};

class JSONParseError extends SyntaxError {
  constructor (error, text, context = 20, caller) {
    const metadata = parseError(error, text, context);
    super(metadata.message);
    Object.assign(this, metadata);
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
  const parseText = stripBOM(text);
  try {
    const [, newline = '\n', indent = '  '] = parseText.match(emptyRE) || parseText.match(formatRE) || [, '', ''];
    const result = JSON.parse(parseText, reviver);
    if (result && typeof result === 'object') {
      result[kNewline] = newline;
      result[kIndent] = indent;
    }
    return result;
  } catch (error) {
    if (typeof text !== 'string' && !Buffer.isBuffer(text)) {
      const isEmptyArray = Array.isArray(text) && text.length === 0;
      throw Object.assign(new TypeError(`Cannot parse ${isEmptyArray ? 'an empty array' : String(text)}`), {
        code: 'EJSONPARSE',
        systemError: error,
      });
    }
    throw new JSONParseError(error, parseText, context, parseJson);
  }
};

const stripBOM = text => String(text).replace(/^\uFEFF/, '');

module.exports = parseJson;
parseJson.JSONParseError = JSONParseError;

parseJson.noExceptions = (text, reviver) => {
  try {
    return JSON.parse(stripBOM(text), reviver);
  } catch (e) {
    // return undefined on parse error
  }
};
