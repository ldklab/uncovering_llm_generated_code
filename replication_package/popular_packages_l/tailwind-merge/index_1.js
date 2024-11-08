// index.js
function twMerge(...classStrings) {
    // Flatten all input class strings into a single array
    const classes = classStrings.flatMap(str => str.split(' '));
    const classMap = {};

    // Iterate over each class
    for (let cls of classes) {
        // Check for a modifier like `hover:` and split the class
        const [modifier, className] = cls.includes(':') 
            ? cls.split(':')
            : [null, cls];
        
        // Create a unique key combining modifier and class name
        const key = modifier ? `${modifier}:${className}` : className;
        
        // Store into map, overwriting to maintain specificity
        classMap[key] = cls;
    }
    
    // Convert the map values into a single space-separated string
    return Object.values(classMap).join(' ');
}

module.exports = { twMerge };

// Usage Example
if (require.main === module) {
    const result = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
    console.log(result); // Output: "hover:bg-dark-red p-3 bg-[#B91C1C]"
}
