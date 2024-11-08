const _ = require('lodash');

const original = { foo: { bar: 'baz' } };
const deepCopy = _.cloneDeep(original);

original.foo.bar = 'foo';

console.log(original); // { foo: { bar: 'foo' } }
console.log(deepCopy); // { foo: { bar: 'baz' } }
