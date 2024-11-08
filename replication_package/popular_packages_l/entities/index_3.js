// entities.js

class Entities {
  constructor() {
    this.htmlEntitiesMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&apos;',
      'ü': '&uuml;',
      'ÿ': '&yuml;',
    };
    this.xmlEntitiesMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&apos;',
    };
  }

  escapeUTF8(str) {
    return str.split('&').join(this.htmlEntitiesMap['&']);
  }

  encodeXML(str) {
    return str.replace(/[&<>"']/g, char => this.xmlEntitiesMap[char]);
  }

  encodeHTML(str) {
    return str.replace(/[&<>"'üÿ]/g, char => this.htmlEntitiesMap[char] || char);
  }

  decodeXML(str) {
    const xmlEntityRegex = /&(?:#(\d+)|#x([a-fA-F0-9]+)|(\w+));/g;
    const xmlEntitiesReverseMap = this._createReverseMap(this.xmlEntitiesMap);
    return this._decodeEntities(str, xmlEntitiesReverseMap, xmlEntityRegex);
  }

  decodeHTML(str) {
    const htmlEntityRegex = /&(?:#(\d+)|#x([a-fA-F0-9]+)|(\w+));/g;
    const htmlEntitiesReverseMap = this._createReverseMap(this.htmlEntitiesMap);
    return this._decodeEntities(str, htmlEntitiesReverseMap, htmlEntityRegex);
  }

  _decodeEntities(str, reverseMap, regex) {
    return str.replace(regex, (match, dec, hex, named) => {
      if (dec) return String.fromCharCode(dec);
      if (hex) return String.fromCharCode(parseInt(hex, 16));
      return reverseMap[named] || match;
    });
  }

  _createReverseMap(map) {
    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => [value.slice(1, -1), key])
    );
  }
}

module.exports = new Entities();
