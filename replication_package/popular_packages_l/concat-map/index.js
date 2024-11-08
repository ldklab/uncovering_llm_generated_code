markdown
// concat-map.js

module.exports = function concatMap(xs, fn) {
    // Initialize an empty array to hold concatenated results
    var result = [];
    
    // Iterate over each element in the input array
    for (var i = 0; i < xs.length; i++) {
        // Get the transformed value for the current element
        var res = fn(xs[i], i);
        
        // Check if the result is an array
        if (Array.isArray(res)) {
            // Concatenate the result if it's an array
            result = result.concat(res);
        } else {
            // Push the result if it's not an array
            result.push(res);
        }
    }
    
    // Return the final concatenated array
    return result;
}
