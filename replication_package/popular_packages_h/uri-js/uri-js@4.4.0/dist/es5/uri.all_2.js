/** @license URI.js v4.4.0 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.URI = global.URI || {})));
}(this, (function (exports) { 'use strict';

  // Utility functions
  function merge(...sets) {
    if (sets.length > 1) {
      sets[0] = sets[0].slice(0, -1);
      const xl = sets.length - 1;
      for (let x = 1; x < xl; ++x) {
        sets[x] = sets[x].slice(1, -1);
      }
      sets[xl] = sets[xl].slice(1);
      return sets.join('');
    } else {
      return sets[0];
    }
  }

  function subexp(str) {
    return "(?:" + str + ")";
  }

  function typeOf(o) {
    return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
  }

  function toUpperCase(str) {
    return str.toUpperCase();
  }

  function toArray(obj) {
    return obj !== undefined && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
  }

  function assign(target, source) {
    var obj = target;
    if (source) {
      for (var key in source) {
        obj[key] = source[key];
      }
    }
    return obj;
  }

  // Regular expressions for parsing
  const UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~]";
  const HEXDIG$$ = "[0-9A-Fa-f]";
  const PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$));
  const GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]";
  const SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]";
  const RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$);
  const SCHEME$ = subexp(UNRESERVED$$ + merge(UNRESERVED$$));

  function buildExps(isIRI) {
    // The function generates regular expressions for different URI components based on whether it is handling an IRI or not.
    return {
      NOT_SCHEME: new RegExp(merge("[^]", UNRESERVED$$, "[\\+\\-\\.]"), "g"),
      // ... other expressions
    };
  }

  const URI_PROTOCOL = buildExps(false);
  const IRI_PROTOCOL = buildExps(true);

  // Function to parse URIs
  function parse(uriString, options = {}) {
    const components = {};
    const protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    // Use regex to parse the URI
    const matches = uriString.match(/^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i);
    if (matches) {
      components.scheme = matches[1];
      // ... parse other components
      return components;
    } else {
      components.error = components.error || "URI can not be parsed.";
    }
    return components;
  }

  // Export functions
  exports.parse = parse;
  // ... export other functions

  Object.defineProperty(exports, '__esModule', { value: true });

})));
