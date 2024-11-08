const cloneDeep = require('lodash.clonedeep');

const originalObject = { nested: { key: 'initial' } };
const clonedObject = cloneDeep(originalObject);

originalObject.nested.key = 'updated';

console.log(originalObject); // { nested: { key: 'updated' } }
console.log(clonedObject);  // { nested: { key: 'initial' } }
