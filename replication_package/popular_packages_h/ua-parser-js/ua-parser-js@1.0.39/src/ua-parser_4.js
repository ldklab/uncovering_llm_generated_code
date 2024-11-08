'use strict';

(function (root) {
    const LIBVERSION = '1.0.39';
    const UA_MAX_LENGTH = 500;
    const EMPTY = '';
    const UNKNOWN = '?';
    const STR_TYPE = 'string';
    const UNDEF_TYPE = 'undefined';
    const FUNC_TYPE = 'function';
    const OBJ_TYPE = 'object';

    const BROWSER_LIST = {
        'chrome': ['crios', 'crmo'],
        'edge': ['edgios', 'edge', 'edga'],
        'opera': ['opera mini', 'opera mobi', 'opera'],
        'firefox': ['firefox', 'fxios'],
        // add more browsers as needed
    };

    const DEVICE_TYPES = {
        MOBILE: 'mobile',
        TABLET: 'tablet',
        SMARTTV: 'smarttv',
        WEARABLE: 'wearable',
        EMBEDDED: 'embedded',
        CONSOLE: 'console',
    };

    const VENDORS = ['Apple', 'Samsung', 'Huawei', 'Sony', 'Xiaomi'];

    const extend = (regexes, extensions) => {
        const merged = {};
        for (let key in regexes) {
            merged[key] = extensions[key]
                ? extensions[key].concat(regexes[key])
                : regexes[key];
        }
        return merged;
    };

    const has = (str1, str2) => {
        return typeof str1 === STR_TYPE && str2.toLowerCase().includes(str1.toLowerCase());
    };

    const lowerize = (str) => str.toLowerCase();

    const majorize = (version) => {
        return typeof version === STR_TYPE ? version.split('.')[0] : undefined;
    };

    const trim = (str, len) => {
        return typeof str === STR_TYPE ? str.trim().substring(0, len) : str;
    };

    const rgxMapper = (ua, regexes) => {
        let matches = null;
        regexes.some(([regex, properties]) => {
            matches = regex.exec(ua);
            if (matches) {
                properties.forEach(([key, value, fn]) => {
                    this[key] = fn ? fn.call(this, matches[value]) : matches[value] || undefined;
                });
                return true;
            }
        });
    };

    const UAParser = function (ua, extensions) {
        if (!(this instanceof UAParser)) return new UAParser(ua, extensions).getResult();

        const _ua = trim(ua || (root.navigator && root.navigator.userAgent), UA_MAX_LENGTH);
        const _rgxmap = extensions ? extend(regexes, extensions) : regexes;
        
        this.getBrowser = function () {
            const browser = { name: undefined, version: undefined };
            rgxMapper.call(browser, _ua, _rgxmap.browser);
            browser.major = majorize(browser.version);
            return browser;
        };
        
        // Similar methods for CPU, Device, Engine, OS...

        this.getResult = function () {
            return {
                ua: _ua,
                browser: this.getBrowser(),
                // similarly call and store results of other methods
            };
        };
    };

    UAParser.VERSION = LIBVERSION;

    if (typeof exports !== UNDEF_TYPE) {
        if (typeof module !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else if (typeof define === FUNC_TYPE && define.amd) {
        define(() => UAParser);
    } else {
        root.UAParser = UAParser;
    }

})(typeof window === 'object' ? window : this);
