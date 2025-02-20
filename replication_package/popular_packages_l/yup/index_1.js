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

// Setting custom error messages for validation
setLocale({
  mixed: {
    default: 'This field is invalid',
  },
  number: {
    min: 'This value should be greater than ${min}',
  },
});

// Defining a user schema for validating user data
const userSchema = object({
  name: string().required(), // User must have a name
  age: number().required().positive().integer(), // Age must be a positive integer
  email: string().email(), // Email must be a valid email format
  website: string().url().nullable(), // Website must be a valid URL, can be null
  createdOn: date().default(() => new Date()), // Default to current date if not provided
});

// Function to asynchronously validate user data
async function validateUser(data) {
  try {
    const user = await userSchema.validate(data);
    console.log(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(err.errors); // Log validation errors
    }
  }
}

// Function to cast data into schema format without validating
function castUserData(data) {
  const parsedUser = userSchema.cast(data);
  console.log(parsedUser); // Log the cast data
}

// Extending string schema to include a custom 'safeEmail' method
addMethod(string, 'safeEmail', function () {
  return this.lowercase().matches(/^\S+@\S+\.\S+$/, 'Must be a valid email address');
});

// Custom schema using the new 'safeEmail' method
const customSchema = object({
  contactEmail: string().safeEmail(),
});

// Function to validate data against the custom schema
async function validateCustomUser(data) {
  try {
    const result = await customSchema.validate(data);
    console.log(result);
  } catch (err) {
    console.error(err.errors); // Log validation errors
  }
}

// Running validation checks
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

  // Testing custom email validation
  await validateCustomUser({ contactEmail: 'valid@example.com' });
  await validateCustomUser({ contactEmail: 'INVALIDEMAIL' });
})();
