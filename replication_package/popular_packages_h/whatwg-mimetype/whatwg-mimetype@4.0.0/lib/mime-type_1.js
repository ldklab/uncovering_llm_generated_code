"use strict";

const MIMETypeParameters = require("./mime-type-parameters.js");
const parse = require("./parser.js");
const serialize = require("./serializer.js");
const { asciiLowercase, solelyContainsHTTPTokenCodePoints } = require("./utils.js");

module.exports = class MIMEType {
  constructor(input) {
    const inputString = String(input);
    const parsedResult = parse(inputString);

    if (parsedResult === null) {
      throw new Error(`Could not parse MIME type string "${inputString}"`);
    }

    this._type = parsedResult.type;
    this._subtype = parsedResult.subtype;
    this._parameters = new MIMETypeParameters(parsedResult.parameters);
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

  set type(newType) {
    const lowercasedType = asciiLowercase(String(newType));

    if (!lowercasedType || !solelyContainsHTTPTokenCodePoints(lowercasedType)) {
      throw new Error(`Invalid type: "${newType}" is not a valid HTTP token`);
    }

    this._type = lowercasedType;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(newSubtype) {
    const lowercasedSubtype = asciiLowercase(String(newSubtype));

    if (!lowercasedSubtype || !solelyContainsHTTPTokenCodePoints(lowercasedSubtype)) {
      throw new Error(`Invalid subtype: "${newSubtype}" is not a valid HTTP token`);
    }

    this._subtype = lowercasedSubtype;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    return serialize(this);
  }

  isJavaScript({ prohibitParameters = false } = {}) {
    const isJavaScriptSubtype = (subtype) => {
      const validSubtypes = [
        "ecmascript", "javascript", "javascript1.0", "javascript1.1",
        "javascript1.2", "javascript1.3", "javascript1.4", "javascript1.5",
        "jscript", "livescript", "x-ecmascript", "x-javascript"
      ];
      return validSubtypes.includes(subtype);
    }

    if ((this._type === "text" || this._type === "application") && isJavaScriptSubtype(this._subtype)) {
      return !prohibitParameters || this._parameters.size === 0;
    }
    return false;
  }

  isXML() {
    return (this._subtype === "xml" && (this._type === "text" || this._type === "application")) || this._subtype.endsWith("+xml");
  }

  isHTML() {
    return this._subtype === "html" && this._type === "text";
  }
};
