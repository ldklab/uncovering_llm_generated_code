// Import core modules for schema types and utilities
const {
  mixed,
  string,
  number,
  boolean,
  bool,
  date,
  object,
  array,
  ref,
  lazy,
  ValidationError,
  addMethod,
  Schema,
  setLocale,
  reach,
} = require('yup');

// Custom error messages
setLocale({
  mixed: {
    default: 'This field is invalid',
  },
  number: {
    min: 'This value should be greater than ${min}',
  },
});

// Example User Schema
let userSchema = object({
  name: string().required(),
  age: number().required().positive().integer(),
  email: string().email(),
  website: string().url().nullable(),
  createdOn: date().default(() => new Date()),
});

// Asynchronous validation example
async function validateUser(data) {
  try {
    const user = await userSchema.validate(data);
    console.log(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(err.errors);
    }
  }
}

// Casting data example
function castUserData(data) {
  const parsedUser = userSchema.cast(data);
  console.log(parsedUser);
}

// Extending Yup: Adding a Custom Method
addMethod(string, 'safeEmail', function safeEmail() {
  return this.lowercase().matches(/^\S+@\S+\.\S+$/, 'Must be a valid email address');
});

// Usage of custom method
let customSchema = object({
  contactEmail: string().safeEmail(),
});

// Custom Usage
async function validateCustomUser(data) {
  try {
    const result = await customSchema.validate(data);
    console.log(result);
  } catch (err) {
    console.error(err.errors);
  }
}

// Test the package
(async () => {
  const sampleData = {
    name: 'John Doe',
    age: 29,
    email: 'john.doe@example.com',
    website: 'https://johndoe.com',
  };

  const invalidData = {
    name: 'John Doe',
    age: 29,
    email: 'not-an-email',
  };

  await validateUser(sampleData);
  castUserData({ name: 'Jane', age: '23', website: '' });

  // Test custom method validation
  await validateCustomUser({ contactEmail: 'valid@example.com' });
  await validateCustomUser({ contactEmail: 'INVALIDEMAIL' });
})();
