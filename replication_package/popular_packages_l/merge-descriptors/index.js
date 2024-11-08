// merge-descriptors.js

function mergeDescriptors(destination, source, overwrite = true) {
  if (!source || typeof source !== 'object') {
    throw new TypeError('Source must be a non-null object');
  }
  if (!destination || typeof destination !== 'object') {
    throw new TypeError('Destination must be a non-null object');
  }

  const keys = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source));

  keys.forEach((key) => {
    if (!overwrite && key in destination) {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    Object.defineProperty(destination, key, descriptor);
  });

  return destination;
}

export default mergeDescriptors;
