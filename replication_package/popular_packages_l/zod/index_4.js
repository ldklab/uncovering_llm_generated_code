const { z } = require('zod');

// String schema
const stringSchema = z.string();

try {
    console.log(stringSchema.parse("hello"));
} catch (e) {
    console.error(e.errors);
}

const safeParseResult = stringSchema.safeParse("hello");
if (safeParseResult.success) {
    console.log(safeParseResult.data);
} else {
    console.error(safeParseResult.error);
}

// Object schema
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

// Optional and nullable schemas
const optionalStringSchema = z.string().optional();
console.log(optionalStringSchema.parse(undefined));

const nullableStringSchema = z.string().nullable();
console.log(nullableStringSchema.parse(null));

// Password schema with custom validation
const passwordSchema = z.string().min(8).refine(val => /[A-Z]/.test(val), {
    message: "Must contain one uppercase letter"
});

try {
    const password = passwordSchema.parse("password");
    console.log(password);
} catch (e) {
    console.error(e.errors);
}

// Unions
const numberOrString = z.union([z.number(), z.string()]);
console.log(numberOrString.parse(123));
console.log(numberOrString.parse("abc"));

// Transformations
const upperCaseString = z.string().transform(str => str.toUpperCase());
console.log(upperCaseString.parse("hello"));
