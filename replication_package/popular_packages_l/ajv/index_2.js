// A JSON Schema Validator with Basic Capabilities

class BasicJsonSchemaValidator {
  constructor() {
    this.savedSchemas = {};
  }

  /**
   * Store a schema for later validation or reference
   * @param {string} schemaKey - A unique identifier for the schema
   * @param {object} schemaObject - The JSON schema object
   */
  storeSchema(schemaKey, schemaObject) {
    this.savedSchemas[schemaKey] = schemaObject;
  }

  /**
   * Generate a function to validate data against a provided schema
   * @param {object} schemaObject - The JSON schema to use for validation
   * @returns {function} - A function that checks data conformity with the schema
   */
  createValidator(schemaObject) {
    return inputData => this.checkValidity(schemaObject, inputData);
  }

  /**
   * Check data against the rules defined in a schema
   * @param {object} schemaObject - The schema containing validation rules
   * @param {object} inputData - The data that needs validation
   * @returns {boolean} - True if the data adheres to the schema, false otherwise
   */
  checkValidity(schemaObject, inputData) {
    if (schemaObject.type && typeof inputData !== schemaObject.type) {
      return false;
    }

    if (schemaObject.properties) {
      for (let propertyName in schemaObject.properties) {
        if (!this.checkValidity(schemaObject.properties[propertyName], inputData[propertyName])) {
          return false;
        }
      }
    }

    if (schemaObject.required) {
      for (let requiredKey of schemaObject.required) {
        if (!(requiredKey in inputData)) {
          return false;
        }
      }
    }

    if (schemaObject.additionalProperties === false) {
      for (let dataKey in inputData) {
        if (!(dataKey in schemaObject.properties)) {
          return false;
        }
      }
    }

    return true;
  }
}

// Example Usage
const schemaValidator = new BasicJsonSchemaValidator();
const exampleSchema = {
  type: "object",
  properties: {
    foo: { type: "integer" },
    bar: { type: "string" },
  },
  required: ["foo"],
  additionalProperties: false,
};

const dataToValidate = {
  foo: 1,
  bar: "abc",
};

const validationFunction = schemaValidator.createValidator(exampleSchema);
const validationResult = validationFunction(dataToValidate);
console.log(validationResult ? "Valid!" : "Invalid!");
