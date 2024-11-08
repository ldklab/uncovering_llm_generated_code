"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { escape, unescape } = require("minimatch");
const { Glob } = require("./glob.js");
const { hasMagic } = require("./has-magic.js");
const { Ignore } = require("./ignore.js");

function globStreamSync(pattern, options = {}) {
    return new Glob(pattern, options).streamSync();
}

function globStream(pattern, options = {}) {
    return new Glob(pattern, options).stream();
}

function globSync(pattern, options = {}) {
    return new Glob(pattern, options).walkSync();
}

async function glob_(pattern, options = {}) {
    return new Glob(pattern, options).walk();
}

function globIterateSync(pattern, options = {}) {
    return new Glob(pattern, options).iterateSync();
}

function globIterate(pattern, options = {}) {
    return new Glob(pattern, options).iterate();
}

exports.globStreamSync = globStreamSync;
exports.globStream = globStream;
exports.globSync = globSync;
exports.globIterateSync = globIterateSync;
exports.globIterate = globIterate;
exports.streamSync = globStreamSync;
exports.stream = Object.assign(globStream, { sync: globStreamSync });
exports.iterateSync = globIterateSync;
exports.iterate = Object.assign(globIterate, { sync: globIterateSync });
exports.sync = Object.assign(globSync, { stream: globStreamSync, iterate: globIterateSync });
exports.glob = Object.assign(glob_, {
    glob: glob_,
    globSync,
    sync: exports.sync,
    globStream,
    stream: exports.stream,
    globStreamSync,
    streamSync: exports.streamSync,
    globIterate,
    iterate: exports.iterate,
    globIterateSync,
    iterateSync: exports.iterateSync,
    Glob,
    hasMagic,
    escape,
    unescape,
});
Object.defineProperties(exports, {
    escape: { enumerable: true, get: () => escape },
    unescape: { enumerable: true, get: () => unescape },
    Glob: { enumerable: true, get: () => Glob },
    hasMagic: { enumerable: true, get: () => hasMagic },
    Ignore: { enumerable: true, get: () => Ignore },
});
exports.glob.glob = exports.glob;
