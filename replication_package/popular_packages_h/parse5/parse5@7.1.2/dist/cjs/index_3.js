"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const parser = require("./parser/index.js");
const defaultTreeAdapterModule = require("./tree-adapters/default.js");
const serializer = require("./serializer/index.js");
const errorCodes = require("./common/error-codes.js");
exports.foreignContent = require("./common/foreign-content.js");
exports.html = require("./common/html.js");
exports.Token = require("./common/token.js");
const tokenizer = require("./tokenizer/index.js");

// Re-exporting components
exports.defaultTreeAdapter = defaultTreeAdapterModule.defaultTreeAdapter;
exports.Parser = parser.Parser;
exports.serialize = serializer.serialize;
exports.serializeOuter = serializer.serializeOuter;
exports.ErrorCodes = errorCodes.ERR;
exports.Tokenizer = tokenizer.Tokenizer;
exports.TokenizerMode = tokenizer.TokenizerMode;

/**
 * Parses an HTML string and returns a Document.
 *
 * @param {string} html - Input HTML string.
 * @param {Object} [options] - Parsing options.
 * @returns {Document}
 */
function parse(html, options) {
    return parser.Parser.parse(html, options);
}
exports.parse = parse;

/**
 * Parses an HTML fragment within a given context.
 *
 * @param {Element} [fragmentContext] - Context element for the fragment.
 * @param {string} html - Input HTML fragment string.
 * @param {Object} [options] - Parsing options.
 * @returns {DocumentFragment}
 */
function parseFragment(fragmentContext, html, options) {
    if (typeof fragmentContext === 'string') {
        options = html;
        html = fragmentContext;
        fragmentContext = null;
    }
    const fragmentParser = parser.Parser.getFragmentParser(fragmentContext, options);
    fragmentParser.tokenizer.write(html, true);
    return fragmentParser.getFragment();
}
exports.parseFragment = parseFragment;

//# sourceMappingURL=index.js.map
