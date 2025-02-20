(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global.URI = global.URI || {}));
    }
}(this, (function(exports) {
    'use strict';

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
        return `(?:${str})`;
    }

    function typeOf(o) {
        return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
    }

    function toUpperCase(str) {
        return str.toUpperCase();
    }

    function toArray(obj) {
        if (obj !== undefined && obj !== null) {
            return obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj);
        }
        return [];
    }

    function assign(target, source) {
        const obj = target;
        if (source) {
            for (let key in source) {
                obj[key] = source[key];
            }
        }
        return obj;
    }

    function buildExps(isIRI) {
        const ALPHA$$ = "[A-Za-z]";
        const DIGIT$$ = "[0-9]";
        const HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]");
        const PCT_ENCODED$ = subexp(`${subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$)}|${subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$)}|${subexp("%" + HEXDIG$$ + HEXDIG$$)}`);
        const UNRESERVED$$ = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]");
        const SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*");
        const USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\:"])));
        const DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$);
        const IPV4ADDRESS$ = subexp(DEC_OCTET$ + "\\." + DEC_OCTET$ + "\\." + DEC_OCTET$ + "\\." + DEC_OCTET$);
        const H16$ = subexp(HEXDIG$$ + "{1,4}");
        const LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$);
        const IPV6ADDRESS$ = subexp(`${IPV4ADDRESS$}|${H16$}\\:${H16$}\\:${H16$}\\:${H16$}\\:${H16$}\\:${LS32$}`);
        const HOST$ = subexp(subexp(IPV4ADDRESS$ + "|" + subexp(IPV6ADDRESS$) + "|" + subexp("[A-Za-z0-9\\-\\.][A-Za-z0-9\\-\\._~%!$&'()*+,;=]*")));
        const URI$ = subexp(`${SCHEME$}\\:` + subexp(`\\/\\/${HOST$}`) + subexp(`[\\/?#].*?$`));
        return {
            NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
            IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
            IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")\\]?$"),
        };
    }

    const URI_PROTOCOL = buildExps(false);

    function _stripLeadingZeros(str) {
        return str.replace(/^0*(.*)/, "$1") || "0";
    }

    function _normalizeIPv4(host, protocol) {
        let matches = host.match(protocol.IPV4ADDRESS) || [];
        let address = matches[1];
        if (address) {
            return address.split(".").map(_stripLeadingZeros).join(".");
        } else {
            return host;
        }
    }

    function _normalizeIPv6(host, protocol) {
        let matches = host.match(protocol.IPV6ADDRESS) || [];
        let address = matches[1];
        if (address) {
            const fields = address.toLowerCase().split(':');
            return fields.map(_stripLeadingZeros).join(':');
        }
        return host;
    }

    const parse = (uriString, options = {}) => {
        let components = {};
        const protocol = options.iri !== false ? URI_PROTOCOL : URI_PROTOCOL;
        const matches = uriString.match(/^([^:\/?#]+):([^?#]*)(\?([^#]*))?(#(.*))?/);
        if (matches) {
            components.scheme = matches[1];
            components.path = matches[2];
            components.query = matches[4];
            components.fragment = matches[6];
        }
        return components;
    };

    exports.parse = parse;
    exports._stripLeadingZeros = _stripLeadingZeros;
    exports._normalizeIPv4 = _normalizeIPv4;
    exports._normalizeIPv6 = _normalizeIPv6;

})));
