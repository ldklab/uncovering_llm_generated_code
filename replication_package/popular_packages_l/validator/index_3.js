// validator.js

// Checks if a string is a valid email format
function isEmail(str) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

// Checks if a string contains only alphabetic characters
function isAlpha(str, locale = 'en-US', options = {}) {
  let alphaRegex;
  switch (locale) {
    case 'en-US':
      alphaRegex = /^[A-Za-z]+$/;
      break;
    // Default locale case can be extended with more locales if necessary
    default:
      alphaRegex = /^[A-Za-z]+$/;
  }
  
  if (options.ignore) {
    alphaRegex = new RegExp(`^[${alphaRegex.source}${options.ignore}]+$`);
  }
  
  return alphaRegex.test(str);
}

// Checks if a string represents a numeric value
function isNumeric(str, options = { no_symbols: false }) {
  const numericRegex = options.no_symbols ? /^[0-9]+$/ : /^[+-]?[0-9]+(\.[0-9]+)?$/;
  return numericRegex.test(str);
}

// Example usage
console.log(isEmail('test@example.com')); // true
console.log(isAlpha('hello', 'en-US')); // true
console.log(isNumeric('123')); // true

// Module exports
module.exports = {
  isEmail,
  isAlpha,
  isNumeric
};
