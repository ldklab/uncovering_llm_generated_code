// Simple TypeScript-like type validation in Node.js

// Registries for types and formats
const TypeRegistry = new Map();
const FormatRegistry = new Map();

// Basic Type Definitions
class Type {
  // Method to define a string type, with optional constraints
  static String(options = {}) {
    return { type: 'string', ...options };
  }

  // Method to define a number type, with optional constraints
  static Number(options = {}) {
    return { type: 'number', ...options };
  }

  // Method to define a boolean type, with optional constraints
  static Boolean(options = {}) {
    return { type: 'boolean', ...options };
  }

  // Method to define an object type, specifying its properties and other options
  static Object(properties = {}, options = {}) {
    return { type: 'object', properties, ...options };
  }

  // Method to refer to a schema using its $id property
  static Ref(schema) {
    return { $ref: schema['$id'] };
  }

  // Method to create a type that is one of a list of types
  static AnyOf(types) {
    return { anyOf: types };
  }

  // Method to make a type optional by removing the 'required' constraint
  static Optional(type) {
    const newType = { ...type };
    delete newType.required;
    return newType;
  }
}

// Class for operations on values
class Value {
  // Deep clone an object using JSON parse/stringify
  static Clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Check if a value matches a schema
  static Check(schema, value) {
    if (schema.type === 'string' && typeof value !== 'string') return false;
    if (schema.type === 'number' && typeof value !== 'number') return false;
    if (schema.type === 'boolean' && typeof value !== 'boolean') return false;
    if (schema.type === 'object') {
      if (typeof value !== 'object' || value === null) return false;
      for (const key of Object.keys(schema.properties)) {
        if (!Value.Check(schema.properties[key], value[key])) return false;
      }
    }
    return true;
  }
}

// Class for compiling type validators
class TypeCompiler {
  // Compile a schema into a validator function
  static Compile(schema) {
    return {
      Check: value => Value.Check(schema, value),
    };
  }
}

// Example usage

// Define a schema with string, number, and boolean properties
const userSchema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
  isActive: Type.Boolean()
});

// Compile the schema into a type checker
const userChecker = TypeCompiler.Compile(userSchema);

// Validate example values
console.log(userChecker.Check({ name: 'Alice', age: 30, isActive: true })); // true
console.log(userChecker.Check({ name: 'Bob', age: 'thirty', isActive: true })); // false
