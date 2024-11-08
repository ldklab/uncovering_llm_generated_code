// Importing the Zod library for schema validation
const { z } = require('zod');

// Define a schema for a simple string
const stringSchema = z.string();

// Parsing a string and catching errors if any
try {
    console.log(stringSchema.parse("hello")); // Output: "hello"
} catch (e) {
    console.error(e.errors);
}

// Safe parsing of a string with success check
const safeParseResult = stringSchema.safeParse("hello");
if (safeParseResult.success) {
    console.log(safeParseResult.data); // Output: "hello"
} else {
    console.error(safeParseResult.error);
}

// Define a schema for an object with specific properties
const userSchema = z.object({
  username: z.string(),
  age: z.number().min(18),
  email: z.string().email().optional()
});

// Parsing and validating an object against the schema
try {
  const user = userSchema.parse({
    username: "john_doe",
    age: 20,
    email: "john@example.com"
  });
  console.log(user); // Output the user object
} catch (error) {
  console.error(error.errors);
}

// Define schemas using .optional and .nullable
const optionalStringSchema = z.string().optional();
console.log(optionalStringSchema.parse(undefined)); // Output: undefined

const nullableStringSchema = z.string().nullable();
console.log(nullableStringSchema.parse(null)); // Output: null

// Schema with custom validation to check for at least one uppercase letter
const passwordSchema = z.string().min(8).refine(val => /[A-Z]/.test(val), {
    message: "Must contain one uppercase letter"
});

// Parsing password and handling validation errors
try {
    const password = passwordSchema.parse("password");
    console.log(password);
} catch (e) {
    console.error(e.errors);
}

// Define a union schema allowing number or string input
const numberOrString = z.union([z.number(), z.string()]);
console.log(numberOrString.parse(123)); // Output: 123
console.log(numberOrString.parse("abc")); // Output: "abc"

// Using transformations to convert strings to uppercase
const upperCaseString = z.string().transform(str => str.toUpperCase());
console.log(upperCaseString.parse("hello")); // Output: "HELLO"
