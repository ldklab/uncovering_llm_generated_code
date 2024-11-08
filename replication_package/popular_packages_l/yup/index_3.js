// Import necessary functions and classes from yup library
const {
  string,
  number,
  date,
  object,
  ValidationError,
  addMethod,
  setLocale,
} = require('yup');

// Set custom error messages
setLocale({
  mixed: {
    default: 'This field is invalid',
  },
  number: {
    min: 'This value should be greater than ${min}',
  },
});

// Define user schema with specific validation rules
const userSchema = object({
  name: string().required(),
  age: number().required().positive().integer(),
  email: string().email(),
  website: string().url().nullable(),
  createdOn: date().default(() => new Date()),
});

// Function to validate user data asynchronously
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

// Function to cast and parse user data according to schema
function castUserData(data) {
  const parsedUser = userSchema.cast(data);
  console.log(parsedUser);
}

// Extend string type to add custom email validation
addMethod(string, 'safeEmail', function safeEmail() {
  return this.lowercase().matches(/^\S+@\S+\.\S+$/, 'Must be a valid email address');
});

// Define a schema utilizing the custom method
const customSchema = object({
  contactEmail: string().safeEmail(),
});

// Function to validate data with custom schema
async function validateCustomUser(data) {
  try {
    const result = await customSchema.validate(data);
    console.log(result);
  } catch (err) {
    console.error(err.errors);
  }
}

// Main IIFE to test schema validations
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

  // Validating sample data
  await validateUser(sampleData);
  // Casting data with potential conversion
  castUserData({ name: 'Jane', age: '23', website: '' });

  // Testing custom email validation
  await validateCustomUser({ contactEmail: 'valid@example.com' });
  await validateCustomUser({ contactEmail: 'INVALIDEMAIL' });
})();
