// simple-transform-classes.js

function transformClassToFunction(code) {
  const classRegex = /class\s+(\w+)\s*\{/;
  const constructorRegex = /constructor\s*\(([^\)]*)\)\s*\{/;
  const methodRegex = /(\w+)\s*\(([^\)]*)\)\s*\{/g;

  // Transform the class-based code to a function-based code
  let transformedCode = code;

  // Transform the class definition to a function declaration
  transformedCode = transformedCode.replace(classRegex, (match, className) => {
    return `function ${className}() {\n`;
  });

  // Transform the constructor to an initialization function call
  transformedCode = transformedCode.replace(constructorRegex, (match, args) => {
    return `${args ? `${args}, ` : ''}_init();\nfunction _init(${args}) {`;
  });

  // Transform methods to prototype-based functions
  transformedCode = transformedCode.replace(methodRegex, (match, methodName, args, offset, string) => {
    const classMatch = classRegex.exec(string);
    if (classMatch) {
      const className = classMatch[1];
      return `${methodName === 'constructor' ? '' : `${className}.prototype.${methodName} = function(${args})`} {`;
    }
    return match;
  });

  // Adjust closing braces for methods and the end of the class
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
