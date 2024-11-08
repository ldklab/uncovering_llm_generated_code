'use strict';

const isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

module.exports = (xs, fn) => {
    const res = [];
    xs.forEach((item, i) => {
        const x = fn(item, i);
        if (isArray(x)) {
            res.push(...x);
        } else {
            res.push(x);
        }
    });
    return res;
};
