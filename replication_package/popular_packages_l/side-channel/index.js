// side-channel.js
class SideChannel {
  constructor() {
    this.useWeakMap = typeof WeakMap !== 'undefined';
    this.store = this.useWeakMap ? new WeakMap() : Object.create(null);
  }

  // Method to associate a value with a key
  set(key, value) {
    if (this.useWeakMap) {
      if (this.isObjectType(key)) {
        this.store.set(key, value);
      } else {
        throw new TypeError('Invalid value used as weak map key');
      }
    } else {
      key.__side_channel__ = value;
    }
  }

  // Method to retrieve a value associated with a key
  get(key) {
    if (this.useWeakMap) {
      if (this.isObjectType(key)) {
        return this.store.get(key);
      } else {
        return undefined;
      }
    } else {
      return key.__side_channel__;
    }
  }

  // Method to check if a value is associated with a key
  has(key) {
    if (this.useWeakMap) {
      return this.isObjectType(key) && this.store.has(key);
    } else {
      return typeof key === 'object' && '__side_channel__' in key;
    }
  }

  // Utility to check if a value is an object or function and thus can be used as a key in a WeakMap
  isObjectType(value) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
  }
}

module.exports = SideChannel;
