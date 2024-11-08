/**
 * Conditional module export based on environment setting.
 * Different behaviors for development and production environments.
 */

if (process.env.NODE_ENV !== 'production') {
  const ReactIs = require('react-is');

  // Use prop-types in development for enhanced type checking
  const throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
} else {
  // Use simpler production behavior for prop-types
  module.exports = require('./factoryWithThrowingShims')();
}
