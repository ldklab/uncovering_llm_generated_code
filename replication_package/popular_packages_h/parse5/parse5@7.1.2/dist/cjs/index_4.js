"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Parser: ParserModule } = require("./parser/index.js");
const { defaultTreeAdapter } = require("./tree-adapters/default.js");
const { serialize, serializeOuter } = require("./serializer/index.js");
const { ERR: ErrorCodes } = require("./common/error-codes.js");
const foreignContent = require("./common/foreign-content.js");
const html = require("./common/html.js");
const Token = require("./common/token.js");
const { Tokenizer, TokenizerMode } = require("./tokenizer/index.js");

exports.defaultTreeAdapter = defaultTreeAdapter;
exports.Parser = ParserModule.Parser;
exports.serialize = serialize;
exports.serializeOuter = serializeOuter;
exports.ErrorCodes = ErrorCodes;
exports.foreignContent = foreignContent;
exports.html = html;
exports.Token = Token;
exports.Tokenizer = Tokenizer;
exports.TokenizerMode = TokenizerMode;

function parse(html, options) {
    return ParserModule.parse(html, options);
}
exports.parse = parse;

function parseFragment(fragmentContext, html, options) {
    if (typeof fragmentContext === 'string') {
        options = html;
        html = fragmentContext;
        fragmentContext = null;
    }
    const parser = ParserModule.getFragmentParser(fragmentContext, options);
    parser.tokenizer.write(html, true);
    return parser.getFragment();
}
exports.parseFragment = parseFragment;
