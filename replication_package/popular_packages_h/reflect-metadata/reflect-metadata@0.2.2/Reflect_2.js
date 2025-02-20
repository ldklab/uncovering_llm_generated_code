var Reflect;
(function (Reflect) {
    const root = detectGlobalObject();
    let exporter = createExporter(Reflect);
    
    if (root.Reflect) {
        exporter = createExporter(root.Reflect, exporter);
    }
    factory(exporter, root);
    
    if (!root.Reflect) {
        root.Reflect = Reflect;
    }
    
    function detectGlobalObject() {
        return typeof globalThis === "object" ? globalThis :
            typeof global === "object" ? global :
                typeof self === "object" ? self : this;
    }
    
    function createExporter(target, previous) {
        return function (key, value) {
            Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
            if (previous) previous(key, value);
        };
    }
    
    function factory(exporter, root) {
        const supportsSymbol = typeof Symbol === "function";
        const toPrimitiveSymbol = supportsSymbol && Symbol.toPrimitive;
        const iteratorSymbol = supportsSymbol && Symbol.iterator || "@@iterator";
        const supportsCreate = typeof Object.create === "function";
        const supportsProto = { __proto__: [] } instanceof Array;
        const isDownLevel = !supportsCreate && !supportsProto;

        const HashMap = {
            create: supportsCreate
                ? () => makeDictionary(Object.create(null))
                : supportsProto
                    ? () => makeDictionary({ __proto__: null })
                    : () => makeDictionary({}),
            has: isDownLevel
                ? (map, key) => Object.prototype.hasOwnProperty.call(map, key)
                : (map, key) => key in map,
            get: isDownLevel
                ? (map, key) => Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined
                : (map, key) => map[key],
        };

        const _Map = typeof Map === "function" ? Map : createMapPolyfill();
        const _Set = typeof Set === "function" ? Set : createSetPolyfill();
        const _WeakMap = typeof WeakMap === "function" ? WeakMap : createWeakMapPolyfill();
        const registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
        const metadataRegistry = getOrCreateMetadataRegistry();
        const metadataProvider = createMetadataProvider(metadataRegistry);

        function decorate(decorators, target, propertyKey, attributes) {
            if (propertyKey !== undefined) {
                validateDecorateArguments(decorators, target, attributes);

                if (attributes === null) attributes = undefined;
                propertyKey = toPropertyKey(propertyKey);
                return decorateProperty(decorators, target, propertyKey, attributes);
            } else {
                validateDecorateArguments(decorators, target);
                return decorateConstructor(decorators, target);
            }
        }
        
        function validateDecorateArguments(decorators, target, attributes) {
            if (!Array.isArray(decorators)) throw new TypeError();
            if (typeof target !== "object") throw new TypeError();
            if (attributes !== undefined && attributes !== null && typeof attributes !== "object") throw new TypeError();
        }
        
        function decorateConstructor(decorators, target) {
            let decoratedTarget = target;
            for (let i = decorators.length - 1; i >= 0; i--) {
                const decorated = decorators[i](decoratedTarget);
                if (decorated !== undefined && decorated !== null) {
                    if (typeof decorated !== "function") throw new TypeError();
                    decoratedTarget = decorated;
                }
            }
            return decoratedTarget;
        }

        function decorateProperty(decorators, target, propertyKey, descriptor) {
            let decoratedDescriptor = descriptor;
            for (let i = decorators.length - 1; i >= 0; i--) {
                const decorated = decorators[i](target, propertyKey, decoratedDescriptor);
                if (decorated !== undefined && decorated !== null) {
                    if (typeof decorated !== "object") throw new TypeError();
                    decoratedDescriptor = decorated;
                }
            }
            return decoratedDescriptor;
        }
        
        function metadata(metadataKey, metadataValue) {
            return function decorator(target, propertyKey) {
                if (typeof target !== "object") throw new TypeError();
                if (propertyKey !== undefined && !isPropertyKey(propertyKey)) throw new TypeError();
                defineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            };
        }

        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            defineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }

        function hasMetadata(metadataKey, target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryHasMetadata(metadataKey, target, propertyKey);
        }

        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }

        function getMetadata(metadataKey, target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryGetMetadata(metadataKey, target, propertyKey);
        }

        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }

        function getMetadataKeys(target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryMetadataKeys(target, propertyKey);
        }

        function getOwnMetadataKeys(target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryOwnMetadataKeys(target, propertyKey);
        }

        function deleteMetadata(metadataKey, target, propertyKey) {
            if (typeof target !== "object") throw new TypeError();
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return deleteOwnMetadata(metadataKey, target, propertyKey);
        }

        function ordinaryHasMetadata(metadataKey, obj, propertyKey) {
            let hasOwn = ordinaryHasOwnMetadata(metadataKey, obj, propertyKey);
            if (hasOwn) return true;
            const parent = ordinaryGetPrototypeOf(obj);
            if (parent !== null) return ordinaryHasMetadata(metadataKey, parent, propertyKey);
            return false;
        }

        function ordinaryHasOwnMetadata(metadataKey, obj, propertyKey) {
            const provider = getMetadataProvider(obj, propertyKey, false);
            if (provider === undefined) return false;
            return provider.ordinaryHasOwnMetadata(metadataKey, obj, propertyKey);
        }

        function ordinaryGetMetadata(metadataKey, obj, propertyKey) {
            let hasOwn = ordinaryHasOwnMetadata(metadataKey, obj, propertyKey);
            if (hasOwn) return ordinaryGetOwnMetadata(metadataKey, obj, propertyKey);
            const parent = ordinaryGetPrototypeOf(obj);
            if (parent !== null) return ordinaryGetMetadata(metadataKey, parent, propertyKey);
            return undefined;
        }

        function ordinaryGetOwnMetadata(metadataKey, obj, propertyKey) {
            const provider = getMetadataProvider(obj, propertyKey, false);
            if (provider === undefined) return;
            return provider.ordinaryGetOwnMetadata(metadataKey, obj, propertyKey);
        }

        function defineOwnMetadata(metadataKey, metadataValue, obj, propertyKey) {
            const provider = getMetadataProvider(obj, propertyKey, true);
            provider.ordinaryDefineOwnMetadata(metadataKey, metadataValue, obj, propertyKey);
        }

        function ordinaryMetadataKeys(obj, propertyKey) {
            const ownKeys = ordinaryOwnMetadataKeys(obj, propertyKey);
            const parent = ordinaryGetPrototypeOf(obj);
            if (parent === null) return ownKeys;
            const parentKeys = ordinaryMetadataKeys(parent, propertyKey);
            if (parentKeys.length <= 0) return ownKeys;
            if (ownKeys.length <= 0) return parentKeys;
            const set = new _Set();
            const keys = [];
            for (const key of ownKeys.concat(parentKeys)) {
                if (!set.has(key)) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }

        function ordinaryOwnMetadataKeys(obj, propertyKey) {
            const provider = getMetadataProvider(obj, propertyKey, false);
            if (!provider) return [];
            return provider.ordinaryOwnMetadataKeys(obj, propertyKey);
        }

        function deleteOwnMetadata(metadataKey, obj, propertyKey) {
            const provider = getMetadataProvider(obj, propertyKey, false);
            if (provider === undefined) return false;
            return provider.ordinaryDeleteMetadata(metadataKey, obj, propertyKey);
        }

        function ordinaryGetPrototypeOf(obj) {
            return Object.getPrototypeOf(obj);
        }

        function makeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }

        function type(x) {
            if (x === null) return 1; // Null
            switch (typeof x) {
                case "undefined": return 0; // Undefined
                case "boolean": return 2; // Boolean
                case "string": return 3; // String
                case "symbol": return 4; // Symbol
                case "number": return 5; // Number
                case "object": return 6; // Object
                default: return 6; // Object
            }
        }

        function toPrimitive(input, preferredType) {
            const typeOfInput = type(input);
            if (typeOfInput !== 6) return input;
            const hint = preferredType === 3 ? "string" : preferredType === 5 ? "number" : "default";
            const exoticToPrim = input[toPrimitiveSymbol];
            if (exoticToPrim !== undefined) {
                const result = exoticToPrim.call(input, hint);
                if (typeof result !== "object") return result;
            }
            return ordinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }

        function ordinaryToPrimitive(obj, hint) {
            if (hint === "string") {
                if (typeof obj.toString === "function") {
                    const result = obj.toString();
                    if (typeof result !== "object") return result;
                }
                if (typeof obj.valueOf === "function") {
                    const result = obj.valueOf();
                    if (typeof result !== "object") return result;
                }
            } else {
                if (typeof obj.valueOf === "function") {
                    const result = obj.valueOf();
                    if (typeof result !== "object") return result;
                }
                if (typeof obj.toString === "function") {
                    const result = obj.toString();
                    if (typeof result !== "object") return result;
                }
            }
            throw new TypeError();
        }

        function toBoolean(argument) {
            return !!argument;
        }

        function toString(argument) {
            return "" + argument;
        }

        function toPropertyKey(argument) {
            const key = toPrimitive(argument, 3 /* String */);
            if (typeof key === "symbol") return key;
            return toString(key);
        }

        function isPropertyKey(argument) {
            return typeof argument === "string" || typeof argument === "symbol";
        }
        
        function getOrCreateMetadataRegistry() {
            let metadataRegistry;
            if (registrySymbol !== undefined && root.Reflect && Object.isExtensible(root.Reflect)) {
                metadataRegistry = root.Reflect[registrySymbol];
            }
            if (metadataRegistry === undefined) {
                metadataRegistry = createMetadataRegistry();
            }
            if (registrySymbol !== undefined && root.Reflect && Object.isExtensible(root.Reflect)) {
                Object.defineProperty(root.Reflect, registrySymbol, {
                    enumerable: false, configurable: false, writable: false,
                    value: metadataRegistry
                });
            }
            return metadataRegistry;
        }
        
        function createMetadataRegistry() {
            let first;
            let second;
            let rest;
            const targetProviderMap = new _WeakMap();
            const registry = { registerProvider, getProvider, setProvider };
            return registry;

            function registerProvider(provider) {
                if (!Object.isExtensible(registry)) throw new Error("Cannot add provider to a frozen registry.");
                if (!first) {
                    first = provider;
                } else if (first !== provider) {
                    if (!second) {
                        second = provider;
                    } else if (second !== provider) {
                        if (!rest) rest = new _Set();
                        rest.add(provider);
                    }
                }
            }

            function getProvider(obj, propertyKey) {
                return (targetProviderMap.get(obj) || new _Map()).get(propertyKey);
            }

            function setProvider(obj, propertyKey, provider) {
                const existingProvider = getProvider(obj, propertyKey);
                if (existingProvider !== provider) {
                    if (existingProvider) return false;
                    const providerMap = targetProviderMap.get(obj) || new _Map();
                    providerMap.set(propertyKey, provider);
                }
                return true;
            }
        }

        function createMetadataProvider(registry) {
            const metadata = new _WeakMap();
            const provider = {
                isProviderFor(obj, propertyKey) {
                    const targetMetadata = metadata.get(obj);
                    return targetMetadata ? targetMetadata.has(propertyKey) : false;
                },
                ordinaryDefineOwnMetadata: defineOwnMetadata,
                ordinaryHasOwnMetadata: ordinaryHasOwnMetadata,
                ordinaryGetOwnMetadata: ordinaryGetOwnMetadata,
                ordinaryOwnMetadataKeys: ordinaryOwnMetadataKeys,
                ordinaryDeleteMetadata: deleteOwnMetadata,
            };
            registry.registerProvider(provider);
            return provider;
        }

        function getMetadataProvider(obj, propertyKey, create) {
            const registeredProvider = metadataRegistry.getProvider(obj, propertyKey);
            if (registeredProvider) return registeredProvider;
            if (create) {
                if (metadataRegistry.setProvider(obj, propertyKey, metadataProvider)) {
                    return metadataProvider;
                }
                throw new Error("Illegal state.");
            }
        }

        function createMapPolyfill() {
            const cacheSentinel = {};
            const arraySentinel = [];
            
            class Map {
                constructor() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                
                get size() {
                    return this._keys.length;
                }
                
                has(key) {
                    return this._find(key, false) >= 0;
                }
                
                get(key) {
                    const index = this._find(key, false);
                    return index >= 0 ? this._values[index] : undefined;
                }
                
                set(key, value) {
                    const index = this._find(key, true);
                    this._values[index] = value;
                    return this;
                }
                
                delete(key) {
                    const index = this._find(key, false);
                    if (index >= 0) {
                        this._keys.splice(index, 1);
                        this._values.splice(index, 1);
                        if (key === this._cacheKey) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                }
                
                clear() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                
                keys() {
                    return new MapIterator(this._keys, this._values, (k) => k);
                }
                
                values() {
                    return new MapIterator(this._keys, this._values, (k, v) => v);
                }
                
                entries() {
                    return new MapIterator(this._keys, this._values, (k, v) => [k, v]);
                }
                
                _find(key, insert) {
                    if (this._cacheKey !== key) {
                        this._cacheIndex = this._keys.indexOf(key);
                        this._cacheKey = key;
                    }
                    
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    
                    return this._cacheIndex;
                }
            }

            class MapIterator {
                constructor(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                
                next() {
                    if (this._index < this._keys.length) {
                        const value = this._selector(this._keys[this._index], this._values[this._index]);
                        this._index++;
                        return { value, done: false };
                    }
                    return { value: undefined, done: true };
                }
            }
            
            return Map;
        }
        
        function createSetPolyfill() {
            class Set {
                constructor() {
                    this._map = new _Map();
                }
                
                get size() {
                    return this._map.size;
                }
                
                has(value) {
                    return this._map.has(value);
                }
                
                add(value) {
                    this._map.set(value, value);
                    return this;
                }
                
                delete(value) {
                    return this._map.delete(value);
                }
                
                clear() {
                    this._map.clear();
                }
                
                keys() {
                    return this._map.keys();
                }
                
                values() {
                    return this._map.keys();
                }
                
                entries() {
                    return this._map.entries();
                }
            }
            
            return Set;
        }
        
        function createWeakMapPolyfill() {
            const UUID_SIZE = 16;
            const keys = HashMap.create();
            const rootKey = createUniqueKey();
            
            class WeakMap {
                constructor() {
                    this._key = createUniqueKey();
                }
                
                has(target) {
                    const table = getOrCreateWeakMapTable(target, false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                }
                
                get(target) {
                    const table = getOrCreateWeakMapTable(target, false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                }
                
                set(target, value) {
                    const table = getOrCreateWeakMapTable(target, true);
                    table[this._key] = value;
                    return this;
                }
                
                delete(target) {
                    const table = getOrCreateWeakMapTable(target, false);
                    return table !== undefined ? delete table[this._key] : false;
                }
                
                clear() {
                    this._key = createUniqueKey();
                }
            }
            
            function createUniqueKey() {
                let key;
                do {
                    key = `@@WeakMap@@${createUUID()}`;
                } while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            
            function getOrCreateWeakMapTable(target, create) {
                if (!Object.prototype.hasOwnProperty.call(target, rootKey)) {
                    if (!create) return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            
            function fillRandomBytes(buffer, size) {
                for (let i = 0; i < size; ++i) buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            
            function genRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    const array = new Uint8Array(size);
                    if (typeof crypto !== "undefined") {
                        crypto.getRandomValues(array);
                    } else if (typeof msCrypto !== "undefined") {
                        msCrypto.getRandomValues(array);
                    } else {
                        fillRandomBytes(array, size);
                    }
                    return array;
                }
                return fillRandomBytes(new Array(size), size);
            }
            
            function createUUID() {
                const data = genRandomBytes(UUID_SIZE);
                data[6] = data[6] & 0x0f | 0x40;
                data[8] = data[8] & 0x3f | 0x80;
                let result = '';
                for (let offset = 0; offset < UUID_SIZE; ++offset) {
                    const byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8) result += "-";
                    if (byte < 16) result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
            
            return WeakMap;
        }

        exporter("decorate", decorate);
        exporter("metadata", metadata);
        exporter("defineMetadata", defineMetadata);
        exporter("hasMetadata", hasMetadata);
        exporter("hasOwnMetadata", hasOwnMetadata);
        exporter("getMetadata", getMetadata);
        exporter("getOwnMetadata", getOwnMetadata);
        exporter("getMetadataKeys", getMetadataKeys);
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        exporter("deleteMetadata", deleteMetadata);
    }
})(Reflect || (Reflect = {}));
