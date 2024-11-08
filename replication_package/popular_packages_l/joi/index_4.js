// Import the Joi module for data validation
const Joi = require('joi');

// Define a Joi schema for validating user objects
const userSchema = Joi.object({
  username: Joi.string()                   // 'username' should be a string
    .alphanum()                            // It should only contain alphanumeric characters
    .min(3)                                // Minimum length of 3 characters
    .max(30)                               // Maximum length of 30 characters
    .required(),                           // This field is required

  password: Joi.string()                   // 'password' should be a string
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) // It should match the specified regex pattern
    .required(),                           // This field is required

  birth_year: Joi.number()                 // 'birth_year' should be a number
    .integer()                             // It should be an integer
    .min(1900)                             // Minimum value of 1900
    .max(2013),                            // Maximum value of 2013

  email: Joi.string()                      // 'email' should be a string
    .email()                               // It should be a valid email format
});

// Example user data to validate against the schema
const userData = {
  username: 'exampleUser',
  password: 'password123',
  birth_year: 1980,
  email: 'user@example.com'
};

// Validate the example data with the defined schema
const validation = userSchema.validate(userData);

// Output the validation result
if (validation.error) {
  // If there are validation errors, log them
  console.log('Validation Error:', validation.error.details);
} else {
  // If validation is successful, log the valid data
  console.log('Validation Successful:', validation.value);
}

// Export the user schema for use in other modules
module.exports = {
  userSchema
};
