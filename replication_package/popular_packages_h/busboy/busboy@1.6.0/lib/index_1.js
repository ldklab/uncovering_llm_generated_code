'use strict';

const { parseContentType } = require('./utils.js');

function createHandlerInstance(config) {
  const headers = config.headers;
  const contentType = parseContentType(headers['content-type']);
  if (!contentType)
    throw new Error('Malformed content type');

  for (const typeHandler of AVAILABLE_TYPES) {
    if (!typeHandler.detect(contentType))
      continue;

    const handlerConfig = {
      limits: config.limits,
      headers,
      contentType,
      highWaterMark: config.highWaterMark,
      fileHwm: config.fileHwm,
      defCharset: config.defCharset,
      defParamCharset: config.defParamCharset,
      preservePath: config.preservePath || false,
    };

    return new typeHandler(handlerConfig);
  }

  throw new Error(`Unsupported content type: ${headers['content-type']}`);
}

const AVAILABLE_TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded'),
].filter(typeModule => typeof typeModule.detect === 'function');

module.exports = (config) => {
  if (typeof config !== 'object' || config === null)
    config = {};

  if (typeof config.headers !== 'object'
      || config.headers === null
      || typeof config.headers['content-type'] !== 'string') {
    throw new Error('Missing Content-Type');
  }

  return createHandlerInstance(config);
};
