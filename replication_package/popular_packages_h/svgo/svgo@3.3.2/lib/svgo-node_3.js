'use strict';

const os = require('os');
const fs = require('fs').promises;
const { pathToFileURL } = require('url');
const path = require('path');
const { optimize: optimizeAgnostic } = require('./svgo.js');

const importConfig = async (configFile) => {
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
};

const isFile = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
};

const loadConfig = async (configFile, cwd = process.cwd()) => {
  if (configFile) {
    const fullPath = path.isAbsolute(configFile) ? configFile : path.join(cwd, configFile);
    return importConfig(fullPath);
  }

  for (let dir = cwd; dir !== path.dirname(dir); dir = path.dirname(dir)) {
    for (const ext of ['js', 'mjs', 'cjs']) {
      const filePath = path.join(dir, `svgo.config.${ext}`);
      if (await isFile(filePath)) {
        return importConfig(filePath);
      }
    }
  }

  return null;
};

exports.loadConfig = loadConfig;

const optimize = (input, config = {}) => {
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
};

exports.optimize = optimize;
