/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  const ReactIs = require('react-is');

  const throwOnDirectAccess = true;
  const createTypeCheckers = require('./factoryWithTypeCheckers');
  
  module.exports = createTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
} else {
  const createThrowingShims = require('./factoryWithThrowingShims');
  
  module.exports = createThrowingShims();
}
