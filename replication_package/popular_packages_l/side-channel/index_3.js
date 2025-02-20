// This script defines a `SideChannel` class which allows associating values with keys using a mechanism
// that employs either a `WeakMap` (when available) or a fallback storage mechanism. It provides methods
// to set, get, and check the presence of key-value associations, tailoring behavior based on whether
// `WeakMap` is supported and using a primitive storage technique otherwise.

class SideChannel {
  constructor() {
    // Detect availability of WeakMap for use in storing key-value pairs
    this.useWeakMap = typeof WeakMap !== 'undefined';
    // Initialize storage: use WeakMap if available, otherwise create a plain object
    this.store = this.useWeakMap ? new WeakMap() : Object.create(null);
  }

  // Associate a value with a key in the SideChannel
  set(key, value) {
    if (this.useWeakMap) {
      // Only objects and functions can be used as keys in a WeakMap
      if (this.isObjectType(key)) {
        this.store.set(key, value);
      } else {
        throw new TypeError('Invalid value used as weak map key');
      }
    } else {
      // Use a custom property in case WeakMap is not available
      key.__side_channel__ = value;
    }
  }

  // Retrieve a value associated with a key
  get(key) {
    if (this.useWeakMap) {
      return this.isObjectType(key) ? this.store.get(key) : undefined;
    } else {
      return key.__side_channel__;
    }
  }

  // Check if a key has an associated value
  has(key) {
    if (this.useWeakMap) {
      return this.isObjectType(key) && this.store.has(key);
    } else {
      return typeof key === 'object' && '__side_channel__' in key;
    }
  }

  // Utility method to check if a given value is usable as a WeakMap key (i.e., is an object or function)
  isObjectType(value) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
  }
}

module.exports = SideChannel;
