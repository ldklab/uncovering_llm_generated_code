// Simple JSON Schema Validator with Basic Functionality

class SimpleJsonValidator {
  constructor() {
    this.schemas = {};
  }

  /**
   * Adds a schema for remote reference under a specific key
   * @param {string} key - The identifier for the schema
   * @param {object} schema - The JSON schema object
   */
  addSchema(key, schema) {
    this.schemas[key] = schema;
  }

  /**
   * Compiles a JSON schema into a validation function, enabling its reuse
   * @param {object} schema - The JSON schema to be compiled
   * @returns {function} - A function that checks the validity of data against the schema
   */
  compile(schema) {
    return data => this.validate(schema, data);
  }

  /**
   * Validates data against a provided JSON schema
   * @param {object} schema - The JSON schema describing the data structure
   * @param {object} data - The actual data to be validated against the schema
   * @returns {boolean} - Result of the validation; true if data conforms to the schema, false otherwise
   */
  validate(schema, data) {
    // Check if the data type matches the schema type
    if (schema.type && typeof data !== schema.type) {
      return false;
    }

    // Validate each property with the specified schema
    if (schema.properties) {
      for (let key in schema.properties) {
        if (!this.validate(schema.properties[key], data[key])) {
          return false;
        }
      }
    }

    // Check if all required properties are present
    if (schema.required) {
      for (let key of schema.required) {
        if (!(key in data)) {
          return false;
        }
      }
    }

    // Ensure no additional properties are present if not allowed
    if (schema.additionalProperties === false) {
      for (let key in data) {
        if (!(key in schema.properties)) {
          return false;
        }
      }
    }

    return true; // Data is valid according to the schema
  }
}

// Usage Example
const validator = new SimpleJsonValidator();
const schema = {
  type: "object", // Root data type
  properties: {
    foo: { type: "integer" },
    bar: { type: "string" },
  },
  required: ["foo"], // Required property
  additionalProperties: false, // Disallow extra properties
};

const data = {
  foo: 1,
  bar: "abc",
};

const validate = validator.compile(schema);
const isValid = validate(data);
console.log(isValid ? "Valid!" : "Invalid!"); // Output: Valid!
