'use strict';

const os = require('os');
const fs = require('fs');
const { pathToFileURL } = require('url');
const path = require('path');
const { optimize: optimizeAgnostic } = require('./svgo.js');

async function importConfig(configFile) {
  let config;

  if (configFile.endsWith('.cjs')) {
    config = require(configFile);
  } else {
    const { default: imported } = await import(pathToFileURL(configFile));
    config = imported;
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`Invalid config file "${configFile}"`);
  }

  return config;
}

async function isFile(file) {
  try {
    const stats = await fs.promises.stat(file);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function loadConfig(configFile, cwd = process.cwd()) {
  if (configFile) {
    const filePath = path.isAbsolute(configFile) ? configFile : path.join(cwd, configFile);
    return await importConfig(filePath);
  }

  let dir = cwd;

  while (true) {
    const js = path.join(dir, 'svgo.config.js');
    if (await isFile(js)) return await importConfig(js);

    const mjs = path.join(dir, 'svgo.config.mjs');
    if (await isFile(mjs)) return await importConfig(mjs);

    const cjs = path.join(dir, 'svgo.config.cjs');
    if (await isFile(cjs)) return await importConfig(cjs);

    const parent = path.dirname(dir);
    if (dir === parent) return null;

    dir = parent;
  }
}

exports.loadConfig = loadConfig;

function optimize(input, config = {}) {
  if (typeof config !== 'object') {
    throw new Error('Config should be an object');
  }

  return optimizeAgnostic(input, {
    ...config,
    js2svg: {
      eol: os.EOL === '\r\n' ? 'crlf' : 'lf',
      ...config.js2svg,
    },
  });
}

exports.optimize = optimize;
