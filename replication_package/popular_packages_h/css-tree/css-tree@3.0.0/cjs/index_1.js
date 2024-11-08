'use strict';

// Importing various modules from different directories for syntax processing
const syntaxIndex = require('./syntax/index.cjs');
const appVersion = require('./version.cjs');
const createSyntax = require('./syntax/create.cjs');
const ListUtil = require('./utils/List.cjs');
const LexerUtil = require('./lexer/Lexer.cjs');
const definitionSyntax = require('./definition-syntax/index.cjs');
const cloneUtil = require('./utils/clone.cjs');
const nameUtils = require('./utils/names.cjs');
const identUtil = require('./utils/ident.cjs');
const stringUtil = require('./utils/string.cjs');
const urlUtil = require('./utils/url.cjs');
const tokenTypes = require('./tokenizer/types.cjs');
const tokenNames = require('./tokenizer/names.cjs');
const TokenStreamUtil = require('./tokenizer/TokenStream.cjs');

// Destructuring core functions from the main syntax module
const {
    tokenize,
    parse,
    generate,
    lexer,
    createLexer,
    walk,
    find,
    findLast,
    findAll,
    toPlainObject,
    fromPlainObject,
    fork
} = syntaxIndex;

// Exporting core functionalities and utilities to be used in syntax processing
exports.version = appVersion.version;
exports.createSyntax = createSyntax;
exports.List = ListUtil.List;
exports.Lexer = LexerUtil.Lexer;
exports.definitionSyntax = definitionSyntax;
exports.clone = cloneUtil.clone;
exports.isCustomProperty = nameUtils.isCustomProperty;
exports.keyword = nameUtils.keyword;
exports.property = nameUtils.property;
exports.vendorPrefix = nameUtils.vendorPrefix;
exports.ident = identUtil;
exports.string = stringUtil;
exports.url = urlUtil;
exports.tokenTypes = tokenTypes;
exports.tokenNames = tokenNames;
exports.TokenStream = TokenStreamUtil.TokenStream;
exports.createLexer = createLexer;
exports.find = find;
exports.findAll = findAll;
exports.findLast = findLast;
exports.fork = fork;
exports.fromPlainObject = fromPlainObject;
exports.generate = generate;
exports.lexer = lexer;
exports.parse = parse;
exports.toPlainObject = toPlainObject;
exports.tokenize = tokenize;
exports.walk = walk;
