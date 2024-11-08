const ReactIs = process.env.NODE_ENV !== 'production' ? require('react-is') : null;
const throwOnDirectAccess = process.env.NODE_ENV !== 'production';

module.exports = process.env.NODE_ENV !== 'production'
  ? require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess)
  : require('./factoryWithThrowingShims')();
