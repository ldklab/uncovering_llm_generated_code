// Simple JSON Schema Validator with Basic Functionality

class JsonValidator {
  constructor() {
    this.schemas = {};
  }

  /**
   * Registers a schema with a specific key for later use.
   * @param {string} key - The identifier to store the schema.
   * @param {object} schema - The JSON schema object.
   */
  addSchema(key, schema) {
    this.schemas[key] = schema;
  }

  /**
   * Creates a validation function from the provided schema.
   * @param {object} schema - JSON schema to compile into a function.
   * @returns {function} - A function that validates data against the schema.
   */
  compile(schema) {
    return data => this.validate(schema, data);
  }

  /**
   * Validates data against the given schema.
   * @param {object} schema - The JSON schema against which data is validated.
   * @param {object} data - The actual data to be validated.
   * @returns {boolean} - Returns true if validation succeeds, otherwise false.
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
const validator = new JsonValidator();
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

const validateFunc = validator.compile(schema);
const isValid = validateFunc(data);
console.log(isValid ? "Valid!" : "Invalid!");
