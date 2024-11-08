'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { optimize: svgoOptimize } = require('./svgo.js');

const importConfig = async (configFile) => {
  let config;
  if (configFile.endsWith('.cjs')) {
    config = require(configFile);
  } else {
    const { default: importedConfig } = await import(pathToFileURL(configFile));
    config = importedConfig;
  }
  
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`Invalid config file "${configFile}"`);
  }
  
  return config;
};

const isFile = async (filepath) => {
  try {
    const fileStats = await fs.promises.stat(filepath);
    return fileStats.isFile();
  } catch {
    return false;
  }
};

const loadConfig = async (configFile, currentDir = process.cwd()) => {
  if (configFile) {
    const absolutePath = path.isAbsolute(configFile) ? configFile : path.join(currentDir, configFile);
    return await importConfig(absolutePath);
  }
  
  let directory = currentDir;
  
  while (true) {
    const configFiles = ['svgo.config.js', 'svgo.config.mjs', 'svgo.config.cjs'];
    
    for (const configFilename of configFiles) {
      const configFilePath = path.join(directory, configFilename);
      if (await isFile(configFilePath)) {
        return await importConfig(configFilePath);
      }
    }
    
    const parentDir = path.dirname(directory);
    if (directory === parentDir) return null;
    directory = parentDir;
  }
};

const optimize = (svgInput, config = {}) => {
  if (typeof config !== 'object') {
    throw new Error('Config should be an object');
  }
  
  const eolSetting = os.EOL === '\r\n' ? 'crlf' : 'lf';
  
  return svgoOptimize(svgInput, {
    ...config,
    js2svg: {
      eol: eolSetting,
      ...config.js2svg,
    },
  });
};

exports.loadConfig = loadConfig;
exports.optimize = optimize;
