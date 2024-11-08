/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * Licensed under the MIT license available in the LICENSE file in the root directory.
 */

const ReactIs = process.env.NODE_ENV !== 'production' ? require('react-is') : null;
const throwOnDirectAccess = process.env.NODE_ENV !== 'production';

const moduleExport = process.env.NODE_ENV !== 'production'
  ? require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess)
  : require('./factoryWithThrowingShims')();

module.exports = moduleExport;
