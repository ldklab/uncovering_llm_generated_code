(function(global) {
    'use strict';

    const LIBVERSION = '1.0.39',
          STR_TYPE = 'string',
          FUNC_TYPE = 'function',
          UNDEF_TYPE = 'undefined',
          EMPTY = '',
          UA_MAX_LENGTH = 500;

    // Helper Functions
    const lowerize = str => str.toLowerCase();
    const majorize = version => typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined;
    
    const trim = (str, len) => {
        if (typeof(str) === STR_TYPE) {
            str = str.replace(/^\s\s*/, EMPTY);
            return typeof(len) === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
        }
    };

    const has = (str1, str2) => {
        return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
    };

    const rgxMapper = function(ua, arrays) {
        let matches;

        for (let i = 0; i < arrays.length && !matches; i += 2) {
            const regex = arrays[i], props = arrays[i + 1];

            for (let j = 0; j < regex.length && !matches; j++) {
                if (!regex[j]) break;
                matches = regex[j].exec(ua);
                if (matches) {
                    for (let k = 0, q; q = props[k]; k++) {
                        const match = matches[k + 1];
                        this[q] = match !== undefined ? match : undefined;
                    }
                }
            }
        }
    };

    const enumerize = arr => {
        return arr.reduce((acc, cur) => {
            acc[cur.toUpperCase()] = cur;
            return acc;
        }, {});
    };

    const browserRgx = [
        [/\b(?:crmo|crios)\/([\w\.]+)/i], ['version', ['name', 'Chrome']],
        [/edg(?:e|ios|a)?\/([\w\.]+)/i], ['version', ['name', 'Edge']],
        ...
    ];

    const cpuRgx = [
        [/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [['architecture', 'amd64']],
        ...
    ];

    const deviceRgx = [
        [/\((ipad);[-\w\),; ]+apple/i], ['model', ['vendor', 'Apple'], ['type', 'tablet']],
        ...
    ];

    const engineRgx = [
        [/(presto)\/([\w\.]+)/i], ['name', 'version'],
        ...
    ];

    const osRgx = [
        [/(windows nt 6\.\d); (metro)/i], [['name', 'Windows'], ['version', '8']],
        ...
    ];

    const regexes = {
        browser: browserRgx,
        cpu: cpuRgx,
        device: deviceRgx,
        engine: engineRgx,
        os: osRgx
    };

    class UAParser {
        constructor(ua, extensions) {
            if (typeof ua === 'object') {
                extensions = ua;
                ua = undefined;
            }
            if (!(this instanceof UAParser)) {
                return new UAParser(ua, extensions).getResult();
            }
            
            this.ua = ua || (global.navigator && global.navigator.userAgent) || EMPTY;
            const regexData = extensions ? { ...regexes, ...extensions } : regexes;

            this.getBrowser = () => {
                const browser = { name: undefined, version: undefined };
                rgxMapper.call(browser, this.ua, regexData.browser);
                browser.major = majorize(browser.version);
                return browser;
            };

            this.getCPU = () => {
                const cpu = { architecture: undefined };
                rgxMapper.call(cpu, this.ua, regexData.cpu);
                return cpu;
            };

            this.getDevice = () => {
                const device = { vendor: undefined, model: undefined, type: undefined };
                rgxMapper.call(device, this.ua, regexData.device);
                return device;
            };

            this.getEngine = () => {
                const engine = { name: undefined, version: undefined };
                rgxMapper.call(engine, this.ua, regexData.engine);
                return engine;
            };

            this.getOS = () => {
                const os = { name: undefined, version: undefined };
                rgxMapper.call(os, this.ua, regexData.os);
                return os;
            };

            this.getResult = () => ({
                ua: this.getUA(),
                browser: this.getBrowser(),
                cpu: this.getCPU(),
                device: this.getDevice(),
                engine: this.getEngine(),
                os: this.getOS()
            });

            this.getUA = () => this.ua;

            this.setUA = function(ua) {
                this.ua = typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH ? trim(ua, UA_MAX_LENGTH) : ua;
                return this;
            };
        }
    }

    const exportsToGlobal = () => {
        global.UAParser = UAParser;
    };

    if (typeof exports !== UNDEF_TYPE) {
        // Node.js environment
        if (typeof module !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else if (typeof define === FUNC_TYPE && define.amd) {
        // AMD environment
        define(() => UAParser);
    } else if (global) {
        // Browser environment
        exportsToGlobal();
    }

    const $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        const parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = () => parser.getUA();
        $.ua.set = (ua) => {
            parser.setUA(ua);
            Object.assign($.ua, parser.getResult());
        };
    }
})(typeof window === 'object' ? window : this);
