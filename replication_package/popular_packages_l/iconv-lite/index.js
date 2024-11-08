const iconvLite = (() => {
    const encodings = {
        'win1251': 'cp1251',
        'utf8': 'utf-8',
        'ucs2': 'utf-16le',
        'ascii': 'ascii'
    };
    
    class IconvLite {
        static decode(buffer, encoding) {
            encoding = encodings[encoding.toLowerCase()] || encoding;
            return buffer.toString(encoding);
        }

        static encode(string, encoding) {
            encoding = encodings[encoding.toLowerCase()] || encoding;
            return Buffer.from(string, encoding);
        }

        static encodingExists(encoding) {
            return Object.keys(encodings).includes(encoding.toLowerCase());
        }

        static decodeStream(encoding) {
            encoding = encodings[encoding.toLowerCase()] || encoding;
            const stream = new (require('stream').Transform)();
            stream._transform = (chunk, encoding, done) => {
                stream.push(chunk.toString(encoding));
                done();
            };
            return stream;
        }

        static encodeStream(encoding) {
            encoding = encodings[encoding.toLowerCase()] || encoding;
            const stream = new (require('stream').Transform)();
            stream._transform = (chunk, encoding, done) => {
                stream.push(Buffer.from(chunk.toString(), encoding));
                done();
            };
            return stream;
        }
    }

    return IconvLite;
})();

module.exports = iconvLite;
