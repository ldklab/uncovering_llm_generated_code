// Import necessary functions and classes from the 'yup' library
const yup = require('yup');

// Custom error messages for validation failures
yup.setLocale({
  mixed: {
    default: 'This field is invalid',
  },
  number: {
    min: 'This value should be greater than ${min}',
  },
});

// Define the schema for a User object
const userSchema = yup.object({
  name: yup.string().required(),
  age: yup.number().required().positive().integer(),
  email: yup.string().email(),
  website: yup.string().url().nullable(),
  createdOn: yup.date().default(() => new Date()),
});

// Function to validate user data asynchronously
async function validateUser(data) {
  try {
    const user = await userSchema.validate(data);
    console.log(user);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      console.error(err.errors);
    }
  }
}

// Function to transform or cast user data according to the schema
function castUserData(data) {
  const parsedUser = userSchema.cast(data);
  console.log(parsedUser);
}

// Extend yup with a custom string method for safe email validation
yup.addMethod(yup.string, 'safeEmail', function () {
  return this.lowercase().matches(/^\S+@\S+\.\S+$/, 'Must be a valid email address');
});

// Define the schema using the custom 'safeEmail' method for a contact email
const customSchema = yup.object({
  contactEmail: yup.string().safeEmail(),
});

// Function to validate data with the custom schema
async function validateCustomUser(data) {
  try {
    const result = await customSchema.validate(data);
    console.log(result);
  } catch (err) {
    console.error(err.errors);
  }
}

// Test various schemas and functions with sample data
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

  // Test the custom safeEmail validation
  await validateCustomUser({ contactEmail: 'valid@example.com' });
  await validateCustomUser({ contactEmail: 'INVALIDEMAIL' });
})();
