// index.js
class BufferUtility {
    static createBuffer(data, encodingOrOffset, length) {
        // Ensure the data is valid for buffer creation
        if (!data && typeof data !== 'number') {
            throw new Error('Data must be provided to create a Buffer.');
        }

        // Utilize Node.js's Buffer.from method
        return Buffer.from(data, encodingOrOffset, length);
    }
}

module.exports = BufferUtility;

// Example usage (commented for illustration purposes):
// const BufferUtility = require('./index');
// const buffer = BufferUtility.createBuffer('example data', 'utf8');
// console.log(buffer);
