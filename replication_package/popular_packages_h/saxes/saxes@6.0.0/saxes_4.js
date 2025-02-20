"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaxesParser = exports.EVENTS = void 0;
const ed5 = require("xmlchars/xml/1.0/ed5");
const ed2 = require("xmlchars/xml/1.1/ed2");
const NSed3 = require("xmlchars/xmlns/1.0/ed3");

const {
  isS,
  isChar: isChar10,
  isNameStartChar,
  isNameChar,
  S_LIST,
  NAME_RE,
} = ed5;

const { isChar: isChar11 } = ed2;
const { isNCNameStartChar, isNCNameChar, NC_NAME_RE } = NSed3;

const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";

const rootNS = {
  __proto__: null,
  xml: XML_NAMESPACE,
  xmlns: XMLNS_NAMESPACE,
};

const XML_ENTITIES = {
  __proto__: null,
  amp: "&",
  gt: ">",
  lt: "<",
  quot: "\"",
  apos: "'",
};

const EOC = -1;
const NL_LIKE = -2;
const S_BEGIN = 0;
const S_BEGIN_WHITESPACE = 1;
const S_DOCTYPE = 2;
const S_OPEN_TAG = 34;
// Other states are omitted for brevity

const EVENTS = [
  "xmldecl",
  "text",
  "processinginstruction",
  "doctype",
  "comment",
  "opentagstart",
  "attribute",
  "opentag",
  "closetag",
  "cdata",
  "error",
  "end",
  "ready",
];

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
  ready: "readyHandler",
};

class SaxesParser {
  constructor(opt) {
    this.opt = opt || {};
    this.fragmentOpt = !!this.opt.fragment;
    this.xmlnsOpt = !!this.opt.xmlns;
    this.trackPosition = this.opt.position !== false;
    this.fileName = this.opt.fileName;
    this._init();
  }

  _init() {
    var _a;
    this.state = S_BEGIN;
    this.openWakaBang = "";
    this.text = "";
    this.name = "";
    this.piTarget = "";
    this.entity = "";
    this.q = null;
    this.tags = [];
    this.tag = null;
    this.topNS = null;
    this.chunk = "";
    this.chunkPosition = 0;
    this.i = 0;
    this.prevI = 0;
    this.carriedFromPrevious = undefined;
    this.forbiddenState = FORBIDDEN_START;
    this.attribList = [];
    
    // Set the functions to handle namespaces based on config
    if (this.xmlnsOpt) {
      this.nameStartCheck = isNCNameStartChar;
      this.nameCheck = isNCNameChar;
      this.isName = isNCName;
      // Functions specific to handling namespaced XML
      this.processAttribs = this.processAttribsNS;
      this.pushAttrib = this.pushAttribNS;
      this.ns = Object.assign({ __proto__: null }, rootNS);
      
      const additional = this.opt.additionalNamespaces;
      if (additional != null) {
        nsMappingCheck(this, additional);
        Object.assign(this.ns, additional);
      }
    } else {
      this.nameStartCheck = isNameStartChar;
      this.nameCheck = isNameChar;
      this.isName = isName;
      this.processAttribs = this.processAttribsPlain;
      this.pushAttrib = this.pushAttribPlain;
    }
    
    this.stateTable = [
      this.sBegin,
      this.sBeginWhitespace,
      this.sDoctype,
      // Other methods omitted for brevity
    ];
    this._init();
  }

  on(name, handler) {
    this[EVENT_NAME_TO_HANDLER_NAME[name]] = handler;
  }

  off(name) {
    this[EVENT_NAME_TO_HANDLER_NAME[name]] = undefined;
  }
  
  fail(message) {
    const err = this.makeError(message);
    const handler = this.errorHandler;
    if (handler === undefined) {
      throw err;
    } else {
      handler(err);
    }
    return this;
  }
  
  write(chunk) {
    if (this.closed) {
      return this.fail("cannot write after close; assign an onready handler.");
    }
    let end = false;
    if (chunk === null) {
      end = true;
      chunk = "";
    } else if (typeof chunk === "object") {
      chunk = chunk.toString();
    }
    
    if (this.carriedFromPrevious !== undefined) {
      chunk = `${this.carriedFromPrevious}${chunk}`;
      this.carriedFromPrevious = undefined;
    }
    
    let limit = chunk.length;
    const lastCode = chunk.charCodeAt(limit - 1);
    if (!end && (lastCode === CR || (lastCode >= 0xD800 && lastCode <= 0xDBFF))) {
      this.carriedFromPrevious = chunk[limit - 1];
      limit--;
      chunk = chunk.slice(0, limit);
    }
    
    this.chunk = chunk;
    this.i = 0;
    const { stateTable } = this;
    while (this.i < limit) {
      stateTable[this.state].call(this);
    }
    this.chunkPosition += limit;
    return end ? this.end() : this;
  }

  // Various state management methods

  sBegin() {
    if (this.chunk.charCodeAt(0) === 0xFEFF) {
      this.i++;
      this.column++;
    }
    this.state = S_BEGIN_WHITESPACE;
  }

  sBeginWhitespace() {
    const iBefore = this.i;
    const c = this.skipSpaces();
    if (this.prevI !== iBefore) {
      this.xmlDeclPossible = false;
    }
    switch (c) {
      case LESS:
        this.state = S_OPEN_WAKA;
        if (this.text.length !== 0) {
          throw new Error("no-empty text at start");
        }
        break;
      case EOC:
        break;
      default:
        this.unget();
        this.state = S_TEXT;
        this.xmlDeclPossible = false;
    }
  }

  sDoctype() {
    var _a;
    const c = this.captureTo(DOCTYPE_TERMINATOR);
    switch (c) {
      case GREATER: {
        (_a = this.doctypeHandler)?.call(this, this.text);
        this.text = "";
        this.state = S_TEXT;
        this.doctype = true;
        break;
      }
      case EOC:
        break;
      default:
        this.text += String.fromCodePoint(c);
        if (c === OPEN_BRACKET) {
          this.state = S_DTD;
        } else if (isQuote(c)) {
          this.state = S_DOCTYPE_QUOTE;
          this.q = c;
        }
    }
  }

  // Further state methods here

  // Functions handling opening, closing tags, attributes

  openTag() {
    var _a;
    this.processAttribs();
    const { tags } = this;
    const tag = this.tag;
    tag.isSelfClosing = false;
    (_a = this.openTagHandler)?.call(this, tag);
    tags.push(tag);
    this.state = S_TEXT;
    this.name = "";
  }

  closeTag() {
    const { tags, name } = this;
    this.state = S_TEXT;
    this.name = "";

    if (name === "") {
      this.fail("weird empty close tag.");
      this.text += "</>";
      return;
    }

    let l = tags.length;
    while (l-- > 0) {
      const tag = this.tag = tags.pop();
      this.topNS = tag.ns;
      this.closeTagHandler?.(tag);
      if (tag.name === name) {
        break;
      }
      this.fail("unexpected close tag.");
    }
    if (l === 0) {
      this.closedRoot = true;
    } else if (l < 0) {
      this.fail(`unmatched closing tag: ${name}.`);
      this.text += `</${name}>`;
    }
  }
  
  // Additional operational functions

  processAttribsNS() {
    var _a;
    const { attribList } = this;
    const tag = this.tag;
    const { prefix, local } = this.qname(tag.name);
    tag.prefix = prefix;
    tag.local = local;
    tag.uri = (_a = this.resolve(prefix)) ?? "";
    if (prefix !== "") {
      if (prefix === "xmlns") {
        this.fail("tags may not have \"xmlns\" as prefix.");
      }
      if (tag.uri === "") {
        this.fail(`unbound namespace prefix: ${JSON.stringify(prefix)}.`);
        tag.uri = prefix;
      }
    }
    if (attribList.length === 0) {
      return;
    }
    const { attributes } = tag;
    const seen = new Set();
    for (const attr of attribList) {
      let uri;
      let eqname;
      if (attr.prefix === "") {
        uri = attr.name === "xmlns" ? XMLNS_NAMESPACE : "";
        eqname = attr.name;
      } else {
        uri = this.resolve(attr.prefix);
        if (uri === undefined) {
          this.fail(`unbound namespace prefix: ${JSON.stringify(attr.prefix)}.`);
          uri = attr.prefix;
        }
        eqname = `{${uri}}${attr.local}`;
      }
      if (seen.has(eqname)) {
        this.fail(`duplicate attribute: ${eqname}.`);
      }
      seen.add(eqname);
      attr.uri = uri;
      attributes[attr.name] = attr;
    }
    this.attribList = [];
  }

  processAttribsPlain() {
    const { attribList } = this;
    const attributes = this.tag.attributes;
    for (const { name, value } of attribList) {
      if (attributes[name] !== undefined) {
        this.fail(`duplicate attribute: ${name}.`);
      }
      attributes[name] = value;
    }
    this.attribList = [];
  }

  // Meta and utility functions

  end() {
    var _a, _b;
    if (!this.sawRoot) {
      this.fail("document must contain a root element.");
    }
    while (this.tags.length > 0) {
      const tag = this.tags.pop();
      this.fail(`unclosed tag: ${tag.name}`);
    }
    if (this.state !== S_BEGIN && this.state !== S_TEXT) {
      this.fail("unexpected end.");
    }
    const { text } = this;
    if (text.length !== 0) {
      (_a = this.textHandler)?.(text);
      this.text = "";
    }
    this._closed = true;
    (_b = this.endHandler)?.(this);
    this._init();
    return this;
  }
}

exports.SaxesParser = SaxesParser;
