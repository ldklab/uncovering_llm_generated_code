'use strict';

const {
  Composer: ComposerClass,
  Document: DocumentClass,
  Schema: SchemaClass,
  Alias: AliasClass,
  Pair: PairClass,
  Scalar: ScalarClass,
  YAMLMap: YAMLMapClass,
  YAMLSeq: YAMLSeqClass,
} = require('./compose/composer.js');
const { Document } = require('./doc/Document.js');
const { Schema } = require('./schema/Schema.js');
const {
  YAMLError,
  YAMLParseError,
  YAMLWarning
} = require('./errors.js');
const { Alias } = require('./nodes/Alias.js');
const {
  isAlias,
  isCollection,
  isDocument,
  isMap,
  isNode,
  isPair,
  isScalar,
  isSeq,
} = require('./nodes/identity.js');
const { Pair } = require('./nodes/Pair.js');
const { Scalar } = require('./nodes/Scalar.js');
const { YAMLMap } = require('./nodes/YAMLMap.js');
const { YAMLSeq } = require('./nodes/YAMLSeq.js');
const CST = require('./parse/cst.js');
const { Lexer } = require('./parse/lexer.js');
const { LineCounter } = require('./parse/line-counter.js');
const { Parser } = require('./parse/parser.js');
const {
  parse,
  parseAllDocuments,
  parseDocument,
  stringify
} = require('./public-api.js');
const { visit, visitAsync } = require('./visit.js');

module.exports = {
  Composer: ComposerClass,
  Document: DocumentClass,
  Schema: SchemaClass,
  YAMLError,
  YAMLParseError,
  YAMLWarning,
  Alias: AliasClass,
  isAlias,
  isCollection,
  isDocument,
  isMap,
  isNode,
  isPair,
  isScalar,
  isSeq,
  Pair: PairClass,
  Scalar: ScalarClass,
  YAMLMap: YAMLMapClass,
  YAMLSeq: YAMLSeqClass,
  CST,
  Lexer,
  LineCounter,
  Parser,
  parse,
  parseAllDocuments,
  parseDocument,
  stringify,
  visit,
  visitAsync,
};
