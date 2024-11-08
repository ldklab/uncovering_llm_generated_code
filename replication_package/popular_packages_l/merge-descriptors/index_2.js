function mergeDescriptors(destination, source, overwrite = true) {
  if (typeof source !== 'object' || source === null) {
    throw new TypeError('Source must be a non-null object');
  }
  if (typeof destination !== 'object' || destination === null) {
    throw new TypeError('Destination must be a non-null object');
  }

  const sourceKeys = [
    ...Object.getOwnPropertyNames(source),
    ...Object.getOwnPropertySymbols(source)
  ];

  sourceKeys.forEach((key) => {
    if (!(overwrite || !(key in destination))) {
      return;
    }
    const propertyDescriptor = Object.getOwnPropertyDescriptor(source, key);
    Object.defineProperty(destination, key, propertyDescriptor);
  });

  return destination;
}

export default mergeDescriptors;
