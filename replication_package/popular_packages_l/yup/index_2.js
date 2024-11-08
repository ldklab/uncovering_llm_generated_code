// Import the necessary components from the 'yup' library for creating schemas and validation
const {
  string,
  number,
  date,
  object,
  ValidationError,
  addMethod,
  setLocale,
} = require('yup');

// Set custom local error messages for validation
setLocale({
  mixed: {
    default: 'This field is invalid',
  },
  number: {
    min: 'This value should be greater than ${min}',
  },
});

// Define a user schema with various fields and validation constraints
let userSchema = object({
  name: string().required(),                          // Name must be a non-empty string
  age: number().required().positive().integer(),       // Age must be a positive integer
  email: string().email(),                             // Email must be a valid email format
  website: string().url().nullable(),                  // Website must be a valid URL, can be null
  createdOn: date().default(() => new Date()),         // Default created date to current date
});

// Function to asynchronously validate a user object against the schema
async function validateUser(data) {
  try {
    const user = await userSchema.validate(data);
    console.log(user);  // If valid, log the user object
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(err.errors);  // Log validation errors
    }
  }
}

// Function to cast and convert data types in the user object
function castUserData(data) {
  const parsedUser = userSchema.cast(data);
  console.log(parsedUser);  // Log the casted user object
}

// Add a custom validation method to strings to ensure they are valid email addresses
addMethod(string, 'safeEmail', function safeEmail() {
  return this.lowercase().matches(/^\S+@\S+\.\S+$/, 'Must be a valid email address');
});

// Define a custom schema using the new validation method for emails
let customSchema = object({
  contactEmail: string().safeEmail(),
});

// Asynchronous function to validate the specially structured data
async function validateCustomUser(data) {
  try {
    const result = await customSchema.validate(data);
    console.log(result);  // Log valid data
  } catch (err) {
    console.error(err.errors);  // Log errors
  }
}

// Test the schema and validation methods with example data
(async () => {
  const validUserData = {
    name: 'John Doe',
    age: 29,
    email: 'john.doe@example.com',
    website: 'https://johndoe.com',
  };

  const invalidUserData = {
    name: 'John Doe',
    age: 29,
    email: 'not-an-email',
  };

  await validateUser(validUserData);  // Validate valid user data
  castUserData({ name: 'Jane', age: '23', website: '' });  // Cast data types

  // Test the custom email validation method
  await validateCustomUser({ contactEmail: 'valid@example.com' });
  await validateCustomUser({ contactEmail: 'INVALIDEMAIL' });  // Trigger validation error
})();
