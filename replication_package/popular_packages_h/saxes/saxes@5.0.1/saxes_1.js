"use strict";

const ed5 = require("xmlchars/xml/1.0/ed5");
const ed2 = require("xmlchars/xml/1.1/ed2");
const NSed3 = require("xmlchars/xmlns/1.0/ed3");

const isChar10 = ed5.isChar;
const isChar11 = ed2.isChar;
const isNameStartChar = ed5.isNameStartChar;
const isNameChar = ed5.isNameChar;
const isNCNameStartChar = NSed3.isNCNameStartChar;
const isNCNameChar = NSed3.isNCNameChar;
const NAME_RE = ed5.NAME_RE;
const NC_NAME_RE = NSed3.NC_NAME_RE;
const S_LIST = ed5.S_LIST;

const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";

const rootNS = {
  __proto__: null,
  xml: XML_NAMESPACE,
  xmlns: XMLNS_NAMESPACE
};

const XML_ENTITIES = {
  __proto__: null,
  amp: "&",
  gt: ">",
  lt: "<",
  quot: "\"",
  apos: "'"
};

const EVENT_NAME_TO_HANDLER_NAME = {
  xmldecl: "xmldeclHandler",
  text: "textHandler",
  processinginstruction: "piHandler",
  doctype: "doctypeHandler",
  comment: "commentHandler",
  opentagstart: "openTagStartHandler",
  attribute: "attributeHandler",
  opentag: "openTagHandler",
  closetag: "closeTagHandler",
  cdata: "cdataHandler",
  error: "errorHandler",
  end: "endHandler",
  ready: "readyHandler"
};

class SaxesParser {
  constructor(opt) {
    this.opt = opt || {};
    this.trackPosition = this.opt.position !== false;
    this.xmlnsOpt = !!this.opt.xmlns;

    if (this.xmlnsOpt) {
      this.nameStartCheck = isNCNameStartChar;
      this.nameCheck = isNCNameChar;
      this.processAttribs = this.processAttribsNS;
      this.pushAttrib = this.pushAttribNS;
      this.ns = { __proto__: null, ...rootNS };
    } else {
      this.nameStartCheck = isNameStartChar;
      this.nameCheck = isNameChar;
      this.processAttribs = this.processAttribsPlain;
      this.pushAttrib = this.pushAttribPlain;
    }

    this.stateTable = [
      this.sBegin,
      this.sBeginWhitespace,
      this.sOpenWaka,
      this.sOpenTag,
      this.sAttribName,
      this.sAttribValue,
      this.sAttribValueQuoted,
      this.sAttribValueClosed,
      this.sCloseTag
    ];

    this._init();
  }

  get closed() {
    return this._closed;
  }

  _init() {
    this.state = S_BEGIN;
    this.tag = null;
    this.tags = [];
    this.text = "";
    this.name = "";
    this.attribList = [];
    this.xmlDecl = { version: undefined, encoding: undefined, standalone: undefined };
    this.currentXMLVersion = this.opt.defaultXMLVersion || "1.0";
    this._closed = false;
  }

  on(name, handler) {
    this[EVENT_NAME_TO_HANDLER_NAME[name]] = handler;
  }

  off(name) {
    this[EVENT_NAME_TO_HANDLER_NAME[name]] = undefined;
  }

  write(chunk) {
    if (this.closed) throw new Error("Cannot write after close.");

    if (typeof chunk === "object") {
      chunk = chunk.toString();
    }

    this.chunk = chunk;

    while (this.i < chunk.length) {
      this.stateTable[this.state].call(this);
    }

    return this;
  }

  close() {
    return this.write(null);
  }

  getCode() {
    const code = this.chunk.charCodeAt(this.i++);
    this.column++;
    if (code < 0xD800) return code;
    return 0x10000 + ((code - 0xD800) << 10) + (this.chunk.charCodeAt(this.i++) - 0xDC00);
  }

  makeError(message) {
    let msg = this.fileName ? `${this.fileName}: ` : "";
    msg += `${this.line}:${this.column}: ${message}`;
    return new Error(msg);
  }

  fail(message) {
    const err = this.makeError(message);
    if (this.errorHandler === undefined) throw err;
    this.errorHandler(err);
  }

  processAttribsNS() {
    const { attributes } = this.tag;
    this.attribList.forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    this.attribList = [];
  }

  processAttribsPlain() {
    const { attributes } = this.tag;
    this.attribList.forEach(attr => {
      if (attributes[attr.name] !== undefined) {
        this.fail(`Duplicate attribute: ${attr.name}`);
      }
      attributes[attr.name] = attr.value;
    });
    this.attribList = [];
  }

  sBegin() {
    if (this.chunk.charCodeAt(0) === 0xFEFF) {
      this.i++;
      this.column++;
    }
    this.state = S_BEGIN_WHITESPACE;
  }

  sBeginWhitespace() {
    const c = this.skipSpaces();
    if (c === LESS) {
      this.state = S_OPEN_WAKA;
    } else if (c !== EOC) {
      this.state = S_TEXT;
    }
  }

  sOpenWaka() {
    const c = this.getCode();
    if (isNameStartChar(c)) {
      this.state = S_OPEN_TAG;
      this.unget();
    } else if (c === FORWARD_SLASH) {
      this.state = S_CLOSE_TAG;
    } else {
      this.fail("Invalid character in tag.");
      this.state = S_TEXT;
    }
  }

  openTag() {
    this.processAttribs();
    const tag = this.tag;
    tag.isSelfClosing = false;
    if (this.openTagHandler) this.openTagHandler(tag);
    this.tags.push(tag);
    this.state = S_TEXT;
    this.name = "";
  }

  sOpenTag() {
    const c = this.captureNameChars();
    if (c === GREATER) {
      this.openTag();
    } else if (c === FORWARD_SLASH) {
      this.state = S_OPEN_TAG_SLASH;
    } else {
      this.state = S_ATTRIB;
    }
  }

  sCloseTag() {
    const c = this.captureNameChars();
    if (c === GREATER) {
      this.closeTag();
    } else {
      this.fail("Invalid closing tag character.");
    }
  }

  captureNameChars() {
    const start = this.i;
    while (this.i < this.chunk.length) {
      const c = this.getCode();
      if (!isNameChar(c)) {
        this.i--;
        this.name = this.chunk.slice(start, this.i);
        return c;
      }
    }
    return EOC;
  }

  skipSpaces() {
    while (this.i < this.chunk.length) {
      const c = this.getCode();
      if (!isS(c)) return c;
    }
    return EOC;
  }

  get position() {
    return this.chunkPosition + this.i;
  }

  closeTag() {
    const { name, tags } = this;
    let tag = null;
    while (tags.length > 0) {
      tag = tags.pop();
      if (tag.name === name) break;
      this.fail(`Unexpected close tag: ${name}`);
    }
    if (this.closeTagHandler) this.closeTagHandler(tag);
  }
}

exports.SaxesParser = SaxesParser;
