"use strict";

const { Parser } = require("./Parser.js");
const { DomHandler } = require("domhandler");
const { default: Tokenizer, QuoteType } = require("./Tokenizer.js");
const ElementType = require("domelementtype");
const DomUtils = require("domutils");
const { getFeed } = DomUtils;

Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = Parser;
exports.DomHandler = DomHandler;
exports.DefaultHandler = DomHandler; // Alias for backwards compatibility
exports.Tokenizer = Tokenizer;
exports.QuoteType = QuoteType;
exports.ElementType = ElementType;
exports.getFeed = getFeed;
exports.DomUtils = DomUtils;

function parseDocument(data, options) {
    const handler = new DomHandler(undefined, options);
    new Parser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;

function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

function createDocumentStream(callback, options, elementCallback) {
    const handler = new DomHandler(
        (error) => callback(error, handler.root), 
        options, 
        elementCallback
    );
    return new Parser(handler, options);
}
exports.createDocumentStream = createDocumentStream;

function createDomStream(callback, options, elementCallback) {
    const handler = new DomHandler(callback, options, elementCallback);
    return new Parser(handler, options);
}
exports.createDomStream = createDomStream;

const parseFeedDefaultOptions = { xmlMode: true };

function parseFeed(feed, options = parseFeedDefaultOptions) {
    return getFeed(parseDOM(feed, options));
}
exports.parseFeed = parseFeed;
