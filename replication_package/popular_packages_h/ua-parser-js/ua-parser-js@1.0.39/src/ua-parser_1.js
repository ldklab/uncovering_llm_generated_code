(function (global) {
    'use strict';

    const LIB_VERSION = '1.0.39';
    const EMPTY = '';
    const UNKNOWN = '?';
    const FUNC_TYPE = 'function';
    const UNDEF_TYPE = 'undefined';
    const OBJ_TYPE = 'object';
    const STR_TYPE = 'string';
    const MAJOR = 'major';
    const MODEL = 'model';
    const NAME = 'name';
    const TYPE = 'type';
    const VENDOR = 'vendor';
    const VERSION = 'version';
    const ARCHITECTURE = 'architecture';
    const CONSOLE = 'console';
    const MOBILE = 'mobile';
    const TABLET = 'tablet';
    const SMARTTV = 'smarttv';
    const WEARABLE = 'wearable';
    const EMBEDDED = 'embedded';
    const UA_MAX_LENGTH = 500;

    const BRANDS = {
        AMAZON: 'Amazon',
        APPLE: 'Apple',
        ASUS: 'ASUS',
        BLACKBERRY: 'BlackBerry',
        BROWSER: 'Browser',
        CHROME: 'Chrome',
        EDGE: 'Edge',
        FIREFOX: 'Firefox',
        GOOGLE: 'Google',
        HUAWEI: 'Huawei',
        LG: 'LG',
        MICROSOFT: 'Microsoft',
        MOTOROLA: 'Motorola',
        OPERA: 'Opera',
        SAMSUNG: 'Samsung',
        SHARP: 'Sharp',
        SONY: 'Sony',
        XIAOMI: 'Xiaomi',
        ZEBRA: 'Zebra',
        FACEBOOK: 'Facebook',
        CHROMIUM_OS: 'Chromium OS',
        MAC_OS: 'Mac OS',
    };

    function extend(regexes, extensions) {
        const mergedRegexes = {};
        for (let key in regexes) {
            mergedRegexes[key] = extensions[key] && extensions[key].length % 2 === 0 
                ? extensions[key].concat(regexes[key]) 
                : regexes[key];
        }
        return mergedRegexes;
    }

    function enumerize(arr) {
        return arr.reduce((acc, curr) => {
            acc[curr.toUpperCase()] = curr;
            return acc;
        }, {});
    }

    function has(s1, s2) {
        return typeof s1 === STR_TYPE ? s2.toLowerCase().includes(s1.toLowerCase()) : false;
    }

    function lowerize(str) {
        return str.toLowerCase();
    }

    function majorize(version) {
        return typeof version === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined;
    }

    function trim(str, len) {
        if (typeof str === STR_TYPE) {
            str = str.trim();
            return typeof len === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
        }
    }

    function rgxMapper(ua, arrays) {
        let matches;

        for (let i = 0; matches == null && i < arrays.length; i += 2) {
            const regex = arrays[i];
            const props = arrays[i + 1];
            
            for (let j = 0; matches == null && j < regex.length; j++) {
                if (!regex[j]) break;
                matches = regex[j++].exec(ua);
                if (matches) {
                    this.extractProperties(matches, props);
                }
            }
        }
    }

    function strMapper(str, map) {
        for (let key in map) {
            if (Array.isArray(map[key])) {
                for (let i = 0; i < map[key].length; i++) {
                    if (has(map[key][i], str)) {
                        return key === UNKNOWN ? undefined : key;
                    }
                }
            } else if (has(map[key], str)) {
                return key === UNKNOWN ? undefined : key;
            }
        }
        return map.hasOwnProperty('*') ? map['*'] : str;
    }

    const regexes = {
        // regex patterns for browsers, CPU, device, engines, and OS
    };

    const UAParser = function (ua, extensions) {
        if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
        }

        const _navigator = (typeof window !== UNDEF_TYPE && window.navigator) ? window.navigator : undefined;
        const _ua = ua || ((_navigator && _navigator.userAgent) ? _navigator.userAgent : EMPTY);
        const _regexMapped = extensions ? extend(regexes, extensions) : regexes;
        const _isSelfNav = _navigator && _navigator.userAgent == _ua;

        this.getBrowser = function () {
            return this.parseEntity(_ua, _regexMapped.browser, _isSelfNav);
        };

        this.getCPU = function () {
            return this.parseEntity(_ua, _regexMapped.cpu);
        };

        this.getDevice = function () {
            const device = this.parseEntity(_ua, _regexMapped.device);
            if (_isSelfNav && !device[TYPE] && _navigator.userAgentData && _navigator.userAgentData.mobile) {
                device[TYPE] = MOBILE;
            }
            if (_isSelfNav && device[MODEL] === 'Macintosh' && _navigator.standalone !== undefined && _navigator.maxTouchPoints > 2) {
                device[MODEL] = 'iPad';
                device[TYPE] = TABLET;
            }
            return device;
        };

        this.getEngine = function () {
            return this.parseEntity(_ua, _regexMapped.engine);
        };

        this.getOS = function () {
            const os = this.parseEntity(_ua, _regexMapped.os);
            if (_isSelfNav && !os[NAME] && _navigator.userAgentData && _navigator.userAgentData.platform !== 'Unknown') {
                os[NAME] = _navigator.userAgentData.platform
                    .replace(/chrome os/i, BRANDS.CHROMIUM_OS)
                    .replace(/macos/i, BRANDS.MAC_OS);
            }
            return os;
        };

        this.getResult = function () {
            return {
                ua: this.getUA(),
                browser: this.getBrowser(),
                engine: this.getEngine(),
                os: this.getOS(),
                device: this.getDevice(),
                cpu: this.getCPU()
            };
        };

        this.getUA = function () {
            return _ua;
        };

        this.setUA = function (ua) {
            _ua = (typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH) ? trim(ua, UA_MAX_LENGTH) : ua;
            return this;
        };

        this.parseEntity = function(ua, map, isSelfNav = false) {
            const entity = {};
            const mappingFunction = rgxMapper.bind(entity, ua);
            const braveSpecificLogic = (nav) => {
                if (isSelfNav && nav && nav.brave && typeof nav.brave.isBrave == FUNC_TYPE) {
                    entity[NAME] = 'Brave';
                }
            };
            mappingFunction(map);
            entity[MAJOR] = majorize(entity[VERSION]);
            braveSpecificLogic(_navigator);
            return entity;
        };

        this.extractProperties = function (matches, props) {
            let matchIndex;
            for (let p = 0; p < props.length; p++) {
                matchIndex = p + 1;
                const prop = props[p];
                if (Array.isArray(prop)) {
                    if (prop.length === 2) {
                        this[prop[0]] = typeof prop[1] === FUNC_TYPE ? prop[1].call(this, matches[matchIndex]) : prop[1];
                    } else if (prop.length === 3) {
                        this[prop[0]] = matches[matchIndex] ? matches[matchIndex].replace(prop[1], prop[2]) : undefined;
                    } else if (prop.length === 4) {
                        this[prop[0]] = matches[matchIndex] ? prop[3].call(this, matches[matchIndex].replace(prop[1], prop[2])) : undefined;
                    }
                } else {
                    this[prop] = matches[matchIndex];
                }
            }
        };

        this.setUA(_ua);

        return this;
    };

    UAParser.VERSION = LIB_VERSION;
    UAParser.BROWSER = enumerize([NAME, VERSION, MAJOR]);
    UAParser.CPU = enumerize([ARCHITECTURE]);
    UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
    UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

    if (typeof exports !== UNDEF_TYPE) {
        if (typeof module !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        if (typeof define === FUNC_TYPE && define.amd) {
            define(function () {
                return UAParser;
            });
        } else if (typeof global !== UNDEF_TYPE) {
            global.UAParser = UAParser;
        }
    }

    const $ = typeof global !== UNDEF_TYPE && (global.jQuery || global.Zepto);
    if ($ && !$.ua) {
        const parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (ua) {
            parser.setUA(ua);
            const result = parser.getResult();
            for (let prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);
