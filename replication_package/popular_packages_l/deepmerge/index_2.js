function merge(x, y, options = {}) {
    const {
        arrayMerge = defaultArrayMerge,
        isMergeableObject = defaultIsMergeableObject,
        customMerge
    } = options;

    if (!isMergeableObject(x) || !isMergeableObject(y)) {
        return cloneUnlessOtherwiseSpecified(y, { clone: true });
    }

    const mergedObject = { ...cloneObject(x) };

    for (const key in y) {
        if (customMerge && customMerge(key)) {
            mergedObject[key] = customMerge(key)(x[key], y[key]);
        } else if (isMergeableObject(y[key])) {
            mergedObject[key] = merge(x[key], y[key], options);
        } else {
            mergedObject[key] = cloneUnlessOtherwiseSpecified(y[key], { clone: true });
        }
    }

    return mergedObject;
}

function mergeAll(arrayOfObjects, options) {
    if (!Array.isArray(arrayOfObjects)) {
        throw new Error('merge.all expects an array');
    }
    return arrayOfObjects.reduce((accumulator, currentObject) => merge(accumulator, currentObject, options), {});
}

function defaultArrayMerge(targetArray, sourceArray) {
    return [...targetArray, ...sourceArray];
}

function defaultIsMergeableObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone ? deepClone(value) : value;
}

function deepClone(value) {
    if (Array.isArray(value)) {
        return value.map(deepClone);
    }
    if (value && typeof value === 'object') {
        return merge({}, value);
    }
    return value;
}

function cloneObject(object) {
    return Object.entries(object).reduce((clone, [key, value]) => {
        clone[key] = cloneUnlessOtherwiseSpecified(value, { clone: true });
        return clone;
    }, {});
}

module.exports = {
    merge,
    mergeAll,
};
