// Function to transform an ES6 class definition into a traditional function constructor pattern
function transformClassToFunction(code) {
  // Regular expressions to match class, constructor, and method syntaxes
  const classRegex = /class\s+(\w+)\s*\{/;
  const constructorRegex = /constructor\s*\(([^\)]*)\)\s*\{/;
  const methodRegex = /(\w+)\s*\(([^\)]*)\)\s*\{/g;

  let transformedCode = code;

  // Replace the class definition with function declaration
  transformedCode = transformedCode.replace(classRegex, (match, className) => {
    return `function ${className}() {\n`;
  });

  // Transform the constructor to an _init function call
  transformedCode = transformedCode.replace(constructorRegex, (match, args) => {
    return `${args ? `${args}, ` : ''}_init();\nfunction _init(${args}) {`;
  });

  // Transform class methods to prototype function definitions
  transformedCode = transformedCode.replace(methodRegex, (match, methodName, args) => {
    // Ensure it's not modifying the constructor method itself
    return `${methodName === 'constructor' ? '' : className + '.prototype.'}${methodName} = function(${args}) {`;
  });

  // Fix closing braces at the end of the code
  transformedCode = transformedCode.replace(/}\s*$/, '};\n}');

  // Return the transformed code
  return transformedCode;
}

// Example ES6 class to demonstrate the transformation
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

// Transforms the example class and logs the result
console.log(transformClassToFunction(es6Class));

// Export the transform function for use in other modules
module.exports = transformClassToFunction;
