// concat-map.js

module.exports = function concatMap(xs, fn) {
    // Initialize an array to collect results
    let result = [];
    
    // Iterate over elements in the provided array
    xs.forEach((item, index) => {
        // Transform the element using the provided function
        const transformed = fn(item, index);
        
        // If the transformation result is an array, concatenate it
        // Otherwise, append it to the result array
        result = result.concat(transformed);
    });

    // Return the accumulated results
    return result;
}
