// string.prototype.trimend/index.js

'use strict';

const whitespaceChars = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF';
const wsRegexEnd = new RegExp(`[${whitespaceChars}]+$`);

function trimEnd(value) {
    if (value == null) { // Checks for both undefined and null
        throw new TypeError('Cannot convert undefined or null to object');
    }
    return String(value).replace(wsRegexEnd, '');
}

function shimTrimEnd() {
    if (!String.prototype.trimEnd) {
        String.prototype.trimEnd = function () {
            return trimEnd(this);
        };
    }
}

module.exports = trimEnd;
module.exports.shim = shimTrimEnd;
