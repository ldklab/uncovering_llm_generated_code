"use strict";
const MIMETypeParameters = require("./mime-type-parameters.js");
const parseMIMEType = require("./parser.js");
const serializeMIMEType = require("./serializer.js");
const { toAsciiLowercase, isValidHTTPToken } = require("./utils.js");

class MIMEType {
  constructor(input) {
    const string = String(input);
    const parsed = parseMIMEType(string);
    if (!parsed) {
      throw new Error(`Could not parse MIME type string "${string}"`);
    }
    this._type = parsed.type;
    this._subtype = parsed.subtype;
    this._parameters = new MIMETypeParameters(parsed.parameters);
  }

  static parse(input) {
    try {
      return new this(input);
    } catch {
      return null;
    }
  }

  get essence() {
    return `${this.type}/${this.subtype}`;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const lowerCaseValue = toAsciiLowercase(String(value));
    if (!lowerCaseValue || !isValidHTTPToken(lowerCaseValue)) {
      throw new Error(`Invalid type: "${value}"`);
    }
    this._type = lowerCaseValue;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    const lowerCaseValue = toAsciiLowercase(String(value));
    if (!lowerCaseValue || !isValidHTTPToken(lowerCaseValue)) {
      throw new Error(`Invalid subtype: "${value}"`);
    }
    this._subtype = lowerCaseValue;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    return serializeMIMEType(this);
  }

  isJavaScript({ prohibitParameters = false } = {}) {
    const validJavaScriptSubtypes = [
      "ecmascript", "javascript", "javascript1.0", "javascript1.1",
      "javascript1.2", "javascript1.3", "javascript1.4", "javascript1.5",
      "jscript", "livescript", "x-ecmascript", "x-javascript"
    ];

    if ((this._type === "text" || this._type === "application") && validJavaScriptSubtypes.includes(this._subtype)) {
      return !prohibitParameters || this._parameters.size === 0;
    }
    return false;
  }

  isXML() {
    return (this._subtype === "xml" && (this._type === "text" || this._type === "application")) ||
           this._subtype.endsWith("+xml");
  }

  isHTML() {
    return this._type === "text" && this._subtype === "html";
  }
}

module.exports = MIMEType;
