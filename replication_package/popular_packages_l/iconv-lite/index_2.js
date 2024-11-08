const { Transform } = require('stream');

const encodings = {
    'win1251': 'cp1251',
    'utf8': 'utf-8',
    'ucs2': 'utf-16le',
    'ascii': 'ascii'
};

class IconvLite {
    static decode(buffer, encoding) {
        const normalizedEncoding = encodings[encoding.toLowerCase()] || encoding;
        return buffer.toString(normalizedEncoding);
    }

    static encode(string, encoding) {
        const normalizedEncoding = encodings[encoding.toLowerCase()] || encoding;
        return Buffer.from(string, normalizedEncoding);
    }

    static encodingExists(encoding) {
        return encodings.hasOwnProperty(encoding.toLowerCase());
    }

    static decodeStream(encoding) {
        const normalizedEncoding = encodings[encoding.toLowerCase()] || encoding;
        return new Transform({
            transform(chunk, enc, callback) {
                this.push(chunk.toString(normalizedEncoding));
                callback();
            }
        });
    }

    static encodeStream(encoding) {
        const normalizedEncoding = encodings[encoding.toLowerCase()] || encoding;
        return new Transform({
            transform(chunk, enc, callback) {
                this.push(Buffer.from(chunk.toString(), normalizedEncoding));
                callback();
            }
        });
    }
}

module.exports = IconvLite;
