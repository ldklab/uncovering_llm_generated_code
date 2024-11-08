'use strict';

const INDENT = Symbol.for('indent');
const NEWLINE = Symbol.for('newline');

const DEFAULT_NEWLINE = '\n';
const DEFAULT_INDENT = '  ';
const BOM = /^\uFEFF/;
const FORMAT = /^\s*[{[]((?:\r?\n)+)([\s\t]*)/;
const EMPTY = /^(?:\{\}|\[\])((?:\r?\n)+)?$/;
const UNEXPECTED_TOKEN = /^Unexpected token '?(.)'?(,)? /i;

const hexify = char => `0x${char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()}`;

const stripBOM = txt => String(txt).replace(BOM, '');

const makeParsedError = (msg, parsing, position = 0) => ({
  message: `${msg} while parsing ${parsing}`,
  position,
});

const parseError = (e, txt, context = 20) => {
  let msg = e.message;

  if (!txt) return makeParsedError(msg, 'empty string');

  const badTokenMatch = msg.match(UNEXPECTED_TOKEN);
  const badIndexMatch = msg.match(/ position\s+(\d+)/i);

  if (badTokenMatch) {
    msg = msg.replace(
      UNEXPECTED_TOKEN,
      `Unexpected token ${JSON.stringify(badTokenMatch[1])} (${hexify(badTokenMatch[1])})$2 `
    );
  }

  let errIdx;
  if (badIndexMatch) {
    errIdx = +badIndexMatch[1];
  } else if (msg.match(/^Unexpected end of JSON.*/i)) {
    errIdx = txt.length - 1;
  }

  if (errIdx == null) return makeParsedError(msg, `'${txt.slice(0, context * 2)}'`);

  const start = Math.max(0, errIdx - context);
  const end = Math.min(txt.length, errIdx + context);
  const slice = `${start ? '...' : ''}${txt.slice(start, end)}${end === txt.length ? '' : '...'}`;

  return makeParsedError(msg, `${txt === slice ? '' : 'near '}${JSON.stringify(slice)}`, errIdx);
};

class JSONParseError extends SyntaxError {
  constructor(er, txt, context, caller) {
    const metadata = parseError(er, txt, context);
    super(metadata.message);
    Object.assign(this, metadata);
    this.code = 'EJSONPARSE';
    this.systemError = er;
    Error.captureStackTrace(this, caller || this.constructor);
  }

  get name() { return this.constructor.name; }
  set name(_) {}

  get [Symbol.toStringTag]() { return this.constructor.name; }
}

const parseJson = (txt, reviver) => {
  const result = JSON.parse(txt, reviver);
  if (result && typeof result === 'object') {
    const match = txt.match(EMPTY) || txt.match(FORMAT) || [null, '', ''];
    result[NEWLINE] = match[1] ?? DEFAULT_NEWLINE;
    result[INDENT] = match[2] ?? DEFAULT_INDENT;
  }
  return result;
};

const parseJsonError = (raw, reviver, context) => {
  const txt = stripBOM(raw);
  try {
    return parseJson(txt, reviver);
  } catch (e) {
    if (typeof raw !== 'string' && !Buffer.isBuffer(raw)) {
      const msg = Array.isArray(raw) && raw.length === 0 ? 'an empty array' : String(raw);
      throw Object.assign(
        new TypeError(`Cannot parse ${msg}`),
        { code: 'EJSONPARSE', systemError: e }
      );
    }
    throw new JSONParseError(e, txt, context, parseJsonError);
  }
};

module.exports = parseJsonError;
parseJsonError.JSONParseError = JSONParseError;
parseJsonError.noExceptions = (raw, reviver) => {
  try {
    return parseJson(stripBOM(raw), reviver);
  } catch {}
};
