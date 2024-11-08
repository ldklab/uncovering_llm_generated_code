function merge(x, y, options = {}) {
    const {
        arrayMerge = defaultArrayMerge,
        isMergeableObject = defaultIsMergeableObject,
        customMerge,
    } = options;

    if (!isMergeableObject(x) || !isMergeableObject(y)) {
        return cloneUnlessOtherwiseSpecified(y, { clone: true });
    }
    
    const target = { ...cloneDeep(x) };

    for (const key of Object.keys(y)) {
        if (customMerge && customMerge(key)) {
            target[key] = customMerge(key)(x[key], y[key]);
        } else if (isMergeableObject(y[key])) {
            target[key] = merge(x[key], y[key], options);
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
    return options.clone ? cloneDeep(value) : value;
}

function cloneDeep(value) {
    if (Array.isArray(value)) {
        return value.map(item => cloneDeep(item));
    } else if (value && typeof value === 'object') {
        return Object.keys(value).reduce((result, key) => {
            result[key] = cloneDeep(value[key]);
            return result;
        }, {});
    }
    return value;
}

module.exports = {
    merge,
    mergeAll,
};
