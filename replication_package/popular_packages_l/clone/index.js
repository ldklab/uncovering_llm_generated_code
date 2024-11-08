var clone = require('clone');
var a = { foo: { bar: 'baz' } };
var b = clone(a);
a.foo.bar = 'foo';
console.log(a); // { foo: { bar: 'foo' } }
console.log(b); // { foo: { bar: 'baz' } }
