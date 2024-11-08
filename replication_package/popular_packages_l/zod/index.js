// Import Zod
const { z } = require('zod');

// Creating a schema for a simple string
const stringSchema = z.string();

// Parsing
try {
    console.log(stringSchema.parse("hello")); // "hello"
} catch (e) {
    console.error(e.errors);
}

// Safe parsing
const safeParseResult = stringSchema.safeParse("hello");
if (safeParseResult.success) {
    console.log(safeParseResult.data); // "hello"
} else {
    console.error(safeParseResult.error);
}

// Creating an object schema
const userSchema = z.object({
  username: z.string(),
  age: z.number().min(18),
  email: z.string().email().optional()
});

try {
  const user = userSchema.parse({
    username: "john_doe",
    age: 20,
    email: "john@example.com"
  });
  console.log(user);
} catch (error) {
  console.error(error.errors);
}

// Using .optional and .nullable
const optionalStringSchema = z.string().optional();
console.log(optionalStringSchema.parse(undefined)); // undefined

const nullableStringSchema = z.string().nullable();
console.log(nullableStringSchema.parse(null)); // null

// A schema with custom validation
const passwordSchema = z.string().min(8).refine(val => /[A-Z]/.test(val), {
    message: "Must contain one uppercase letter"
});

try {
    const password = passwordSchema.parse("password");
    console.log(password);
} catch (e) {
    console.error(e.errors);
}

// Working with unions
const numberOrString = z.union([z.number(), z.string()]);
console.log(numberOrString.parse(123)); // 123
console.log(numberOrString.parse("abc")); // "abc"

// Using transformations
const upperCaseString = z.string().transform(str => str.toUpperCase());
console.log(upperCaseString.parse("hello")); // "HELLO"
