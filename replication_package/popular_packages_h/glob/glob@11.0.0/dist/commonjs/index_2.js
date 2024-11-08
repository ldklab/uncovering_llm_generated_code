"use strict";

import { escape as minimatchEscape, unescape as minimatchUnescape } from "minimatch";
import { Glob as GlobClass } from "./glob.js";
import { hasMagic as checkHasMagic } from "./has-magic.js";
import { Ignore as IgnoreClass } from "./ignore.js";

const globMethods = {
    streamSync: function(pattern, options = {}) {
        return new GlobClass(pattern, options).streamSync();
    },
    
    stream: function(pattern, options = {}) {
        return new GlobClass(pattern, options).stream();
    },
    
    sync: function(pattern, options = {}) {
        return new GlobClass(pattern, options).walkSync();
    },
    
    async glob(pattern, options = {}) {
        return new GlobClass(pattern, options).walk();
    },
    
    iterateSync: function(pattern, options = {}) {
        return new GlobClass(pattern, options).iterateSync();
    },
    
    iterate: function(pattern, options = {}) {
        return new GlobClass(pattern, options).iterate();
    }
};

const stream = Object.assign(globMethods.stream, { sync: globMethods.streamSync });
const iterate = Object.assign(globMethods.iterate, { sync: globMethods.iterateSync });
const sync = Object.assign(globMethods.sync, {
    stream: globMethods.streamSync,
    iterate: globMethods.iterateSync
});

const glob = Object.assign(globMethods.glob, {
    glob: globMethods.glob,
    globSync: globMethods.sync,
    sync: sync,
    globStream: globMethods.stream,
    stream: stream,
    globStreamSync: globMethods.streamSync,
    streamSync: globMethods.streamSync,
    globIterate: globMethods.iterate,
    iterate: iterate,
    globIterateSync: globMethods.iterateSync,
    iterateSync: globMethods.iterateSync,
    Glob: GlobClass,
    hasMagic: checkHasMagic,
    escape: minimatchEscape,
    unescape: minimatchUnescape
});

export { streamSync, stream, iterateSync, iterate, sync, glob, IgnoreClass as Ignore, checkHasMagic as hasMagic, GlobClass as Glob, minimatchEscape as escape, minimatchUnescape as unescape };
glob.glob = glob;
