// side-channel.js
class SideChannel {
  constructor() {
    // Determines whether WeakMap can be used (available in environment)
    this.useWeakMap = typeof WeakMap !== 'undefined';
    // Initializes store as either a WeakMap or a plain object
    this.store = this.useWeakMap ? new WeakMap() : Object.create(null);
  }

  // Associate a value with a key
  set(key, value) {
    if (this.useWeakMap) {
      // Check if the key is suitable for a WeakMap (object or function)
      if (this.isObjectType(key)) {
        this.store.set(key, value);
      } else {
        throw new TypeError('Invalid value used as weak map key');
      }
    } else {
      // Associate the value directly on the object key
      key.__side_channel__ = value;
    }
  }

  // Retrieve the value associated with a key
  get(key) {
    if (this.useWeakMap) {
      // Return value if key is suitable object for WeakMap, else undefined
      if (this.isObjectType(key)) {
        return this.store.get(key);
      }
      return undefined;
    } else {
      // Retrieve value from object property
      return key.__side_channel__;
    }
  }

  // Check if a key-value association exists
  has(key) {
    if (this.useWeakMap) {
      // Check existence only for valid object keys in WeakMap
      return this.isObjectType(key) && this.store.has(key);
    } else {
      // Check presence of property in object key
      return typeof key === 'object' && '__side_channel__' in key;
    }
  }

  // Determine if a value can be a WeakMap key (should be object or function)
  isObjectType(value) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
  }
}

module.exports = SideChannel;
