"use strict";

export { computeAccessibleDescription } from './accessible-description';
export { computeAccessibleName } from './accessible-name';

import getRoleModule from './getRole';
export const getRole = getRoleModule.default;
