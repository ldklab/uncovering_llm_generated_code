// Custom JSON Schema Validator Implementation with Basic Functionality

class SimpleJsonValidator {
  constructor() {
    this.schemas = {};
  }

  /**
   * Add schemas for remote references
   * @param {string} key - The identifier for the schema
   * @param {object} schema - The JSON schema object
   */
  addSchema(key, schema) {
    this.schemas[key] = schema;
  }

  /**
   * Compile a schema into a validation function
   * @param {object} schema - The JSON schema to compile
   * @returns {function} - A validation function for the schema
   */
  compile(schema) {
    return data => this.validate(schema, data);
  }

  /**
   * Validate data against a schema
   * @param {object} schema - The JSON schema
   * @param {object} data - The JSON data to validate
   * @returns {boolean} - True if valid, otherwise false
   */
  validate(schema, data) {
    if (schema.type && typeof data !== schema.type) {
      return false;
    }

    if (schema.properties) {
      for (let key in schema.properties) {
        if (!this.validate(schema.properties[key], data[key])) {
          return false;
        }
      }
    }

    if (schema.required) {
      for (let key of schema.required) {
        if (!(key in data)) {
          return false;
        }
      }
    }

    if (schema.additionalProperties === false) {
      for (let key in data) {
        if (!(key in schema.properties)) {
          return false;
        }
      }
    }

    return true;
  }
}

// Usage Example
const validator = new SimpleJsonValidator();
const schema = {
  type: "object",
  properties: {
    foo: { type: "integer" },
    bar: { type: "string" },
  },
  required: ["foo"],
  additionalProperties: false,
};

const data = {
  foo: 1,
  bar: "abc",
};

const validate = validator.compile(schema);
const isValid = validate(data);
console.log(isValid ? "Valid!" : "Invalid!");

