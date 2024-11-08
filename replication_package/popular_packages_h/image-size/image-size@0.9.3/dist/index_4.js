"use strict";
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const Queue = require("queue");
const { detector } = require("./detector");
const { typeHandlers } = require("./types");

const MaxBufferSize = 512 * 1024;
const queue = new Queue({ concurrency: 100, autostart: true });

async function asyncFileToBuffer(filepath) {
    const handle = await fs.open(filepath, 'r');
    const { size } = await handle.stat();
    if (size <= 0) {
        await handle.close();
        throw new Error('Empty file');
    }
    const bufferSize = Math.min(size, MaxBufferSize);
    const buffer = Buffer.alloc(bufferSize);
    await handle.read(buffer, 0, bufferSize, 0);
    await handle.close();
    return buffer;
}

function syncFileToBuffer(filepath) {
    const descriptor = fsSync.openSync(filepath, 'r');
    const { size } = fsSync.fstatSync(descriptor);
    if (size <= 0) {
        fsSync.closeSync(descriptor);
        throw new Error('Empty file');
    }
    const bufferSize = Math.min(size, MaxBufferSize);
    const buffer = Buffer.alloc(bufferSize);
    fsSync.readSync(descriptor, buffer, 0, bufferSize, 0);
    fsSync.closeSync(descriptor);
    return buffer;
}

function lookup(buffer, filepath) {
    const type = detector(buffer);
    if (type && type in typeHandlers) {
        const size = typeHandlers[type].calculate(buffer, filepath);
        if (size !== undefined) {
            size.type = type;
            return size;
        }
    }
    throw new TypeError('unsupported file type: ' + type + ' (file: ' + filepath + ')');
}

function imageSize(input, callback) {
    if (Buffer.isBuffer(input)) {
        return lookup(input);
    }
    if (typeof input !== 'string') {
        throw new TypeError('invalid invocation');
    }
    const filepath = path.resolve(input);
    if (typeof callback === 'function') {
        queue.push(() => asyncFileToBuffer(filepath)
            .then(buffer => process.nextTick(() => callback(null, lookup(buffer, filepath))))
            .catch(callback));
    } else {
        const buffer = syncFileToBuffer(filepath);
        return lookup(buffer, filepath);
    }
}

module.exports = imageSize;
module.exports.setConcurrency = (c) => { queue.concurrency = c; };
module.exports.types = Object.keys(typeHandlers);
