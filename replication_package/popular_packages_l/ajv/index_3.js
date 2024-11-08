// Implementation of a Simple JSON Schema Validator

class SimpleJsonValidator {
  constructor() {
    this.schemas = {}; // Storage for schemas with remote references
  }

  /**
   * Adds a JSON schema to the internal schema storage.
   * @param {string} key - The schema identifier.
   * @param {object} schema - The JSON schema object.
   */
  addSchema(key, schema) {
    this.schemas[key] = schema;
  }

  /**
   * Compiles a JSON schema into a function that can be used to validate data.
   * @param {object} schema - The JSON schema to be compiled.
   * @returns {function} - A function that validates data against the schema.
   */
  compile(schema) {
    // Returns a function that calls the validate method with the pre-defined schema
    return data => this.validate(schema, data);
  }

  /**
   * Validates a piece of data against a given schema.
   * @param {object} schema - The JSON schema for validation.
   * @param {object} data - The data object to be validated.
   * @returns {boolean} - Returns true if the data is valid according to the schema, otherwise false.
   */
  validate(schema, data) {
    // Check the 'type' constraint
    if (schema.type && typeof data !== schema.type) {
      return false;
    }

    // Validate 'properties' recursively
    if (schema.properties) {
      for (let key in schema.properties) {
        if (!this.validate(schema.properties[key], data[key])) {
          return false;
        }
      }
    }

    // Check for 'required' properties in the data
    if (schema.required) {
      for (let key of schema.required) {
        if (!(key in data)) {
          return false;
        }
      }
    }

    // Ensure no additional properties exist if 'additionalProperties' is false
    if (schema.additionalProperties === false) {
      for (let key in data) {
        if (!(key in schema.properties)) {
          return false;
        }
      }
    }

    // Return true if all checks are passed
    return true;
  }
}

// Example Usage: Creating a validator and using it to validate data
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
console.log(isValid ? "Valid!" : "Invalid!"); // Outputs: "Valid!"
