// mimeType.js
class MIMEType {
  constructor(input) {
    const parsed = this.constructor.parse(input);
    if (!parsed) throw new Error("Invalid MIME type");
    this._type = parsed.type;
    this._subtype = parsed.subtype;
    this._parameters = new MIMETypeParameters(parsed.parameters);
  }

  static parse(input) {
    const match = input.match(/^\s*([^\/\s]+)\/([^;\s]+)\s*(;(.*))?$/i);
    if (!match) return null;

    const type = match[1].toLowerCase();
    const subtype = match[2].toLowerCase();
    const parameters = new Map();

    if (match[4]) {
      match[4].split(';').forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) parameters.set(key.toLowerCase(), value ? value.replace(/^"|"$/g, '') : "");
      });
    }

    return { type, subtype, parameters };
  }

  get type() {
    return this._type;
  }

  set type(newType) {
    if (!/^[\w!#$%&'*+.^_`|~-]+$/.test(newType)) {
      throw new Error("Invalid type");
    }
    this._type = newType.toLowerCase();
  }

  get subtype() {
    return this._subtype;
  }

  set subtype(newSubtype) {
    if (!/^[\w!#$%&'*+.^_`|~-]+$/.test(newSubtype)) {
      throw new Error("Invalid subtype");
    }
    this._subtype = newSubtype.toLowerCase();
  }

  get essence() {
    return `${this.type}/${this.subtype}`;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    return Array.from(this.parameters).reduce((str, [key, value]) =>
      str + `;${key}=${value.includes(' ') ? `"${value}"` : value}`, this.essence);
  }

  isHTML() {
    return this.essence === "text/html";
  }

  isXML() {
    return this.subtype.endsWith("+xml") ||
      this.essence === "application/xml" ||
      this.essence === "text/xml";
  }

  isJavaScript({ prohibitParameters = false } = {}) {
    const jsTypes = ["text/javascript", "application/javascript", "application/ecmascript", "text/ecmascript"];
    return jsTypes.includes(this.essence) && !(prohibitParameters && this.parameters.size > 0);
  }
}

// mimeTypeParameters.js
class MIMETypeParameters {
  constructor(parameters) {
    this._parameters = new Map(parameters);
  }

  has(key) {
    return this._parameters.has(key.toLowerCase());
  }

  get(key) {
    return this._parameters.get(key.toLowerCase());
  }

  set(key, value) {
    if (!/^[\w!#$%&'*+.^_`|~-]+$/.test(key)) {
      throw new Error("Invalid parameter name");
    }
    this._parameters.set(key.toLowerCase(), value);
  }

  delete(key) {
    return this._parameters.delete(key.toLowerCase());
  }

  *[Symbol.iterator]() {
    yield* this._parameters.entries();
  }

  get size() {
    return this._parameters.size;
  }
}

module.exports = MIMEType;
