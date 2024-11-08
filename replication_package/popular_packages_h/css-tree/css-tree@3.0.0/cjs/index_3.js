'use strict';

// Importing required modules and functionalities
const syntaxIndex = require('./syntax/index.cjs');
const versionModule = require('./version.cjs');
const syntaxCreate = require('./syntax/create.cjs');
const ListModule = require('./utils/List.cjs');
const LexerModule = require('./lexer/Lexer.cjs');
const definitionSyntaxModule = require('./definition-syntax/index.cjs');
const cloneModule = require('./utils/clone.cjs');
const namesUtils = require('./utils/names.cjs');
const identUtils = require('./utils/ident.cjs');
const stringUtils = require('./utils/string.cjs');
const urlUtils = require('./utils/url.cjs');
const tokenTypesModule = require('./tokenizer/types.cjs');
const tokenNamesModule = require('./tokenizer/names.cjs');
const TokenStreamModule = require('./tokenizer/TokenStream.cjs');

// Deconstructing needed functionalities from `syntaxIndex`
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

// Exporting functionalities for external use
exports.version = versionModule.version;
exports.createSyntax = syntaxCreate;
exports.List = ListModule.List;
exports.Lexer = LexerModule.Lexer;
exports.definitionSyntax = definitionSyntaxModule;
exports.clone = cloneModule.clone;
exports.isCustomProperty = namesUtils.isCustomProperty;
exports.keyword = namesUtils.keyword;
exports.property = namesUtils.property;
exports.vendorPrefix = namesUtils.vendorPrefix;
exports.ident = identUtils;
exports.string = stringUtils;
exports.url = urlUtils;
exports.tokenTypes = tokenTypesModule;
exports.tokenNames = tokenNamesModule;
exports.TokenStream = TokenStreamModule.TokenStream;
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
