/*!
 * UAParser.js - Lightweight JavaScript User-Agent parser
 * Parses various properties from a given User-Agent string.
 */

(function(global) {
    'use strict';
    
    const LIBVERSION = '0.7.23';
    const EMPTY = '';
    const UNKNOWN = '?';
    const TYPE_CONSTANTS = {
        FUNCTION: 'function', UNDEFINED: 'undefined', OBJECT: 'object', STRING: 'string',
        ARCHITECTURE: 'architecture', MODEL: 'model', NAME: 'name', TYPE: 'type', VENDOR: 'vendor',
        VERSION: 'version', CONSOLE: 'console', MOBILE: 'mobile', TABLET: 'tablet', 
        SMARTTV: 'smarttv', WEARABLE: 'wearable', EMBEDDED: 'embedded'
    };
    
    // Utility functions
    const util = {
        extend: (base, ext) => Object.keys(base).reduce((acc, key) => {
            acc[key] = ext[key] && ext[key].length % 2 === 0 ? ext[key].concat(base[key]) : base[key];
            return acc;
        }, {}),
        
        has: (str1, str2) => typeof str1 === 'string' && str2.toLowerCase().includes(str1.toLowerCase()),

        lowerize: str => str.toLowerCase(),

        major: version => typeof version === 'string' ? version.replace(/[^\d\.]/g,'').split('.')[0] : undefined,

        trim: str => str.replace(/^\s+|\s+$/g, '')
    };

    // Map helpers
    const mapper = {
        rgx: function(ua, patterns) {
            let matches;
            for (let i = 0; i < patterns.length && !matches; i += 2) {
                const regexArray = patterns[i];
                const properties = patterns[i + 1];
                regexArray.some(regex => {
                    matches = regex.exec(ua);
                    if (matches) {
                        let matchIdx = 1;
                        properties.forEach(prop => {
                            if (Array.isArray(prop) && prop.length > 0) {
                                const [key, mapOrFunc, repl, sanitizer] = prop;
                                if (typeof mapOrFunc === 'function' && !(mapOrFunc.exec && mapOrFunc.test)) {
                                    this[key] = matches[matchIdx] ? mapOrFunc.call(this, matches[matchIdx], repl) : undefined;
                                } else {
                                    this[key] = matches[matchIdx] ? matches[matchIdx].replace(mapOrFunc, repl) : undefined;
                                    if (sanitizer) {
                                        this[key] = sanitizer.call(this, this[key]);
                                    }
                                }
                            } else {
                                this[prop] = matches[matchIdx] || undefined;
                            }
                            matchIdx++;
                        });
                    }
                });
            }
        },

        str: (str, map) => Object.keys(map).find(key => {
            const item = map[key];
            return (Array.isArray(item) ? item : [item]).some(val => util.has(val, str)) && key !== UNKNOWN ? key : undefined;
        }) || str
    };

    // Configuration maps and regular expressions are defined here (not repeated for brevity)

    // UAParser Constructor
    function UAParser(uastring, extensions) {
        if (typeof uastring === 'object') {
            extensions = uastring;
            uastring = undefined;
        }
        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        let ua = uastring || (global.navigator ? global.navigator.userAgent : EMPTY);
        let rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function() {
            const browser = { name: undefined, version: undefined };
            mapper.rgx.call(browser, ua, rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser;
        };

        this.getCPU = function() {
            const cpu = { architecture: undefined };
            mapper.rgx.call(cpu, ua, rgxmap.cpu);
            return cpu;
        };

        this.getDevice = function() {
            const device = { vendor: undefined, model: undefined, type: undefined };
            mapper.rgx.call(device, ua, rgxmap.device);
            return device;
        };

        this.getEngine = function() {
            const engine = { name: undefined, version: undefined };
            mapper.rgx.call(engine, ua, rgxmap.engine);
            return engine;
        };

        this.getOS = function() {
            const os = { name: undefined, version: undefined };
            mapper.rgx.call(os, ua, rgxmap.os);
            return os;
        };

        this.getResult = function() {
            return {
                ua: this.getUA(),
                browser: this.getBrowser(),
                engine: this.getEngine(),
                os: this.getOS(),
                device: this.getDevice(),
                cpu: this.getCPU()
            };
        };

        this.getUA = function() {
            return ua;
        };

        this.setUA = function(userAgentString) {
            ua = userAgentString;
            return this;
        };

        return this;
    }

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = {
        NAME: 'name',
        MAJOR: 'major', // deprecated
        VERSION: 'version'
    };
    UAParser.CPU = {
        ARCHITECTURE: 'architecture'
    };
    UAParser.DEVICE = {
        MODEL: 'model',
        VENDOR: 'vendor',
        TYPE: 'type',
        CONSOLE: 'console',
        MOBILE: 'mobile',
        SMARTTV: 'smarttv',
        TABLET: 'tablet',
        WEARABLE: 'wearable',
        EMBEDDED: 'embedded'
    };
    UAParser.ENGINE = {
        NAME: 'name',
        VERSION: 'version'
    };
    UAParser.OS = {
        NAME: 'name',
        VERSION: 'version'
    };

    // Export logic
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else if (typeof define === 'function' && define.amd) {
        define(() => UAParser);
    } else if (global) {
        global.UAParser = UAParser;
    }

    // jQuery/Zepto integration
    const $ = global && (global.jQuery || global.Zepto);
    if ($ && !$.ua) {
        const parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = () => parser.getUA();
        $.ua.set = (uastring) => {
            parser.setUA(uastring);
            Object.assign($.ua, parser.getResult());
        };
    }

})(typeof window === 'object' ? window : this);
