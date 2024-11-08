// ajv-formats/index.js

const { URL } = require('url');

const formats = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  uri: URL, // Use native URL constructor for URI validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Additional formats can be added here.
};

const addFormats = (ajv, options = {}) => {
  const { formats: enabledFormats, mode = "full", keywords = false } = Array.isArray(options) ? { formats: options } : options;
  const enabledSet = new Set(enabledFormats || Object.keys(formats));

  for (const [format, validator] of Object.entries(formats)) {
    if (enabledSet.has(format)) {
      ajv.addFormat(format, validator);
    }
  }

  if (keywords) {
    ajv.addKeyword('formatMinimum', {
      type: 'string',
      validate: (schema, data) => new Date(data) >= new Date(schema),
    });

    ajv.addKeyword('formatExclusiveMaximum', {
      type: 'string',
      validate: (schema, data) => new Date(data) < new Date(schema),
    });
    // Additional keywords can be added here.
  }

  return ajv;
};

module.exports = addFormats;
