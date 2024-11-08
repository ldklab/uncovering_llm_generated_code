/*!
 * UAParser.js v0.7.23
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
 * Licensed under MIT License
 */

(function (globalScope) {
    'use strict';

    const LIBVERSION = '0.7.23';
    const EMPTY = '';
    const UNKNOWN = '?';
    const FUNC_TYPE = 'function';
    const STR_TYPE = 'string';
    const OBJ_TYPE = 'object';
    const TYPE_ATTRIBUTES = {
        NAME: 'name',
        VERSION: 'version',
        ARCHITECTURE: 'architecture',
        MODEL: 'model',
        VENDOR: 'vendor',
        TYPE: 'type',
        MAJOR: 'major',
        CONSOLE: 'console',
        MOBILE: 'mobile',
        TABLET: 'tablet',
        SMARTTV: 'smarttv',
        WEARABLE: 'wearable',
        EMBEDDED: 'embedded'
    };

    const util = {
        extend: (regexes, extensions) => {
            const mergedRegexes = {};
            for (let key in regexes) {
                if (extensions[key] && extensions[key].length % 2 === 0) {
                    mergedRegexes[key] = extensions[key].concat(regexes[key]);
                } else {
                    mergedRegexes[key] = regexes[key];
                }
            }
            return mergedRegexes;
        },
        has: (needle, haystack) => typeof needle === STR_TYPE ? haystack.toLowerCase().includes(needle.toLowerCase()) : false,
        lowerize: (str) => str.toLowerCase(),
        major: (version) => typeof version === STR_TYPE ? version.replace(/[^\d.]/g,'').split(".")[0] : undefined,
        trim: (str) => str.trim()
    };

    const mapper = {
        rgx(ua, patterns) {
            let matches;
            for (let i = 0; i < patterns.length && !matches; i += 2) {
                const regexArr = patterns[i];
                const props = patterns[i + 1];
                let j = 0, k = 0;
                while (j < regexArr.length && !matches) {
                    matches = regexArr[j++].exec(ua);
                    if (matches) {
                        for (let p = 0; p < props.length; p++) {
                            const match = matches[++k];
                            const field = props[p];
                            if (typeof field === OBJ_TYPE && field.length > 0) {
                                if (field.length === 2) {
                                    this[field[0]] = typeof field[1] === FUNC_TYPE ? field[1].call(this, match) : field[1];
                                } else if (field.length === 3) {
                                    this[field[0]] = match ? (typeof field[1] === FUNC_TYPE ? field[1](match, field[2]) : match.replace(field[1], field[2])) : undefined;
                                } else if (field.length === 4) {
                                    this[field[0]] = match ? field[3].call(this, match.replace(field[1], field[2])) : undefined;
                                }
                            } else {
                                this[field] = match || undefined;
                            }
                        }
                    }
                }
            }
        },

        str(str, map) {
            for (let key in map) {
                if (typeof map[key] === OBJ_TYPE && map[key].length > 0) {
                    for (let val of map[key]) {
                        if (util.has(val, str)) {
                            return key !== UNKNOWN ? key : undefined;
                        }
                    }
                } else if (util.has(map[key], str)) {
                    return key !== UNKNOWN ? key : undefined;
                }
            }
            return str;
        }
    };

    const regexes = { /* Omitted for brevity; similar to original */ };
    const maps = { /* Omitted for brevity; similar to original */ };

    class UAParser {
        constructor(uastring, extensions) {
            if (typeof uastring === 'object') {
                extensions = uastring;
                uastring = undefined;
            }

            this.ua = uastring || (globalScope?.navigator?.userAgent || EMPTY);
            this.rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
        }

        getBrowser() {
            const browser = {};
            mapper.rgx.call(browser, this.ua, this.rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser;
        }

        getCPU() {
            const cpu = {};
            mapper.rgx.call(cpu, this.ua, this.rgxmap.cpu);
            return cpu;
        }

        getDevice() {
            const device = {};
            mapper.rgx.call(device, this.ua, this.rgxmap.device);
            return device;
        }

        getEngine() {
            const engine = {};
            mapper.rgx.call(engine, this.ua, this.rgxmap.engine);
            return engine;
        }

        getOS() {
            const os = {};
            mapper.rgx.call(os, this.ua, this.rgxmap.os);
            return os;
        }

        getResult() {
            return {
                ua: this.getUA(),
                browser: this.getBrowser(),
                engine: this.getEngine(),
                os: this.getOS(),
                device: this.getDevice(),
                cpu: this.getCPU()
            };
        }

        getUA() {
            return this.ua;
        }

        setUA(uastring) {
            this.ua = uastring;
            return this;
        }
    }

    Object.assign(UAParser, { VERSION: LIBVERSION }, TYPE_ATTRIBUTES);

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else if (typeof define === FUNC_TYPE && define.amd) {
        define(() => UAParser);
    } else {
        globalScope.UAParser = UAParser;
    }

    const $ = globalScope?.jQuery || globalScope?.Zepto;
    if ($ && !$.ua) {
        const parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = () => parser.getUA();
        $.ua.set = (uastring) => {
            parser.setUA(uastring);
            const result = parser.getResult();
            for (let prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }
})(typeof window === 'object' ? window : this);
