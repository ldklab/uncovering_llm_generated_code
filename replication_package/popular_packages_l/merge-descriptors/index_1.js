function mergeDescriptors(dest, src, overwrite = true) {
  if (src === null || typeof src !== 'object') {
    throw new TypeError('Source must be a non-null object');
  }
  if (dest === null || typeof dest !== 'object') {
    throw new TypeError('Destination must be a non-null object');
  }

  const propertyKeys = [...Object.getOwnPropertyNames(src), ...Object.getOwnPropertySymbols(src)];

  for (const propertyKey of propertyKeys) {
    if (!overwrite && propertyKey in dest) {
      continue;
    }
    const propDescriptor = Object.getOwnPropertyDescriptor(src, propertyKey);
    Object.defineProperty(dest, propertyKey, propDescriptor);
  }

  return dest;
}

export default mergeDescriptors;
