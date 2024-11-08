"use strict";
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

const streamSync = globStreamSync;
const stream = Object.assign(globStream, { sync: globStreamSync });
const iterateSync = globIterateSync;
const iterate = Object.assign(globIterate, { sync: globIterateSync });
const sync = Object.assign(globSync, { stream: globStreamSync, iterate: globIterateSync });
const glob = Object.assign(glob_, {
  glob: glob_,
  globSync,
  sync,
  globStream,
  stream,
  globStreamSync,
  streamSync,
  globIterate,
  iterate,
  globIterateSync,
  iterateSync,
  Glob,
  hasMagic,
  escape,
  unescape,
});

glob.glob = glob;

module.exports = {
  escape,
  unescape,
  Glob,
  hasMagic,
  Ignore,
  streamSync,
  stream,
  iterateSync,
  iterate,
  sync,
  glob,
};
