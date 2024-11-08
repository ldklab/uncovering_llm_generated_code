"use strict";

const { Parser as ImportedParser } = require("./Parser.js");
const { DomHandler: ImportedDomHandler } = require("domhandler");
const { default: Tokenizer, QuoteType } = require("./Tokenizer.js");
const ElementType = require("domelementtype");
const domUtils = require("domutils");
const { getFeed } = require("domutils");

Object.defineProperty(exports, "__esModule", { value: true });

exports.Parser = ImportedParser;
exports.DomHandler = ImportedDomHandler;
exports.DefaultHandler = ImportedDomHandler;
exports.Tokenizer = Tokenizer;
exports.QuoteType = QuoteType;
exports.ElementType = ElementType;

const parseFeedDefaultOptions = { xmlMode: true };

function parseDocument(data, options) {
    const handler = new ImportedDomHandler(undefined, options);
    new ImportedParser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;

function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;

function createDocumentStream(callback, options, elementCallback) {
    const handler = new ImportedDomHandler((error) => callback(error, handler.root), options, elementCallback);
    return new ImportedParser(handler, options);
}
exports.createDocumentStream = createDocumentStream;

function createDomStream(callback, options, elementCallback) {
    const handler = new ImportedDomHandler(callback, options, elementCallback);
    return new ImportedParser(handler, options);
}
exports.createDomStream = createDomStream;

function parseFeed(feed, options = parseFeedDefaultOptions) {
    return getFeed(parseDOM(feed, options));
}
exports.parseFeed = parseFeed;

exports.DomUtils = domUtils;
exports.getFeed = getFeed;
