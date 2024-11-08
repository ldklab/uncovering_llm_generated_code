// A module for defining and validating complex types similar to TypeBox
const TypeRegistry = new Map();
const FormatRegistry = new Map();

// Class for handling basic type definitions
class Type {
  // Method to define a type of string with optional parameters
  static String(options = {}) { return { type: 'string', ...options }; }

  // Method to define a type of number with optional parameters
  static Number(options = {}) { return { type: 'number', ...options }; }

  // Method to define a type of boolean with optional parameters
  static Boolean(options = {}) { return { type: 'boolean', ...options }; }

  // Method to define an object type with specified properties and options
  static Object(properties = {}, options = {}) {
    return { type: 'object', properties, ...options };
  }

  // Method to define a reference to another schema
  static Ref(schema) { return { $ref: schema['$id'] }; }

  // Method to define a schema that can match any one of multiple types
  static AnyOf(types) { return { anyOf: types }; }

  // Method to make a property optional by removing the 'required' attribute
  static Optional(type) {
    const newType = { ...type };
    delete newType.required;
    return newType;
  }
}

// Class for performing operations on values
class Value {

  // Method to create a deep clone of a value
  static Clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Method to check if a value conforms to a given schema
  static Check(schema, value) {
    // Check each base type and validate accordingly
    if (schema.type === 'string' && typeof value !== 'string') return false;
    if (schema.type === 'number' && typeof value !== 'number') return false;
    if (schema.type === 'boolean' && typeof value !== 'boolean') return false;

    // Check for object type and recursively validate each property
    if (schema.type === 'object') {
      if (typeof value !== 'object' || value === null) return false;
      for (const key of Object.keys(schema.properties)) {
        if (!Value.Check(schema.properties[key], value[key])) return false;
      }
    }
    return true;
  }
}

// Class for compiling type schemas into structures that can validate values
class TypeCompiler {
  
  // Method to compile a schema into a checker function
  static Compile(schema) {
    return {
      Check: value => Value.Check(schema, value), // Return an object with a Check method
    };
  }
}

// Example of using the module

// Define a schema for a user object
const userSchema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
  isActive: Type.Boolean()
});

// Compile the schema to create a type-checking function
const userChecker = TypeCompiler.Compile(userSchema);

// Validate some example data using the compiled checking function
console.log(userChecker.Check({ name: 'Alice', age: 30, isActive: true })); // Outputs: true
console.log(userChecker.Check({ name: 'Bob', age: 'thirty', isActive: true })); // Outputs: false
