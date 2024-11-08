'use strict';

const { parseContentType } = require('./utils.js');

const TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded'),
].filter(typeModule => typeof typeModule.detect === 'function');

function getInstance(config) {
  const headers = config.headers;
  const contentTypeHeader = headers['content-type'];
  const parsedContentType = parseContentType(contentTypeHeader);

  if (!parsedContentType) {
    throw new Error('Malformed content type');
  }

  for (const type of TYPES) {
    if (type.detect(parsedContentType)) {
      const instanceConfig = {
        limits: config.limits,
        headers,
        conType: parsedContentType,
        highWaterMark: config.highWaterMark,
        fileHwm: config.fileHwm,
        defCharset: config.defCharset,
        defParamCharset: config.defParamCharset,
        preservePath: config.preservePath || false,
      };
      return new type(instanceConfig);
    }
  }

  throw new Error(`Unsupported content type: ${contentTypeHeader}`);
}

module.exports = (config) => {
  if (typeof config !== 'object' || config === null) {
    config = {};
  }

  const headers = config.headers;
  const contentTypeHeader = headers?.['content-type'];

  if (typeof headers !== 'object' || !contentTypeHeader) {
    throw new Error('Missing Content-Type');
  }

  return getInstance(config);
};
