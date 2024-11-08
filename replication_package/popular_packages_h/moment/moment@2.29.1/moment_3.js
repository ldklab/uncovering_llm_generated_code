(function (global, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.moment = factory();
    }
}(this, (function () {
    'use strict';

    // Core functions and variables
    var hookCallback;
    function hooks() { return hookCallback.apply(null, arguments); }
    function setHookCallback(callback) { hookCallback = callback; }

    var momentProperties = (hooks.momentProperties = []);

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = { _isAMomentObject: true, _isUTC: isUTC, _l: locale, _i: input, _f: format, _strict: strict };
        return createFromConfig(c);
    }

    function createFromConfig(config) {
        return new Moment(checkOverflow(prepareConfig(config)));
    }

    function Moment(config) { copyConfig(this, config); this._d = new Date(config._d != null ? config._d.getTime() : NaN); }
    
    function copyConfig(to, from) {
        var i, prop, val;
        for (i in from) {
            if (!isUndefined(from[i])) {
                to[i] = from[i];
            }
        }
        return to;
    }

    // Other utilities
    function isUndefined(input) { return input === void 0; }
    function hasOwnProp(a, b) { return Object.prototype.hasOwnProperty.call(a, b); }
    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) a[i] = b[i];
        }
        return a;
    }

    function prepareConfig(config) {
        var input = config._i, format = config._f;
        if (input === null || (format === undefined && input === '')) return createInvalid({ nullInput: true });
        config._a = [];
        getParsingFlags(config).empty = true;

        var string = '' + config._i, tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [], token, parsedInput;
        for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }
        
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
        configFromArray(config);
        checkOverflow(config);
    }

    hooks.fn = Moment.prototype;
    hooks.createFromInputFallback = createFallback; 
    hooks.defineLocale = defineLocale;

    function defineLocale(name, config) {
        if (config !== null) {
            locales[name] = new Locale(mergeConfigs(parentConfig, config));
            getSetGlobalLocale(name);
            return locales[name];
        } else {
            delete locales[name];
            return null;
        }
    }

    return hooks;
})));
