"use strict";
const parse = require("./parser.js");
const serialize = require("./serializer.js");
const {
  asciiLowercase,
  solelyContainsHTTPTokenCodePoints,
  solelyContainsHTTPQuotedStringTokenCodePoints // It seems the spelling of "solely" was corrected here
} = require("./utils.js");

class MIMEType {
  constructor(string) {
    string = String(string); // Explicit String conversion
    const result = parse(string); // Parse the MIME type string
    if (result === null) {
      throw new Error(`Could not parse MIME type string "${string}"`);
    }

    this._type = result.type; // Initialize type
    this._subtype = result.subtype; // Initialize subtype
    this._parameters = new MIMETypeParameters(result.parameters); // Initialize parameters
  }

  static parse(string) {
    try {
      return new this(string); // Try to construct a MIMEType instance
    } catch {
      return null; // Return null if parsing fails
    }
  }

  get essence() {
    return `${this.type}/${this.subtype}`; // Return essence consisting of type and subtype
  }

  get type() {
    return this._type;
  }

  set type(value) {
    value = asciiLowercase(String(value));

    if (!value || !solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(
        `Invalid type ${value}: must be non-empty and contain only HTTP token code points`
      );
    }
    this._type = value;
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(value) {
    value = asciiLowercase(String(value));

    if (!value || !solelyContainsHTTPTokenCodePoints(value)) {
      throw new Error(
        `Invalid subtype ${value}: must be non-empty and contain only HTTP token code points`
      );
    }
    this._subtype = value;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    return serialize(this); // Serialize this MIMEType
  }

  isJavaScript({ allowParameters = false } = {}) {
    if (
      (this._type === "text" &&
        [
          "ecmascript",
          "javascript",
          "javascript1.0",
          "javascript1.1",
          "javascript1.2",
          "javascript1.3",
          "javascript1.4",
          "javascript1.5",
          "jscript",
          "livescript",
          "x-ecmascript",
          "x-javascript"
        ].includes(this._subtype)) ||
      (this._type === "application" &&
        ["ecmascript", "javascript", "x-ecmascript", "x-javascript"].includes(
          this._subtype
        ))
    ) {
      return allowParameters || this._parameters.size === 0;
    }
    return false;
  }

  isXML() {
    return (
      (this._subtype === "xml" && ["text", "application"].includes(this._type)) ||
      this._subtype.endsWith("+xml")
    );
  }

  isHTML() {
    return this._type === "text" && this._subtype === "html"; // Check if MIME type is text/html
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
    name = asciiLowercase(String(name));
    value = String(value);

    if (!solelyContainsHTTPTokenCodePoints(name) || !solelyContainsHTTPQuotedStringTokenCodePoints(value)) {
      throw new Error("Invalid MIME type parameter");
    }

    this._map.set(name, value);
  }

  clear() {
    this._map.clear();
  }

  delete(name) {
    return this._map.delete(asciiLowercase(String(name)));
  }

  forEach(...args) {
    this._map.forEach(...args);
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
