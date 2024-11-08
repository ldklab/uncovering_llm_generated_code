function mergeDescriptors(destination, source, overwrite = true) {
  if (typeof source !== 'object' || source === null) {
    throw new TypeError('Source must be a non-null object');
  }

  if (typeof destination !== 'object' || destination === null) {
    throw new TypeError('Destination must be a non-null object');
  }

  const keys = [
    ...Object.getOwnPropertyNames(source), 
    ...Object.getOwnPropertySymbols(source)
  ];

  for (const key of keys) {
    if (!overwrite && key in destination) {
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    Object.defineProperty(destination, key, descriptor);
  }

  return destination;
}

export default mergeDescriptors;
