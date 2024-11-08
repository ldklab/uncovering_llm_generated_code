class MetadataMap {
  constructor() {
    this.map = new Map();
  }
  
  set(property, metaKey, metaValue) {
    if (!this.map.has(property)) {
      this.map.set(property, new Map());
    }
    this.map.get(property).set(metaKey, metaValue);
  }

  get(property, metaKey) {
    return this.map.has(property) ? this.map.get(property).get(metaKey) : undefined;
  }

  has(property, metaKey) {
    return this.map.has(property) && this.map.get(property).has(metaKey);
  }
  
  keys(property) {
    return this.map.has(property) ? Array.from(this.map.get(property).keys()) : [];
  }

  delete(property, metaKey) {
    if (this.map.has(property)) {
      return this.map.get(property).delete(metaKey);
    }
    return false;
  }
}

const metadataStore = new WeakMap();

function ensureMetadataMap(target) {
  if (!metadataStore.has(target)) {
    metadataStore.set(target, new MetadataMap());
  }
}

const Reflect = globalThis.Reflect || {}; 

Reflect.defineMetadata = function (metadataKey, metadataValue, target, propertyKey = 'default') {
  ensureMetadataMap(target);
  metadataStore.get(target).set(propertyKey, metadataKey, metadataValue);
};

Reflect.hasMetadata = function (metadataKey, target, propertyKey = 'default') {
  while (target !== null) {
    if (Reflect.hasOwnMetadata(metadataKey, target, propertyKey)) {
      return true;
    }
    target = Object.getPrototypeOf(target);
  }
  return false;
};

Reflect.hasOwnMetadata = function (metadataKey, target, propertyKey = 'default') {
  ensureMetadataMap(target);
  return metadataStore.get(target).has(propertyKey, metadataKey);
};

Reflect.getMetadata = function (metadataKey, target, propertyKey = 'default') {
  while (target !== null) {
    const result = Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    if (result !== undefined) {
      return result;
    }
    target = Object.getPrototypeOf(target);
  }
  return undefined;
};

Reflect.getOwnMetadata = function (metadataKey, target, propertyKey = 'default') {
  ensureMetadataMap(target);
  return metadataStore.get(target).get(propertyKey, metadataKey);
};

Reflect.getMetadataKeys = function (target, propertyKey = 'default') {
  const keys = new Set();
  while (target !== null) {
    for (const key of Reflect.getOwnMetadataKeys(target, propertyKey)) {
      keys.add(key);
    }
    target = Object.getPrototypeOf(target);
  }
  return [...keys];
};

Reflect.getOwnMetadataKeys = function (target, propertyKey = 'default') {
  ensureMetadataMap(target);
  return metadataStore.get(target).keys(propertyKey);
};

Reflect.deleteMetadata = function (metadataKey, target, propertyKey = 'default') {
  ensureMetadataMap(target);
  return metadataStore.get(target).delete(propertyKey, metadataKey);
};

if (!globalThis.Reflect) {
  globalThis.Reflect = Reflect;
}

export default Reflect;
