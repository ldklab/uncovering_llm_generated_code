'use strict';

const { parseContentType } = require('./utils.js');

// Supported content types, each must have a 'detect' method
const TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded'),
].filter(typeModule => typeof typeModule.detect === 'function');

function createInstance(config) {
  const { headers, limits, highWaterMark, fileHwm, defCharset, defParamCharset, preservePath } = config;

  // Parse and validate the 'content-type' header
  const contentType = parseContentType(headers['content-type']);
  if (!contentType) {
    throw new Error('Malformed content type');
  }

  // Find the appropriate handler type based on the content type
  for (const TypeClass of TYPES) {
    if (TypeClass.detect(contentType)) {
      // Prepare the configuration for the instance
      const instanceConfig = {
        limits,
        headers,
        conType: contentType,
        highWaterMark,
        fileHwm,
        defCharset,
        defParamCharset,
        preservePath: Boolean(preservePath),
      };

      return new TypeClass(instanceConfig);
    }
  }

  throw new Error(`Unsupported content type: ${headers['content-type']}`);
}

module.exports = (config) => {
  // Validate the configuration object and content-type header
  if (typeof config !== 'object' || config === null) {
    config = {};
  }

  if (typeof config.headers !== 'object' || config.headers === null || typeof config.headers['content-type'] !== 'string') {
    throw new Error('Missing Content-Type');
  }

  return createInstance(config);
};
