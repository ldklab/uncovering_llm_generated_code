// bufferUtil.js
class BufferUtility {
    static createBuffer(input, offsetOrEncoding, length) {
        if (input == null) {
            throw new Error('Input data must be provided to create a Buffer.');
        }
        
        return Buffer.from(input, offsetOrEncoding, length);
    }
}

module.exports = BufferUtility;

// Example usage (commented out for reference):
// const BufferUtility = require('./bufferUtil');
// const resultBuffer = BufferUtility.createBuffer('sample data', 'utf8');
// console.log(resultBuffer);
