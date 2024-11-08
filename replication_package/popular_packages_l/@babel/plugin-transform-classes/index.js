// simple-transform-classes.js

function transformClassToFunction(code) {
  const classRegex = /class\s+(\w+)\s*\{/;
  const constructorRegex = /constructor\s*\(([^\)]*)\)\s*\{/;
  const methodRegex = /(\w+)\s*\(([^\)]*)\)\s*\{/g;
  
  let transformedCode = code;
  
  // Find the class definition
  transformedCode = transformedCode.replace(classRegex, (match, className) => {
    return `function ${className}() {\n`;
  });

  // Find the constructor in the class
  transformedCode = transformedCode.replace(constructorRegex, (match, args) => {
    return `${args ? `${args}, ` : ''}_init();\nfunction _init(${args}) {`;
  });

  // Find the methods in the class
  transformedCode = transformedCode.replace(methodRegex, (match, methodName, args) => {
    return `${methodName === 'constructor' ? '' : `${className}.prototype.${methodName} = function(${args})`} {`;
  });

  // Closing curly braces of methods and classes
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
