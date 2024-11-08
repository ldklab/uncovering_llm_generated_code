"use strict";

const { Parser: InnerParser } = require("./Parser");
const domhandler = require("domhandler");
const TokenizerModule = require("./Tokenizer");
const ElementType = require("domelementtype");
const { FeedHandler } = require("./FeedHandler");
const DomUtils = require("domutils");

// Export necessary modules and functionalities
exports.Parser = InnerParser;
exports.DomHandler = domhandler.DomHandler;
exports.DefaultHandler = domhandler.DomHandler;
exports.Tokenizer = TokenizerModule.default;
exports.ElementType = ElementType;
exports.RssHandler = FeedHandler;
exports.DomUtils = DomUtils;

// Helper methods

/**
 * Parses the data to return the resulting document.
 *
 * @param {*} data - The data to be parsed.
 * @param {*} options - Optional parser and DOM builder options.
 * @returns The parsed document's root.
 */
function parseDocument(data, options) {
    const handler = new domhandler.DomHandler(undefined, options);
    new InnerParser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;

/**
 * Parses data to return an array of the root nodes.
 *
 * @param {*} data - The data to be parsed.
 * @param {*} options - Optional parser and DOM builder options.
 * @returns Array of root nodes.
 * @deprecated Use `parseDocument` instead.
 */
function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

/**
 * Creates a parser instance with an attached DOM handler.
 *
 * @param {*} cb - Callback upon parsing completion.
 * @param {*} options - Optional parser and DOM builder options.
 * @param {*} elementCb - Optional callback for element completion.
 * @returns A new parser instance.
 */
function createDomStream(cb, options, elementCb) {
    const handler = new domhandler.DomHandler(cb, options, elementCb);
    return new InnerParser(handler, options);
}
exports.createDomStream = createDomStream;

// For backwards-compatibility
require("./FeedHandler"); // Ensures compatibility by exporting the necessary parts of FeedHandler

// Exports module for future backward compatibility
__exportStar(require("./FeedHandler"), exports);
