// Import the required SWC core module for code transformation
const swc = require("@swc/core");

// Define a function to compile JavaScript code
/**
 * Compiles the given source code using SWC.
 *
 * @param {string} code - The JavaScript source code to compile.
 * @param {object} [options] - Optional SWC compile options.
 * @returns {string} - The compiled JavaScript code.
 */
function compileCode(code, options = {}) {
  // Default compilation options
  const defaultOptions = {
    jsc: {
      parser: {
        syntax: "ecmascript", // Specify ECMAScript parsing
        jsx: false, // Disable JSX support
      },
      target: "es2015", // Set target ECMAScript version
    },
    module: {
      type: "commonjs", // Output format
    },
  };

  // Compile code using SWC and return compiled output
  return swc.transformSync(code, { ...defaultOptions, ...options }).code;
}

// Export the compileCode function for external usage
module.exports = {
  compileCode
};

// Example usage: Compile and log JavaScript code
const jsCode = 'const add = (a, b) => a + b;';
const compiledCode = compileCode(jsCode);
console.log(compiledCode);

// Performance benchmarking using the performance hooks API
const { performance, PerformanceObserver } = require("perf_hooks");

// Sample code for benchmarking
const code = `let x = 10; for(let i = 0; i < x; i++) { console.log(i); }`;

const obs = new PerformanceObserver((list) => {
  console.log(list.getEntries()[0].duration);
  obs.disconnect();
});
obs.observe({ entryTypes: ["measure"] });

performance.mark("start");
compileCode(code); // Compile the code
performance.mark("end");
performance.measure("Compile Time", "start", "end");
