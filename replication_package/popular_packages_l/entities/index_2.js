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
      '\'': '&apos;'
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
    const xmlEntityRegex = /&(?:#(\d+)|#x([a-fA-F0-9]+)|(\w+));/g;
    const xmlEntitiesReverseMap = this.reverseMap(this.xmlEntitiesMap);
    return this.decodeEntities(str, xmlEntitiesReverseMap, xmlEntityRegex);
  }

  decodeHTML(str) {
    const htmlEntityRegex = /&(?:#(\d+)|#x([a-fA-F0-9]+)|(\w+));/g;
    const htmlEntitiesReverseMap = this.reverseMap(this.htmlEntitiesMap);
    return this.decodeEntities(str, htmlEntitiesReverseMap, htmlEntityRegex);
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
