"use strict";

const { ElementType } = require("domelementtype");
const { Document, Element, Text, Comment, CDATA, ProcessingInstruction } = require("./node.js");

Object.defineProperty(exports, "__esModule", { value: true });
exports.DomHandler = undefined;

const defaultOpts = {
    withStartIndices: false,
    withEndIndices: false,
    xmlMode: false
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
            elementCB = options; options = defaultOpts;
        }
        if (typeof callback === "object") {
            options = callback; callback = undefined;
        }

        this.callback = callback ?? null;
        this.options = options ?? defaultOpts;
        this.elementCB = elementCB ?? null;
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
        this.parser = null;
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
        const type = this.options.xmlMode ? ElementType.Tag : undefined;
        const element = new Element(name, attribs, undefined, type);
        this.addNode(element);
        this.tagStack.push(element);
    }

    ontext(data) {
        let lastNode = this.lastNode;
        if (lastNode && lastNode.type === ElementType.Text) {
            lastNode.data += data;
            if (this.options.withEndIndices) {
                lastNode.endIndex = this.parser.endIndex;
            }
        } else {
            const node = new Text(data);
            this.addNode(node);
            this.lastNode = node;
        }
    }

    oncomment(data) {
        if (this.lastNode && this.lastNode.type === ElementType.Comment) {
            this.lastNode.data += data;
            return;
        }
        const node = new Comment(data);
        this.addNode(node);
        this.lastNode = node;
    }

    oncommentend() {
        this.lastNode = null;
    }

    oncdatastart() {
        const text = new Text("");
        const node = new CDATA([text]);
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
}

exports.DomHandler = DomHandler;
exports.default = DomHandler;
export * from "./node.js";
