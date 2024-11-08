// ajv-formats/index.js

const url = require('url'); // Import the required 'url' module

const formats = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/,
  uri: url.URL, // Using the URL constructor for URI validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Additional format regex patterns can be added here
};

const addFormats = (ajv, options = {}) => {
  const { formats: enabledFormats, mode = "full", keywords = false } = Array.isArray(options) ? {formats: options} : options;
  const enabledSet = new Set(enabledFormats || Object.keys(formats)); // Determine which formats to enable

  for (const [format, pattern] of Object.entries(formats)) {
    if (enabledSet.has(format)) {
      ajv.addFormat(format, pattern); // Add the format to the ajv instance
    }
  }

  if (keywords) {
    // Add custom validation keywords if requested
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

    // Additional custom keywords could be declared here
  }

  return ajv; // Return the enhanced ajv instance
};

module.exports = addFormats; // Export the addFormats function
