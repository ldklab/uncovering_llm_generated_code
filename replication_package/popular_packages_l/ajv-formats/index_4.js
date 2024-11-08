// ajv-formats/index.js

const url = require('url');

const formats = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  uri: url.URL, 
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

function addFormats(ajv, options = {}) {
  const normalizedOptions = Array.isArray(options) ? { formats: options } : options;
  const { formats: enabledFormatsList, mode = "full", keywords = false } = normalizedOptions;
  const enabledFormats = new Set(enabledFormatsList || Object.keys(formats));

  Object.entries(formats).forEach(([format, validator]) => {
    if (enabledFormats.has(format)) {
      ajv.addFormat(format, validator);
    }
  });

  if (keywords) {
    ajv.addKeyword('formatMinimum', {
      type: 'string',
      validate(schema, data) {
        return new Date(data) >= new Date(schema);
      }
    });
    ajv.addKeyword('formatExclusiveMaximum', {
      type: 'string',
      validate(schema, data) {
        return new Date(data) < new Date(schema);
      }
    });
  }

  return ajv;
}

module.exports = addFormats;
