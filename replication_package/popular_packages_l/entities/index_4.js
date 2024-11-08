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
    return str.replace(/[&]/g, this.htmlEntitiesMap['&']);
  }

  encodeXML(str) {
    return str.replace(/[&<>"']/g, char => this.xmlEntitiesMap[char]);
  }

  encodeHTML(str) {
    return str.replace(/[&<>"'üÿ]/g, char => this.htmlEntitiesMap[char] || char);
  }

  decodeXML(str) {
    return this.decodeEntities(str, this.reverseMap(this.xmlEntitiesMap), /&(?:#(\d+)|#x([a-fA-F0-9]+)|(\w+));/g);
  }

  decodeHTML(str) {
    return this.decodeEntities(str, this.reverseMap(this.htmlEntitiesMap), /&(?:#(\d+)|#x([a-fA-F0-9]+)|(\w+));/g);
  }

  decodeEntities(str, reverseMap, regex) {
    return str.replace(regex, (match, dec, hex, named) => {
      if (dec) return String.fromCharCode(dec);
      if (hex) return String.fromCharCode(parseInt(hex, 16));
      return reverseMap[named] || match;
    });
  }

  reverseMap(map) {
    const reverseMap = {};
    for (const key in map) {
      reverseMap[map[key].slice(1, -1)] = key;
    }
    return reverseMap;
  }
}

module.exports = new Entities();
