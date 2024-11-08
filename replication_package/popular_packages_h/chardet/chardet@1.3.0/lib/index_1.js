"use strict";

const fs = require("fs");
const utf8 = require("./encoding/utf8").default;
const unicode = require("./encoding/unicode");
const mbcs = require("./encoding/mbcs");
const sbcs = require("./encoding/sbcs");
const iso2022 = require("./encoding/iso2022");

const recognisers = [
    new utf8(),
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
];

function analyse(buffer) {
    const fByteStats = Array(256).fill(0);
    for (const byte of buffer) {
        fByteStats[byte]++;
    }

    const fC1Bytes = fByteStats.slice(0x80, 0xa0).some(value => value > 0);

    const context = {
        fByteStats,
        fC1Bytes,
        fRawInput: buffer,
        fRawLength: buffer.length,
        fInputBytes: buffer,
        fInputLen: buffer.length,
    };

    return recognisers.map(rec => rec.match(context))
                      .filter(match => !!match)
                      .sort((a, b) => b.confidence - a.confidence);
}

function detect(buffer) {
    const matches = analyse(buffer);
    return matches.length > 0 ? matches[0].name : null;
}

function detectFile(filepath, opts = {}) {
    return new Promise((resolve, reject) => {
        const handler = (err, buffer) => {
            if (err) return reject(err);
            resolve(detect(buffer));
        };

        if (opts.sampleSize) {
            fs.open(filepath, 'r', (err, fd) => {
                if (err) return reject(err);
                const sample = Buffer.allocUnsafe(opts.sampleSize);
                fs.read(fd, sample, 0, opts.sampleSize, null, (err) => {
                    fs.closeSync(fd);
                    handler(err, sample);
                });
            });
        } else {
            fs.readFile(filepath, handler);
        }
    });
}

function detectFileSync(filepath, opts = {}) {
    if (opts.sampleSize) {
        const fd = fs.openSync(filepath, 'r');
        const sample = Buffer.allocUnsafe(opts.sampleSize);
        fs.readSync(fd, sample, 0, opts.sampleSize);
        fs.closeSync(fd);
        return detect(sample);
    }
    return detect(fs.readFileSync(filepath));
}

module.exports = {
    analyse,
    detect,
    detectFile,
    detectFileSync,
};
