"use strict";

const fs = require("fs");
const path = require("path");
const Queue = require("queue");
const { typeHandlers } = require("./types/index");
const { detector } = require("./detector");

// Constants for maximum input size
const MaxInputSize = 512 * 1024;  // 512 kilobytes

// Queue setup for asynchronous file operations
const queue = new Queue({ concurrency: 100, autostart: true });

// Global options for the module
const globalOptions = {
    disabledFS: false,
    disabledTypes: [],
};

// Function to lookup image size based on Uint8Array input
function lookup(input, filepath) {
    const type = detector(input);
    
    if (type && globalOptions.disabledTypes.indexOf(type) === -1) {
        if (type in typeHandlers) {
            const size = typeHandlers[type].calculate(input, filepath);
            if (size) {
                size.type = size.type ?? type;
                return size;
            }
        }
    }
    
    throw new TypeError(`unsupported file type: ${type} (file: ${filepath})`);
}

// Asynchronously reads a file into an Uint8Array
async function readFileAsync(filepath) {
    const fileHandle = await fs.promises.open(filepath, 'r');
    try {
        const { size } = await fileHandle.stat();
        if (size <= 0) throw new Error('Empty file');
        
        const inputSize = Math.min(size, MaxInputSize);
        const buffer = new Uint8Array(inputSize);
        await fileHandle.read(buffer, 0, inputSize, 0);
        
        return buffer;
    } finally {
        await fileHandle.close();
    }
}

// Synchronously reads a file into an Uint8Array
function readFileSync(filepath) {
    const fileDescriptor = fs.openSync(filepath, 'r');
    try {
        const { size } = fs.fstatSync(fileDescriptor);
        if (size <= 0) throw new Error('Empty file');
        
        const inputSize = Math.min(size, MaxInputSize);
        const buffer = new Uint8Array(inputSize);
        fs.readSync(fileDescriptor, buffer, 0, inputSize, 0);
        
        return buffer;
    } finally {
        fs.closeSync(fileDescriptor);
    }
}

// Main function to determine image size
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
            .then(input => process.nextTick(callback, null, lookup(input, filepath)))
            .catch(callback)
        );
    } else {
        const inputData = readFileSync(filepath);
        return lookup(inputData, filepath);
    }
}

// Functions to modify global options
const disableFS = (value) => {
    globalOptions.disabledFS = value;
};

const disableTypes = (types) => {
    globalOptions.disabledTypes = types;
};

const setConcurrency = (concurrency) => {
    queue.concurrency = concurrency;
};

// Exported types from typeHandlers
const types = Object.keys(typeHandlers);

module.exports = {
    imageSize,
    disableFS,
    disableTypes,
    setConcurrency,
    types,
    default: imageSize // backwards compatibility
};
