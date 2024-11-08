// concat-map.js

module.exports = function concatMap(xs, fn) {
    // Utilize reduce to initialize result and iterate over each element
    return xs.reduce((result, currentValue, index) => {
        // Apply the transformation function to each element
        const res = fn(currentValue, index);
        
        // Concatenate the result if it's an array, otherwise push it
        return Array.isArray(res) ? result.concat(res) : result.concat([res]);
    }, []); // Initialize with an empty array
}
