'use strict';

const syntax = require('./syntax/index.cjs');
const versionModule = require('./version.cjs');
const syntaxCreate = require('./syntax/create.cjs');
const ListUtil = require('./utils/List.cjs');
const LexerModule = require('./lexer/Lexer.cjs');
const definitionSyntaxModule = require('./definition-syntax/index.cjs');
const utilsClone = require('./utils/clone.cjs');
const utilsNames = require('./utils/names.cjs');
const utilsIdent = require('./utils/ident.cjs');
const utilsString = require('./utils/string.cjs');
const utilsURL = require('./utils/url.cjs');
const tokenizerTypes = require('./tokenizer/types.cjs');
const tokenizerNames = require('./tokenizer/names.cjs');
const tokenizerStream = require('./tokenizer/TokenStream.cjs');

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
} = syntax;

module.exports = {
    version: versionModule.version,
    createSyntax: syntaxCreate,
    List: ListUtil.List,
    Lexer: LexerModule.Lexer,
    definitionSyntax: definitionSyntaxModule,
    clone: utilsClone.clone,
    isCustomProperty: utilsNames.isCustomProperty,
    keyword: utilsNames.keyword,
    property: utilsNames.property,
    vendorPrefix: utilsNames.vendorPrefix,
    ident: utilsIdent,
    string: utilsString,
    url: utilsURL,
    tokenTypes: tokenizerTypes,
    tokenNames: tokenizerNames,
    TokenStream: tokenizerStream.TokenStream,
    createLexer,
    find,
    findAll,
    findLast,
    fork,
    fromPlainObject,
    generate,
    lexer,
    parse,
    toPlainObject,
    tokenize,
    walk
};
