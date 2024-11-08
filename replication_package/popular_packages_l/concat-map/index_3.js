// concat-map.js

module.exports = function concatMap(xs, fn) {
    // Initialize an empty array to store the results
    let result = [];
    
    // Iterate over the input array
    xs.forEach((element, index) => {
        // Apply the function to each element
        let res = fn(element, index);
        
        // If the result is an array, use spread syntax to concatenate
        if (Array.isArray(res)) {
            result = [...result, ...res];
        } else {
            // Otherwise, push the result directly
            result.push(res);
        }
    });
    
    // Return the accumulated results
    return result;
}
