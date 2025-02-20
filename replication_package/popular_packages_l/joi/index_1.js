// Import the Joi module for data validation
const Joi = require('joi');

// Define a validation schema for a user object
const userSchema = Joi.object({
  // Username must be an alphanumeric string between 3 and 30 characters
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  // Password must match a regex pattern allowing alphanumeric characters, 3-30 in length
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required(),

  // Birth year should be an integer between 1900 and 2013
  birth_year: Joi.number()
    .integer()
    .min(1900)
    .max(2013),

  // Email must be a valid email address format
  email: Joi.string()
    .email()
});

// Create an example user data object for validation
const userData = {
  username: 'exampleUser',
  password: 'password123',
  birth_year: 1980,
  email: 'user@example.com'
};

// Validate the example data object against the defined schema
const validation = userSchema.validate(userData);

// Check if there is a validation error
if (validation.error) {
  // Output validation error details if present
  console.log('Validation Error:', validation.error.details);
} else {
  // Output validated data if successful
  console.log('Validation Successful:', validation.value);
}

// Export the user schema for use in other modules
module.exports = {
  userSchema
};
