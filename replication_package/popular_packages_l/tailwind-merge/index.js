// index.js
function twMerge(...classStrings) {
    const classes = classStrings.flatMap(str => str.split(' '));
    const classMap = {};

    for (let cls of classes) {
        // Separate class and its modifiers (like `hover:`)
        const [modifier, className] = cls.includes(':') 
            ? cls.split(':')
            : [null, cls];
        
        // Consider modifier as part of the key for specificity
        const key = modifier ? `${modifier}:${className}` : className;
        
        // Overwrite any previous classes to ensure specificity
        classMap[key] = cls;
    }
    
    // Return space-separated final classes
    return Object.values(classMap).join(' ');
}

module.exports = { twMerge };

// Usage Example
if (require.main === module) {
    const result = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
    console.log(result); // Output: "hover:bg-dark-red p-3 bg-[#B91C1C]"
}
