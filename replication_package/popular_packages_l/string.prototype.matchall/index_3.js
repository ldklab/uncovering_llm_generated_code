(function () {
  'use strict';

  var callMethod = Function.prototype.call.bind(Function.prototype.call);
  var indexOf = callMethod(String.prototype.indexOf);

  var supportsSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined';

  var convertToObject = function (value) {
    if (value == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object(value);
  };

  var convertToString = function (item) {
    return String(item);
  };

  var hasOwnProperty = callMethod(Object.prototype.hasOwnProperty);

  var buildMatcher = function (regexp) {
    var flags = 'g' + (hasOwnProperty(regexp, 'flags') ? '' : 
      (regexp.ignoreCase ? 'i' : '') + 
      (regexp.multiline ? 'm' : '') + 
      (regexp.dotAll ? 's' : '') + 
      (regexp.unicode ? 'u' : '') + 
      (regexp.sticky ? 'y' : ''));
    return new RegExp(regexp.source, flags);
  };

  var matchAllPolyfill = function matchAll(string, regex) {
    var obj = convertToObject(string);
    var str = convertToString(obj);

    var matcher;
    if (typeof regex !== 'object' || (supportsSymbols && !(Symbol.matchAll in regex))) {
      matcher = buildMatcher(new RegExp(regex, 'g'));
    } else if (!regex.global) {
      throw new TypeError('matchAll requires a global RegExp or a non-RegExp string');
    } else {
      matcher = regex;
    }

    var results = [];
    var lastIndex = 0;
    var match;
    
    while ((match = matcher.exec(str)) !== null) {
      var matchInfo = Object.assign([], match);
      matchInfo.index = match.index;
      matchInfo.input = str;
      results.push(matchInfo);
      if (!matcher.global) {
        break;
      }
      lastIndex = matcher.lastIndex;
    }

    matcher.lastIndex = lastIndex;
    return results;
  };

  matchAllPolyfill.shim = function applyPolyfill() {
    var proto = String.prototype;
    if (!('matchAll' in proto)) {
      Object.defineProperty(proto, 'matchAll', {
        configurable: true,
        writable: true,
        value: function matchAll(regex) {
          return matchAllPolyfill(this, regex);
        }
      });
    }
  };

  module.exports = matchAllPolyfill;
}());
