"use strict";

const { Parser } = require("./Parser");
const { DomHandler } = require("domhandler");
const { default: Tokenizer } = require("./Tokenizer");
const ElementType = require("domelementtype");
const DomUtils = require("domutils");
const { FeedHandler } = require("./FeedHandler");

Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = Parser;
exports.DomHandler = DomHandler;
exports.DefaultHandler = DomHandler; // Alias
exports.Tokenizer = Tokenizer;
exports.ElementType = ElementType;
exports.DomUtils = DomUtils;
exports.RssHandler = FeedHandler;

/**
 * Parses the data, returns the resulting document.
 *
 * @param {string} data - The data that should be parsed.
 * @param {object} [options] - Optional options for the parser and DOM builder.
 */
function parseDocument(data, options) {
    const handler = new DomHandler(undefined, options);
    new Parser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;

/**
 * Parses data, returns an array of the root nodes.
 * Use `parseDocument` to get the `Document` node instead.
 *
 * @deprecated Use `parseDocument` instead.
 * @param {string} data - The data that should be parsed.
 * @param {object} [options] - Optional options for the parser and DOM builder.
 */
function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

/**
 * Creates a parser instance, with an attached DOM handler.
 *
 * @param {function} cb - A callback that will be called once parsing has completed.
 * @param {object} [options] - Optional options for the parser and DOM builder.
 * @param {function} [elementCb] - An optional callback for completed tags in the DOM.
 */
function createDomStream(cb, options, elementCb) {
    const handler = new DomHandler(cb, options, elementCb);
    return new Parser(handler, options);
}
exports.createDomStream = createDomStream;

// Export additional modules for backward compatibility
Object.assign(exports, require("./FeedHandler"));
