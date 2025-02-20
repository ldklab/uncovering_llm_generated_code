/*!
 * UAParser.js v0.7.23
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
 * Licensed under MIT License
 */

(function (window) {
    'use strict';

    const LIBVERSION = '0.7.23';
    const EMPTY = '';
    const NAME = 'name';
    const VERSION = 'version';
    const STR_TYPE = 'string';
    const FUNC_TYPE = 'function';
    const OBJ_TYPE = 'object';

    const util = {
        extend: (regexes, extensions) => {
            let mergedRegexes = {};
            for (let i in regexes) {
                mergedRegexes[i] = extensions[i] && extensions[i].length % 2 === 0
                    ? extensions[i].concat(regexes[i]) : regexes[i];
            }
            return mergedRegexes;
        },
        has: (str1, str2) => typeof str1 === "string" && str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1,
        lowerize: str => str.toLowerCase(),
        major: version => typeof version === STR_TYPE ? version.replace(/[^\d\.]/g, '').split(".")[0] : undefined,
        trim: str => str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''),
    };

    const mapper = {
        rgx: function (ua, arrays) {
            let i = 0, matches;
            while (i < arrays.length && !matches) {
                let [regex, props] = arrays.slice(i, i+2);
                for (let j = 0; j < regex.length && !matches; j++) {
                    matches = regex[j].exec(ua);
                    if (matches) {
                        props.forEach((prop, p) => {
                            let match = matches[++p];
                            if (typeof prop === OBJ_TYPE && prop.length) {
                                this[prop[0]] = typeof prop[1] === FUNC_TYPE 
                                    ? prop[1].call(this, match, prop[2] || undefined)
                                    : match ? match.replace(prop[1], prop[2]) : undefined;
                            } else {
                                this[prop] = match || undefined;
                            }
                        });
                    }
                }
                i += 2;
            }
        },
        str: (str, map) => {
            for (let i in map) {
                if (util.has(map[i], str)) return i == UNKNOWN ? undefined : i;
            }
            return str;
        }
    };

    const regexes = {
        browser: [
            [
                /(opera\smini)\/([\w\.-]+)/i,
                /(opera)[\/\s]+([\w\.]+)/i
            ], 
            [NAME, VERSION]
        ]
    };

    var UAParser = function (uastring, extensions) {
        if (typeof uastring === 'object') { 
            extensions = uastring;
            uastring = undefined; 
        }

        const ua = uastring || (window && window.navigator && window.navigator.userAgent) || EMPTY;
        const rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            var browser = { name: undefined, version: undefined };
            mapper.rgx.call(browser, ua, rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser;
        };

        this.getResult = function () {
            return {
                ua: this.getUA(),
                browser: this.getBrowser()
            };
        };

        this.getUA = function () { return ua; };
        this.setUA = function (uastring) { ua = uastring; return this; };
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = { NAME: NAME, VERSION: VERSION };

    if (typeof(exports) !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        if (typeof define === 'function' && define.amd) {
            define(function () { return UAParser; });
        } else if (window) {
            window.UAParser = UAParser;
        }
    }

    var $ = window && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () { return parser.getUA(); };
        $.ua.set = function (uastring) {
            parser.setUA(uastring);
            var result = parser.getResult();
            for (var prop in result) $.ua[prop] = result[prop];
        };
    }

})(typeof window === 'object' ? window : this);
