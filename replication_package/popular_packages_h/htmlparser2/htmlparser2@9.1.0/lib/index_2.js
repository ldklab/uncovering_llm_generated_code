"use strict";

const { Parser } = require("./Parser.js");
const { DomHandler } = require("domhandler");
const { default: Tokenizer, QuoteType } = require("./Tokenizer.js");
const { getFeed, ...DomUtils } = require("domutils");
const ElementType = require("domelementtype");

Object.defineProperty(exports, "__esModule", { value: true });

exports.Parser = Parser;
exports.DomHandler = DomHandler;
exports.DefaultHandler = DomHandler;
exports.Tokenizer = Tokenizer;
exports.QuoteType = QuoteType;
exports.ElementType = ElementType;
exports.DomUtils = DomUtils;
exports.getFeed = getFeed;

/**
 * Parses the data, returns the resulting document.
 *
 * @param {string} data - The data that should be parsed.
 * @param {object} options - Optional options for the parser and DOM handler.
 */
function parseDocument(data, options) {
    const handler = new DomHandler(undefined, options);
    new Parser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;

/**
 * Parses data, returns an array of the root nodes.
 *
 * Note that the root nodes still have a `Document` node as their parent.
 * Use `parseDocument` to get the `Document` node instead.
 *
 * @param {string} data - The data to be parsed.
 * @param {object} options - Optional settings for the parser and DOM handler.
 * @deprecated Use `parseDocument` instead.
 */
function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

/**
 * Creates a parser instance with an attached DOM handler.
 *
 * @param {function} callback - Callback for completion with resulting document.
 * @param {object} options - Optional settings for the parser and DOM handler.
 * @param {function} elementCallback - Optional callback for tag completion.
 */
function createDocumentStream(callback, options, elementCallback) {
    const handler = new DomHandler((error) => callback(error, handler.root), options, elementCallback);
    return new Parser(handler, options);
}
exports.createDocumentStream = createDocumentStream;

/**
 * Creates a parser instance with an attached DOM handler.
 *
 * @param {function} callback - Callback for completion with root nodes array.
 * @param {object} options - Optional settings for the parser and DOM handler.
 * @param {function} elementCallback - Optional callback for tag completion.
 * @deprecated Use `createDocumentStream` instead.
 */
function createDomStream(callback, options, elementCallback) {
    const handler = new DomHandler(callback, options, elementCallback);
    return new Parser(handler, options);
}
exports.createDomStream = createDomStream;

const parseFeedDefaultOptions = { xmlMode: true };

/**
 * Parse a feed.
 *
 * @param {string} feed - The feed to parse as a string.
 * @param {object} options - Options for parsing, should enable `xmlMode`.
 */
function parseFeed(feed, options = parseFeedDefaultOptions) {
    return getFeed(parseDOM(feed, options));
}
exports.parseFeed = parseFeed;

//# sourceMappingURL=index.js.map
