function merge(x, y, options = {}) {
    const { arrayMerge = defaultArrayMerge, isMergeableObject = defaultIsMergeableObject, customMerge } = options;
    
    if (!isMergeableObject(x) || !isMergeableObject(y)) {
        return cloneUnlessOtherwiseSpecified(y, true);
    }
    
    const target = { ...cloneUnlessOtherwiseSpecified(x, true) };
    
    for (const key in y) {
        const cMergeFn = customMerge && customMerge(key);
        target[key] = cMergeFn
            ? cMergeFn(x[key], y[key])
            : isMergeableObject(y[key]) 
                ? merge(x[key], y[key], options)
                : cloneUnlessOtherwiseSpecified(y[key], true);
    }
    
    return target;
}

function mergeAll(arrayOfObjects, options) {
    if (!Array.isArray(arrayOfObjects)) {
        throw new Error('mergeAll expects an array');
    }
    return arrayOfObjects.reduce((acc, obj) => merge(acc, obj, options), {});
}

function defaultArrayMerge(target, source) {
    return target.concat(source);
}

function defaultIsMergeableObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function cloneUnlessOtherwiseSpecified(value, clone) {
    return clone ? deepClone(value) : value;
}

function deepClone(value) {
    if (Array.isArray(value)) {
        return value.map(deepClone);
    } else if (typeof value === 'object' && value !== null) {
        return merge({}, value);
    } else {
        return value;
    }
}

module.exports = {
    merge,
    mergeAll,
};
