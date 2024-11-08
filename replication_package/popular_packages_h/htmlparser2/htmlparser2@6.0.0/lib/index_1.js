"use strict";

const { Parser } = require("./Parser");
const { DomHandler } = require("domhandler");
const Tokenizer = require("./Tokenizer").default;
const * as ElementType from "domelementtype";
const * as DomUtils from "domutils";
const { FeedHandler } = require("./FeedHandler");

exports.Parser = Parser;
exports.DomHandler = DomHandler;
exports.DefaultHandler = DomHandler; // For backwards compatibility
exports.Tokenizer = Tokenizer;
exports.ElementType = ElementType;
exports.DomUtils = DomUtils;
exports.RssHandler = FeedHandler;

/**
 * Parses the data and returns the resulting document.
 *
 * @param {string} data - The data that should be parsed.
 * @param {object} [options] - Optional options for the parser and DOM builder.
 * @returns {Document} - The root of the parsed document.
 */
function parseDocument(data, options) {
    const handler = new DomHandler(undefined, options);
    new Parser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;

/**
 * Parses data and returns an array of the root nodes.
 *
 * @param {string} data - The data that should be parsed.
 * @param {object} [options] - Optional options for the parser and DOM builder.
 * @deprecated Use `parseDocument` instead.
 * @returns {Array} - The root nodes with a `Document` node parent.
 */
function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

/**
 * Creates a parser instance with an attached DOM handler.
 *
 * @param {function} cb - A callback called once parsing is complete.
 * @param {object} [options] - Optional options for the parser and DOM builder.
 * @param {function} [elementCb] - Callback for completed tag elements.
 * @returns {Parser} - The parser instance.
 */
function createDomStream(cb, options, elementCb) {
    const handler = new DomHandler(cb, options, elementCb);
    return new Parser(handler, options);
}
exports.createDomStream = createDomStream;

// Export all from FeedHandler for backwards-compatibility
__exportStar(require("./FeedHandler"), exports);
