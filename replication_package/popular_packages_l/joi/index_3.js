// Import the Joi validation library
const Joi = require('joi');

// Define a validation schema for a user object
const userValidator = Joi.object({
  username: Joi.string() // Username must be a string
    .alphanum()          // Must contain only alphanumeric characters
    .min(3)              // Must be at least 3 characters long
    .max(30)             // Must be no longer than 30 characters
    .required(),         // Is a required field

  password: Joi.string() // Password must be a string
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) // Must match the pattern
    .required(),         // Is a required field

  birth_year: Joi.number() // Birth year must be a number
    .integer()             // Must be an integer
    .min(1900)             // Must not be earlier than 1900
    .max(2013),            // Must not be later than 2013

  email: Joi.string()     // Email must be a string
    .email()              // Must be a valid email format
});

// Sample data to validate
const sampleUser = {
  username: 'exampleUser',         // User's username
  password: 'password123',         // User's password
  birth_year: 1980,                // User's birth year
  email: 'user@example.com'        // User's email address
};

// Validate the sample data with the defined schema
const result = userValidator.validate(sampleUser);

// Check the result of the validation
if (result.error) {
  console.log('Validation Error:', result.error.details); // Display validation errors if any
} else {
  console.log('Validation Successful:', result.value);    // Display validated data if successful
}

// Export the user validator for use in other modules
module.exports = {
  userValidator
};
