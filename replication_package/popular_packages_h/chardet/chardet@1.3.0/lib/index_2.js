"use strict";

import nodeFs from './fs/node';
import Utf8Recognizer from './encoding/utf8';
import * as unicode from './encoding/unicode';
import * as mbcs from './encoding/mbcs';
import * as sbcs from './encoding/sbcs';
import * as iso2022 from './encoding/iso2022';

// Initialize list of encoding recognizers
const recognisers = [
    new Utf8Recognizer(),
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

// Analyzes buffer to detect encoding
export const analyse = (buffer) => {
    const fByteStats = Array(256).fill(0);
    buffer.forEach(byte => fByteStats[byte & 0xFF]++);
    
    const fC1Bytes = fByteStats.slice(0x80, 0x9f + 1).some(count => count > 0);

    const context = {
        fByteStats,
        fC1Bytes,
        fRawInput: buffer,
        fRawLength: buffer.length,
        fInputBytes: buffer,
        fInputLen: buffer.length,
    };

    return recognisers
        .map(rec => rec.match(context))
        .filter(Boolean)
        .sort((a, b) => b.confidence - a.confidence);
};

// Detect encoding from buffer
export const detect = (buffer) => {
    const matches = analyse(buffer);
    return matches.length > 0 ? matches[0].name : null;
};

// Asynchronous file encoding detection
export const detectFile = (filepath, opts = {}) => {
    return new Promise((resolve, reject) => {
        const fs = nodeFs();
        const handler = (err, buffer) => {
            err ? reject(err) : resolve(detect(buffer));
        };

        if (opts.sampleSize) {
            const fd = fs.openSync(filepath, 'r');
            const sample = Buffer.allocUnsafe(opts.sampleSize);
            fs.read(fd, sample, 0, opts.sampleSize, null, (err) => {
                fs.closeSync(fd);
                handler(err, sample);
            });
            return;
        }

        fs.readFile(filepath, handler);
    });
};

// Synchronous file encoding detection
export const detectFileSync = (filepath, opts = {}) => {
    const fs = nodeFs();

    if (opts.sampleSize) {
        const fd = fs.openSync(filepath, 'r');
        const sample = Buffer.allocUnsafe(opts.sampleSize);
        fs.readSync(fd, sample, 0, opts.sampleSize);
        fs.closeSync(fd);
        return detect(sample);
    }

    return detect(fs.readFileSync(filepath));
};

// Export default module
export default {
    analyse,
    detect,
    detectFileSync,
    detectFile,
};
