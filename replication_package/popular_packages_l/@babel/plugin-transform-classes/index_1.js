// simple-transform-classes.js

function transformClassToFunction(code) {
  const classRegex = /class\s+(\w+)\s*\{/;
  const constructorRegex = /constructor\s*\(([^\)]*)\)\s*\{/;
  const methodRegex = /(\w+)\s*\(([^\)]*)\)\s*\{/g;

  let transformedCode = code;
  let className = '';

  // Replace class definition with function definition
  transformedCode = transformedCode.replace(classRegex, (match, cName) => {
    className = cName;
    return `function ${className}() {\n`;
  });

  // Replace constructor with _init function inside the main function
  transformedCode = transformedCode.replace(constructorRegex, (match, args) => {
    return `${args ? `${args}, ` : ''}_init();\nfunction _init(${args}) {`;
  });

  // Convert methods to prototype assignments
  transformedCode = transformedCode.replace(methodRegex, (match, methodName, args) => {
    return `${methodName === 'constructor' ? '' : `${className}.prototype.${methodName} = function(${args})`} {`;
  });

  // Properly format closing braces
  transformedCode = transformedCode.replace(/}\s*$/, '};\n}');

  return transformedCode;
}

// Example usage:
const es6Class = `
class Example {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  greet() {
    return 'Hello ' + this.a;
  }
}
`;

console.log(transformClassToFunction(es6Class));

module.exports = transformClassToFunction;
