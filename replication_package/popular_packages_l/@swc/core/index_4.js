// Import the SWC core library for JavaScript/TypeScript compilation
const swc = require("@swc/core");

/**
 * Compiles the given JavaScript or TypeScript code using SWC.
 * 
 * @param {string} code - The source code to be compiled.
 * @param {object} [options] - Optional SWC compile options.
 * @returns {string} - The compiled JavaScript code.
 */
function compileCode(code, options = {}) {
  // Define default options for the SWC compilation
  const defaultOptions = {
    jsc: {
      parser: {
        syntax: "ecmascript",  // Specify the syntax as ECMAScript
        jsx: false,            // Disable JSX parsing
      },
      target: "es2015",        // Target ECMAScript 2015
    },
    module: {
      type: "commonjs",        // Specify module type as CommonJS
    },
  };

  // Compile the code using SWC and return the compiled code
  return swc.transformSync(code, { ...defaultOptions, ...options }).code;
}

// Example JavaScript code to be compiled
const jsCode = 'const add = (a, b) => a + b;';

// Compile the example JavaScript code
const compiledCode = compileCode(jsCode);

// Output the compiled code to the console
console.log(compiledCode);

// Performance testing using Node.js 'perf_hooks'
const { performance, PerformanceObserver } = require("perf_hooks");

// Code to compile for performance testing
const performanceCode = `let x = 10; for(let i = 0; i < x; i++) { console.log(i); }`;

// Set up performance observer to measure the compile time
const obs = new PerformanceObserver((list) => {
  console.log(list.getEntries()[0].duration);
  obs.disconnect();
});
obs.observe({ entryTypes: ["measure"] });

// Start measuring performance
performance.mark("start");

// Compile the code for performance testing
compileCode(performanceCode);

// End measuring performance
performance.mark("end");
performance.measure("Compile Time", "start", "end");

module.exports = {
  compileCode
};
