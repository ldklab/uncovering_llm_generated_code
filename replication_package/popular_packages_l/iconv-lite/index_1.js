const { Transform } = require('stream');

const encodingsMap = {
    'win1251': 'cp1251',
    'utf8': 'utf-8',
    'ucs2': 'utf-16le',
    'ascii': 'ascii'
};

class IconvLite {
    static decode(buffer, encoding) {
        const standardizedEncoding = encodingsMap[encoding.toLowerCase()] || encoding;
        return buffer.toString(standardizedEncoding);
    }

    static encode(string, encoding) {
        const standardizedEncoding = encodingsMap[encoding.toLowerCase()] || encoding;
        return Buffer.from(string, standardizedEncoding);
    }

    static encodingExists(encoding) {
        return encodingsMap.hasOwnProperty(encoding.toLowerCase());
    }

    static decodeStream(encoding) {
        const standardizedEncoding = encodingsMap[encoding.toLowerCase()] || encoding;
        return new Transform({
            transform(chunk, _, callback) {
                this.push(chunk.toString(standardizedEncoding));
                callback();
            }
        });
    }

    static encodeStream(encoding) {
        const standardizedEncoding = encodingsMap[encoding.toLowerCase()] || encoding;
        return new Transform({
            transform(chunk, _, callback) {
                const strChunk = chunk.toString();
                this.push(Buffer.from(strChunk, standardizedEncoding));
                callback();
            }
        });
    }
}

module.exports = IconvLite;
