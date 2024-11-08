module.exports = function (array, transform) {
    let results = [];
    for (let index = 0; index < array.length; index++) {
        let transformed = transform(array[index], index);
        if (Array.isArray(transformed)) {
            results.push(...transformed);
        } else {
            results.push(transformed);
        }
    }
    return results;
};
