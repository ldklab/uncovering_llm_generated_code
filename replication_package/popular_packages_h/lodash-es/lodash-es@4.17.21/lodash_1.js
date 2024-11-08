// Import and export modules in an organized manner to create a custom build of Lodash in ES module format.

export { default as add } from './add.js';
export { default as after } from './after.js';
export { default as ary } from './ary.js';
//... (other utility functions)
export { default as zipObjectDeep } from './zipObjectDeep.js';
export { default as zipWith } from './zipWith.js';

// Set the default export to be a bundled Lodash default module
export { default } from './lodash.default.js';
