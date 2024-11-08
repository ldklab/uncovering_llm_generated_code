"use strict";

const { Parser } = require("./Parser");
const { DomHandler } = require("domhandler");
const Tokenizer = require("./Tokenizer").default;
const ElementType = require("domelementtype");
const DomUtils = require("domutils");
const { FeedHandler } = require("./FeedHandler");

function parseDocument(data, options) {
    const handler = new DomHandler(undefined, options);
    new Parser(handler, options).end(data);
    return handler.root;
}

function parseDOM(data, options) {
    return parseDocument(data, options).children;
}

function createDomStream(cb, options, elementCb) {
    const handler = new DomHandler(cb, options, elementCb);
    return new Parser(handler, options);
}

module.exports = {
    Parser,
    DomHandler,
    DefaultHandler: DomHandler,
    parseDocument,
    parseDOM,
    createDomStream,
    Tokenizer,
    ElementType,
    DomUtils,
    RssHandler: FeedHandler
};

require("./FeedHandler");
