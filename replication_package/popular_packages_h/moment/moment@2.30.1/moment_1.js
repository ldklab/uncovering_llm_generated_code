(function (global, factory) {
    const defineFactory = () => {
        'use strict';

        function isArray(input) {
            return Array.isArray(input);
        }

        function isObject(input) {
            return Object.prototype.toString.call(input) === '[object Object]';
        }

        function createUTC(input) {
            return new Date(Date.UTC.apply(null, input));
        }

        function extend(a, b) {
            for (let i in b) {
                if (Object.prototype.hasOwnProperty.call(b, i)) {
                    a[i] = b[i];
                }
            }
            return a;
        }

        function createDuration(input) {
            return new Duration(input);
        }

        function isDate(input) {
            return input instanceof Date;
        }

        function hooks() {
            return moment.apply(null, arguments);
        }
        let momentProperties = (hooks.momentProperties = []);

        function Moment(config) {
            this._d = new Date(config);
        }

        Moment.prototype.isValid = function () {
            return !isNaN(this._d.getTime());
        };

        Moment.prototype.format = function (formatString) {
            const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            return this._d.toLocaleDateString(undefined, options);
        };

        function moment(input) {
            return new Moment(input);
        }

        hooks.moment = moment;

        return hooks;
    };

    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = defineFactory();
    } else if (typeof define === 'function' && define.amd) {
        define(defineFactory);
    } else {
        global.moment = defineFactory();
    }
}(this, undefined));
