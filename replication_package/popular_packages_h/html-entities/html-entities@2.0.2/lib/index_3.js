(function(root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    (root || globalThis).htmlEntities = factory();
  }
})(this, function() {
  const namedReferences = require('./named-references');
  const unicodeMap = require('./numeric-unicode-map');
  const surrogatePairs = require('./surrogate-pairs');

  const allNamedReferences = { ...namedReferences.namedReferences, all: namedReferences.namedReferences.html5 };

  const regex = {
    specialChars: /[<>'"&]/g,
    nonAscii: /[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g
  };

  const defaultEncodeOptions = { mode: 'specialChars', level: 'all', numeric: 'decimal' };
  const defaultDecodeOptions = { scope: 'body', level: 'all' };

  function encode(text, options = {}) {
    options = { ...defaultEncodeOptions, ...options };
    if (!text) return '';

    const charactersMap = allNamedReferences[options.level].characters;
    const isHex = options.numeric === 'hexadecimal';

    return text.replace(regex[options.mode], char => {
      const namedEntity = charactersMap[char];
      if (namedEntity) return namedEntity;

      const codePoint = char.length > 1 ? surrogatePairs.getCodePoint(char, 0) : char.charCodeAt(0);
      return isHex ? `&#x${codePoint.toString(16)};` : `&#${codePoint};`;
    });
  }

  function decode(text, options = {}) {
    options = { ...defaultDecodeOptions, ...options };
    if (!text) return '';
    
    const entitiesMap = allNamedReferences[options.level].entities;
    const scopeRegex = options.scope === 'attribute' ? /&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g : /&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+);?/g;

    return text.replace(scopeRegex, entity => {
      if (options.scope === 'attribute' && entity.endsWith('=')) return entity;

      if (entity[1] !== '#') return entitiesMap[entity] || entity;

      const isHex = entity[2].toLowerCase() === 'x';
      const codePoint = isHex ? parseInt(entity.substr(3), 16) : parseInt(entity.substr(2));

      return codePoint > 65535 ? surrogatePairs.fromCodePoint(codePoint) : String.fromCharCode(unicodeMap.numericUnicodeMap[codePoint] || codePoint);
    });
  }

  return { encode, decode };
});
