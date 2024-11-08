"use strict";

const MIMETypeParameters = require("./mime-type-parameters.js");
const parse = require("./parser.js");
const serialize = require("./serializer.js");
const { asciiLowercase, solelyContainsHTTPTokenCodePoints } = require("./utils.js");

class MIMEType {
  constructor(string) {
    string = String(string);
    const result = parse(string);
    if (!result) {
      throw new Error(`Could not parse MIME type string "${string}"`);
    }

    this._type = result.type;
    this._subtype = result.subtype;
    this._parameters = new MIMETypeParameters(result.parameters);
  }

  static parse(string) {
    try {
      return new MIMEType(string);
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
    value = asciiLowercase(String(value));
    if (!value || !solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid type: must be non-empty and contain only HTTP token code points`);
    }
    this._type = value;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    value = asciiLowercase(String(value));
    if (!value || !solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid subtype: must be non-empty and contain only HTTP token code points`);
    }
    this._subtype = value;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    return serialize(this);
  }

  isJavaScript({ prohibitParameters = false } = {}) {
    if ((this._type === "text" && ["ecmascript", "javascript", "javascript1.0", "javascript1.1", "javascript1.2",
         "javascript1.3", "javascript1.4", "javascript1.5", "jscript", "livescript", "x-ecmascript", "x-javascript"].includes(this._subtype)) ||
         (this._type === "application" && ["ecmascript", "javascript", "x-ecmascript", "x-javascript"].includes(this._subtype))) {
      return !prohibitParameters || this._parameters.size === 0;
    }
    return false;
  }

  isXML() {
    return (this._subtype === "xml" && ["text", "application"].includes(this._type)) || this._subtype.endsWith("+xml");
  }

  isHTML() {
    return this._type === "text" && this._subtype === "html";
  }
}

module.exports = MIMEType;
