var a = { foo: { bar: 'baz' } };
var b = structuredClone(a);
a.foo.bar = 'foo';
console.log(a); // { foo: { bar: 'foo' } }
console.log(b); // { foo: { bar: 'baz' } }
