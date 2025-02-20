// Import Zod
const { z } = require('zod');

// Creating a schema for a simple string
const stringSchema = z.string();

// Parsing a string using the string schema
try {
    console.log(stringSchema.parse("hello")); // Expected output: "hello"
} catch (e) {
    console.error(e.errors); // Error handling in case parsing fails
}

// Safe parsing a string
const safeParseResult = stringSchema.safeParse("hello");
if (safeParseResult.success) {
    console.log(safeParseResult.data); // Expected output: "hello"
} else {
    console.error(safeParseResult.error); // Error handling for safe parsing
}

// Creating an object schema for 'user'
const userSchema = z.object({
  username: z.string(),               // Username should be a string
  age: z.number().min(18),            // Age should be a number and at least 18
  email: z.string().email().optional() // Email is an optional valid email string
});

// Parsing an object using the user schema
try {
  const user = userSchema.parse({
    username: "john_doe",
    age: 20,
    email: "john@example.com"
  });
  console.log(user); // Outputs the user object if parsing is successful
} catch (error) {
  console.error(error.errors); // Error handling for parsing the user object
}

// Demonstrating the use of .optional and .nullable
const optionalStringSchema = z.string().optional();
console.log(optionalStringSchema.parse(undefined)); // Expected output: undefined

const nullableStringSchema = z.string().nullable();
console.log(nullableStringSchema.parse(null)); // Expected output: null

// Creating a schema for passwords with custom validation
const passwordSchema = z.string()
    .min(8)
    .refine(val => /[A-Z]/.test(val), {
      message: "Must contain one uppercase letter"
    });

// Parsing a password using the password schema
try {
    const password = passwordSchema.parse("password");
    console.log(password); // This will fail and go to the catch block
} catch (e) {
    console.error(e.errors); // Outputs errors for invalid password
}

// Working with union types
const numberOrString = z.union([z.number(), z.string()]);
console.log(numberOrString.parse(123)); // Expected output: 123
console.log(numberOrString.parse("abc")); // Expected output: "abc"

// Using transformations in a schema
const upperCaseString = z.string().transform(str => str.toUpperCase());
console.log(upperCaseString.parse("hello")); // Expected output: "HELLO"
