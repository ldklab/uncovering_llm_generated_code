"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const xml10 = require("xmlchars/xml/1.0/ed5");
const xml11 = require("xmlchars/xml/1.1/ed2");
const xmlns = require("xmlchars/xmlns/1.0/ed3");

const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
const rootNS = { __proto__: null, xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
const XML_ENTITIES = { __proto__: null, amp: "&", gt: ">", lt: "<", quot: "\"", apos: "'" };

const STATE = {
    BEGIN: 0, TEXT: 13, OPEN_TAG: 34, ATTRIB: 36, CLOSE_TAG: 43, ENTITY: 14,
    // Other states omitted for brevity...
};

const CHARS = {
    TAB: 9, NL: 0xA, CR: 0xD, SPACE: 0x20, BANG: 0x21,
    LESS: 0x3C, EQUAL: 0x3D, GREATER: 0x3E, QUESTION: 0x3F,
    // Other character codes omitted for brevity...
};

const isQuote = (c) => c === CHARS.DQUOTE || c === CHARS.SQUOTE;
const QUOTES = [CHARS.DQUOTE, CHARS.SQUOTE];

class SaxesParser {
    constructor(options = {}) {
        this.opt = options;
        this.fragmentOpt = !!this.opt.fragment;
        this.xmlnsOpt = !!this.opt.xmlns;
        this.trackPosition = this.opt.position !== false;
        this.fileName = this.opt.fileName;
        
        this.stateTable = [
            this.begin, this.beginWhitespace, this.doctype, this.doctypeQuote, 
            this.dtd, this.dtdQuoted, this.dtdOpenWaka, 
            // Other methods omitted for brevity...
        ];

        this._init();
    }

    _init() {
        this.state = this.fragmentOpt ? STATE.TEXT : STATE.BEGIN;
        this.text = "";
        this.name = "";
        this.tags = [];
        this.tag = null;
        this.chunk = "";
        this.chunkPosition = 0;
        this._closed = false;

        const defaultXMLVersion = this.opt.defaultXMLVersion || "1.0";
        this.setXMLVersion(defaultXMLVersion);
    }

    setXMLVersion(version) {
        this.currentXMLVersion = version;
        if (version === "1.0") {
            this.isChar = xml10.isChar;
            this.getCode = this.getCode10;
        } else {
            this.isChar = xml11.isChar;
            this.getCode = this.getCode11;
        }
    }

    parseEntity(entity) {
        if (entity.startsWith("#")) {
            let num = entity[1] === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
            if (!this.isChar(num)) {
                this.fail("malformed character entity.");
                return `&${entity};`;
            }
            return String.fromCodePoint(num);
        }
        
        const defined = this.ENTITIES[entity];
        if (defined !== undefined) return defined;

        this.fail(this.isName(entity) ? "undefined entity." : "disallowed character in entity name.");
        return `&${entity};`;
    }

    fail(message) {
        let msg = this.fileName ? `${this.fileName}: ` : "";
        msg += this.trackPosition ? `[${this.line}:${this.column}] ` : "";
        msg += message;
        throw new Error(msg);
    }

    // Parsing methods such as begin, beginWhitespace, doctype, etc., are omitted for brevity...
}

exports.SaxesParser = SaxesParser;
