const { Transform } = require('stream');

const encodingMap = {
    'win1251': 'cp1251',
    'utf8': 'utf-8',
    'ucs2': 'utf-16le',
    'ascii': 'ascii'
};

class IconvLite {
    static decode(buffer, encoding) {
        const normalized = encodingMap[encoding.toLowerCase()] || encoding;
        return buffer.toString(normalized);
    }

    static encode(string, encoding) {
        const normalized = encodingMap[encoding.toLowerCase()] || encoding;
        return Buffer.from(string, normalized);
    }

    static encodingExists(encoding) {
        return encoding.toLowerCase() in encodingMap;
    }

    static decodeStream(encoding) {
        const normalized = encodingMap[encoding.toLowerCase()] || encoding;
        const decodeStream = new Transform({
            transform(chunk, enc, callback) {
                callback(null, chunk.toString(normalized));
            }
        });
        return decodeStream;
    }

    static encodeStream(encoding) {
        const normalized = encodingMap[encoding.toLowerCase()] || encoding;
        const encodeStream = new Transform({
            transform(chunk, enc, callback) {
                callback(null, Buffer.from(chunk.toString(), normalized));
            }
        });
        return encodeStream;
    }
}

module.exports = IconvLite;
