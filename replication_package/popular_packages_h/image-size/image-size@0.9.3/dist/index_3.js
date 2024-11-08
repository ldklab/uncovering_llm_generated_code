"use strict";

const fs = require("fs");
const path = require("path");
const Queue = require("queue");
const { typeHandlers } = require("./types");
const { detector } = require("./detector");

const MaxBufferSize = 512 * 1024; // 512 KB max buffer size
const queue = new Queue({ concurrency: 100, autostart: true }); // Async ops queue

function lookup(buffer, filepath) {
    const type = detector(buffer); // Detecting file type
    if (type && type in typeHandlers) {
        const size = typeHandlers[type].calculate(buffer, filepath); // Calculate size
        if (size !== undefined) {
            size.type = type;
            return size;
        }
    }
    throw new TypeError(`unsupported file type: ${type} (file: ${filepath})`);
}

async function asyncFileToBuffer(filepath) {
    const handle = await fs.promises.open(filepath, 'r');
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
    const descriptor = fs.openSync(filepath, 'r');
    const { size } = fs.fstatSync(descriptor);
    if (size <= 0) {
        fs.closeSync(descriptor);
        throw new Error('Empty file');
    }
    const bufferSize = Math.min(size, MaxBufferSize);
    const buffer = Buffer.alloc(bufferSize);
    fs.readSync(descriptor, buffer, 0, bufferSize, 0);
    fs.closeSync(descriptor);
    return buffer;
}

function imageSize(input, callback) {
    if (Buffer.isBuffer(input)) {
        return lookup(input); // Direct buffer handling
    }
    if (typeof input !== 'string') {
        throw new TypeError('invalid invocation');
    }
    const filepath = path.resolve(input);
    if (typeof callback === 'function') {
        queue.push(() => asyncFileToBuffer(filepath)
            .then(buffer => process.nextTick(callback, null, lookup(buffer, filepath)))
            .catch(callback));
    } else {
        const buffer = syncFileToBuffer(filepath);
        return lookup(buffer, filepath);
    }
}

module.exports = imageSize;
exports.default = imageSize;
exports.imageSize = imageSize;
exports.setConcurrency = (c) => { queue.concurrency = c; };
exports.types = Object.keys(typeHandlers);
