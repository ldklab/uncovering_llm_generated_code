(() => {
  'use strict';

  const bindCall = Function.prototype.call.bind(Function.prototype.call);
  const indexOf = bindCall(String.prototype.indexOf);

  const hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined';

  const toObject = (value) => {
    if (value == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object(value);
  };

  const toString = (item) => String(item);

  const hasOwnProperty = bindCall(Object.prototype.hasOwnProperty);

  const createMatcher = (regex) => {
    const flags = 'g' + (hasOwnProperty(regex, 'flags') ? '' : 
      (regex.ignoreCase ? 'i' : '') + 
      (regex.multiline ? 'm' : '') + 
      (regex.dotAll ? 's' : '') + 
      (regex.unicode ? 'u' : '') + 
      (regex.sticky ? 'y' : ''));
    return new RegExp(regex.source, flags);
  };

  const matchAllShim = (string, regex) => {
    const O = toObject(string);
    const S = toString(O);
    let matcher;

    if (typeof regex !== 'object' || (hasSymbols && !(Symbol.matchAll in regex))) {
      matcher = createMatcher(new RegExp(regex, 'g'));
    } else if (!regex.global) {
      throw new TypeError('matchAll requires a global RegExp or a non-RegExp string');
    } else {
      matcher = regex;
    }

    const matches = [];
    let lastIndex = 0, match;

    while ((match = matcher.exec(S)) !== null) {
      const matchObject = Object.assign([], match);
      matchObject.index = match.index;
      matchObject.input = S;
      matches.push(matchObject);
      if (!matcher.global) {
        break;
      }
      lastIndex = matcher.lastIndex;
    }

    matcher.lastIndex = lastIndex;
    return matches;
  };

  matchAllShim.shim = () => {
    const prototype = String.prototype;
    if (!('matchAll' in prototype)) {
      Object.defineProperty(prototype, 'matchAll', {
        configurable: true,
        writable: true,
        value: function matchAll(regexp) {
          return matchAllShim(this, regexp);
        }
      });
    }
  };

  module.exports = matchAllShim;
})();
