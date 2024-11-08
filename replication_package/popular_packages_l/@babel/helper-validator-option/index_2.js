// lib/index.js

class OptionValidator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(options) {
    const errors = [];

    for (const [key, rule] of Object.entries(this.schema)) {
      const option = options[key];

      if (rule.required && (option === undefined || option === null)) {
        errors.push(`Option '${key}' is required.`);
        continue;
      }

      if (option === undefined) {
        continue;
      }

      if (rule.type && typeof option !== rule.type) {
        errors.push(`Option '${key}' must be of type ${rule.type}.`);
      }

      if (rule.allowedValues && !rule.allowedValues.includes(option)) {
        errors.push(`Option '${key}' must be one of: ${rule.allowedValues.join(', ')}.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Example usage
const schema = {
  debug: { type: 'boolean', required: false },
  env: { type: 'string', required: true, allowedValues: ['development', 'production', 'test'] },
};

const validator = new OptionValidator(schema);

const userOptions = {
  debug: true,
  env: 'production'
};

const validationResult = validator.validate(userOptions);

if (!validationResult.isValid) {
  console.error("Validation failed with errors:", validationResult.errors);
} else {
  console.log("Validation succeeded");
}
