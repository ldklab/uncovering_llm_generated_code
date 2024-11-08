"use strict";

const fsNode = require("./fs/node").default;
const AsciiEncoding = require("./encoding/ascii").default;
const Utf8Encoding = require("./encoding/utf8").default;
const UnicodeEncodings = require("./encoding/unicode");
const MbcsEncodings = require("./encoding/mbcs");
const SbcsEncodings = require("./encoding/sbcs");
const Iso2022Encodings = require("./encoding/iso2022");
const utils = require("./utils");

const recognisers = [
    new Utf8Encoding(),
    new UnicodeEncodings.UTF_16BE(),
    new UnicodeEncodings.UTF_16LE(),
    new UnicodeEncodings.UTF_32BE(),
    new UnicodeEncodings.UTF_32LE(),
    new MbcsEncodings.sjis(),
    new MbcsEncodings.big5(),
    new MbcsEncodings.euc_jp(),
    new MbcsEncodings.euc_kr(),
    new MbcsEncodings.gb_18030(),
    new Iso2022Encodings.ISO_2022_JP(),
    new Iso2022Encodings.ISO_2022_KR(),
    new Iso2022Encodings.ISO_2022_CN(),
    new SbcsEncodings.ISO_8859_1(),
    new SbcsEncodings.ISO_8859_2(),
    new SbcsEncodings.ISO_8859_5(),
    new SbcsEncodings.ISO_8859_6(),
    new SbcsEncodings.ISO_8859_7(),
    new SbcsEncodings.ISO_8859_8(),
    new SbcsEncodings.ISO_8859_9(),
    new SbcsEncodings.windows_1251(),
    new SbcsEncodings.windows_1256(),
    new SbcsEncodings.KOI8_R(),
    new AsciiEncoding(),
];

function detect(buffer) {
    const matches = analyse(buffer);
    return matches.length > 0 ? matches[0].name : null;
}

function analyse(buffer) {
    if (!utils.isByteArray(buffer)) {
        throw new Error('Input must be a byte array, e.g. Buffer or Uint8Array');
    }

    const byteStats = Array(256).fill(0);
    for (let i = buffer.length - 1; i >= 0; i--) {
        byteStats[buffer[i] & 0x00ff]++;
    }

    const c1Bytes = byteStats.some((stat, index) => index >= 0x80 && index <= 0x9f && stat !== 0);

    const context = {
        byteStats,
        c1Bytes,
        rawInput: buffer,
        rawLen: buffer.length,
        inputBytes: buffer,
        inputLen: buffer.length,
    };

    const matches = recognisers
        .map(rec => rec.match(context))
        .filter(match => match)
        .sort((a, b) => b.confidence - a.confidence);

    return matches;
}

function detectFile(filepath, opts = {}) {
    return new Promise((resolve, reject) => {
        const fs = fsNode();
        let fd;
        
        const handler = (err, buffer) => {
            if (fd) {
                fs.closeSync(fd);
            }
            if (err) {
                reject(err);
            } else {
                resolve(detect(buffer));
            }
        };

        if (opts && opts.sampleSize) {
            fd = fs.openSync(filepath, 'r');
            const sample = Buffer.allocUnsafe(opts.sampleSize);
            fs.read(fd, sample, 0, opts.sampleSize, opts.offset, err => handler(err, sample));
        } else {
            fs.readFile(filepath, handler);
        }
    });
}

function detectFileSync(filepath, opts = {}) {
    const fs = fsNode();
    
    if (opts && opts.sampleSize) {
        const fd = fs.openSync(filepath, 'r');
        const sample = Buffer.allocUnsafe(opts.sampleSize);
        fs.readSync(fd, sample, 0, opts.sampleSize, opts.offset);
        fs.closeSync(fd);
        return detect(sample);
    }
    
    return detect(fs.readFileSync(filepath));
}

module.exports = {
    analyse,
    detect,
    detectFileSync,
    detectFile,
};
