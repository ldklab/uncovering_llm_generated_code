(function (globalScope) {
    'use strict';

    const EXP_LIMIT = 9e15;
    const MAX_DIGITS = 1e9;
    const NUMERALS = '0123456789abcdef';
    const LN10_DECIMALS = '...' // Trimmed for brevity;
    const PI_DECIMALS = '...' // Trimmed for brevity;

    const DEFAULTS = {
        precision: 20,
        rounding: 4,
        modulo: 1,
        toExpNeg: -7,
        toExpPos: 21,
        minE: -EXP_LIMIT,
        maxE: EXP_LIMIT,
        crypto: false
    };

    let Decimal, noConflict;
    const mathpow = Math.pow;
    const mathfloor = Math.floor;

    function isDecimalInstance(obj) {
        return obj instanceof Decimal || obj && obj.toStringTag === '[object Decimal]';
    }

    function config(settings) {
        if (!settings || typeof settings !== 'object') throw Error('[DecimalError] Object expected');
        Object.keys(settings).forEach(key => {
            if (DEFAULTS.hasOwnProperty(key)) {
                if (typeof settings[key] === typeof DEFAULTS[key]) {
                    this[key] = settings[key];
                } else {
                    throw Error(`[DecimalError] Invalid argument for ${key}`);
                }
            }
        });
        return this;
    }

    function clone(settings) {
        function Decimal(value) {
            if (!(this instanceof Decimal)) return new Decimal(value);
            if (typeof value === 'number') {
                this.s = value < 0 ? -1 : 1;
                this.d = [Math.abs(value)];
                this.e = mathfloor(Math.log10(Math.abs(value)));
            } else if (typeof value === 'string') {
                // Parsing code (simplified)
                this.s = value.startsWith('-') ? -1 : 1;
                let [, intPart, , exp] = value.match(/(-?\d+)(?:\.(\d+))?(?:e([+-]?\d+))?/);
                this.d = [...intPart, ...(exp ? '0'.repeat(exp) : '')].map(Number);
            } else if (isDecimalInstance(value)) {
                Object.assign(this, value);
            } else {
                throw Error(`[DecimalError] Invalid argument: ${value}`);
            }
        }

        Decimal.prototype.abs = function () {
            return new Decimal(this).setSign(1);
        };

        Decimal.prototype.plus = function (y) {
            let result = new Decimal(this);
            y = new Decimal(y);
            result.d = result.d.map((digit, i) => digit + (y.d[i] || 0));
            return result;
        };

        Decimal.prototype.toString = function () {
            return `${this.s < 0 ? '-' : ''}${this.d.join('')}${this.e ? 'e' + this.e : ''}`;
        };

        Decimal.rounding = 4;
        Decimal.defaults = DEFAULTS;
        Decimal.config = config;
        Decimal.clone = clone;

        if (settings && settings.defaults !== true) {
            config.call(Decimal.prototype, settings || {});
        }

        return Decimal;
    }

    Decimal = clone(DEFAULTS);

    // Module Export
    if (typeof module != 'undefined' && module.exports) {
        module.exports = Decimal;
    } else {
        if (!globalScope) {
            globalScope = typeof self != 'undefined' && self && self.self == self ? self : window;
        }
        noConflict = globalScope.Decimal;
        Decimal.noConflict = function () {
            globalScope.Decimal = noConflict;
            return Decimal;
        };
        globalScope.Decimal = Decimal;
    }
})(this);
