// File: extend.js

function isPlainObject(obj) {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

function extend() {
    let target = arguments[0] || {};
    let i = 1;
    const isDeep = typeof target === 'boolean' ? target : false;

    if (isDeep) {
        target = arguments[1] || {};
        i = 2;
    }

    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
    }

    for (; i < arguments.length; i++) {
        const options = arguments[i];
        if (options != null) {
            for (const key in options) {
                const src = target[key];
                const copy = options[key];

                if (target === copy) continue;

                if (isDeep && copy && (isPlainObject(copy) || Array.isArray(copy))) {
                    const clone = Array.isArray(copy)
                        ? (Array.isArray(src) ? src : [])
                        : (isPlainObject(src) ? src : {});
                    target[key] = extend(isDeep, clone, copy);
                } else if (copy !== undefined) {
                    target[key] = copy;
                }
            }
        }
    }

    return target;
}

module.exports = extend;
