// concat-map.js

module.exports = function concatMap(array, transformFn) {
    // Initialize an empty array to accumulate transformed elements
    let accumulatedArray = [];

    // Apply the transformation to each element in the given array
    for (let index = 0; index < array.length; index++) {
        // Result from applying the transform function
        let transformedItem = transformFn(array[index], index);

        // If the transformed item is an array, concatenate it
        // Otherwise, add the item directly to the accumulated array
        accumulatedArray = Array.isArray(transformedItem) 
            ? accumulatedArray.concat(transformedItem) 
            : accumulatedArray.concat([transformedItem]);
    }
    
    // Return the accumulated array which aggregates all results
    return accumulatedArray;
}
