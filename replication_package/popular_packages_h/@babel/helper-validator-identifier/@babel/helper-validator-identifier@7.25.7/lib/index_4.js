"use strict";

// This code defines various exports which are properties of the `exports` object.
// It uses `Object.defineProperty` to make these properties available by importing them from two modules:
// `identifier.js` and `keyword.js`. The properties are getters for specific methods from these external modules.

// The following defines an export for `isIdentifierChar` from `identifier.js`
Object.defineProperty(exports, "isIdentifierChar", {
  enumerable: true,
  get: function () {
    return _identifier.isIdentifierChar;
  }
});

// Exports `isIdentifierName` from `identifier.js`
Object.defineProperty(exports, "isIdentifierName", {
  enumerable: true,
  get: function () {
    return _identifier.isIdentifierName;
  }
});

// Exports `isIdentifierStart` from `identifier.js`
Object.defineProperty(exports, "isIdentifierStart", {
  enumerable: true,
  get: function () {
    return _identifier.isIdentifierStart;
  }
});

// Exports `isKeyword` from `keyword.js`
Object.defineProperty(exports, "isKeyword", {
  enumerable: true,
  get: function () {
    return _keyword.isKeyword;
  }
});

// Exports `isReservedWord` from `keyword.js`
Object.defineProperty(exports, "isReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isReservedWord;
  }
});

// Exports `isStrictBindOnlyReservedWord` from `keyword.js`
Object.defineProperty(exports, "isStrictBindOnlyReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isStrictBindOnlyReservedWord;
  }
});

// Exports `isStrictBindReservedWord` from `keyword.js`
Object.defineProperty(exports, "isStrictBindReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isStrictBindReservedWord;
  }
});

// Exports `isStrictReservedWord` from `keyword.js`
Object.defineProperty(exports, "isStrictReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isStrictReservedWord;
  }
});

// Import modules `identifier.js` and `keyword.js`
var _identifier = require("./identifier.js");
var _keyword = require("./keyword.js");

//# sourceMappingURL=index.js.map
