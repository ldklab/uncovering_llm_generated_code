// index.js
function twMerge(...classStrings) {
    const classes = classStrings.flatMap(str => str.split(' '));
    const classMap = {};

    classes.forEach(cls => {
        const [modifier, className] = cls.includes(':') 
            ? cls.split(':') 
            : [null, cls];

        const key = modifier ? `${modifier}:${className}` : className;
        classMap[key] = cls;
    });

    return Object.values(classMap).join(' ');
}

module.exports = { twMerge };

// Usage Example
if (require.main === module) {
    const result = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
    console.log(result); // Output: "hover:bg-dark-red p-3 bg-[#B91C1C]"
}
