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

Reflect.defineMetadata = function (metadataKey, metadataValue, target, propertyKey) {
  ensureMetadataMap(target);
  metadataStore.get(target).set(propertyKey || 'default', metadataKey, metadataValue);
};

Reflect.hasMetadata = function (metadataKey, target, propertyKey) {
  while (target !== null) {
    if (Reflect.hasOwnMetadata(metadataKey, target, propertyKey)) {
      return true;
    }
    target = Object.getPrototypeOf(target);
  }
  return false;
};

Reflect.hasOwnMetadata = function (metadataKey, target, propertyKey) {
  ensureMetadataMap(target);
  return metadataStore.get(target).has(propertyKey || 'default', metadataKey);
};

Reflect.getMetadata = function (metadataKey, target, propertyKey) {
  while (target !== null) {
    const result = Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    if (result !== undefined) {
      return result;
    }
    target = Object.getPrototypeOf(target);
  }
  return undefined;
};

Reflect.getOwnMetadata = function (metadataKey, target, propertyKey) {
  ensureMetadataMap(target);
  return metadataStore.get(target).get(propertyKey || 'default', metadataKey);
};

Reflect.getMetadataKeys = function (target, propertyKey) {
  const keys = new Set();
  while (target !== null) {
    Reflect.getOwnMetadataKeys(target, propertyKey).forEach(key => keys.add(key));
    target = Object.getPrototypeOf(target);
  }
  return [...keys];
};

Reflect.getOwnMetadataKeys = function (target, propertyKey) {
  ensureMetadataMap(target);
  return metadataStore.get(target).keys(propertyKey || 'default');
};

Reflect.deleteMetadata = function (metadataKey, target, propertyKey) {
  ensureMetadataMap(target);
  return metadataStore.get(target).delete(propertyKey || 'default', metadataKey);
};

if (!globalThis.Reflect) {
  globalThis.Reflect = Reflect;
}

export default Reflect;
