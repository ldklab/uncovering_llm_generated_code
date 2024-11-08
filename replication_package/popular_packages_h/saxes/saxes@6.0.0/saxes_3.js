"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SaxesParser = exports.EVENTS = void 0;

const ed5 = require("xmlchars/xml/1.0/ed5");
const ed2 = require("xmlchars/xml/1.1/ed2");
const NSed3 = require("xmlchars/xmlns/1.0/ed3");

const isS = ed5.isS, isChar10 = ed5.isChar, isNameStartChar = ed5.isNameStartChar, 
      isNameChar = ed5.isNameChar, S_LIST = ed5.S_LIST, NAME_RE = ed5.NAME_RE, 
      isChar11 = ed2.isChar, isNCNameStartChar = NSed3.isNCNameStartChar, 
      isNCNameChar = NSed3.isNCNameChar, NC_NAME_RE = NSed3.NC_NAME_RE;

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

const EOC = -1, NL_LIKE = -2;

// Define states for the state machine
const S_BEGIN = 0, S_BEGIN_WHITESPACE = 1, S_DOCTYPE = 2, S_DTD = 4,
      S_TEXT = 13, S_ENTITY = 14, S_OPEN_WAKA = 15;

// Event definitions
exports.EVENTS = [
    "xmldecl", "text", "processinginstruction", "doctype", "comment",
    "opentagstart", "attribute", "opentag", "closetag", "cdata",
    "error", "end", "ready"
];

const EVENT_NAME_TO_HANDLER_NAME = {
    xmldecl: "xmldeclHandler", text: "textHandler",
    processinginstruction: "piHandler", doctype: "doctypeHandler",
    comment: "commentHandler", opentagstart: "openTagStartHandler",
    attribute: "attributeHandler", opentag: "openTagHandler",
    closetag: "closeTagHandler", cdata: "cdataHandler",
    error: "errorHandler", end: "endHandler", ready: "readyHandler"
};

// Main parser class
class SaxesParser {
    constructor(opt) {
        this.opt = opt || {};
        this.fragmentOpt = !!this.opt.fragment;
        const xmlnsOpt = this.xmlnsOpt = !!this.opt.xmlns;
        this.trackPosition = this.opt.position !== false;
        if (xmlnsOpt) {
            this.nameStartCheck = isNCNameStartChar;
            this.nameCheck = isNCNameChar;
            this.isName = isNCName;
            this.processAttribs = this.processAttribsNS;
            this.pushAttrib = this.pushAttribNS;
            this.ns = Object.assign({ __proto__: null }, rootNS);
            const additional = this.opt.additionalNamespaces;
            if (additional) {
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
            this.sBegin, this.sBeginWhitespace, this.sDoctype, this.sDTD, this.sText,
            this.sEntity, this.sOpenWaka
        ];
        this._init();
    }

    get closed() {
        return this._closed;
    }

    _init() {
        var _a;
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
        this.attribList = [];
        const { fragmentOpt } = this;
        this.state = fragmentOpt ? S_TEXT : S_BEGIN;
        this.reportedTextBeforeRoot = this.reportedTextAfterRoot = this.closedRoot = this.sawRoot = fragmentOpt;
        this.xmlDeclPossible = !fragmentOpt;
        this.xmlDeclExpects = ["version"];
        let { defaultXMLVersion } = this.opt;
        if (defaultXMLVersion === undefined) {
            if (this.opt.forceXMLVersion === true) {
                throw new Error("forceXMLVersion set but defaultXMLVersion is not set");
            }
            defaultXMLVersion = "1.0";
        }
        this.setXMLVersion(defaultXMLVersion);
        this.positionAtNewLine = 0;
        this.doctype = false;
        this._closed = false;
        this.xmlDecl = {
            version: undefined,
            encoding: undefined,
            standalone: undefined
        };
        this.line = 1;
        this.column = 0;
        this.ENTITIES = Object.create(XML_ENTITIES);
        (_a = this.readyHandler) === null || _a === void 0 ? void 0 : _a.call(this);
    }

    get position() {
        return this.chunkPosition + this.i;
    }

    get columnIndex() {
        return this.position - this.positionAtNewLine;
    }

    on(name, handler) {
        // Set event handlers
        this[EVENT_NAME_TO_HANDLER_NAME[name]] = handler;
    }

    off(name) {
        // Remove event handlers
        this[EVENT_NAME_TO_HANDLER_NAME[name]] = undefined;
    }

    makeError(message) {
        var _a;
        let msg = (_a = this.fileName) !== null && _a !== void 0 ? _a : "";
        if (this.trackPosition) {
            if (msg.length > 0) {
                msg += ":";
            }
            msg += `${this.line}:${this.column}`;
        }
        if (msg.length > 0) {
            msg += ": ";
        }
        return new Error(msg + message);
    }

    fail(message) {
        const err = this.makeError(message);
        const handler = this.errorHandler;
        (handler === undefined) ? throw err : handler(err);
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
        // Get a single code point for XML 1.0
        const { chunk, i } = this;
        this.prevI = i;
        this.i = i + 1;
        if (i >= chunk.length) {
            return EOC;
        }
        const code = chunk.charCodeAt(i);
        this.column++;
        if (code < 0xD800) {
            if (code >= SPACE || code === TAB) {
                return code;
            }
            switch (code) {
                case NL:
                    this.line++;
                    this.column = 0;
                    this.positionAtNewLine = this.position;
                    return NL;
                case CR:
                    if (chunk.charCodeAt(i + 1) === NL) {
                        this.i = i + 2;
                    }
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
            if (!(code >= 0xE000 && code <= 0xFFFD)) {
                this.fail("disallowed character.");
            }
            return code;
        }
        const final = 0x10000 + ((code - 0xD800) * 0x400) + (chunk.charCodeAt(i + 1) - 0xDC00);
        this.i = i + 2;
        if (final > 0x10FFFF) {
            this.fail("disallowed character.");
        }
        return final;
    }

    getCode11() {
        // Get a single code point for XML 1.1
        const { chunk, i } = this;
        this.prevI = i;
        this.i = i + 1;
        if (i >= chunk.length) {
            return EOC;
        }
        const code = chunk.charCodeAt(i);
        this.column++;
        if (code < 0xD800) {
            if ((code > 0x1F && code < 0x7F) || (code > 0x9F && code !== LS) || code === TAB) {
                return code;
            }
            switch (code) {
                case NL:
                    this.line++;
                    this.column = 0;
                    this.positionAtNewLine = this.position;
                    return NL;
                case CR: {
                    const next = chunk.charCodeAt(i + 1);
                    if (next === NL || next === NEL) {
                        this.i = i + 2;
                    }
                }
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
            if (!(code >= 0xE000 && code <= 0xFFFD)) {
                this.fail("disallowed character.");
            }
            return code;
        }
        const final = 0x10000 + ((code - 0xD800) * 0x400) + (chunk.charCodeAt(i + 1) - 0xDC00);
        this.i = i + 2;
        if (final > 0x10FFFF) {
            this.fail("disallowed character.");
        }
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
            if (c === EOC || !isS(c)) {
                return c;
            }
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

    // State machine methods for parsing XML
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
            case GREATER:
                (_a = this.doctypeHandler) === null || _a === void 0 ? void 0 : _a.call(this, this.text);
                this.text = "";
                this.state = S_TEXT;
                this.doctype = true;
                break;
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

    sDTD() {
        const c = this.captureTo(DTD_TERMINATOR);
        if (c === EOC) {
            return;
        }
        this.text += String.fromCodePoint(c);
        if (c === CLOSE_BRACKET) {
            this.state = S_DOCTYPE;
        } else if (c === LESS) {
            this.state = S_DTD_OPEN_WAKA;
        } else if (isQuote(c)) {
            this.state = S_DTD_QUOTED;
            this.q = c;
        }
    }

    sText() {
        if (this.tags.length !== 0) {
            this.handleTextInRoot();
        } else {
            this.handleTextOutsideRoot();
        }
    }

    sEntity() {
        let { i: start } = this;
        const { chunk } = this;
        while (true) {
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
                    if (entityReturnState !== S_TEXT || this.textHandler !== undefined) {
                        this.text += parsed;
                    }
                    return;
                case EOC:
                    this.entity += chunk.slice(start);
                    return;
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

    sComment() {
        if (this.captureToChar(MINUS)) {
            this.state = S_COMMENT_ENDING;
        }
    }

    sCloseTag() {
        const c = this.captureNameChars();
        if (c === GREATER) {
            this.closeTag();
        } else if (isS(c)) {
            this.state = S_CLOSE_TAG_SAW_WHITE;
        } else if (c !== EOC) {
            this.fail("disallowed character in closing tag.");
        }
    }

    // Handle text data inside root elements
    handleTextInRoot() {
        let { i: start, forbiddenState } = this;
        const { chunk, textHandler: handler } = this;
        while (true) {
            switch (this.getCode()) {
                case LESS:
                    this.state = S_OPEN_WAKA;
                    if (handler !== undefined) {
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
                    return;
                case AMP:
                    this.state = S_ENTITY;
                    this.entityReturnState = S_TEXT;
                    if (handler !== undefined) {
                        this.text += chunk.slice(start, this.prevI);
                    }
                    forbiddenState = FORBIDDEN_START;
                    return;
                case CLOSE_BRACKET:
                    switch (forbiddenState) {
                        case FORBIDDEN_START:
                            forbiddenState = FORBIDDEN_BRACKET;
                            break;
                        case FORBIDDEN_BRACKET:
                            forbiddenState = FORBIDDEN_BRACKET_BRACKET;
                            break;
                        default:
                            throw new Error("impossible state");
                    }
                    break;
                case GREATER:
                    if (forbiddenState === FORBIDDEN_BRACKET_BRACKET) {
                        this.fail("the string \"]]>\" is disallowed in char data.");
                    }
                    forbiddenState = FORBIDDEN_START;
                    break;
                case NL_LIKE:
                    if (handler !== undefined) {
                        this.text += `${chunk.slice(start, this.prevI)}\n`;
                    }
                    start = this.i;
                    forbiddenState = FORBIDDEN_START;
                    break;
                case EOC:
                    if (handler !== undefined) {
                        this.text += chunk.slice(start);
                    }
                    return;
                default:
                    forbiddenState = FORBIDDEN_START;
            }
        }
        this.forbiddenState = forbiddenState;
    }

    // Handle text data outside root elements
    handleTextOutsideRoot() {
        let { i: start } = this;
        const { chunk, textHandler: handler } = this;
        let nonSpace = false;
        while (true) {
            const code = this.getCode();
            switch (code) {
                case LESS:
                    this.state = S_OPEN_WAKA;
                    if (handler !== undefined) {
                        const { text } = this;
                        const slice = chunk.slice(start, this.prevI);
                        if (text.length !== 0) {
                            handler(text + slice);
                            this.text = "";
                        } else if (slice.length !== 0) {
                            handler(slice);
                        }
                    }
                    return;
                case AMP:
                    this.state = S_ENTITY;
                    this.entityReturnState = S_TEXT;
                    if (handler !== undefined) {
                        this.text += chunk.slice(start, this.prevI);
                    }
                    nonSpace = true;
                    return;
                case NL_LIKE:
                    if (handler !== undefined) {
                        this.text += `${chunk.slice(start, this.prevI)}\n`;
                    }
                    start = this.i;
                    break;
                case EOC:
                    if (handler !== undefined) {
                        this.text += chunk.slice(start);
                    }
                    return;
                default:
                    if (!isS(code)) {
                        nonSpace = true;
                    }
            }
        }
        if (!nonSpace) {
            return;
        }
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
        var _a;
        const { prefix, local } = this.qname(name);
        const attr = { name, prefix, local, value };
        this.attribList.push(attr);
        (_a = this.attributeHandler) === null || _a === void 0 ? void 0 : _a.call(this, attr);
        if (prefix === "xmlns") {
            const trimmed = value.trim();
            if (this.currentXMLVersion === "1.0" && trimmed === "") {
                this.fail("invalid attempt to undefine prefix in XML 1.0");
            }
            this.topNS[local] = trimmed;
            nsPairCheck(this, local, trimmed);
        } else if (name === "xmlns") {
            const trimmed = value.trim();
            this.topNS[""] = trimmed;
            nsPairCheck(this, "", trimmed);
        }
    }

    pushAttribPlain(name, value) {
        var _a;
        const attr = { name, value };
        this.attribList.push(attr);
        (_a = this.attributeHandler) === null || _a === void 0 ? void 0 : _a.call(this, attr);
    }

    end() {
        var _a, _b;
        if (!this.sawRoot) {
            this.fail("document must contain a root element.");
        }
        const { tags } = this;
        while (tags.length > 0) {
            const tag = tags.pop();
            this.fail(`unclosed tag: ${tag.name}`);
        }
        if ((this.state !== S_BEGIN) && (this.state !== S_TEXT)) {
            this.fail("unexpected end.");
        }
        const { text } = this;
        if (text.length !== 0) {
            (_a = this.textHandler) === null || _a === void 0 ? void 0 : _a.call(this, text);
            this.text = "";
        }
        this._closed = true;
        (_b = this.endHandler) === null || _b === void 0 ? void 0 : _b.call(this);
        this._init();
        return this;
    }

    resolve(prefix) {
        var _a, _b;
        let uri = this.topNS[prefix];
        if (uri !== undefined) {
            return uri;
        }
        const { tags } = this;
        for (let index = tags.length - 1; index >= 0; index--) {
            uri = tags[index].ns[prefix];
            if (uri !== undefined) {
                return uri;
            }
        }
        uri = this.ns[prefix];
        if (uri !== undefined) {
            return uri;
        }
        return (_b = (_a = this.opt).resolvePrefix) === null || _b === void 0 ? void 0 : _b.call(_a, prefix);
    }

    qname(name) {
        const colon = name.indexOf(":");
        if (colon === -1) {
            return { prefix: "", local: name };
        }
        const local = name.slice(colon + 1);
        const prefix = name.slice(0, colon);
        if (prefix === "" || local === "" || local.includes(":")) {
            this.fail(`malformed name: ${name}.`);
        }
        return { prefix, local };
    }

    processAttribsNS() {
        var _a;
        const { attribList } = this;
        const tag = this.tag;
        {
            const { prefix, local } = this.qname(tag.name);
            tag.prefix = prefix;
            tag.local = local;
            const uri = tag.uri = (_a = this.resolve(prefix)) !== null && _a !== void 0 ? _a : "";
            if (prefix !== "") {
                if (prefix === "xmlns") {
                    this.fail("tags may not have \"xmlns\" as prefix.");
                }
                if (uri === "") {
                    this.fail(`unbound namespace prefix: ${JSON.stringify(prefix)}.`);
                    tag.uri = prefix;
                }
            }
        }
        if (attribList.length === 0) {
            return;
        }
        const { attributes } = tag;
        const seen = new Set();
        for (const attr of attribList) {
            const { name, prefix, local } = attr;
            let uri;
            let eqname;
            if (prefix === "") {
                uri = name === "xmlns" ? XMLNS_NAMESPACE : "";
                eqname = name;
            } else {
                uri = this.resolve(prefix);
                if (uri === undefined) {
                    this.fail(`unbound namespace prefix: ${JSON.stringify(prefix)}.`);
                    uri = prefix;
                }
                eqname = `{${uri}}${local}`;
            }
            if (seen.has(eqname)) {
                this.fail(`duplicate attribute: ${eqname}.`);
            }
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
            if (attributes[name] !== undefined) {
                this.fail(`duplicate attribute: ${name}.`);
            }
            attributes[name] = value;
        }
        this.attribList = [];
    }

    openTag() {
        this.processAttribs();
        const { tags } = this;
        const tag = this.tag;
        tag.isSelfClosing = false;
        this.openTagHandler && this.openTagHandler(tag);
        tags.push(tag);
        this.state = S_TEXT;
        this.name = "";
    }

    openSelfClosingTag() {
        this.processAttribs();
        const { tags } = this;
        const tag = this.tag;
        tag.isSelfClosing = true;
        this.openTagHandler && this.openTagHandler(tag);
        this.closeTagHandler && this.closeTagHandler(tag);
        const top = this.tag = tags[tags.length - 1] || null;
        if (top === null) {
            this.closedRoot = true;
        }
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
        const handler = this.closeTagHandler;
        let l = tags.length;
        while (l-- > 0) {
            const tag = this.tag = tags.pop();
            this.topNS = tag.ns;
            handler && handler(tag);
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

    parseEntity(entity) {
        if (entity[0] !== "#") {
            const defined = this.ENTITIES[entity];
            if (defined !== undefined) {
                return defined;
            }
            this.fail(this.isName(entity) ? "undefined entity." : "disallowed character in entity name.");
            return `&${entity};`;
        }
        let num = NaN;
        if (entity[1] === "x" && /^#x[0-9a-f]+$/i.test(entity)) {
            num = parseInt(entity.slice(2), 16);
        } else if (/^#[0-9]+$/.test(entity)) {
            num = parseInt(entity.slice(1), 10);
        }
        if (!this.isChar(num)) {
            this.fail("malformed character entity.");
            return `&${entity};`;
        }
        return String.fromCodePoint(num);
    }
}

exports.SaxesParser = SaxesParser;
