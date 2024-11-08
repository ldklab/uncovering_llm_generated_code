'use strict';

const os = require('os');
const detectNewline = require('detect-newline').default;

// Regular expressions used for parsing docblocks
const commentEndRe = /\*\/$/;
const commentStartRe = /^\/\*\*?/;
const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/;
const lineCommentRe = /(^|\s+)\/\/([^\r\n]*)/g;
const ltrimNewlineRe = /^(\r?\n)+/;
const multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *(?![^@\r\n]*\/\/[^]*)([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
const propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;
const stringStartRe = /(\r?\n|^) *\* ?/g;
const STRING_ARRAY = [];

// Extracts the docblock from the given content
function extract(contents) {
  const match = contents.match(docblockRe);
  return match ? match[0].trimLeft() : '';
}

// Strips the docblock from the content
function strip(contents) {
  const match = contents.match(docblockRe);
  return match && match[0] ? contents.substring(match[0].length) : contents;
}

// Parses the docblock to extract pragmas
function parse(docblock) {
  return parseWithComments(docblock).pragmas;
}

// Parses the docblock to extract both pragmas and comments
function parseWithComments(docblock) {
  const line = detectNewline(docblock) ?? os.EOL;
  docblock = docblock.replace(commentStartRe, '').replace(commentEndRe, '').replace(stringStartRe, '$1');

  // Normalize multi-line directives
  let prev = '';
  while (prev !== docblock) {
    prev = docblock;
    docblock = docblock.replace(multilineRe, `${line}$1 $2${line}`);
  }
  docblock = docblock.replace(ltrimNewlineRe, '').trimRight();

  const result = Object.create(null);
  const comments = docblock.replace(propertyRe, '').replace(ltrimNewlineRe, '').trimRight();
  let match;
  while ((match = propertyRe.exec(docblock))) {
    const nextPragma = match[2].replace(lineCommentRe, '');
    if (typeof result[match[1]] === 'string' || Array.isArray(result[match[1]])) {
      result[match[1]] = STRING_ARRAY.concat(result[match[1]], nextPragma);
    } else {
      result[match[1]] = nextPragma;
    }
  }
  return {
    comments,
    pragmas: result
  };
}

// Prints a formatted docblock from comments and pragmas
function print({comments = '', pragmas = {}}) {
  const line = detectNewline(comments) ?? os.EOL;
  const head = '/**';
  const start = ' *';
  const tail = ' */';
  const keys = Object.keys(pragmas);

  const printedObject = keys
    .flatMap(key => printKeyValues(key, pragmas[key]))
    .map(keyValue => `${start} ${keyValue}${line}`)
    .join('');

  if (!comments) {
    if (keys.length === 0) {
      return '';
    }
    if (keys.length === 1 && !Array.isArray(pragmas[keys[0]])) {
      const value = pragmas[keys[0]];
      return `${head} ${printKeyValues(keys[0], value)[0]}${tail}`;
    }
  }

  const printedComments = comments
    .split(line)
    .map(textLine => `${start} ${textLine}`)
    .join(line) + line;

  return (
    head +
    line +
    (comments ? printedComments : '') +
    (comments && keys.length ? start + line : '') +
    printedObject +
    tail
  );
}

// Helper function to format key-value pairs for the docblock
function printKeyValues(key, valueOrArray) {
  return STRING_ARRAY.concat(valueOrArray).map(value => `@${key} ${value}`.trim());
}

// Exports
exports.extract = extract;
exports.parse = parse;
exports.parseWithComments = parseWithComments;
exports.print = print;
exports.strip = strip;
