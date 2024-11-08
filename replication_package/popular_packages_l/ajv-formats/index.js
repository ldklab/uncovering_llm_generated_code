// ajv-formats/index.js

const formats = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  uri: require('url').URL, // an example, assuming URI format validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // ... other format regex patterns
}

const addFormats = (ajv, options = {}) => {
  const {formats: enabledFormats, mode = "full", keywords = false} = Array.isArray(options) ? {formats: options} : options;
  const enabledSet = new Set(enabledFormats || Object.keys(formats));

  for (const [format, regex] of Object.entries(formats)) {
    if (enabledSet.has(format)) {
      ajv.addFormat(format, regex);
    }
  }

  if (keywords) {
    ajv.addKeyword('formatMinimum', {
      type: 'string',
      validate: function (schema, data) {
        return new Date(data) >= new Date(schema);
      }
    });
    ajv.addKeyword('formatExclusiveMaximum', {
      type: 'string',
      validate: function (schema, data) {
        return new Date(data) < new Date(schema);
      }
    });
    // ... other keywords
  }

  return ajv;
};

module.exports = addFormats;
