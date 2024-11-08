; (function (global, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.moment = factory();
    }
}(this, function () {
    'use strict';

    let currentMoment;

    const utils = {
        isArray: input => Array.isArray(input),
        isObject: input => input != null && typeof input === 'object' && !Array.isArray(input),
        isNumber: input => typeof input === 'number',
        hasOwnProp: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
    };

    function moment(input) {
        if (!(this instanceof moment)) {
            return new moment(input);
        }
        this._d = new Date(input || Date.now());
        this.isValid();
    }

    moment.prototype.isValid = function () {
        return !isNaN(this._d.getTime());
    };

    moment.prototype.add = function (amount, unit) {
        if (!this.isValid()) return this;
        const value = utils.isNumber(amount) ? amount : 0;
        switch (unit) {
            case 'days':
                this._d.setDate(this._d.getDate() + value);
                break;
            case 'months':
                this._d.setMonth(this._d.getMonth() + value);
                break;
            case 'years':
                this._d.setFullYear(this._d.getFullYear() + value);
                break;
        }
        return this;
    };

    moment.prototype.subtract = function (amount, unit) {
        return this.add(-amount, unit);
    };

    moment.prototype.format = function (formatStr = 'YYYY-MM-DD') {
        if (!this.isValid()) return 'Invalid date';
        const year = this._d.getFullYear();
        const month = String(this._d.getMonth() + 1).padStart(2, '0');
        const day = String(this._d.getDate()).padStart(2, '0');
        return formatStr.replace('YYYY', year).replace('MM', month).replace('DD', day);
    };

    moment.prototype.toDate = function () {
        return new Date(this._d);
    };

    moment.locale = 'en';

    // Expose the factory function
    return moment;
}));
