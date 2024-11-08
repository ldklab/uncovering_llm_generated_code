// A TypeBox-like module providing schema definition and validation
const TypeRegistry = new Map();
const FormatRegistry = new Map();

// Basic Type Definitions utilizing static methods
class Type {
  static String(options = {}) {
    return { type: 'string', ...options };
  }

  static Number(options = {}) {
    return { type: 'number', ...options };
  }

  static Boolean(options = {}) {
    return { type: 'boolean', ...options };
  }

  static Object(properties = {}, options = {}) {
    return {
      type: 'object',
      properties,
      ...options
    };
  }

  static Ref(schema) {
    return { $ref: schema['$id'] };
  }

  static AnyOf(types) {
    return { anyOf: types };
  }

  static Optional(type) {
    const newType = { ...type };
    delete newType.required;
    return newType;
  }
}

// Operations on values, including checking against schemas
class Value {
  static Clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  static Check(schema, value) {
    if (schema.type === 'string') {
      return typeof value === 'string';
    }
    if (schema.type === 'number') {
      return typeof value === 'number';
    }
    if (schema.type === 'boolean') {
      return typeof value === 'boolean';
    }
    if (schema.type === 'object') {
      return (
        value !== null &&
        typeof value === 'object' &&
        Object.keys(schema.properties).every(key =>
          Value.Check(schema.properties[key], value[key])
        )
      );
    }
    return true;
  }
}

// Compiler for schema-based validation
class TypeCompiler {
  static Compile(schema) {
    return {
      Check: value => Value.Check(schema, value)
    };
  }
}

// Demonstration of module usage

// Define a schema
const userSchema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
  isActive: Type.Boolean()
});

// Compile the schema for validation
const userChecker = TypeCompiler.Compile(userSchema);

// Validate some example values
console.log(userChecker.Check({ name: 'Alice', age: 30, isActive: true })); // true
console.log(userChecker.Check({ name: 'Bob', age: 'thirty', isActive: true })); // false
