// index.js
class UtilBufferFrom {
    static from(data, encodingOrOffset, length) {
        // Basic validation or logging can be added here
        if (typeof data === 'undefined' || data === null) {
            throw new Error('Data is required to create a Buffer.');
        }

        // Call Node.js's Buffer.from method
        return Buffer.from(data, encodingOrOffset, length);
    }
}

module.exports = UtilBufferFrom;

// Example code to use the package (for illustration purposes only):
// const UtilBufferFrom = require('./index');
// const buffer = UtilBufferFrom.from('example data', 'utf8');
// console.log(buffer);
