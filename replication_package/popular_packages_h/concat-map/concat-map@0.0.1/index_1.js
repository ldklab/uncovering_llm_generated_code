module.exports = function (items, transform) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
        const result = transform(items[i], i);
        if (Array.isArray(result)) {
            results.push(...result);
        } else {
            results.push(result);
        }
    }
    return results;
};
