"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const ed5 = require("xmlchars/xml/1.0/ed5");
const ed2 = require("xmlchars/xml/1.1/ed2");
const NSed3 = require("xmlchars/xmlns/1.0/ed3");

const isS = ed5.isS;
const isChar10 = ed5.isChar;
const isNameStartChar = ed5.isNameStartChar;
const isNameChar = ed5.isNameChar;
const { S_LIST, NAME_RE } = ed5;
const isChar11 = ed2.isChar;
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
const S_DOCTYPE_QUOTE = 3;
const S_DTD = 4;
const S_DTD_QUOTED = 5;
const S_DTD_OPEN_WAKA = 6;
const S_DTD_OPEN_WAKA_BANG = 7;
const S_DTD_COMMENT = 8;
const S_DTD_COMMENT_ENDING = 9;
const S_DTD_COMMENT_ENDED = 10;
const S_DTD_PI = 11;
const S_DTD_PI_ENDING = 12;
const S_TEXT = 13;
const S_ENTITY = 14;
const S_OPEN_WAKA = 15;
const S_OPEN_WAKA_BANG = 16;
const S_COMMENT = 17;
const S_COMMENT_ENDING = 18;
const S_COMMENT_ENDED = 19;
const S_CDATA = 20;
const S_CDATA_ENDING = 21;
const S_CDATA_ENDING_2 = 22;
const S_PI_FIRST_CHAR = 23;
const S_PI_REST = 24;
const S_PI_BODY = 25;
const S_PI_ENDING = 26;
const S_XML_DECL_NAME_START = 27;
const S_XML_DECL_NAME = 28;
const S_XML_DECL_EQ = 29;
const S_XML_DECL_VALUE_START = 30;
const S_XML_DECL_VALUE = 31;
const S_XML_DECL_SEPARATOR = 32;
const S_XML_DECL_ENDING = 33;
const S_OPEN_TAG = 34;
const S_OPEN_TAG_SLASH = 35;
const S_ATTRIB = 36;
const S_ATTRIB_NAME = 37;
const S_ATTRIB_NAME_SAW_WHITE = 38;
const S_ATTRIB_VALUE = 39;
const S_ATTRIB_VALUE_QUOTED = 40;
const S_ATTRIB_VALUE_CLOSED = 41;
const S_ATTRIB_VALUE_UNQUOTED = 42;
const S_CLOSE_TAG = 43;
const S_CLOSE_TAG_SAW_WHITE = 44;
const TAB = 9;
const NL = 0xA;
const CR = 0xD;
const SPACE = 0x20;
const BANG = 0x21;
const DQUOTE = 0x22;
const AMP = 0x26;
const SQUOTE = 0x27;
const MINUS = 0x2D;
const FORWARD_SLASH = 0x2F;
const SEMICOLON = 0x3B;
const LESS = 0x3C;
const EQUAL = 0x3D;
const GREATER = 0x3E;
const QUESTION = 0x3F;
const OPEN_BRACKET = 0x5B;
const CLOSE_BRACKET = 0x5D;
const NEL = 0x85;
const LS = 0x2028;

const isQuote = c => c === DQUOTE || c === SQUOTE;
const QUOTES = [DQUOTE, SQUOTE];
const DOCTYPE_TERMINATOR = [...QUOTES, OPEN_BRACKET, GREATER];
const DTD_TERMINATOR = [...QUOTES, LESS, CLOSE_BRACKET];
const XML_DECL_NAME_TERMINATOR = [EQUAL, QUESTION, ...S_LIST];
const ATTRIB_VALUE_UNQUOTED_TERMINATOR = [...S_LIST, GREATER, AMP, LESS];

function nsPairCheck(parser, prefix, uri) {
    switch (prefix) {
        case "xml":
            if (uri !== XML_NAMESPACE)
                parser.fail(`xml prefix must be bound to ${XML_NAMESPACE}.`);
            break;
        case "xmlns":
            if (uri !== XMLNS_NAMESPACE)
                parser.fail(`xmlns prefix must be bound to ${XMLNS_NAMESPACE}.`);
            break;
    }
    if (uri === XMLNS_NAMESPACE)
        parser.fail(prefix === "" ? `the default namespace may not be set to ${uri}.` : `may not assign a prefix (even "xmlns") to the URI ${XMLNS_NAMESPACE}.`);
    else if (uri === XML_NAMESPACE)
        switch (prefix) {
            case "xml":
                break;
            case "":
                parser.fail(`the default namespace may not be set to ${uri}.`);
                break;
            default:
                parser.fail("may not assign the xml namespace to another prefix.");
        }
}

function nsMappingCheck(parser, mapping) {
    for (const local of Object.keys(mapping))
        nsPairCheck(parser, local, mapping[local]);
}

const isNCName = name => NC_NAME_RE.test(name);
const isName = name => NAME_RE.test(name);
const FORBIDDEN_START = 0;
const FORBIDDEN_BRACKET = 1;
const FORBIDDEN_BRACKET_BRACKET = 2;

exports.EVENTS = [
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
        this.opt = opt ?? {};
        this.fragmentOpt = !!this.opt.fragment;
        this.xmlnsOpt = !!this.opt.xmlns;
        this.trackPosition = this.opt.position !== false;
        this.fileName = this.opt.fileName;
        
        if (this.xmlnsOpt) {
            this.nameStartCheck = isNCNameStartChar;
            this.nameCheck = isNCNameChar;
            this.isName = isNCName;
            this.processAttribs = this.processAttribsNS;
            this.pushAttrib = this.pushAttribNS;
            this.ns = Object.assign({ __proto__: null }, rootNS);
            if (this.opt.additionalNamespaces) {
                nsMappingCheck(this, this.opt.additionalNamespaces);
                Object.assign(this.ns, this.opt.additionalNamespaces);
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
            this.sDoctypeQuote,
            this.sDTD,
            this.sDTDQuoted,
            this.sDTDOpenWaka,
            this.sDTDOpenWakaBang,
            this.sDTDComment,
            this.sDTDCommentEnding,
            this.sDTDCommentEnded,
            this.sDTDPI,
            this.sDTDPIEnding,
            this.sText,
            this.sEntity,
            this.sOpenWaka,
            this.sOpenWakaBang,
            this.sComment,
            this.sCommentEnding,
            this.sCommentEnded,
            this.sCData,
            this.sCDataEnding,
            this.sCDataEnding2,
            this.sPIFirstChar,
            this.sPIRest,
            this.sPIBody,
            this.sPIEnding,
            this.sXMLDeclNameStart,
            this.sXMLDeclName,
            this.sXMLDeclEq,
            this.sXMLDeclValueStart,
            this.sXMLDeclValue,
            this.sXMLDeclSeparator,
            this.sXMLDeclEnding,
            this.sOpenTag,
            this.sOpenTagSlash,
            this.sAttrib,
            this.sAttribName,
            this.sAttribNameSawWhite,
            this.sAttribValue,
            this.sAttribValueQuoted,
            this.sAttribValueClosed,
            this.sAttribValueUnquoted,
            this.sCloseTag,
            this.sCloseTagSawWhite,
        ];
        this._init();
    }

    get closed() {
        return this._closed;
    }

    _init() {
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

        this.state = this.fragmentOpt ? S_TEXT : S_BEGIN;

        this.reportedTextBeforeRoot = this.reportedTextAfterRoot = this.closedRoot = this.sawRoot = this.fragmentOpt;
        this.xmlDeclPossible = !this.fragmentOpt;
        this.xmlDeclExpects = ["version"];
        this.entityReturnState = undefined;

        let defaultXMLVersion = this.opt.defaultXMLVersion;
        if (defaultXMLVersion === undefined) {
            if (this.opt.forceXMLVersion === true) throw new Error("forceXMLVersion set but defaultXMLVersion is not set");
            defaultXMLVersion = "1.0";
        }
        this.setXMLVersion(defaultXMLVersion);

        this.positionAtNewLine = 0;
        this.doctype = false;
        this._closed = false;

        this.xmlDecl = {
            version: undefined,
            encoding: undefined,
            standalone: undefined,
        };

        this.line = 1;
        this.column = 0;
        this.ENTITIES = Object.create(XML_ENTITIES);
        if (this.readyHandler) this.readyHandler();
    }

    get position() {
        return this.chunkPosition + this.i;
    }

    get columnIndex() {
        return this.position - this.positionAtNewLine;
    }

    on(name, handler) {
        this[EVENT_NAME_TO_HANDLER_NAME[name]] = handler;
    }

    off(name) {
        this[EVENT_NAME_TO_HANDLER_NAME[name]] = undefined;
    }

    makeError(message) {
        let msg = this.fileName ?? "";
        if (this.trackPosition) {
            if (msg.length > 0) msg += ":";
            msg += `${this.line}:${this.column}`;
        }
        if (msg.length > 0) msg += ": ";
        return new Error(msg + message);
    }

    fail(message) {
        const err = this.makeError(message);
        const handler = this.errorHandler;
        if (handler === undefined) throw err;
        else handler(err);
        return this;
    }

    write(chunk) {
        if (this.closed) return this.fail("cannot write after close; assign an onready handler.");
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

        const { stateTable } = this;
        this.chunk = chunk;
        this.i = 0;

        while (this.i < limit) {
            stateTable[this.state].call(this);
        }

        this.chunkPosition += limit;
        return end ? this.end() : this;
    }

    close() {
        return this.write(null);
    }

    getCode10() {
        const { chunk, i } = this;
        this.prevI = i;
        this.i = i + 1;
        if (i >= chunk.length) return EOC;
        const code = chunk.charCodeAt(i);
        this.column++;
        if (code < 0xD800) {
            if (code >= SPACE || code === TAB) return code;
            switch (code) {
                case NL:
                    this.line++;
                    this.column = 0;
                    this.positionAtNewLine = this.position;
                    return NL;
                case CR:
                    if (chunk.charCodeAt(i + 1) === NL) this.i = i + 2;
                    this.line++;
                    this.column = 0;
                    this.positionAtNewLine = this.position;
                    return NL_LIKE;
                default:
                    this.fail("disallowed character.");
                    return code;
            }
        }
        if (code > 0xDBFF) {
            if (!(code >= 0xE000 && code <= 0xFFFD)) this.fail("disallowed character.");
            return code;
        }
        const final = 0x10000 + ((code - 0xD800) * 0x400) + (chunk.charCodeAt(i + 1) - 0xDC00);
        this.i = i + 2;
        if (final > 0x10FFFF) this.fail("disallowed character.");
        return final;
    }

    getCode11() {
        const { chunk, i } = this;
        this.prevI = i;
        this.i = i + 1;
        if (i >= chunk.length) return EOC;
        const code = chunk.charCodeAt(i);
        this.column++;
        if (code < 0xD800) {
            if ((code > 0x1F && code < 0x7F) || (code > 0x9F && code !== LS) || code === TAB) return code;
            switch (code) {
                case NL:
                    this.line++;
                    this.column = 0;
                    this.positionAtNewLine = this.position;
                    return NL;
                case CR:
                    const next = chunk.charCodeAt(i + 1);
                    if (next === NL || next === NEL) this.i = i + 2;
                case NEL:
                case LS:
                    this.line++;
                    this.column = 0;
                    this.positionAtNewLine = this.position;
                    return NL_LIKE;
                default:
                    this.fail("disallowed character.");
                    return code;
            }
        }
        if (code > 0xDBFF) {
            if (!(code >= 0xE000 && code <= 0xFFFD)) this.fail("disallowed character.");
            return code;
        }
        const final = 0x10000 + ((code - 0xD800) * 0x400) + (chunk.charCodeAt(i + 1) - 0xDC00);
        this.i = i + 2;
        if (final > 0x10FFFF) this.fail("disallowed character.");
        return final;
    }

    getCodeNorm() {
        const c = this.getCode();
        return c === NL_LIKE ? NL : c;
    }

    unget() {
        this.i = this.prevI;
        this.column--;
    }

    captureTo(chars) {
        let { i: start } = this;
        const { chunk } = this;
        while (true) {
            const c = this.getCode();
            const isNLLike = c === NL_LIKE;
            const final = isNLLike ? NL : c;
            if (final === EOC || chars.includes(final)) {
                this.text += chunk.slice(start, this.prevI);
                return final;
            }
            if (isNLLike) {
                this.text += `${chunk.slice(start, this.prevI)}\n`;
                start = this.i;
            }
        }
    }

    captureToChar(char) {
        let { i: start } = this;
        const { chunk } = this;
        while (true) {
            let c = this.getCode();
            switch (c) {
                case NL_LIKE:
                    this.text += `${chunk.slice(start, this.prevI)}\n`;
                    start = this.i;
                    c = NL;
                    break;
                case EOC:
                    this.text += chunk.slice(start);
                    return false;
                default:
            }
            if (c === char) {
                this.text += chunk.slice(start, this.prevI);
                return true;
            }
        }
    }

    captureNameChars() {
        const { chunk, i: start } = this;
        while (true) {
            const c = this.getCode();
            if (c === EOC) {
                this.name += chunk.slice(start);
                return EOC;
            }
            if (!isNameChar(c)) {
                this.name += chunk.slice(start, this.prevI);
                return c === NL_LIKE ? NL : c;
            }
        }
    }

    skipSpaces() {
        while (true) {
            const c = this.getCodeNorm();
            if (c === EOC || !isS(c))
                return c;
        }
    }

    setXMLVersion(version) {
        this.currentXMLVersion = version;
        if (version === "1.0") {
            this.isChar = isChar10;
            this.getCode = this.getCode10;
        } else {
            this.isChar = isChar11;
            this.getCode = this.getCode11;
        }
    }

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
        if (this.prevI !== iBefore) this.xmlDeclPossible = false;
        if (c === LESS) {
            this.state = S_OPEN_WAKA;
            if (this.text.length !== 0) throw new Error("no-empty text at start");
        } else if (c !== EOC) {
            this.unget();
            this.state = S_TEXT;
            this.xmlDeclPossible = false;
        }
    }

    sDoctype() {
        const c = this.captureTo(DOCTYPE_TERMINATOR);
        if (c === GREATER) {
            if (this.doctypeHandler) this.doctypeHandler(this.text);
            this.text = "";
            this.state = S_TEXT;
            this.doctype = true;
        } else if (c !== EOC) {
            this.text += String.fromCodePoint(c);
            if (c === OPEN_BRACKET)
                this.state = S_DTD;
            else if (isQuote(c)) {
                this.state = S_DOCTYPE_QUOTE;
                this.q = c;
            }
        }
    }

    sDoctypeQuote() {
        const q = this.q;
        if (this.captureToChar(q)) {
            this.text += String.fromCodePoint(q);
            this.q = null;
            this.state = S_DOCTYPE;
        }
    }

    sDTD() {
        const c = this.captureTo(DTD_TERMINATOR);
        if (c === EOC) return;
        this.text += String.fromCodePoint(c);
        if (c === CLOSE_BRACKET)
            this.state = S_DOCTYPE;
        else if (c === LESS)
            this.state = S_DTD_OPEN_WAKA;
        else if (isQuote(c)) {
            this.state = S_DTD_QUOTED;
            this.q = c;
        }
    }

    sDTDQuoted() {
        const q = this.q;
        if (this.captureToChar(q)) {
            this.text += String.fromCodePoint(q);
            this.state = S_DTD;
            this.q = null;
        }
    }

    sDTDOpenWaka() {
        const c = this.getCodeNorm();
        this.text += String.fromCodePoint(c);
        if (c === BANG)
            this.state = S_DTD_OPEN_WAKA_BANG, this.openWakaBang = "";
        else if (c === QUESTION)
            this.state = S_DTD_PI;
        else
            this.state = S_DTD;
    }

    sDTDOpenWakaBang() {
        const char = String.fromCodePoint(this.getCodeNorm());
        const owb = this.openWakaBang += char;
        this.text += char;
        if (owb !== "-") {
            this.state = owb === "--" ? S_DTD_COMMENT : S_DTD;
            this.openWakaBang = "";
        }
    }

    sDTDComment() {
        if (this.captureToChar(MINUS)) {
            this.text += "-";
            this.state = S_DTD_COMMENT_ENDING;
        }
    }

    sDTDCommentEnding() {
        const c = this.getCodeNorm();
        this.text += String.fromCodePoint(c);
        this.state = c === MINUS ? S_DTD_COMMENT_ENDED : S_DTD_COMMENT;
    }

    sDTDCommentEnded() {
        const c = this.getCodeNorm();
        this.text += String.fromCodePoint(c);
        if (c === GREATER) {
            this.state = S_DTD;
        } else {
            this.fail("malformed comment.");
            this.state = S_DTD_COMMENT;
        }
    }

    sDTDPI() {
        if (this.captureToChar(QUESTION)) {
            this.text += "?";
            this.state = S_DTD_PI_ENDING;
        }
    }

    sDTDPIEnding() {
        const c = this.getCodeNorm();
        this.text += String.fromCodePoint(c);
        if (c === GREATER) this.state = S_DTD;
    }

    sText() {
        if (this.tags.length !== 0)
            this.handleTextInRoot();
        else
            this.handleTextOutsideRoot();
    }

    sEntity() {
        let { i: start } = this;
        const { chunk } = this;
        loop: while (true) {
            switch (this.getCode()) {
                case NL_LIKE:
                    this.entity += `${chunk.slice(start, this.prevI)}\n`;
                    start = this.i;
                    break;
                case SEMICOLON:
                    const { entityReturnState } = this;
                    const entity = this.entity + chunk.slice(start, this.prevI);
                    this.state = entityReturnState;
                    let parsed;
                    if (entity === "") {
                        this.fail("empty entity name.");
                        parsed = "&;";
                    } else {
                        parsed = this.parseEntity(entity);
                        this.entity = "";
                    }
                    if (entityReturnState !== S_TEXT || this.textHandler !== undefined)
                        this.text += parsed;
                    break loop;
                case EOC:
                    this.entity += chunk.slice(start);
                    break loop;
                default:
            }
        }
    }

    sOpenWaka() {
        const c = this.getCode();
        if (isNameStartChar(c)) {
            this.state = S_OPEN_TAG;
            this.unget();
            this.xmlDeclPossible = false;
        } else {
            switch (c) {
                case FORWARD_SLASH:
                    this.state = S_CLOSE_TAG;
                    this.xmlDeclPossible = false;
                    break;
                case BANG:
                    this.state = S_OPEN_WAKA_BANG;
                    this.openWakaBang = "";
                    this.xmlDeclPossible = false;
                    break;
                case QUESTION:
                    this.state = S_PI_FIRST_CHAR;
                    break;
                default:
                    this.fail("disallowed character in tag name");
                    this.state = S_TEXT;
                    this.xmlDeclPossible = false;
            }
        }
    }

    sOpenWakaBang() {
        this.openWakaBang += String.fromCodePoint(this.getCodeNorm());
        switch (this.openWakaBang) {
            case "[CDATA[":
                if (!this.sawRoot && !this.reportedTextBeforeRoot) {
                    this.fail("text data outside of root node.");
                    this.reportedTextBeforeRoot = true;
                }
                if (this.closedRoot && !this.reportedTextAfterRoot) {
                    this.fail("text data outside of root node.");
                    this.reportedTextAfterRoot = true;
                }
                this.state = S_CDATA;
                this.openWakaBang = "";
                break;
            case "--":
                this.state = S_COMMENT;
                this.openWakaBang = "";
                break;
            case "DOCTYPE":
                this.state = S_DOCTYPE;
                if (this.doctype || this.sawRoot)
                    this.fail("inappropriately located doctype declaration.");
                this.openWakaBang = "";
                break;
            default:
                if (this.openWakaBang.length >= 7) this.fail("incorrect syntax.");
        }
    }

    sComment() {
        if (this.captureToChar(MINUS)) this.state = S_COMMENT_ENDING;
    }

    sCommentEnding() {
        const c = this.getCodeNorm();
        if (c === MINUS) {
            this.state = S_COMMENT_ENDED;
            if (this.commentHandler) this.commentHandler(this.text);
            this.text = "";
        } else {
            this.text += `-${String.fromCodePoint(c)}`;
            this.state = S_COMMENT;
        }
    }

    sCommentEnded() {
        const c = this.getCodeNorm();
        if (c !== GREATER) {
            this.fail("malformed comment.");
            this.text += `--${String.fromCodePoint(c)}`;
            this.state = S_COMMENT;
        } else {
            this.state = S_TEXT;
        }
    }

    sCData() {
        if (this.captureToChar(CLOSE_BRACKET)) this.state = S_CDATA_ENDING;
    }

    sCDataEnding() {
        const c = this.getCodeNorm();
        if (c === CLOSE_BRACKET) {
            this.state = S_CDATA_ENDING_2;
        } else {
            this.text += `]${String.fromCodePoint(c)}`;
            this.state = S_CDATA;
        }
    }

    sCDataEnding2() {
        const c = this.getCodeNorm();
        if (c === GREATER) {
            if (this.cdataHandler) this.cdataHandler(this.text);
            this.text = "";
            this.state = S_TEXT;
        } else if (c === CLOSE_BRACKET) {
            this.text += "]";
        } else {
            this.text += `]]${String.fromCodePoint(c)}`;
            this.state = S_CDATA;
        }
    }

    sPIFirstChar() {
        const c = this.getCodeNorm();
        if (this.nameStartCheck(c)) {
            this.piTarget += String.fromCodePoint(c);
            this.state = S_PI_REST;
        } else if (c === QUESTION || isS(c)) {
            this.fail("processing instruction without a target.");
            this.state = c === QUESTION ? S_PI_ENDING : S_PI_BODY;
        } else {
            this.fail("disallowed character in processing instruction name.");
            this.piTarget += String.fromCodePoint(c);
            this.state = S_PI_REST;
        }
    }

    sPIRest() {
        const { chunk, i: start } = this;
        while (true) {
            const c = this.getCodeNorm();
            if (c === EOC) {
                this.piTarget += chunk.slice(start);
                return;
            }
            if (!this.nameCheck(c)) {
                this.piTarget += chunk.slice(start, this.prevI);
                const isQuestion = c === QUESTION;
                if (isQuestion || isS(c)) {
                    if (this.piTarget === "xml") {
                        if (!this.xmlDeclPossible)
                            this.fail("an XML declaration must be at the start of the document.");
                        this.state = isQuestion ? S_XML_DECL_ENDING : S_XML_DECL_NAME_START;
                    } else {
                        this.state = isQuestion ? S_PI_ENDING : S_PI_BODY;
                    }
                } else {
                    this.fail("disallowed character in processing instruction name.");
                    this.piTarget += String.fromCodePoint(c);
                }
                break;
            }
        }
    }

    sPIBody() {
        if (this.text.length === 0) {
            const c = this.getCodeNorm();
            if (c === QUESTION) this.state = S_PI_ENDING;
            else if (!isS(c)) this.text = String.fromCodePoint(c);
        } else if (this.captureToChar(QUESTION)) {
            this.state = S_PI_ENDING;
        }
    }

    sPIEnding() {
        const c = this.getCodeNorm();
        if (c === GREATER) {
            if (this.piTarget.toLowerCase() === "xml") {
                this.fail("the XML declaration must appear at the start of the document.");
            }
            if (this.piHandler) this.piHandler({ target: this.piTarget, body: this.text });
            this.piTarget = this.text = "";
            this.state = S_TEXT;
        } else if (c === QUESTION) {
            this.text += "?";
        } else {
            this.text += `?${String.fromCodePoint(c)}`;
            this.state = S_PI_BODY;
        }
        this.xmlDeclPossible = false;
    }

    sXMLDeclNameStart() {
        const c = this.skipSpaces();
        if (c === QUESTION) {
            this.state = S_XML_DECL_ENDING;
            return;
        }
        if (c !== EOC) {
            this.state = S_XML_DECL_NAME;
            this.name = String.fromCodePoint(c);
        }
    }

    sXMLDeclName() {
        const c = this.captureTo(XML_DECL_NAME_TERMINATOR);
        if (c === QUESTION) {
            this.state = S_XML_DECL_ENDING;
            this.name += this.text;
            this.text = "";
            this.fail("XML declaration is incomplete.");
            return;
        }
        if (!(isS(c) || c === EQUAL)) return;
        this.name += this.text;
        this.text = "";
        if (!this.xmlDeclExpects.includes(this.name)) {
            if (this.name.length === 0) this.fail("did not expect any more name/value pairs.");
            else if (this.name.length === 1) this.fail(`expected the name ${this.xmlDeclExpects[0]}.`);
            else this.fail(`expected one of ${this.xmlDeclExpects.join(", ")}`);
        }
        this.state = c === EQUAL ? S_XML_DECL_VALUE_START : S_XML_DECL_EQ;
    }

    sXMLDeclEq() {
        const c = this.getCodeNorm();
        if (c === QUESTION) {
            this.state = S_XML_DECL_ENDING;
            this.fail("XML declaration is incomplete.");
            return;
        }
        if (isS(c)) return;
        if (c !== EQUAL) this.fail("value required.");
        this.state = S_XML_DECL_VALUE_START;
    }

    sXMLDeclValueStart() {
        const c = this.getCodeNorm();
        if (c === QUESTION) {
            this.state = S_XML_DECL_ENDING;
            this.fail("XML declaration is incomplete.");
            return;
        }
        if (isS(c)) return;
        if (!isQuote(c)) {
            this.fail("value must be quoted.");
            this.q = SPACE;
        } else {
            this.q = c;
        }
        this.state = S_XML_DECL_VALUE;
    }

    sXMLDeclValue() {
        const c = this.captureTo([this.q, QUESTION]);
        if (c === QUESTION) {
            this.state = S_XML_DECL_ENDING;
            this.text = "";
            this.fail("XML declaration is incomplete.");
            return;
        }
        if (c === EOC) return;
        const value = this.text;
        this.text = "";
        switch (this.name) {
            case "version":
                this.xmlDeclExpects = ["encoding", "standalone"];
                const version = value;
                this.xmlDecl.version = version;
                if (!/^1\.[0-9]+$/.test(version)) {
                    this.fail("version number must match /^1\\.[0-9]+$/.");
                } else if (!this.opt.forceXMLVersion) {
                    this.setXMLVersion(version);
                }
                break;
            case "encoding":
                if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(value)) {
                    this.fail("encoding value must match /^[A-Za-z0-9][A-Za-z0-9._-]*$/.");
                }
                this.xmlDeclExpects = ["standalone"];
                this.xmlDecl.encoding = value;
                break;
            case "standalone":
                if (value !== "yes" && value !== "no") {
                    this.fail("standalone value must match \"yes\" or \"no\".");
                }
                this.xmlDeclExpects = [];
                this.xmlDecl.standalone = value;
                break;
        }
        this.name = "";
        this.state = S_XML_DECL_SEPARATOR;
    }

    sXMLDeclSeparator() {
        const c = this.getCodeNorm();
        if (c === QUESTION) {
            this.state = S_XML_DECL_ENDING;
            return;
        }
        if (!isS(c)) {
            this.fail("whitespace required.");
            this.unget();
        }
        this.state = S_XML_DECL_NAME_START;
    }

    sXMLDeclEnding() {
        const c = this.getCodeNorm();
        if (c === GREATER) {
            if (this.piTarget !== "xml") {
                this.fail("processing instructions are not allowed before root.");
            } else if (this.name !== "version" && this.xmlDeclExpects.includes("version")) {
                this.fail("XML declaration must contain a version.");
            }
            if (this.xmldeclHandler) this.xmldeclHandler(this.xmlDecl);
            this.name = "";
            this.piTarget = this.text = "";
            this.state = S_TEXT;
        } else {
            this.fail("The character ? is disallowed anywhere in XML declarations.");
        }
        this.xmlDeclPossible = false;
    }

    sOpenTag() {
        const c = this.captureNameChars();
        if (c === EOC) return;
        const tag = this.tag = { name: this.name, attributes: Object.create(null) };
        this.name = "";
        if (this.xmlnsOpt) this.topNS = tag.ns = Object.create(null);
        if (this.openTagStartHandler) this.openTagStartHandler(tag);
        this.sawRoot = true;
        if (!this.fragmentOpt && this.closedRoot) this.fail("documents may contain only one root.");
        if (c === GREATER) {
            this.openTag();
        } else if (c === FORWARD_SLASH) {
            this.state = S_OPEN_TAG_SLASH;
        } else if (!isS(c)) {
            this.fail("disallowed character in tag name.");
            this.state = S_ATTRIB;
        }
    }

    sOpenTagSlash() {
        if (this.getCode() === GREATER) this.openSelfClosingTag();
        else {
            this.fail("forward-slash in opening tag not followed by >.");
            this.state = S_ATTRIB;
        }
    }

    sAttrib() {
        const c = this.skipSpaces();
        if (c === EOC) return;
        if (isNameStartChar(c)) {
            this.unget();
            this.state = S_ATTRIB_NAME;
        } else if (c === GREATER) {
            this.openTag();
        } else if (c === FORWARD_SLASH) {
            this.state = S_OPEN_TAG_SLASH;
        } else {
            this.fail("disallowed character in attribute name.");
        }
    }

    sAttribName() {
        const c = this.captureNameChars();
        if (c === EQUAL) {
            this.state = S_ATTRIB_VALUE;
        } else if (isS(c)) {
            this.state = S_ATTRIB_NAME_SAW_WHITE;
        } else if (c === GREATER) {
            this.fail("attribute without value.");
            this.pushAttrib(this.name, this.name);
            this.name = this.text = "";
            this.openTag();
        } else if (c !== EOC) {
            this.fail("disallowed character in attribute name.");
        }
    }

    sAttribNameSawWhite() {
        const c = this.skipSpaces();
        if (c === EOC) return;
        if (c === EQUAL) {
            this.state = S_ATTRIB_VALUE;
        } else {
            this.fail("attribute without value.");
            this.text = this.name = "";
            if (c === GREATER) {
                this.openTag();
            } else if (isNameStartChar(c)) {
                this.unget();
                this.state = S_ATTRIB_NAME;
            } else {
                this.fail("disallowed character in attribute name.");
                this.state = S_ATTRIB;
            }
        }
    }

    sAttribValue() {
        const c = this.getCodeNorm();
        if (isQuote(c)) {
            this.q = c;
            this.state = S_ATTRIB_VALUE_QUOTED;
        } else if (!isS(c)) {
            this.fail("unquoted attribute value.");
            this.state = S_ATTRIB_VALUE_UNQUOTED;
            this.unget();
        }
    }

    sAttribValueQuoted() {
        const { q, chunk } = this;
        let { i: start } = this;
        while (true) {
            switch (this.getCode()) {
                case q:
                    this.pushAttrib(this.name, this.text + chunk.slice(start, this.prevI));
                    this.name = this.text = "";
                    this.q = null;
                    this.state = S_ATTRIB_VALUE_CLOSED;
                    return;
                case AMP:
                    this.text += chunk.slice(start, this.prevI);
                    this.state = S_ENTITY;
                    this.entityReturnState = S_ATTRIB_VALUE_QUOTED;
                    return;
                case NL:
                case NL_LIKE:
                case TAB:
                    this.text += `${chunk.slice(start, this.prevI)} `;
                    start = this.i;
                    break;
                case LESS:
                    this.text += chunk.slice(start, this.prevI);
                    this.fail("disallowed character.");
                    return;
                case EOC:
                    this.text += chunk.slice(start);
                    return;
            }
        }
    }

    sAttribValueClosed() {
        const c = this.getCodeNorm();
        if (isS(c)) {
            this.state = S_ATTRIB;
        } else if (c === GREATER) {
            this.openTag();
        } else if (c === FORWARD_SLASH) {
            this.state = S_OPEN_TAG_SLASH;
        } else if (isNameStartChar(c)) {
            this.fail("no whitespace between attributes.");
            this.unget();
            this.state = S_ATTRIB_NAME;
        } else {
            this.fail("disallowed character in attribute name.");
        }
    }

    sAttribValueUnquoted() {
        const c = this.captureTo(ATTRIB_VALUE_UNQUOTED_TERMINATOR);
        if (c === AMP) {
            this.state = S_ENTITY;
            this.entityReturnState = S_ATTRIB_VALUE_UNQUOTED;
        } else if (c === LESS) {
            this.fail("disallowed character.");
        } else if (c !== EOC) {
            if (this.text.includes("]]>")) this.fail("the string \"]]>\" is disallowed in char data.");
            this.pushAttrib(this.name, this.text);
            this.name = this.text = "";
            if (c === GREATER) this.openTag();
            else this.state = S_ATTRIB;
        }
    }

    sCloseTag() {
        const c = this.captureNameChars();
        if (c === GREATER) this.closeTag();
        else if (isS(c)) this.state = S_CLOSE_TAG_SAW_WHITE;
        else if (c !== EOC) this.fail("disallowed character in closing tag.");
    }

    sCloseTagSawWhite() {
        const c = this.skipSpaces();
        if (c === GREATER) this.closeTag();
        else if (c !== EOC) this.fail("disallowed character in closing tag.");
    }

    handleTextInRoot() {
        let { i: start, forbiddenState } = this;
        const { chunk, textHandler: handler } = this;
        scanLoop: while (true) {
            switch (this.getCode()) {
                case LESS:
                    this.state = S_OPEN_WAKA;
                    if (handler) {
                        const { text } = this;
                        const slice = chunk.slice(start, this.prevI);
                        if (text.length !== 0) {
                            handler(text + slice);
                            this.text = "";
                        } else if (slice.length !== 0) {
                            handler(slice);
                        }
                    }
                    forbiddenState = FORBIDDEN_START;
                    break scanLoop;
                case AMP:
                    this.state = S_ENTITY;
                    this.entityReturnState = S_TEXT;
                    if (handler) this.text += chunk.slice(start, this.prevI);
                    forbiddenState = FORBIDDEN_START;
                    break scanLoop;
                case CLOSE_BRACKET:
                    if (forbiddenState === FORBIDDEN_START) forbiddenState = FORBIDDEN_BRACKET;
                    else if (forbiddenState === FORBIDDEN_BRACKET) forbiddenState = FORBIDDEN_BRACKET_BRACKET;
                    break;
                case GREATER:
                    if (forbiddenState === FORBIDDEN_BRACKET_BRACKET) this.fail("the string \"]]>\" is disallowed in char data.");
                    forbiddenState = FORBIDDEN_START;
                    break;
                case NL_LIKE:
                    if (handler) this.text += `${chunk.slice(start, this.prevI)}\n`;
                    start = this.i;
                    forbiddenState = FORBIDDEN_START;
                    break;
                case EOC:
                    if (handler) this.text += chunk.slice(start);
                    break scanLoop;
                default:
                    forbiddenState = FORBIDDEN_START;
            }
        }
        this.forbiddenState = forbiddenState;
    }

    handleTextOutsideRoot() {
        let { i: start } = this;
        const { chunk, textHandler: handler } = this;
        let nonSpace = false;
        outRootLoop: while (true) {
            const code = this.getCode();
            switch (code) {
                case LESS:
                    this.state = S_OPEN_WAKA;
                    if (handler) {
                        const { text } = this;
                        const slice = chunk.slice(start, this.prevI);
                        if (text.length !== 0) {
                            handler(text + slice);
                            this.text = "";
                        } else if (slice.length !== 0) {
                            handler(slice);
                        }
                    }
                    break outRootLoop;
                case AMP:
                    this.state = S_ENTITY;
                    this.entityReturnState = S_TEXT;
                    if (handler) this.text += chunk.slice(start, this.prevI);
                    nonSpace = true;
                    break outRootLoop;
                case NL_LIKE:
                    if (handler) this.text += `${chunk.slice(start, this.prevI)}\n`;
                    start = this.i;
                    break;
                case EOC:
                    if (handler) this.text += chunk.slice(start);
                    break outRootLoop;
                default:
                    if (!isS(code)) nonSpace = true;
            }
        }
        if (!nonSpace) return;
        if (!this.sawRoot && !this.reportedTextBeforeRoot) {
            this.fail("text data outside of root node.");
            this.reportedTextBeforeRoot = true;
        }
        if (this.closedRoot && !this.reportedTextAfterRoot) {
            this.fail("text data outside of root node.");
            this.reportedTextAfterRoot = true;
        }
    }

    pushAttribNS(name, value) {
        const { prefix, local } = this.qname(name);
        const attr = { name, prefix, local, value };
        this.attribList.push(attr);
        if (this.attributeHandler) this.attributeHandler(attr);
        if (prefix === "xmlns") {
            const trimmed = value.trim();
            if (this.currentXMLVersion === "1.0" && trimmed === "")
                this.fail("invalid attempt to undefine prefix in XML 1.0");
            this.topNS[local] = trimmed;
            nsPairCheck(this, local, trimmed);
        } else if (name === "xmlns") {
            const trimmed = value.trim();
            this.topNS[""] = trimmed;
            nsPairCheck(this, "", trimmed);
        }
    }

    pushAttribPlain(name, value) {
        const attr = { name, value };
        this.attribList.push(attr);
        if (this.attributeHandler) this.attributeHandler(attr);
    }

    end() {
        if (!this.sawRoot) this.fail("document must contain a root element.");
        const { tags } = this;
        while (tags.length > 0) {
            const tag = tags.pop();
            this.fail(`unclosed tag: ${tag.name}`);
        }
        if ((this.state !== S_BEGIN) && (this.state !== S_TEXT)) this.fail("unexpected end.");
        const { text } = this;
        if (text.length !== 0) {
            if (this.textHandler) this.textHandler(text);
            this.text = "";
        }
        this._closed = true;
        if (this.endHandler) this.endHandler();
        this._init();
        return this;
    }

    resolve(prefix) {
        let uri = this.topNS[prefix];
        if (uri !== undefined) return uri;
        const { tags } = this;
        for (let index = tags.length - 1; index >= 0; index--) {
            uri = tags[index].ns[prefix];
            if (uri !== undefined) return uri;
        }
        uri = this.ns[prefix];
        if (uri !== undefined) return uri;
        return this.opt.resolvePrefix?.(prefix);
    }

    qname(name) {
        const colon = name.indexOf(":");
        if (colon === -1) return { prefix: "", local: name };
        const local = name.slice(colon + 1);
        const prefix = name.slice(0, colon);
        if (prefix === "" || local === "" || local.includes(":"))
            this.fail(`malformed name: ${name}.`);
        return { prefix, local };
    }

    processAttribsNS() {
        const { attribList } = this;
        const tag = this.tag;
        const { prefix, local } = this.qname(tag.name);
        tag.prefix = prefix;
        tag.local = local;
        const uri = tag.uri = this.resolve(prefix) ?? "";
        if (prefix !== "") {
            if (prefix === "xmlns")
                this.fail("tags may not have \"xmlns\" as prefix.");
            if (uri === "")
                this.fail(`unbound namespace prefix: ${JSON.stringify(prefix)}.`);
        }
        if (attribList.length === 0) return;
        const { attributes } = tag;
        const seen = new Set();
        for (const attr of attribList) {
            const { name, prefix, local } = attr;
            let uri, eqname;
            if (prefix === "") {
                uri = name === "xmlns" ? XMLNS_NAMESPACE : "";
                eqname = name;
            } else {
                uri = this.resolve(prefix);
                if (uri === undefined)
                    this.fail(`unbound namespace prefix: ${JSON.stringify(prefix)}.`);
                eqname = `{${uri}}${local}`;
            }
            if (seen.has(eqname))
                this.fail(`duplicate attribute: ${eqname}.`);
            seen.add(eqname);
            attr.uri = uri;
            attributes[name] = attr;
        }
        this.attribList = [];
    }

    processAttribsPlain() {
        const { attribList } = this;
        const attributes = this.tag.attributes;
        for (const { name, value } of attribList) {
            if (attributes[name] !== undefined)
                this.fail(`duplicate attribute: ${name}.`);
            attributes[name] = value;
        }
        this.attribList = [];
    }

    openTag() {
        this.processAttribs();
        const { tags } = this;
        const tag = this.tag;
        tag.isSelfClosing = false;
        if (this.openTagHandler) this.openTagHandler(tag);
        tags.push(tag);
        this.state = S_TEXT;
        this.name = "";
    }

    openSelfClosingTag() {
        this.processAttribs();
        const { tags } = this;
        const tag = this.tag;
        tag.isSelfClosing = true;
        if (this.openTagHandler) this.openTagHandler(tag);
        if (this.closeTagHandler) this.closeTagHandler(tag);
        const top = this.tag = tags[tags.length - 1] ?? null;
        if (top === null) this.closedRoot = true;
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
            if (this.closeTagHandler) this.closeTagHandler(tag);
            if (tag.name === name) break;
            this.fail("unexpected close tag.");
        }
        if (l === 0) this.closedRoot = true;
        else if (l < 0) this.fail(`unmatched closing tag: ${name}.`);
    }

    parseEntity(entity) {
        if (entity[0] !== "#") {
            const defined = this.ENTITIES[entity];
            if (defined !== undefined) return defined;
            this.fail(this.isName(entity) ? "undefined entity." : "disallowed character in entity name.");
            return `&${entity};`;
        }
        let num = NaN;
        if (entity[1] === "x" && /^#x[0-9a-f]+$/i.test(entity))
            num = parseInt(entity.slice(2), 16);
        else if (/^#[0-9]+$/.test(entity))
            num = parseInt(entity.slice(1), 10);
        if (!this.isChar(num)) {
            this.fail("malformed character entity.");
            return `&${entity};`;
        }
        return String.fromCodePoint(num);
    }
}

exports.SaxesParser = SaxesParser;
