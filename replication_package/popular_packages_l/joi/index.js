// Import the Joi module
const Joi = require('joi');

// Define a schema for a user object
const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required(),

  birth_year: Joi.number()
    .integer()
    .min(1900)
    .max(2013),

  email: Joi.string()
    .email()
});

// Example data object to validate
const userData = {
  username: 'exampleUser',
  password: 'password123',
  birth_year: 1980,
  email: 'user@example.com'
};

// Validate the data against the schema
const validation = userSchema.validate(userData);

// Check for validation errors
if (validation.error) {
  console.log('Validation Error:', validation.error.details);
} else {
  console.log('Validation Successful:', validation.value);
}

module.exports = {
  userSchema
};
