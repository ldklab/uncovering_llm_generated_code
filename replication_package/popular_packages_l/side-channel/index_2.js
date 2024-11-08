// side-channel.js
class SideChannel {
  constructor() {
    this.supportsWeakMap = typeof WeakMap !== 'undefined';
    this.storage = this.supportsWeakMap ? new WeakMap() : Object.create(null);
  }

  set(key, value) {
    if (this.supportsWeakMap) {
      if (this.isValidWeakMapKey(key)) {
        this.storage.set(key, value);
      } else {
        throw new TypeError('WeakMap keys must be objects or functions');
      }
    } else {
      key.__side_channel_id__ = value;
    }
  }

  get(key) {
    if (this.supportsWeakMap) {
      if (this.isValidWeakMapKey(key)) {
        return this.storage.get(key);
      } else {
        return undefined;
      }
    } else {
      return key.__side_channel_id__;
    }
  }

  has(key) {
    if (this.supportsWeakMap) {
      return this.isValidWeakMapKey(key) ? this.storage.has(key) : false;
    } else {
      return typeof key === 'object' && key !== null && '__side_channel_id__' in key;
    }
  }

  isValidWeakMapKey(value) {
    const valueType = typeof value;
    return value !== null && (valueType === 'object' || valueType === 'function');
  }
}

module.exports = SideChannel;
