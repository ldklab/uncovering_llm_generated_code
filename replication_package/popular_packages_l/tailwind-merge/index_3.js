// index.js
function twMerge(...classStrings) {
    // Flatten the input class strings and split them into individual classes
    const classes = classStrings.flatMap(str => str.split(' '));
    const classMap = {};

    // Iterate over each class
    for (let cls of classes) {
        // If the class has a modifier (like `hover:`), separate it from the class name
        const [modifier, className] = cls.includes(':') 
            ? cls.split(':')
            : [null, cls];
        
        // Create a key using the modifier and class name to keep specificity
        const key = modifier ? `${modifier}:${className}` : className;
        
        // Store the class in the map, overwriting any previous entry with the same key for specificity
        classMap[key] = cls;
    }
    
    // Join the final classes stored in the map into a single space-separated string
    return Object.values(classMap).join(' ');
}

// Export the function as a module
module.exports = { twMerge };

// Usage Example
if (require.main === module) {
    // Execute an example merging of classes and display the result
    const result = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
    console.log(result); // Expected output: "hover:bg-dark-red p-3 bg-[#B91C1C]"
}
