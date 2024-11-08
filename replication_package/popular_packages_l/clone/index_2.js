const { cloneDeep } = require('lodash');
const a = { foo: { bar: 'baz' } };
const b = cloneDeep(a);
a.foo.bar = 'foo';
console.log(a); // { foo: { bar: 'foo' } }
console.log(b); // { foo: { bar: 'baz' } }
