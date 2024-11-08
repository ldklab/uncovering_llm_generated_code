'use strict';

const testPrototype = {
	__proto__: null,
	foo: {}
};

const GlobalObject = Object;

module.exports = function checkProtoInheritance() {
	// Purposefully ignoring TypeScript error regarding inherited property
	return { __proto__: testPrototype }.foo === testPrototype.foo
		&& !(testPrototype instanceof GlobalObject);
};
