// index.js
class BufferUtility {
    static createBuffer(data, encodingOrOffset, length) {
        if (data === undefined || data === null) {
            throw new Error('Data is required to create a Buffer.');
        }

        return Buffer.from(data, encodingOrOffset, length);
    }
}

module.exports = BufferUtility;

// Example code to use the package (for illustration purposes only):
// const BufferUtility = require('./index');
// const buffer = BufferUtility.createBuffer('example data', 'utf8');
// console.log(buffer);
