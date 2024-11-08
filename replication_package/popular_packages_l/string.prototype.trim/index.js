// index.js
(function() {
    'use strict';

    var stringTrim = function() {
        var ws = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF';
        var zeroWidth = '\u200B';
        var wsTrimmed = ws.replace(zeroWidth, '');
        
        var trimRegex = new RegExp('^[' + wsTrimmed + ']+|[' + wsTrimmed + ']+$', 'g');
        
        return function trim() {
            return String(this).replace(trimRegex, '');
        };
    }();

    var trim = function(value) {
        return stringTrim.call(value);
    };

    trim.shim = function shimStringTrim() {
        if (!String.prototype.trim || '\u200B'.trim() !== '\u200B') {
            String.prototype.trim = stringTrim;
        }
    };

    module.exports = trim;
})();
