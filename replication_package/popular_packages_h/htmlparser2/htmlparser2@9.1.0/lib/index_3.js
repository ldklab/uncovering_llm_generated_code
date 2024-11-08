"use strict";

const { Parser } = require("./Parser.js");
const { DomHandler } = require("domhandler");
const { getFeed } = require("domutils");
const { default: Tokenizer, QuoteType } = require("./Tokenizer.js");
const ElementType = require("domelementtype");
const DomUtils = require("domutils");

Object.defineProperty(exports, "__esModule", { value: true });

// Export components
exports.Parser = Parser;
exports.DomHandler = DomHandler;
exports.DefaultHandler = DomHandler; // Old name for DomHandler
exports.Tokenizer = Tokenizer;
exports.QuoteType = QuoteType;
exports.ElementType = ElementType;
exports.DomUtils = DomUtils;
exports.getFeed = domutils_2.getFeed;

// Default options for parsing feeds
const parseFeedDefaultOptions = { xmlMode: true };

/**
 * Parses the data, returns the resulting document.
 *
 * @param {string} data The data that should be parsed.
 * @param {object} [options] Optional options for the parser and DOM handler.
 * @returns {object} The parsed document.
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
 * @param {string} data The data that should be parsed.
 * @param {object} [options] Optional options for the parser and DOM handler.
 * @deprecated Use `parseDocument` instead.
 * @returns {array} Array of root nodes.
 */
function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

/**
 * Creates a parser instance, with an attached DOM handler.
 *
 * @param {function} callback A callback that will be called once parsing has been completed, with the resulting document.
 * @param {object} [options] Optional options for the parser and DOM handler.
 * @param {function} [elementCallback] An optional callback called every time a tag is completed in the DOM.
 * @returns {object} The parser instance.
 */
function createDocumentStream(callback, options, elementCallback) {
    const handler = new DomHandler((error) => callback(error, handler.root), options, elementCallback);
    return new Parser(handler, options);
}
exports.createDocumentStream = createDocumentStream;

/**
 * Creates a parser instance, with an attached DOM handler.
 *
 * @param {function} callback A callback that will be called once parsing has been completed, with an array of root nodes.
 * @param {object} [options] Optional options for the parser and DOM handler.
 * @param {function} [elementCallback] An optional callback called every time a tag is completed in the DOM.
 * @deprecated Use `createDocumentStream` instead.
 * @returns {object} The parser instance.
 */
function createDomStream(callback, options, elementCallback) {
    const handler = new DomHandler(callback, options, elementCallback);
    return new Parser(handler, options);
}
exports.createDomStream = createDomStream;

/**
 * Parse a feed.
 *
 * @param {string} feed The feed that should be parsed as a string.
 * @param {object} [options] Optionally, options for parsing. Set `xmlMode` to `true` when using this.
 * @returns {object} The parsed feed.
 */
function parseFeed(feed, options = parseFeedDefaultOptions) {
    return getFeed(parseDOM(feed, options));
}
exports.parseFeed = parseFeed;
