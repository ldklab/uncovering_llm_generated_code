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
    // Parse the input string to initialize the MIME type, subtype, and parameters
    string = String(string);
    const result = parse(string);
    if (result === null) {
      throw new Error(`Could not parse MIME type string "${string}"`);
    }

    this._type = result.type;
    this._subtype = result.subtype;
    this._parameters = new MIMETypeParameters(result.parameters);
  }
  
  static parse(string) {
    // Utility method to parse MIME type string and handle errors gracefully
    try {
      return new MIMEType(string);
    } catch (e) {
      return null;
    }
  }

  get essence() {
    // Returns a string combining type and subtype
    return `${this.type}/${this.subtype}`;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    // Validate and set type, ensuring it contains only valid HTTP token code points
    value = asciiLowercase(String(value));
    if (value.length === 0) {
      throw new Error("Invalid type: must be a non-empty string");
    }
    if (!solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid type ${value}: must contain only HTTP token code points`);
    }
    this._type = value;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    // Validate and set subtype
    value = asciiLowercase(String(value));
    if (value.length === 0) {
      throw new Error("Invalid subtype: must be a non-empty string");
    }
    if (!solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(`Invalid subtype ${value}: must contain only HTTP token code points`);
    }
    this._subtype = value;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    // Represents the MIME type as a string
    return serialize(this);
  }

  isJavaScript({ allowParameters = false } = {}) {
    // Check if the MIME type is JavaScript-related
    if (this._type === "text" || this._type === "application") {
      const jsSubtypes = [
        "ecmascript", "javascript", "javascript1.0", "javascript1.1", "javascript1.2",
        "javascript1.3", "javascript1.4", "javascript1.5", "jscript", "livescript",
        "x-ecmascript", "x-javascript"
      ];
      return jsSubtypes.includes(this._subtype) && (allowParameters || this._parameters.size === 0);
    }
    return false;
  }

  isXML() {
    // Determine if MIME type is XML
    return (this._subtype === "xml" && (this._type === "text" || this._type === "application")) ||
           this._subtype.endsWith("+xml");
  }

  isHTML() {
    // Determine if MIME type is HTML
    return this._subtype === "html" && this._type === "text";
  }
}

class MIMETypeParameters {
  constructor(map) {
    // Initialize with a map of parameters
    this._map = map;
  }

  get size() {
    return this._map.size;
  }

  get(name) {
    name = asciiLowercase(String(name));
    return this._map.get(name);
  }

  has(name) {
    name = asciiLowercase(String(name));
    return this._map.has(name);
  }

  set(name, value) {
    // Set parameter name and value ensuring they meet HTTP token code point criteria
    name = asciiLowercase(String(name));
    value = String(value);
    if (!solelyContainsHTTPTokenCodePoints(name)) {
      throw new Error(`Invalid MIME type parameter name "${name}": only HTTP token code points are valid.`);
    }
    if (!soleyContainsHTTPQuotedStringTokenCodePoints(value)) {
      throw new Error(`Invalid MIME type parameter value "${value}": only HTTP quoted-string token code points are valid.`);
    }
    return this._map.set(name, value);
  }

  clear() {
    this._map.clear();
  }

  delete(name) {
    name = asciiLowercase(String(name));
    return this._map.delete(name);
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
