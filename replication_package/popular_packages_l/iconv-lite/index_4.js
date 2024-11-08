const { Transform } = require('stream');

class IconvLite {
    static ENCODINGS = {
        'win1251': 'cp1251',
        'utf8': 'utf-8',
        'ucs2': 'utf-16le',
        'ascii': 'ascii'
    };

    static decode(buffer, encoding) {
        const normalizedEncoding = IconvLite.ENCODINGS[encoding.toLowerCase()] || encoding;
        return buffer.toString(normalizedEncoding);
    }

    static encode(string, encoding) {
        const normalizedEncoding = IconvLite.ENCODINGS[encoding.toLowerCase()] || encoding;
        return Buffer.from(string, normalizedEncoding);
    }

    static encodingExists(encoding) {
        return !!IconvLite.ENCODINGS[encoding.toLowerCase()];
    }

    static decodeStream(encoding) {
        const normalizedEncoding = IconvLite.ENCODINGS[encoding.toLowerCase()] || encoding;
        return new Transform({
            transform(chunk, _, callback) {
                this.push(chunk.toString(normalizedEncoding));
                callback();
            }
        });
    }

    static encodeStream(encoding) {
        const normalizedEncoding = IconvLite.ENCODINGS[encoding.toLowerCase()] || encoding;
        return new Transform({
            transform(chunk, _, callback) {
                this.push(Buffer.from(chunk.toString(), normalizedEncoding));
                callback();
            }
        });
    }
}

module.exports = (() => IconvLite)();
