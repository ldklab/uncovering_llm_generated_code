"use strict";

const { Document, Element, Text, Comment, ProcessingInstruction, NodeWithChildren } = require("./node");

const reWhitespace = /\s+/g;

const defaultOpts = {
    normalizeWhitespace: false,
    withStartIndices: false,
    withEndIndices: false,
};

class DomHandler {
    constructor(callback, options, elementCB) {
        this.dom = [];
        this.root = new Document(this.dom);
        this.done = false;
        this.tagStack = [this.root];
        this.lastNode = null;
        this.parser = null;

        if (typeof options === "function") {
            elementCB = options;
            options = defaultOpts;
        }
        if (typeof callback === "object") {
            options = callback;
            callback = undefined;
        }
        this.callback = callback || null;
        this.options = options || defaultOpts;
        this.elementCB = elementCB || null;
    }

    onparserinit(parser) {
        this.parser = parser;
    }

    onreset() {
        this.dom = [];
        this.root = new Document(this.dom);
        this.done = false;
        this.tagStack = [this.root];
        this.lastNode = null;
        this.parser = this.parser || null;
    }

    onend() {
        if (this.done) return;
        this.done = true;
        this.parser = null;
        this.handleCallback(null);
    }

    onerror(error) {
        this.handleCallback(error);
    }

    onclosetag() {
        this.lastNode = null;
        const elem = this.tagStack.pop();
        if (this.options.withEndIndices) {
            elem.endIndex = this.parser.endIndex;
        }
        if (this.elementCB) this.elementCB(elem);
    }

    onopentag(name, attribs) {
        const element = new Element(name, attribs);
        this.addNode(element);
        this.tagStack.push(element);
    }

    ontext(data) {
        const { normalizeWhitespace } = this.options;
        const lastNode = this.lastNode;

        if (lastNode && lastNode.type === "text") {
            lastNode.data = normalizeWhitespace 
                ? (lastNode.data + data).replace(reWhitespace, " ") 
                : lastNode.data + data;
        } else {
            data = normalizeWhitespace ? data.replace(reWhitespace, " ") : data;
            const node = new Text(data);
            this.addNode(node);
            this.lastNode = node;
        }
    }

    oncomment(data) {
        if (this.lastNode && this.lastNode.type === "comment") {
            this.lastNode.data += data;
        } else {
            const node = new Comment(data);
            this.addNode(node);
            this.lastNode = node;
        }
    }

    oncommentend() {
        this.lastNode = null;
    }

    oncdatastart() {
        const text = new Text("");
        const node = new NodeWithChildren("cdata", [text]);
        this.addNode(node);
        text.parent = node;
        this.lastNode = text;
    }

    oncdataend() {
        this.lastNode = null;
    }

    onprocessinginstruction(name, data) {
        const node = new ProcessingInstruction(name, data);
        this.addNode(node);
    }

    handleCallback(error) {
        if (typeof this.callback === "function") {
            this.callback(error, this.dom);
        } else if (error) {
            throw error;
        }
    }

    addNode(node) {
        const parent = this.tagStack[this.tagStack.length - 1];
        const previousSibling = parent.children[parent.children.length - 1];

        if (this.options.withStartIndices) {
            node.startIndex = this.parser.startIndex;
        }
        if (this.options.withEndIndices) {
            node.endIndex = this.parser.endIndex;
        }

        parent.children.push(node);

        if (previousSibling) {
            node.prev = previousSibling;
            previousSibling.next = node;
        }

        node.parent = parent;
        this.lastNode = null;
    }

    addDataNode(node) {
        this.addNode(node);
        this.lastNode = node;
    }
}

module.exports.DomHandler = DomHandler;
module.exports.default = DomHandler;
