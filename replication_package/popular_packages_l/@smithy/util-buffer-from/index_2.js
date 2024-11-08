// bufferUtil.js
class BufferUtil {
    static createBuffer(data, encodingOrOffset, length) {
        if (data == null) { // Checks for both undefined and null
            throw new Error('Data must be provided to create a Buffer.');
        }
        return Buffer.from(data, encodingOrOffset, length);
    }
}

module.exports = BufferUtil;

// Usage example (for illustration):
// const BufferUtil = require('./bufferUtil');
// const buffer = BufferUtil.createBuffer('sample data', 'utf8');
// console.log(buffer);
