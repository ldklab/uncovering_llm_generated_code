/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const ReactIs = isDevelopment ? require('react-is') : null;
const throwOnDirectAccess = true;

if (isDevelopment) {
  module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
} else {
  module.exports = require('./factoryWithThrowingShims')();
}
