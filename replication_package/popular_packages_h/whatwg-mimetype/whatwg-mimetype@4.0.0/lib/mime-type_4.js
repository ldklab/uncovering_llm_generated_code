"use strict";

const MIMETypeParameters = require("./mime-type-parameters.js");
const parse = require("./parser.js");
const serialize = require("./serializer.js");
const {
  asciiLowercase,
  solelyContainsHTTPTokenCodePoints
} = require("./utils.js");

module.exports = class MIMEType {
  constructor(mimeString) {
    mimeString = String(mimeString);
    const parseResult = parse(mimeString);
    if (parseResult === null) {
      throw new Error(`Could not parse MIME type string "${mimeString}"`);
    }

    this._type = parseResult.type;
    this._subtype = parseResult.subtype;
    this._parameters = new MIMETypeParameters(parseResult.parameters);
  }

  static parse(mimeString) {
    try {
      return new this(mimeString);
    } catch (error) {
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

    if (!value.length) {
      throw new Error("Invalid type: must be a non-empty string");
    }
    if (!solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid type "${value}": must contain only HTTP token code points`);
    }

    this._type = value;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    value = asciiLowercase(String(value));

    if (!value.length) {
      throw new Error("Invalid subtype: must be a non-empty string");
    }
    if (!solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid subtype "${value}": must contain only HTTP token code points`);
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
    if (this._type === "text") {
      const validSubtypes = [
        "ecmascript", "javascript", "javascript1.0", "javascript1.1", "javascript1.2",
        "javascript1.3", "javascript1.4", "javascript1.5", "jscript", 
        "livescript", "x-ecmascript", "x-javascript"
      ];
      if (validSubtypes.includes(this._subtype)) {
        return !prohibitParameters || this._parameters.size === 0;
      }
    } else if (this._type === "application") {
      const validSubtypes = ["ecmascript", "javascript", "x-ecmascript", "x-javascript"];
      if (validSubtypes.includes(this._subtype)) {
        return !prohibitParameters || this._parameters.size === 0;
      }
    }
    return false;
  }

  isXML() {
    return (this._subtype === "xml" && (this._type === "text" || this._type === "application")) ||
           this._subtype.endsWith("+xml");
  }

  isHTML() {
    return this._subtype === "html" && this._type === "text";
  }
};
