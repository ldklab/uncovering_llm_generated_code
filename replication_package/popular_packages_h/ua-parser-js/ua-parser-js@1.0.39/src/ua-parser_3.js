(function (global) {
    'use strict';

    const LIB_VERSION = '1.0.39';
    const CONSTANTS = {
        EMPTY: '',
        UNKNOWN: '?',
        UA_MAX_LENGTH: 500,
        NAME: 'name',
        VERSION: 'version',
        VENDOR: 'vendor',
        MODEL: 'model',
        TYPE: 'type',
        MOBILE: 'mobile',
        TABLET: 'tablet',
        SMARTTV: 'smarttv',
        CONSOLE: 'console',
        WEARABLE: 'wearable',
        EMBEDDED: 'embedded',
        ARCHITECTURE: 'architecture',
    };

    const VENDORS = {
        AMAZON: 'Amazon',
        APPLE: 'Apple',
        GOOGLE: 'Google',
        SAMSUNG: 'Samsung',
        MICROSOFT: 'Microsoft',
        XIAOMI: 'Xiaomi',
    };

    const BROWSERS = {
        CHROME: 'Chrome',
        FIREFOX: 'Firefox',
        OPERA: 'Opera',
        EDGE: 'Edge',
    };

    const OSES = {
        MAC_OS: 'Mac OS',
        CHROMIUM_OS: 'Chromium OS',
    };

    // Helper functions
    const lowerize = (str) => str.toLowerCase();
    const trim = (str, len) => str.replace(/^\s+|\s+$/g, CONSTANTS.EMPTY).substring(0, len || CONSTANTS.UA_MAX_LENGTH);
    const majorize = (version) => (typeof version === 'string' ? version.split('.')[0] : undefined);

    const extendRegexes = (regexes, extensions) => {
        let merged = {};
        for (let key in regexes) {
            if (extensions[key] && extensions[key].length % 2 === 0) {
                merged[key] = extensions[key].concat(regexes[key]);
            } else {
                merged[key] = regexes[key];
            }
        }
        return merged;
    };

    const rgxMapper = function (ua, arrays) {
        let i = 0, matches;
        while (i < arrays.length && !matches) {
            const regex = arrays[i], props = arrays[++i];
            for (let j = 0; j < regex.length && !matches; j++) {
                matches = regex[j] && regex[j].exec(ua);
                if (matches) {
                    for (let p = 0; p < props.length; p++) {
                        const match = matches[++i], prop = props[p];
                        this[prop] = match;
                    }
                }
            }
            i++;
        }
    };

    const regexes = {
        browser: [
            [/\b(?:crmo|crios)\/([\w\.]+)/i, /edg(?:e|ios|a)?\/([\w\.]+)/i],
            [CONSTANTS.VERSION, [CONSTANTS.NAME, BROWSERS.CHROME]]
        ],
        cpu: [
            [/(?:(amd|x(?:86|64)[-_])?wow|win)64/i],
            [[CONSTANTS.ARCHITECTURE, 'amd64']]
        ],
        device: [
            [/\b(sch-i[89]0\d|sm-[pt]\w{2,4})/i],
            [CONSTANTS.MODEL, [CONSTANTS.VENDOR, VENDORS.SAMSUNG], [CONSTANTS.TYPE, CONSTANTS.TABLET]]
        ],
        engine: [
            [/(trident|webkit|netfront|netsurf)\/([\w\.]+)/i],
            [CONSTANTS.NAME, CONSTANTS.VERSION]
        ],
        os: [
            [/\biphone os ([\w\.]+)/i, /\bmac os x ([\w\._]+)/i],
            [[CONSTANTS.VERSION, /_/g, '.'], [CONSTANTS.NAME, OSES.MAC_OS]]
        ]
    };

    function UAParser(ua, extensions) {
        if (!(this instanceof UAParser)) return new UAParser(ua, extensions).getResult();

        const _ua = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : CONSTANTS.EMPTY);
        const _rgxmap = extensions ? extendRegexes(regexes, extensions) : regexes;

        this.getBrowser = function () {
            let browser = { [CONSTANTS.NAME]: undefined, [CONSTANTS.VERSION]: undefined };
            rgxMapper.call(browser, _ua, _rgxmap.browser);
            browser.major = majorize(browser[CONSTANTS.VERSION]);
            return browser;
        };

        this.getCPU = function () {
            let cpu = { [CONSTANTS.ARCHITECTURE]: undefined };
            rgxMapper.call(cpu, _ua, _rgxmap.cpu);
            return cpu;
        };

        this.getDevice = function () {
            let device = { [CONSTANTS.VENDOR]: undefined, [CONSTANTS.MODEL]: undefined, [CONSTANTS.TYPE]: undefined };
            rgxMapper.call(device, _ua, _rgxmap.device);
            return device;
        };

        this.getEngine = function () {
            let engine = { [CONSTANTS.NAME]: undefined, [CONSTANTS.VERSION]: undefined };
            rgxMapper.call(engine, _ua, _rgxmap.engine);
            return engine;
        };

        this.getOS = function () {
            let os = { [CONSTANTS.NAME]: undefined, [CONSTANTS.VERSION]: undefined };
            rgxMapper.call(os, _ua, _rgxmap.os);
            return os;
        };

        this.getResult = function () {
            return {
                ua: _ua,
                browser: this.getBrowser(),
                cpu: this.getCPU(),
                device: this.getDevice(),
                engine: this.getEngine(),
                os: this.getOS()
            };
        };
    }

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) exports = module.exports = UAParser;
        exports.UAParser = UAParser;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return UAParser; });
    } else if (typeof global !== 'undefined') {
        global.UAParser = UAParser;
    }

})(typeof window !== 'undefined' ? window : this);
