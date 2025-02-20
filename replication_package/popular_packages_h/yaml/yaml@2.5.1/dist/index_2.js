'use strict';

// Import necessary modules for YAML processing
const composer = require('./compose/composer.js');
const Document = require('./doc/Document.js');
const Schema = require('./schema/Schema.js');
const errors = require('./errors.js');
const Alias = require('./nodes/Alias.js');
const identity = require('./nodes/identity.js');
const Pair = require('./nodes/Pair.js');
const Scalar = require('./nodes/Scalar.js');
const YAMLMap = require('./nodes/YAMLMap.js');
const YAMLSeq = require('./nodes/YAMLSeq.js');
const cst = require('./parse/cst.js');
const lexer = require('./parse/lexer.js');
const lineCounter = require('./parse/line-counter.js');
const parser = require('./parse/parser.js');
const publicApi = require('./public-api.js');
const visit = require('./visit.js');

// Export components and functions for external use
module.exports = {
  Composer: composer.Composer,
  Document: Document.Document,
  Schema: Schema.Schema,
  YAMLError: errors.YAMLError,
  YAMLParseError: errors.YAMLParseError,
  YAMLWarning: errors.YAMLWarning,
  Alias: Alias.Alias,
  isAlias: identity.isAlias,
  isCollection: identity.isCollection,
  isDocument: identity.isDocument,
  isMap: identity.isMap,
  isNode: identity.isNode,
  isPair: identity.isPair,
  isScalar: identity.isScalar,
  isSeq: identity.isSeq,
  Pair: Pair.Pair,
  Scalar: Scalar.Scalar,
  YAMLMap: YAMLMap.YAMLMap,
  YAMLSeq: YAMLSeq.YAMLSeq,
  CST: cst,
  Lexer: lexer.Lexer,
  LineCounter: lineCounter.LineCounter,
  Parser: parser.Parser,
  parse: publicApi.parse,
  parseAllDocuments: publicApi.parseAllDocuments,
  parseDocument: publicApi.parseDocument,
  stringify: publicApi.stringify,
  visit: visit.visit,
  visitAsync: visit.visitAsync
};
