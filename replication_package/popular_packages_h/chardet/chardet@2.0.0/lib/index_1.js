"use strict";

const fsModule = require("./fs/node").default;
const AsciiEncoding = require("./encoding/ascii").default;
const Utf8Encoding = require("./encoding/utf8").default;
const unicode = require("./encoding/unicode");
const mbcs = require("./encoding/mbcs");
const sbcs = require("./encoding/sbcs");
const iso2022 = require("./encoding/iso2022");
const { isByteArray } = require("./utils");

const recognisers = [
    new Utf8Encoding(),
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
    new AsciiEncoding(),
];

function detect(buffer) {
    const matches = analyse(buffer);
    return matches.length > 0 ? matches[0].name : null;
}

function analyse(buffer) {
    if (!isByteArray(buffer)) {
        throw new Error('Input must be a byte array, e.g. Buffer or Uint8Array');
    }

    const byteStats = new Array(256).fill(0);

    for (let i = 0; i < buffer.length; i++) {
        byteStats[buffer[i] & 0xFF]++;
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

    return recognisers
        .map(rec => rec.match(context))
        .filter(match => match)
        .sort((a, b) => b.confidence - a.confidence);
}

function detectFile(filepath, opts = {}) {
    return new Promise((resolve, reject) => {
        const fs = fsModule();
        let fd;

        const onReadComplete = (err, buffer) => {
            if (fd) {
                fs.closeSync(fd);
            }
            if (err) {
                reject(err);
            } else {
                resolve(detect(buffer));
            }
        };

        if (opts.sampleSize) {
            fd = fs.openSync(filepath, 'r');
            const sample = Buffer.allocUnsafe(opts.sampleSize);
            fs.read(fd, sample, 0, opts.sampleSize, opts.offset, (err) => onReadComplete(err, sample));
        } else {
            fs.readFile(filepath, onReadComplete);
        }
    });
}

function detectFileSync(filepath, opts = {}) {
    const fs = fsModule();

    if (opts.sampleSize) {
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
