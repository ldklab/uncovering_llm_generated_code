// Registry maps for types and formats, not used in the implementation
const TypeRegistry = new Map();
const FormatRegistry = new Map();

// Class to define basic types with optional properties
class Type {
  // String type definition with optional properties
  static String(options = {}) { return { type: 'string', ...options }; }

  // Number type definition with optional properties
  static Number(options = {}) { return { type: 'number', ...options }; }

  // Boolean type definition with optional properties
  static Boolean(options = {}) { return { type: 'boolean', ...options }; }

  // Object type definition with properties and optional additional properties
  static Object(properties = {}, options = {}) {
    return { type: 'object', properties, ...options };
  }

  // Reference to another schema by its $id
  static Ref(schema) { return { $ref: schema['$id'] }; }

  // Define schema accepting multiple types
  static AnyOf(types) { return { anyOf: types }; }

  // Define an optional type by removing its 'required' field
  static Optional(type) {
    const newType = { ...type };
    delete newType.required;
    return newType;
  }
}

// Class with operations on values, including type checking
class Value {
  // Clone a value using deep copy
  static Clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Check whether a value conforms to a given schema
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

// Class to compile schemas for validation checks
class TypeCompiler {
  // Compile schema into a validation function
  static Compile(schema) {
    return {
      Check: value => Value.Check(schema, value),
    };
  }
}

// Example usage of schema definition and validation

// Define a schema for a user object
const userSchema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
  isActive: Type.Boolean()
});

// Compile the schema for type checking
const userChecker = TypeCompiler.Compile(userSchema);

// Validate a value against the compiled schema
console.log(userChecker.Check({ name: 'Alice', age: 30, isActive: true })); // Output: true
console.log(userChecker.Check({ name: 'Bob', age: 'thirty', isActive: true })); // Output: false
