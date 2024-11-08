"use strict";
const fs = require("fs");
const path = require("path");
const Queue = require("queue");
const { detector } = require("./detector");
const { typeHandlers } = require("./types/index");

const MaxInputSize = 512 * 1024;
const queue = new Queue({ concurrency: 100, autostart: true });
const globalOptions = {
    disabledFS: false,
    disabledTypes: [],
};

function lookup(input, filepath) {
    const type = detector(input);
    if (type && globalOptions.disabledTypes.includes(type)) {
        throw new TypeError(`disabled file type: ${type}`);
    }
    if (type && type in typeHandlers) {
        const size = typeHandlers[type].calculate(input, filepath);
        if (size) {
            size.type = size.type ?? type;
            return size;
        }
    }
    throw new TypeError(`unsupported file type: ${type} (file: ${filepath})`);
}

async function readFileAsync(filepath) {
    const handle = await fs.promises.open(filepath, 'r');
    try {
        const { size } = await handle.stat();
        if (size <= 0) throw new Error('Empty file');
        
        const inputSize = Math.min(size, MaxInputSize);
        const input = new Uint8Array(inputSize);
        await handle.read(input, 0, inputSize, 0);
        return input;
    } finally {
        await handle.close();
    }
}

function readFileSync(filepath) {
    const descriptor = fs.openSync(filepath, 'r');
    try {
        const { size } = fs.fstatSync(descriptor);
        if (size <= 0) throw new Error('Empty file');
        
        const inputSize = Math.min(size, MaxInputSize);
        const input = new Uint8Array(inputSize);
        fs.readSync(descriptor, input, 0, inputSize, 0);
        return input;
    } finally {
        fs.closeSync(descriptor);
    }
}

function imageSize(input, callback) {
    if (input instanceof Uint8Array) {
        return lookup(input);
    }
    if (typeof input !== 'string' || globalOptions.disabledFS) {
        throw new TypeError('invalid invocation. input should be a Uint8Array');
    }
    const filepath = path.resolve(input);
    if (typeof callback === 'function') {
        queue.push(() => readFileAsync(filepath)
            .then((input) => process.nextTick(callback, null, lookup(input, filepath)))
            .catch(callback));
    } else {
        const input = readFileSync(filepath);
        return lookup(input, filepath);
    }
}

const disableFS = (value) => {
    globalOptions.disabledFS = value;
};

const disableTypes = (types) => {
    globalOptions.disabledTypes = types;
};

const setConcurrency = (concurrency) => {
    queue.concurrency = concurrency;
};

module.exports = imageSize;
exports.default = imageSize;
exports.imageSize = imageSize;
exports.disableFS = disableFS;
exports.disableTypes = disableTypes;
exports.setConcurrency = setConcurrency;
exports.types = Object.keys(typeHandlers);
