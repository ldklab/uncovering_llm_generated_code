"use strict";

// Import necessary components
const { Parser } = require("./parser/index.js");
const { serialize, serializeOuter } = require("./serializer/index.js");
const { ERR: ErrorCodes } = require("./common/error-codes.js");

// Direct exports
exports.defaultTreeAdapter = require("./tree-adapters/default.js").defaultTreeAdapter;
exports.foreignContent = require("./common/foreign-content.js");
exports.html = require("./common/html.js");
exports.Token = require("./common/token.js");
exports.Tokenizer = require("./tokenizer/index.js").Tokenizer;
exports.TokenizerMode = require("./tokenizer/index.js").TokenizerMode;

// Exported functions
exports.serialize = serialize;
exports.serializeOuter = serializeOuter;

/**
 * Parses an HTML string.
 *
 * @param {string} html - Input HTML string.
 * @param {Object} options - Parsing options.
 * @returns {Document} Parsed document.
 */
function parse(html, options) {
    return Parser.parse(html, options);
}
exports.parse = parse;

/**
 * Parses an HTML fragment.
 *
 * @param {Node} fragmentContext - Context element for fragment parsing.
 * @param {string} html - Input HTML string.
 * @param {Object} options - Parsing options.
 * @returns {DocumentFragment} Parsed document fragment.
 */
function parseFragment(fragmentContext, html, options) {
    if (typeof fragmentContext === 'string') {
        options = html;
        html = fragmentContext;
        fragmentContext = null;
    }
    const parser = Parser.getFragmentParser(fragmentContext, options);
    parser.tokenizer.write(html, true);
    return parser.getFragment();
}
exports.parseFragment = parseFragment;

exports.ErrorCodes = ErrorCodes;

//# sourceMappingURL=index.js.map
