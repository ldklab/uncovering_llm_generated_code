const { compileCode } = require('swc-node-compiler');

const jsCode = 'const add = (a, b) => a + b;';
const compiledCode = compileCode(jsCode);

console.log(compiledCode);
```

## Implementation



// src/index.js

const swc = require("@swc/core");

/**
 * Compiles the given JavaScript or TypeScript code using swc.
 * 
 * @param {string} code - The source code to be compiled.
 * @param {object} [options] - Optional swc compile options.
 * @returns {string} - The compiled JavaScript code.
 */
function compileCode(code, options = {}) {
  const defaultOptions = {
    jsc: {
      parser: {
        syntax: "ecmascript",
        jsx: false,
      },
      target: "es2015",
    },
    module: {
      type: "commonjs",
    },
  };

  return swc.transformSync(code, { ...defaultOptions, ...options }).code;
}

module.exports = {
  compileCode
};
```

## Performance Benchmarking

To assess performance, you may conduct benchmarks using Node.js. Here's a simple example using the `perf_hooks` module:



// test/performance.js

const { performance, PerformanceObserver } = require("perf_hooks");
const { compileCode } = require("../src");

const code = `let x = 10; for(let i = 0; i < x; i++) { console.log(i); }`;

const obs = new PerformanceObserver((list) => {
  console.log(list.getEntries()[0].duration);
  obs.disconnect();
});
obs.observe({ entryTypes: ["measure"] });

performance.mark("start");

compileCode(code);

performance.mark("end");
performance.measure("Compile Time", "start", "end");
```

## Contributing

Pull requests and issue reporting are welcome. Please see our [CONTRIBUTING.md](CONTRIBUTING.md) guidelines for more information.

## License

Licensed under the MIT License.
```

This is a simple and basic implementation to illustrate the described functionality, focusing on utilizing swc for fast JavaScript and TypeScript compilation. It demonstrates how to use the package and includes a basic performance testing script.