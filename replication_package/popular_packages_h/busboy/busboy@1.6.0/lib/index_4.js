'use strict';

const { parseContentType } = require('./utils.js');
const TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded'),
].filter(type => typeof type.detect === 'function');

function getInstance(cfg) {
  const headers = cfg.headers;
  const conType = parseContentType(headers['content-type']);
  
  if (!conType) throw new Error('Malformed content type');

  for (const type of TYPES) {
    if (!type.detect(conType)) continue;

    const instanceCfg = {
      limits: cfg.limits,
      headers,
      conType,
      highWaterMark: cfg.highWaterMark,
      fileHwm: cfg.fileHwm,
      defCharset: cfg.defCharset,
      defParamCharset: cfg.defParamCharset,
      preservePath: cfg.preservePath ?? false,
    };

    return new type(instanceCfg);
  }

  throw new Error(`Unsupported content type: ${headers['content-type']}`);
}

module.exports = (cfg) => {
  if (typeof cfg !== 'object' || !cfg) cfg = {};

  const headers = cfg.headers;

  if (typeof headers !== 'object' || !headers || typeof headers['content-type'] !== 'string') {
    throw new Error('Missing Content-Type');
  }

  return getInstance(cfg);
};
