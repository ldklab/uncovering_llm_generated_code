// Utilities for property and module manipulation
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setFunctionName = (fn, name) => {
  return defineProperty(fn, 'name', { value: name, configurable: true });
};

const exportFunctions = (target, functions) => {
  for (const name in functions) {
    defineProperty(target, name, { 
      get: functions[name], 
      enumerable: true 
    });
  }
};

const copyProperties = (target, source, exclude) => {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== exclude) {
        defineProperty(target, key, { 
          get: () => source[key], 
          enumerable: !(getOwnPropertyDescriptor(source, key) || {}).enumerable 
        });
      }
    }
  }
  return target;
};

const toCommonJSModule = (mod) => {
  return copyProperties(defineProperty({}, '__esModule', { value: true }), mod);
};

// Exported module structure
const exportsModule = {};
exportFunctions(exportsModule, {
  invalidFunction: () => invalidFunction,
  invalidProvider: () => invalidProvider,
});

module.exports = toCommonJSModule(exportsModule);

// Function definitions
const invalidFunction = setFunctionName((message) => {
  return () => {
    throw new Error(message);
  };
}, 'invalidFunction');

const invalidProvider = setFunctionName((message) => {
  return () => Promise.reject(message);
}, 'invalidProvider');
