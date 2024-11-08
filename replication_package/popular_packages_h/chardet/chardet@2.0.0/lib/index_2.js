"use strict";

// Import necessary modules from ./fs/node and ./encoding directories
const nodeFs = require("./fs/node").default;
const ASCII = require("./encoding/ascii").default;
const UTF8 = require("./encoding/utf8").default;
const unicode = require("./encoding/unicode");
const mbcs = require("./encoding/mbcs");
const sbcs = require("./encoding/sbcs");
const iso2022 = require("./encoding/iso2022");
const { isByteArray } = require("./utils");

// Initialize encoding recognizers
const recognisers = [
    new UTF8(),
    new unicode.UTF_16BE(),
    new unicode.UTF_16LE(),
    new unicode.UTF_32BE(),
    new unicode.UTF_32LE(),
    new mbcs.sjis(),
    new mbcs.big5(),
    new mbcs.euc_jp(),
    new mbcs.euc_kr(),
    new mbcs.gb_18030(),
    new iso2022.ISO_2022_JP(),
    new iso2022.ISO_2022_KR(),
    new iso2022.ISO_2022_CN(),
    new sbcs.ISO_8859_1(),
    new sbcs.ISO_8859_2(),
    new sbcs.ISO_8859_5(),
    new sbcs.ISO_8859_6(),
    new sbcs.ISO_8859_7(),
    new sbcs.ISO_8859_8(),
    new sbcs.ISO_8859_9(),
    new sbcs.windows_1251(),
    new sbcs.windows_1256(),
    new sbcs.KOI8_R(),
    new ASCII(),
];

// Analyse the buffer to detect encoding
const analyse = (buffer) => {
    if (!isByteArray(buffer)) {
        throw new Error('Input must be a byte array, e.g. Buffer or Uint8Array');
    }

    const byteStats = Array(256).fill(0);
    for (const byte of buffer) {
        byteStats[byte & 0xFF]++;
    }

    const c1Bytes = byteStats.slice(0x80, 0xA0).some(count => count > 0);
    const context = {
        byteStats,
        c1Bytes,
        rawInput: buffer,
        rawLen: buffer.length,
        inputBytes: buffer,
        inputLen: buffer.length,
    };

    return recognisers.map(rec => rec.match(context))
                      .filter(Boolean)
                      .sort((a, b) => b.confidence - a.confidence);
};

// Detect encoding from a buffer
const detect = (buffer) => {
    const matches = analyse(buffer);
    return matches.length > 0 ? matches[0].name : null;
};

// Asynchronously detect a file's encoding
const detectFile = (filepath, opts = {}) => new Promise((resolve, reject) => {
    const fs = nodeFs();
    const readFileCallback = (err, buffer) => {
        if (err) reject(err);
        else resolve(detect(buffer));
    };

    if (opts.sampleSize) {
        const fd = fs.openSync(filepath, 'r');
        const sample = Buffer.allocUnsafe(opts.sampleSize);
        fs.read(fd, sample, 0, opts.sampleSize, opts.offset, (err) => {
            fs.closeSync(fd);
            readFileCallback(err, sample);
        });
    } else {
        fs.readFile(filepath, readFileCallback);
    }
});

// Synchronously detect a file's encoding
const detectFileSync = (filepath, opts = {}) => {
    const fs = nodeFs();
    if (opts.sampleSize) {
        const fd = fs.openSync(filepath, 'r');
        const sample = Buffer.allocUnsafe(opts.sampleSize);
        fs.readSync(fd, sample, 0, opts.sampleSize, opts.offset);
        fs.closeSync(fd);
        return detect(sample);
    }
    return detect(fs.readFileSync(filepath));
};

// Export functions
module.exports = {
    analyse,
    detect,
    detectFile,
    detectFileSync,
};
