class MetadataMap {
  constructor() {
    this.maps = new Map();
  }
  
  set(property, key, value) {
    if (!this.maps.has(property)) {
      this.maps.set(property, new Map());
    }
    this.maps.get(property).set(key, value);
  }

  get(property, key) {
    return this.maps.has(property) ? this.maps.get(property).get(key) : undefined;
  }

  has(property, key) {
    return this.maps.has(property) && this.maps.get(property).has(key);
  }
  
  keys(property) {
    return this.maps.has(property) ? Array.from(this.maps.get(property).keys()) : [];
  }

  delete(property, key) {
    if (this.maps.has(property)) {
      return this.maps.get(property).delete(key);
    }
    return false;
  }
}

// Internal metadata storage using WeakMap
const internalMetadataStore = new WeakMap();

// Helper to initialize metadata map for a target
function initializeMetadataMap(target) {
  if (!internalMetadataStore.has(target)) {
    internalMetadataStore.set(target, new MetadataMap());
  }
}

const Reflect = globalThis.Reflect || {}; 

Reflect.defineMetadata = function (key, value, target, property) {
  initializeMetadataMap(target);
  internalMetadataStore.get(target).set(property || 'default', key, value);
};

Reflect.hasMetadata = function (key, target, property) {
  while (target !== null) {
    if (Reflect.hasOwnMetadata(key, target, property)) {
      return true;
    }
    target = Object.getPrototypeOf(target);
  }
  return false;
};

Reflect.hasOwnMetadata = function (key, target, property) {
  initializeMetadataMap(target);
  return internalMetadataStore.get(target).has(property || 'default', key);
};

Reflect.getMetadata = function (key, target, property) {
  while (target !== null) {
    const data = Reflect.getOwnMetadata(key, target, property);
    if (data !== undefined) {
      return data;
    }
    target = Object.getPrototypeOf(target);
  }
  return undefined;
};

Reflect.getOwnMetadata = function (key, target, property) {
  initializeMetadataMap(target);
  return internalMetadataStore.get(target).get(property || 'default', key);
};

Reflect.getMetadataKeys = function (target, property) {
  const keysSet = new Set();
  while (target !== null) {
    Reflect.getOwnMetadataKeys(target, property).forEach(key => keysSet.add(key));
    target = Object.getPrototypeOf(target);
  }
  return [...keysSet];
};

Reflect.getOwnMetadataKeys = function (target, property) {
  initializeMetadataMap(target);
  return internalMetadataStore.get(target).keys(property || 'default');
};

Reflect.deleteMetadata = function (key, target, property) {
  initializeMetadataMap(target);
  return internalMetadataStore.get(target).delete(property || 'default', key);
};

// Ensure global Reflect object exists
if (!globalThis.Reflect) {
  globalThis.Reflect = Reflect;
}

export default Reflect;
