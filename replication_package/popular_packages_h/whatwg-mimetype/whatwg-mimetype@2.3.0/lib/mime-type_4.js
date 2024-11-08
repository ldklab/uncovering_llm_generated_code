"use strict";
const parse = require("./parser.js");
const serialize = require("./serializer.js");
const {
  asciiLowercase,
  solelyContainsHTTPTokenCodePoints,
  soleyContainsHTTPQuotedStringTokenCodePoints
} = require("./utils.js");

class MIMEType {
  constructor(string) {
    const parsed = parse(String(string));
    if (!parsed) {
      throw new Error(`Could not parse MIME type string "${string}"`);
    }
    this._type = parsed.type;
    this._subtype = parsed.subtype;
    this._parameters = new MIMETypeParameters(parsed.parameters);
  }

  static parse(string) {
    try {
      return new this(string);
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
    const lowerValue = asciiLowercase(String(value));
    if (!lowerValue || !solelyContainsHTTPTokenCodePoints(lowerValue)) {
      throw new Error(`Invalid type: "${value}"`);
    }
    this._type = lowerValue;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    const lowerValue = asciiLowercase(String(value));
    if (!lowerValue || !solelyContainsHTTPTokenCodePoints(lowerValue)) {
      throw new Error(`Invalid subtype: "${value}"`);
    }
    this._subtype = lowerValue;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    return serialize(this);
  }

  isJavaScript({ allowParameters = false } = {}) {
    const jsTypes = ["ecmascript", "javascript", "javascript1.0", "javascript1.1", 
      "javascript1.2", "javascript1.3", "javascript1.4", "javascript1.5", 
      "jscript", "livescript", "x-ecmascript", "x-javascript"];
    return (this._type === "text" || this._type === "application") && 
      jsTypes.includes(this._subtype) && (allowParameters || this._parameters.size === 0);
  }

  isXML() {
    return this._subtype === "xml" && (this._type === "text" || this._type === "application") || 
      this._subtype.endsWith("+xml");
  }

  isHTML() {
    return this._type === "text" && this._subtype === "html";
  }
}

class MIMETypeParameters {
  constructor(map) {
    this._map = map;
  }

  get size() {
    return this._map.size;
  }

  get(name) {
    return this._map.get(asciiLowercase(String(name)));
  }

  has(name) {
    return this._map.has(asciiLowercase(String(name)));
  }

  set(name, value) {
    const lowerName = asciiLowercase(String(name));
    const valueStr = String(value);
    
    if (!solelyContainsHTTPTokenCodePoints(lowerName) || 
        !soleyContainsHTTPQuotedStringTokenCodePoints(valueStr)) {
      throw new Error(`Invalid MIME type parameter: "${name}" or "${value}"`);
    }
    
    return this._map.set(lowerName, valueStr);
  }

  clear() {
    this._map.clear();
  }

  delete(name) {
    return this._map.delete(asciiLowercase(String(name)));
  }

  forEach(callbackFn, thisArg) {
    this._map.forEach(callbackFn, thisArg);
  }

  keys() {
    return this._map.keys();
  }

  values() {
    return this._map.values();
  }

  entries() {
    return this._map.entries();
  }

  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
}

module.exports = MIMEType;
