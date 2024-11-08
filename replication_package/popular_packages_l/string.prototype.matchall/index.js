(function () {
  'use strict';

  var callBind = Function.prototype.call.bind(Function.prototype.call);
  var indexOf = callBind(String.prototype.indexOf);

  var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined';

  var toObject = function (value) {
    if (value == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object(value);
  };

  var toString = function (item) {
    return String(item);
  };

  var hasOwn = callBind(Object.prototype.hasOwnProperty);

  var createMatcher = function (regexp) {
    var flags = 'g' + (hasOwn(regexp, 'flags') ? '' : (regexp.ignoreCase ? 'i' : '') + (regexp.multiline ? 'm' : '') + (regexp.dotAll ? 's' : '') + (regexp.unicode ? 'u' : '') + (regexp.sticky ? 'y' : ''));
    return new RegExp(regexp.source, flags);
  };

  var matchAllShim = function matchAll(string, regex) {
    var O = toObject(string);
    var S = toString(O);
    var matcher, flags;

    if (typeof regex !== 'object' || (hasSymbols && !(Symbol.matchAll in regex))) {
      matcher = createMatcher(new RegExp(regex, 'g'));
    } else if (!regex.global) {
      throw new TypeError('matchAll requires a global RegExp or a non-RegExp string');
    } else {
      matcher = regex;
    }

    var matches = [];
    var lastIndex = 0;
    var match;

    while ((match = matcher.exec(S)) !== null) {
      var matchObject = Object.assign([], match);
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

  matchAllShim.shim = function shimMatchAll() {
    var prototype = String.prototype;
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
}());
