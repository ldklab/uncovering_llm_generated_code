/*!
 * UAParser.js v0.7.23
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
 * Licensed under MIT License
 */

(function (root) {

    'use strict';

    const LIBVERSION = '0.7.23', EMPTY = '', UNKNOWN = '?';

    const util = {
        extend: (regexes, extensions) => {
            let mergedRegexes = {};
            for (const key in regexes) {
                mergedRegexes[key] = extensions[key] && extensions[key].length % 2 === 0 
                                    ? extensions[key].concat(regexes[key]) 
                                    : regexes[key];
            }
            return mergedRegexes;
        },
        has: (str1, str2) => typeof str1 === 'string' && str2.toLowerCase().includes(str1.toLowerCase()),
        lowerize: str => str.toLowerCase(),
        major: version => typeof version === 'string' ? version.replace(/[^\d\.]/g, '').split(".")[0] : undefined,
        trim: str => str.replace(/^\s+|\s+$/g, ''),
    };

    const mapper = {
        rgx: function (ua, arrays) {
            let i = 0, matches;
            while (i < arrays.length && !matches) {
                let j = 0, regex = arrays[i], props = arrays[i + 1];
                while (j < regex.length && !matches) {
                    matches = regex[j++].exec(ua);
                    if (matches) {
                        props.forEach((prop, p) => {
                            let q = prop, match = matches[++p];
                            if (Array.isArray(q) && q.length > 0) {
                                if (q.length === 2) {
                                    this[q[0]] = typeof q[1] === 'function' ? q[1].call(this, match) : q[1];
                                } else if (q.length === 3) {
                                    this[q[0]] = match ? (typeof q[1] === 'function' ? q[1].call(this, match, q[2]) : match.replace(q[1], q[2])) : undefined;
                                } else if (q.length === 4) {
                                    this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                this[q] = match || undefined;
                            }
                        });
                    }
                }
                i += 2;
            }
        },
        str: function (str, map) {
            for (const key in map) {
                if (Array.isArray(map[key])) {
                    for (const item of map[key]) {
                        if (util.has(item, str)) {
                            return key === UNKNOWN ? undefined : key;
                        }
                    }
                } else if (util.has(map[key], str)) {
                    return key === UNKNOWN ? undefined : key;
                }
            }
            return str;
        }
    };

    const maps = {
        browser: {
            oldsafari: {
                version: { '1.0': '/8', '1.2': '/1', '1.3': '/3', '2.0': '/412', '2.0.2': '/416', '2.0.3': '/417', '2.0.4': '/419', '?': '/' }
            }
        },
        device: {
            amazon: { model: { 'Fire Phone': ['SD', 'KF'] } },
            sprint: { model: { 'Evo Shift 4G': '7373KT' }, vendor: { 'HTC': 'APA', 'Sprint': 'Sprint' } }
        },
        os: { windows: { version: { 'ME': '4.90', 'NT 3.11': 'NT3.51', 'NT 4.0': 'NT4.0', '2000': 'NT 5.0', 'XP': ['NT 5.1', 'NT 5.2'], 'Vista': 'NT 6.0', '7': 'NT 6.1', '8': 'NT 6.2', '8.1': 'NT 6.3', '10': ['NT 6.4', 'NT 10.0'], 'RT': 'ARM' } } }
    };

    const regexes = {
        browser: [
            [ /(opera\smini)\/([\w\.-]+)/i, /(opera\s[mobiletab]{3,6}).+version\/([\w\.-]+)/i, /(opera).+version\/([\w\.]+)/i, /(opera)[\/\s]+([\w\.]+)/i ], 
            [ 'name', 'version' ],
            [ /\s(opios)[\/\s]+([\w\.]+)/i ],
            [ ['name', 'Opera Mini'], 'version' ],
            [ /\s(opr)\/([\w\.]+)/i ],
            [ ['name', 'Opera'], 'version' ],
            // More regexes omitted for brevity...
        ],
        cpu: [
            [ /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i ],
            [ ['architecture', 'amd64'] ],
            [ /(ia32(?=;))/i ],
            [ ['architecture', util.lowerize] ],
            [ /((?:i[346]|x)86)[;\)]/i ],
            [ ['architecture', 'ia32'] ],
            // More regexes omitted for brevity...
        ],
        device: [ /* Regex patterns omitted for brevity */ ],
        engine: [ /* Regex patterns omitted for brevity */ ],
        os: [ /* Regex patterns omitted for brevity */ ]
    };

    const UAParser = function (uastring, extensions) {
        if (typeof uastring === 'object') {
            extensions = uastring;
            uastring = undefined;
        }
        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        let ua = uastring || (root.navigator ? root.navigator.userAgent : EMPTY);
        let rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            let browser = { name: undefined, version: undefined };
            mapper.rgx.call(browser, ua, rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser;
        };

        this.getCPU = function () {
            let cpu = { architecture: undefined };
            mapper.rgx.call(cpu, ua, rgxmap.cpu);
            return cpu;
        };

        this.getDevice = function () {
            let device = { vendor: undefined, model: undefined, type: undefined };
            mapper.rgx.call(device, ua, rgxmap.device);
            return device;
        };

        this.getEngine = function () {
            let engine = { name: undefined, version: undefined };
            mapper.rgx.call(engine, ua, rgxmap.engine);
            return engine;
        };

        this.getOS = function () {
            let os = { name: undefined, version: undefined };
            mapper.rgx.call(os, ua, rgxmap.os);
            return os;
        };

        this.getResult = function () {
            return {
                ua: this.getUA(),
                browser: this.getBrowser(),
                engine: this.getEngine(),
                os: this.getOS(),
                device: this.getDevice(),
                cpu: this.getCPU(),
            };
        };

        this.getUA = function () {
            return ua;
        };

        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };

        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = { NAME: 'name', MAJOR: 'major', VERSION: 'version' };
    UAParser.CPU = { ARCHITECTURE: 'architecture' };
    UAParser.DEVICE = { MODEL: 'model', VENDOR: 'vendor', TYPE: 'type', CONSOLE: 'console', MOBILE: 'mobile', SMARTTV: 'smarttv', TABLET: 'tablet', WEARABLE: 'wearable', EMBEDDED: 'embedded' };
    UAParser.ENGINE = { NAME: 'name', VERSION: 'version' };
    UAParser.OS = { NAME: 'name', VERSION: 'version' };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        if (typeof define === 'function' && define.amd) {
            define(function () { return UAParser; });
        } else if (root) {
            root.UAParser = UAParser;
        }
    }

    let $ = root && (root.jQuery || root.Zepto);
    if ($ && !$.ua) {
        let parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () { return parser.getUA(); };
        $.ua.set = function (uastring) {
            parser.setUA(uastring);
            let result = parser.getResult();
            for (let prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);
