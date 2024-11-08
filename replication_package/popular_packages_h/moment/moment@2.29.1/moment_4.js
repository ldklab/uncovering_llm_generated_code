//! Simplified version of moment.js
//! Provides basic date manipulation functions

(function (global, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.moment = factory();
    }
}(this, function () {
    'use strict';

    // Basic internal utility function
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    
    // Basic date manipulation function
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    // Basic date formatting function
    function formatDate(date, format) {
        const map = {
            YYYY: date.getFullYear(),
            MM: ('0' + (date.getMonth() + 1)).slice(-2),
            DD: ('0' + date.getDate()).slice(-2),
            HH: ('0' + date.getHours()).slice(-2),
            mm: ('0' + date.getMinutes()).slice(-2),
            ss: ('0' + date.getSeconds()).slice(-2),
        };

        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match]);
    }

    // Factory to create a moment-like date object
    function createMoment(config) {
        const date = config ? new Date(config) : new Date();

        return {
            add: function (number, unit) {
                if (unit === 'd') {
                    return createMoment(addDays(date, number));
                }
                // Additional unit handling can be added here
                return this;
            },
            format: function (format) {
                return formatDate(date, format);
            },
            isLeapYear: function () {
                return isLeapYear(date.getFullYear());
            },
        };
    }

    // Main export for the library
    return {
        now: function () { return new Date(); },
        isLeapYear: isLeapYear,
        createMoment: createMoment,
    };

}));
