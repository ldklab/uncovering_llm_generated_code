const { parseQueryString } = require('@smithy/querystring-parser');

function defineProperty(target, name, descriptor) {
  Object.defineProperty(target, name, descriptor);
}

function getOwnPropertyDescriptor(object, propertyName) {
  return Object.getOwnPropertyDescriptor(object, propertyName);
}

function getOwnPropertyNames(object) {
  return Object.getOwnPropertyNames(object);
}

function hasOwnProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function nameFunction(target, value) {
  defineProperty(target, 'name', { value, configurable: true });
}

function exportProperties(targetObject, properties) {
  for (const name in properties) {
    defineProperty(targetObject, name, { get: properties[name], enumerable: true });
  }
}

function copyProperties(to, from, except, descriptor) {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(from, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return to;
}

function toCommonJS(module) {
  return copyProperties(defineProperty({}, '__esModule', { value: true }), module);
}

// src/index.ts
const srcExports = {};
exportProperties(srcExports, {
  parseUrl: () => parseUrl,
});
module.exports = toCommonJS(srcExports);

function parseUrl(url) {
  if (typeof url === 'string') {
    return parseUrl(new URL(url));
  }
  
  const { hostname, pathname, port, protocol, search } = url;
  let query;
  if (search) {
    query = parseQueryString(search);
  }
  return {
    hostname,
    port: port ? parseInt(port) : undefined,
    protocol,
    path: pathname,
    query,
  };
}
nameFunction(parseUrl, 'parseUrl');
