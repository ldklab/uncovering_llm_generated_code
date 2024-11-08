// TypeBox-like Node.js module
const TypeRegistry = new Map();
const FormatRegistry = new Map();

// Basic Type Definitions
class Type {
  static String(options = {}) { return { type: 'string', ...options }; }
  static Number(options = {}) { return { type: 'number', ...options }; }
  static Boolean(options = {}) { return { type: 'boolean', ...options }; }
  static Object(properties = {}, options = {}) {
    return { type: 'object', properties, ...options };
  }

  static Ref(schema) { return { $ref: schema['$id'] }; }
  static AnyOf(types) { return { anyOf: types }; }
  static Optional(type) {
    const newType = { ...type };
    delete newType.required;
    return newType;
  }
}

// Value operations
class Value {
  static Clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

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

// Type Validation Compiler
class TypeCompiler {
  static Compile(schema) {
    return {
      Check: value => Value.Check(schema, value),
    };
  }
}

// Example usage

// Define a schema
const userSchema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
  isActive: Type.Boolean()
});

// Compile for type checking
const userChecker = TypeCompiler.Compile(userSchema);

// Validate a value
console.log(userChecker.Check({ name: 'Alice', age: 30, isActive: true })); // true
console.log(userChecker.Check({ name: 'Bob', age: 'thirty', isActive: true })); // false
