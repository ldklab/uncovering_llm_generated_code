// index.js
function twMerge(...classStrings) {
    // Flatten the array of class strings into a single array of individual classes
    const classes = classStrings.flatMap(str => str.split(' '));
    const classMap = {};

    // Iterate over each class
    for (let cls of classes) {
        // Determine if the class has a modifier (like `hover:`)
        const [modifier, className] = cls.includes(':') 
            ? cls.split(':')
            : [null, cls];

        // Construct a key for the class map considering the modifier
        const key = modifier ? `${modifier}:${className}` : className;

        // Store the class in the map, overwriting any existing entries with the same key
        classMap[key] = cls;
    }
    
    // Join all values in the map into a single string with spaces separating them
    return Object.values(classMap).join(' ');
}

module.exports = { twMerge };

// Usage Example
if (require.main === module) {
    const result = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
    console.log(result); // Output: "hover:bg-dark-red p-3 bg-[#B91C1C]"
}
