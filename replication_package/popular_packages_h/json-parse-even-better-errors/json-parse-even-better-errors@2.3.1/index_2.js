'use strict';

const hexify = char => {
  const h = char.charCodeAt(0).toString(16).toUpperCase();
  return '0x' + (h.length % 2 ? '0' : '') + h;
};

const parseError = (e, txt, context) => {
  if (!txt) {
    return {
      message: `${e.message} while parsing empty string`,
      position: 0,
    };
  }
  
  const badToken = e.message.match(/^Unexpected token (.) .*position\s+(\d+)/i);
  const errIdx = badToken ? +badToken[2]
    : e.message.includes('Unexpected end of JSON') ? txt.length - 1
    : null;

  const msg = badToken ? e.message.replace(/^Unexpected token ./, `Unexpected token ${
    JSON.stringify(badToken[1])
  } (${hexify(badToken[1])})`)
    : e.message;

  if (errIdx !== null) {
    const start = Math.max(0, errIdx - context);
    const end = Math.min(txt.length, errIdx + context);
    const slice = (start > 0 ? '...' : '') +
      txt.slice(start, end) +
      (end < txt.length ? '...' : '');
    
    const near = txt === slice ? '' : 'near ';
    return {
      message: `${msg} while parsing ${near}${JSON.stringify(slice)}`,
      position: errIdx,
    };
  } else {
    return {
      message: `${msg} while parsing '${txt.slice(0, context * 2)}'`,
      position: 0,
    };
  }
};

class JSONParseError extends SyntaxError {
  constructor(er, txt, context, caller) {
    context = context || 20;
    const metadata = parseError(er, txt, context);
    super(metadata.message);
    Object.assign(this, metadata);
    this.code = 'EJSONPARSE';
    this.systemError = er;
    Error.captureStackTrace(this, caller || this.constructor);
  }
  
  get name() { return this.constructor.name; }
  set name(n) {}
  get [Symbol.toStringTag]() { return this.constructor.name; }
}

const kIndent = Symbol.for('indent');
const kNewline = Symbol.for('newline');

const formatRE = /^\s*[{\[]((?:\r?\n)+)([\s\t]*)/;
const emptyRE = /^(?:\{\}|\[\])((?:\r?\n)+)?$/;

const parseJson = (txt, reviver, context = 20) => {
  const parseText = stripBOM(txt);
  try {
    const [, newline = '\n', indent = '  '] = parseText.match(emptyRE) ||
      parseText.match(formatRE) || [, '', ''];

    const result = JSON.parse(parseText, reviver);
    if (result && typeof result === 'object') {
      result[kNewline] = newline;
      result[kIndent] = indent;
    }
    return result;
  } catch (e) {
    if (typeof txt !== 'string' && !Buffer.isBuffer(txt)) {
      const isEmptyArray = Array.isArray(txt) && txt.length === 0;
      throw Object.assign(new TypeError(
        `Cannot parse ${isEmptyArray ? 'an empty array' : String(txt)}`
      ), {
        code: 'EJSONPARSE',
        systemError: e,
      });
    }

    throw new JSONParseError(e, parseText, context, parseJson);
  }
};

const stripBOM = txt => String(txt).replace(/^\uFEFF/, '');

module.exports = parseJson;
parseJson.JSONParseError = JSONParseError;

parseJson.noExceptions = (txt, reviver) => {
  try {
    return JSON.parse(stripBOM(txt), reviver);
  } catch (e) {}
};
