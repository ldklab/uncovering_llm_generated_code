/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const ReactIs = require('react-is');
  const throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
} else {
  module.exports = require('./factoryWithThrowingShims')();
}
