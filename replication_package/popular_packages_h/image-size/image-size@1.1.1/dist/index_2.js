"use strict";

const fs = require("fs");
const path = require("path");
const Queue = require("queue");
const { typeHandlers } = require("./types/index");
const { detector } = require("./detector");

const MaxInputSize = 512 * 1024;
const fileQueue = new Queue({ concurrency: 100, autostart: true });

const globalOptions = {
    disabledFS: false,
    disabledTypes: [],
};

function detectFileType(input, filepath) {
    const fileType = detector(input);
    if (fileType && globalOptions.disabledTypes.includes(fileType)) {
        throw new TypeError(`disabled file type: ${fileType}`);
    }

    if (fileType in typeHandlers) {
        const size = typeHandlers[fileType].calculate(input, filepath);
        if (size) {
            size.type = size.type || fileType;
            return size;
        }
    }
    
    throw new TypeError(`unsupported file type: ${fileType} (file: ${filepath})`);
}

async function readAsync(filepath) {
    const handle = await fs.promises.open(filepath, 'r');
    try {
        const { size } = await handle.stat();
        if (size <= 0) throw new Error('Empty file');

        const bufferSize = Math.min(size, MaxInputSize);
        const buffer = new Uint8Array(bufferSize);
        await handle.read(buffer, 0, bufferSize, 0);
        return buffer;
    } finally {
        await handle.close();
    }
}

function readSync(filepath) {
    const descriptor = fs.openSync(filepath, 'r');
    try {
        const { size } = fs.fstatSync(descriptor);
        if (size <= 0) throw new Error('Empty file');

        const bufferSize = Math.min(size, MaxInputSize);
        const buffer = new Uint8Array(bufferSize);
        fs.readSync(descriptor, buffer, 0, bufferSize, 0);
        return buffer;
    } finally {
        fs.closeSync(descriptor);
    }
}

function imageSize(input, callback) {
    if (input instanceof Uint8Array) {
        return detectFileType(input);
    }

    if (typeof input !== 'string' || globalOptions.disabledFS) {
        throw new TypeError('invalid invocation. input should be a Uint8Array');
    }

    const resolvedPath = path.resolve(input);
    if (typeof callback === 'function') {
        fileQueue.push(() => readAsync(resolvedPath)
            .then(data => process.nextTick(callback, null, detectFileType(data, resolvedPath)))
            .catch(callback));
    } else {
        const data = readSync(resolvedPath);
        return detectFileType(data, resolvedPath);
    }
}

function disableFS(value) {
    globalOptions.disabledFS = value;
}

function disableTypes(types) {
    globalOptions.disabledTypes = types;
}

function setConcurrency(concurrency) {
    fileQueue.concurrency = concurrency;
}

module.exports = imageSize;
exports.default = imageSize;
exports.imageSize = imageSize;
exports.disableFS = disableFS;
exports.disableTypes = disableTypes;
exports.setConcurrency = setConcurrency;
exports.types = Object.keys(typeHandlers);
