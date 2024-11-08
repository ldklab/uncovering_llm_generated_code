"use strict";
const fs = require('fs');
const Utf8Recognizer = require('./encoding/utf8').default;
const Unicode = require('./encoding/unicode');
const Mbcs = require('./encoding/mbcs');
const Sbcs = require('./encoding/sbcs');
const Iso2022 = require('./encoding/iso2022');

const recognisers = [
  new Utf8Recognizer(),
  new Unicode.UTF_16BE(),
  new Unicode.UTF_16LE(),
  new Unicode.UTF_32BE(),
  new Unicode.UTF_32LE(),
  new Mbcs.sjis(),
  new Mbcs.big5(),
  new Mbcs.euc_jp(),
  new Mbcs.euc_kr(),
  new Mbcs.gb_18030(),
  new Iso2022.ISO_2022_JP(),
  new Iso2022.ISO_2022_KR(),
  new Iso2022.ISO_2022_CN(),
  new Sbcs.ISO_8859_1(),
  new Sbcs.ISO_8859_2(),
  new Sbcs.ISO_8859_5(),
  new Sbcs.ISO_8859_6(),
  new Sbcs.ISO_8859_7(),
  new Sbcs.ISO_8859_8(),
  new Sbcs.ISO_8859_9(),
  new Sbcs.windows_1251(),
  new Sbcs.windows_1256(),
  new Sbcs.KOI8_R(),
];

function analyse(buffer) {
  const fByteStats = new Array(256).fill(0);
  buffer.forEach((byte) => {
    fByteStats[byte & 0xff]++;
  });

  const fC1Bytes = fByteStats.slice(0x80, 0xa0).some((count) => count > 0);

  const context = {
    fByteStats,
    fC1Bytes,
    fRawInput: buffer,
    fRawLength: buffer.length,
    fInputBytes: buffer,
    fInputLen: buffer.length,
  };

  return recognisers
    .map((rec) => rec.match(context))
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence);
}

function detect(buffer) {
  const matches = analyse(buffer);
  return matches.length > 0 ? matches[0].name : null;
}

function detectFile(filepath, opts = {}) {
  return new Promise((resolve, reject) => {
    const handler = (err, buffer) => {
      if (err) {
        return reject(err);
      }
      resolve(detect(buffer));
    };

    if (opts.sampleSize) {
      fs.open(filepath, 'r', (err, fd) => {
        if (err) return handler(err);

        const sample = Buffer.allocUnsafe(opts.sampleSize);
        fs.read(fd, sample, 0, opts.sampleSize, null, (errRead) => {
          fs.closeSync(fd);
          handler(errRead, sample);
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
