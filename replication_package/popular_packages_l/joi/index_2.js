// Import the Joi module for schema validation
const Joi = require('joi');

// Define a schema for validating user objects
const userSchema = Joi.object({
  // Username must be a string of 3-30 alphanumeric characters and is required
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  // Password must match the pattern of 3-30 alphanumeric characters and is required
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required(),

  // Birth year must be an integer between 1900 and 2013
  birth_year: Joi.number()
    .integer()
    .min(1900)
    .max(2013),

  // Email must be a valid email format
  email: Joi.string()
    .email()
});

// Example user data to be validated against the schema
const userData = {
  username: 'exampleUser',
  password: 'password123',
  birth_year: 1980,
  email: 'user@example.com'
};

// Validate the example user data with the defined schema
const { error, value } = userSchema.validate(userData);

// Log validation result - errors if any, or successful validation details
if (error) {
  console.log('Validation Error:', error.details);
} else {
  console.log('Validation Successful:', value);
}

// Export the userSchema for use in other parts of the application
module.exports = {
  userSchema
};
