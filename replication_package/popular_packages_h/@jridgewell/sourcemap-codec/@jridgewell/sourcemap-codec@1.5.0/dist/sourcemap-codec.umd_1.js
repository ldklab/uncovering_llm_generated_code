(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((root.sourcemapCodec = {}));
    }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (exports) {
    'use strict';

    const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const charToInteger = new Uint8Array(128);
    const integerToChar = new Uint8Array(64);

    for (let i = 0; i < BASE64_CHARS.length; i++) {
        const charCode = BASE64_CHARS.charCodeAt(i);
        integerToChar[i] = charCode;
        charToInteger[charCode] = i;
    }

    function decodeVLQ(reader) {
        let result = 0, shift = 0, byte;
        do {
            byte = charToInteger[reader.next()];
            result |= (byte & 31) << shift;
            shift += 5;
        } while (byte & 32);
        return (result & 1 ? ~(result >>> 1) : (result >>> 1));
    }

    function encodeVLQ(writer, value) {
        let num = value < 0 ? ((-value << 1) | 1) : (value << 1);
        do {
            let clamped = num & 31;
            num >>= 5;
            if (num) clamped |= 32;
            writer.write(integerToChar[clamped]);
        } while (num);
    }

    const TextDecoderImpl = typeof TextDecoder !== 'undefined'
        ? new TextDecoder()
        : {
            decode(buf) {
                return String.fromCharCode(...buf);
            }
        };

    class Writer {
        constructor() {
            this.buffer = [];
        }
        write(charCode) {
            this.buffer.push(charCode);
        }
        toString() {
            return TextDecoderImpl.decode(Uint8Array.from(this.buffer));
        }
    }

    class Reader {
        constructor(input) {
            this.input = input;
            this.position = 0;
        }
        next() {
            return this.input.charCodeAt(this.position++);
        }
        peek() {
            return this.input.charCodeAt(this.position);
        }
    }

    function decodeMappings(mappings) {
        const reader = new Reader(mappings);
        const result = [];
        let generatedLine = 0, sourceIndex = 0, sourceLine = 0, sourceColumn = 0, nameIndex = 0;
        let generatedColumn;

        while (reader.position < mappings.length) {
            let segment = [];
            generatedColumn = decodeVLQ(reader);
            segment.push(generatedColumn);

            if (mappings.charCodeAt(reader.position) !== 59) { // ';'
                sourceIndex = decodeVLQ(reader) + sourceIndex;
                sourceLine = decodeVLQ(reader) + sourceLine;
                sourceColumn = decodeVLQ(reader) + sourceColumn;
                segment.push(sourceIndex, sourceLine, sourceColumn);

                if (mappings.charCodeAt(reader.position) !== 59) { // ';'
                    nameIndex = decodeVLQ(reader) + nameIndex;
                    segment.push(nameIndex);
                }
            }
            result.push(segment);
            while (reader.position < mappings.length && mappings.charCodeAt(reader.position) !== 44) { // ','
                reader.position++;
            }
            if (reader.position < mappings.length && mappings.charCodeAt(reader.position) === 44) {
                reader.position++;
            }
        }
        return result;
    }

    function encodeMappings(decoded) {
        const writer = new Writer();
        let generatedColumn = 0, sourceIndex = 0, sourceLine = 0, sourceColumn = 0, nameIndex = 0;

        decoded.forEach(line => {
            let previousColumn = 0;
            line.forEach(segment => {
                if (segment[0] !== previousColumn) {
                    encodeVLQ(writer, segment[0] - previousColumn);
                    previousColumn = segment[0];
                }

                if (segment.length > 1) {
                    encodeVLQ(writer, segment[1] - sourceIndex);
                    encodeVLQ(writer, segment[2] - sourceLine);
                    encodeVLQ(writer, segment[3] - sourceColumn);

                    sourceIndex = segment[1];
                    sourceLine = segment[2];
                    sourceColumn = segment[3];

                    if (segment.length > 4) {
                        encodeVLQ(writer, segment[4] - nameIndex);
                        nameIndex = segment[4];
                    }
                }
                writer.write(44); // ','
            });
            writer.write(59); // ';'
        });

        return writer.toString();
    }

    exports.decodeMappings = decodeMappings;
    exports.encodeMappings = encodeMappings;
});
