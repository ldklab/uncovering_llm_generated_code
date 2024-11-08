// side-channel.js
class SideChannel {
  constructor() {
    // Determine if the environment supports WeakMap and use it if possible
    this.supportsWeakMap = typeof WeakMap !== 'undefined';
    // Store will be a WeakMap or a plain object depending on environment support
    this.storage = this.supportsWeakMap ? new WeakMap() : Object.create(null);
  }

  // Method to associate a value with a key
  set(key, value) {
    if (this.supportsWeakMap) {
      // When using WeakMap, ensure the key is an object or function
      if (this.isObjectOrFunction(key)) {
        this.storage.set(key, value);
      } else {
        throw new TypeError('The key must be an object or function to use WeakMap');
      }
    } else {
      // If not using WeakMap, attach the value to the object using a unique property
      key.__sideChannelProp__ = value;
    }
  }

  // Method to retrieve a value associated with a key
  get(key) {
    if (this.supportsWeakMap) {
      // Return the value if the key is of correct type and exists
      return this.isObjectOrFunction(key) ? this.storage.get(key) : undefined;
    } else {
      // Retrieve the value from a property if WeakMap is not used
      return key.__sideChannelProp__;
    }
  }

  // Method to check if a value is associated with a key
  has(key) {
    if (this.supportsWeakMap) {
      // Check existence in WeakMap, ensuring key type is correct
      return this.isObjectOrFunction(key) && this.storage.has(key);
    } else {
      // Verify the existence of the property on the object
      return typeof key === 'object' && '__sideChannelProp__' in key;
    }
  }

  // Helper to determine if a value is suitable for use in a WeakMap (object or function)
  isObjectOrFunction(value) {
    const valueType = typeof value;
    return value !== null && (valueType === 'object' || valueType === 'function');
  }
}

module.exports = SideChannel;
