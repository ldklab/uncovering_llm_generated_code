function merge(x, y, { arrayMerge = defaultArrayMerge, isMergeableObject = defaultIsMergeableObject, customMerge } = {}) {
    if (!isMergeableObject(x) || !isMergeableObject(y)) {
        return cloneUnlessOtherwiseSpecified(y, { clone: true });
    }
    
    const target = {};
    for (const key in x) {
        target[key] = cloneUnlessOtherwiseSpecified(x[key], { clone: true });
    }
    
    for (const key in y) {
        if (customMerge && customMerge(key)) {
            target[key] = customMerge(key)(x[key], y[key]);
        } else if (isMergeableObject(y[key])) {
            target[key] = merge(x[key], y[key], { arrayMerge, isMergeableObject, customMerge });
        } else {
            target[key] = cloneUnlessOtherwiseSpecified(y[key], { clone: true });
        }
    }
    
    return target;
}

function mergeAll(arrayOfObjects, options) {
    if (!Array.isArray(arrayOfObjects)) {
        throw new Error('merge.all expects an array');
    }
    
    return arrayOfObjects.reduce((prev, obj) => merge(prev, obj, options), {});
}

function defaultArrayMerge(target, source) {
    return target.concat(source);
}

function defaultIsMergeableObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone ? deepClone(value) : value;
}

function deepClone(value) {
    if (Array.isArray(value)) {
        return value.map(item => deepClone(item));
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
