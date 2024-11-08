"use strict";

import v1Default from './v1.js';
import v3Default from './v3.js';
import v4Default from './v4.js';
import v5Default from './v5.js';
import nilDefault from './nil.js';
import versionDefault from './version.js';
import validateDefault from './validate.js';
import stringifyDefault from './stringify.js';
import parseDefault from './parse.js';

export const v1 = v1Default;
export const v3 = v3Default;
export const v4 = v4Default;
export const v5 = v5Default;
export const NIL = nilDefault;
export const version = versionDefault;
export const validate = validateDefault;
export const stringify = stringifyDefault;
export const parse = parseDefault;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
