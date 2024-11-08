var Reflect;
(function (Reflect) {
    (function (factory) {
        var root = typeof globalThis === "object" ? globalThis :
            typeof global === "object" ? global :
                typeof self === "object" ? self :
                    typeof this === "object" ? this :
                        sloppyModeThis();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect !== "undefined") {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter, root);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        function makeExporter(target, previous) {
            return function (key, value) {
                Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                if (previous) previous(key, value);
            };
        }
        function sloppyModeThis() {
            try { return Function("return this;")(); }
            catch (_) { }
        }
    })(function (exporter, root) {
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var supportsCreate = typeof Object.create === "function";
        var supportsProto = { __proto__: [] } instanceof Array;
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            create: supportsCreate
                ? () => MakeDictionary(Object.create(null))
                : supportsProto
                    ? () => MakeDictionary({ __proto__: null })
                    : () => MakeDictionary({}),
            has: downLevel
                ? (map, key) => Object.prototype.hasOwnProperty.call(map, key)
                : (map, key) => key in map,
            get: downLevel
                ? (map, key) => Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined
                : (map, key) => map[key],
        };
        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
        var metadataRegistry = GetOrCreateMetadataRegistry();
        var metadataProvider = CreateMetadataProvider(metadataRegistry);
        
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                checkArrayAndObject(decorators, target, attributes);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            } else {
                if (!IsArray(decorators)) throw new TypeError();
                if (!IsConstructor(target)) throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);

        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target)) throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);

        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);

        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);

        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);

        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);

        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);

        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);

        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);

        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
            var provider = GetMetadataProvider(target, propertyKey, false);
            if (IsUndefined(provider)) return false;
            return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);

        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated)) throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }

        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated)) throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }

        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn) return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }

        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var provider = GetMetadataProvider(O, P, false);
            if (IsUndefined(provider)) return false;
            return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
        }

        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }

        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var provider = GetMetadataProvider(O, P, false);
            if (IsUndefined(provider)) return;
            return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }

        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var provider = GetMetadataProvider(O, P, true);
            provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
        }

        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null) return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            return [...new Set([...ownKeys, ...parentKeys])];
        }

        function OrdinaryOwnMetadataKeys(O, P) {
            var provider = GetMetadataProvider(O, P, false);
            return provider ? provider.OrdinaryOwnMetadataKeys(O, P) : [];
        }

        function Type(x) {
            return x === null ? 1 /* Null */ : typeof x;
        }

        function IsUndefined(x) { return x === undefined; }
        function IsNull(x) { return x === null; }
        function IsSymbol(x) { return typeof x === "symbol"; }
        function IsObject(x) { return typeof x === "object" ? x !== null : typeof x === "function"; }
        
        function ToPrimitive(input, PreferredType) {
            const hint = PreferredType === 3 /* String */ ? "string" : "number";
            const exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                const result = exoticToPrim.call(input, hint);
                if (IsObject(result)) throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint);
        }

        function OrdinaryToPrimitive(O, hint) {
            let result;
            const toString = O.toString;
            if (IsCallable(toString) && (result = toString.call(O), !IsObject(result))) return result;
            const valueOf = O.valueOf;
            if (IsCallable(valueOf) && (result = valueOf.call(O), !IsObject(result))) return result;
            throw new TypeError();
        }

        function ToBoolean(argument) { return !!argument; }
        function ToString(argument) { return "" + argument; }
        function ToPropertyKey(argument) {
            const key = ToPrimitive(argument, 3 /* String */);
            return IsSymbol(key) ? key : ToString(key);
        }

        function IsArray(argument) {
            return Array.isArray ? Array.isArray(argument) : Object.prototype.toString.call(argument) === "[object Array]";
        }

        function IsCallable(argument) { return typeof argument === "function"; }
        function IsConstructor(argument) { return typeof argument === "function"; }
        function IsPropertyKey(argument) { return typeof argument === "string" || typeof argument === "symbol"; }

        function SameValueZero(x, y) { return x === y || (x !== x && y !== y); }

        function GetMethod(V, P) {
            const func = V[P];
            if (func === undefined || func === null) return undefined;
            if (!IsCallable(func)) throw new TypeError();
            return func;
        }

        function GetIterator(obj) {
            const method = GetMethod(obj, Symbol.iterator);
            if (!IsCallable(method)) throw new TypeError();
            const iterator = method.call(obj);
            if (!IsObject(iterator)) throw new TypeError();
            return iterator;
        }

        function IteratorValue(iterResult) { return iterResult.value; }

        function IteratorStep(iterator) {
            const result = iterator.next();
            return result.done ? false : result;
        }

        function IteratorClose(iterator) {
            const returnMethod = iterator["return"];
            if (returnMethod) returnMethod.call(iterator);
        }

        function OrdinaryGetPrototypeOf(O) {
            const proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype) return proto;
            if (proto !== functionPrototype) return proto;
            const prototype = O.prototype;
            const prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto === null || prototypeProto === Object.prototype) return proto;
            const constructor = prototypeProto.constructor;
            return typeof constructor === "function" && constructor !== O ? constructor : proto;
        }

        function CreateMetadataRegistry() {
            const fallback = !IsUndefined(registrySymbol) &&
                typeof root.Reflect !== "undefined" &&
                !(registrySymbol in root.Reflect) &&
                typeof root.Reflect.defineMetadata === "function"
                ? CreateFallbackProvider(root.Reflect)
                : undefined;
            let first, second, rest;
            const targetProviderMap = new _WeakMap();
            const registry = {
                registerProvider,
                getProvider,
                setProvider,
            };
            return registry;

            function registerProvider(provider) {
                if (!Object.isExtensible(registry)) throw new Error("Cannot add provider to a frozen registry.");
                if (fallback === provider) return;
                if (IsUndefined(first)) first = provider;
                else if (first === provider) return;
                else if (IsUndefined(second)) second = provider;
                else if (second === provider) return;
                else {
                    if (IsUndefined(rest)) rest = new _Set();
                    rest.add(provider);
                }
            }

            function getProvider(O, P) {
                const providerMap = targetProviderMap.get(O);
                let provider = providerMap ? providerMap.get(P) : undefined;
                if (provider) return provider;
                provider = getProviderNoCache(O, P);
                if (provider) {
                    if (!providerMap) targetProviderMap.set(O, providerMap = new _Map());
                    providerMap.set(P, provider);
                }
                return provider;
            }

            function getProviderNoCache(O, P) {
                if (first && first.isProviderFor(O, P)) return first;
                if (second && second.isProviderFor(O, P)) return second;
                if (rest) for (const provider of rest) if (provider.isProviderFor(O, P)) return provider;
                if (fallback && fallback.isProviderFor(O, P)) return fallback;
                return undefined;
            }

            function hasProvider(provider) {
                if (IsUndefined(provider)) throw new TypeError();
                return first === provider || second === provider || (rest && rest.has(provider));
            }

            function setProvider(O, P, provider) {
                if (!hasProvider(provider)) throw new Error("Metadata provider not registered.");
                const existingProvider = getProvider(O, P);
                if (existingProvider && existingProvider !== provider) return false;
                if (!existingProvider) {
                    const providerMap = targetProviderMap.get(O) || new _Map();
                    providerMap.set(P, provider);
                    targetProviderMap.set(O, providerMap);
                }
                return true;
            }
        }

        function GetOrCreateMetadataRegistry() {
            let metadataRegistry = IsObject(root.Reflect) && Object.isExtensible(root.Reflect) ? root.Reflect[registrySymbol] : undefined;
            if (IsUndefined(metadataRegistry)) metadataRegistry = CreateMetadataRegistry();
            if (IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
                Object.defineProperty(root.Reflect, registrySymbol, { enumerable: false, configurable: false, writable: false, value: metadataRegistry });
            }
            return metadataRegistry;
        }

        function CreateMetadataProvider(registry) {
            const metadata = new _WeakMap();
            const provider = {
                isProviderFor: (O, P) => {
                    const targetMetadata = metadata.get(O);
                    return !IsUndefined(targetMetadata) && targetMetadata.has(P);
                },
                OrdinaryDefineOwnMetadata,
                OrdinaryHasOwnMetadata,
                OrdinaryGetOwnMetadata,
                OrdinaryOwnMetadataKeys,
                OrdinaryDeleteMetadata,
            };
            registry.registerProvider(provider);
            return provider;

            function GetOrCreateMetadataMap(O, P, Create) {
                let targetMetadata = metadata.get(O);
                if (IsUndefined(targetMetadata)) {
                    if (!Create) return undefined;
                    metadata.set(O, targetMetadata = new _Map());
                }
                let metadataMap = targetMetadata.get(P);
                if (IsUndefined(metadataMap)) {
                    if (!Create) return undefined;
                    metadataMap = new _Map();
                    targetMetadata.set(P, metadataMap);
                    if (!registry.setProvider(O, P, provider)) {
                        targetMetadata.delete(P);
                        if (!targetMetadata.size) metadata.delete(O);
                        throw new Error("Wrong provider for target.");
                    }
                }
                return metadataMap;
            }

            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                const metadataMap = GetOrCreateMetadataMap(O, P, false);
                return !IsUndefined(metadataMap) && ToBoolean(metadataMap.has(MetadataKey));
            }

            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                const metadataMap = GetOrCreateMetadataMap(O, P, false);
                return !IsUndefined(metadataMap) ? metadataMap.get(MetadataKey) : undefined;
            }

            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                const metadataMap = GetOrCreateMetadataMap(O, P, true);
                metadataMap.set(MetadataKey, MetadataValue);
            }

            function OrdinaryOwnMetadataKeys(O, P) {
                const metadataMap = GetOrCreateMetadataMap(O, P, false);
                if (!IsUndefined(metadataMap)) {
                    const keysObj = metadataMap.keys();
                    const keys = Array.from(keysObj);
                    return keys;
                }
                return [];
            }

            function OrdinaryDeleteMetadata(MetadataKey, O, P) {
                const metadataMap = GetOrCreateMetadataMap(O, P, false);
                if (IsUndefined(metadataMap)) return false;
                if (!metadataMap.delete(MetadataKey)) return false;
                if (metadataMap.size === 0) {
                    const targetMetadata = metadata.get(O);
                    targetMetadata.delete(P);
                    if (targetMetadata.size === 0) metadata.delete(O);
                }
                return true;
            }
        }

        function CreateFallbackProvider(reflect) {
            const { defineMetadata, hasOwnMetadata, getOwnMetadata, getOwnMetadataKeys, deleteMetadata } = reflect;
            const metadataOwner = new _WeakMap();
            const provider = {
                isProviderFor: (O, P) => {
                    let metadataPropertySet = metadataOwner.get(O);
                    if (!metadataPropertySet || !metadataPropertySet.has(P)) {
                        if (getOwnMetadataKeys(O, P).length) {
                            if (!metadataPropertySet) metadataOwner.set(O, metadataPropertySet = new _Set());
                            metadataPropertySet.add(P);
                            return true;
                        }
                        return false;
                    }
                    return true;
                },
                OrdinaryDefineOwnMetadata: defineMetadata,
                OrdinaryHasOwnMetadata: hasOwnMetadata,
                OrdinaryGetOwnMetadata: getOwnMetadata,
                OrdinaryOwnMetadataKeys: getOwnMetadataKeys,
                OrdinaryDeleteMetadata: deleteMetadata,
            };
            return provider;
        }

        function GetMetadataProvider(O, P, Create) {
            const registeredProvider = metadataRegistry.getProvider(O, P);
            if (!IsUndefined(registeredProvider)) return registeredProvider;
            if (Create) {
                if (metadataRegistry.setProvider(O, P, metadataProvider)) return metadataProvider;
                throw new Error("Illegal state.");
            }
            return undefined;
        }

        function CreateMapPolyfill() {
            const cacheSentinel = {};
            const arraySentinel = [];
            class MapIterator {
                constructor(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                ["@@iterator"]() { return this; }
                [iteratorSymbol]() { return this; }
                next() {
                    const index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        const result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        } else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                }
                throw(error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                }
                return(value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                }
            }
            class Map {
                constructor() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                get size() { return this._keys.length; }
                has(key) { return this._find(key, false) >= 0; }
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
                        const size = this._keys.length;
                        for (let i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (SameValueZero(key, this._cacheKey)) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                }
                clear() {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                keys() { return new MapIterator(this._keys, this._values, getKey); }
                values() { return new MapIterator(this._keys, this._values, getValue); }
                entries() { return new MapIterator(this._keys, this._values, getEntry); }
                ["@@iterator"]() { return this.entries(); }
                [iteratorSymbol]() { return this.entries(); }
                _find(key, insert) {
                    if (!SameValueZero(this._cacheKey, key)) {
                        this._cacheIndex = -1;
                        for (let i = 0; i < this._keys.length; i++) {
                            if (SameValueZero(this._keys[i], key)) {
                                this._cacheIndex = i;
                                break;
                            }
                        }
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                }
            }
            return Map;
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }

        function CreateSetPolyfill() {
            class Set {
                constructor() {
                    this._map = new _Map();
                }
                get size() { return this._map.size; }
                has(value) { return this._map.has(value); }
                add(value) { return this._map.set(value, value), this; }
                delete(value) { return this._map.delete(value); }
                clear() { this._map.clear(); }
                keys() { return this._map.keys(); }
                values() { return this._map.keys(); }
                entries() { return this._map.entries(); }
                ["@@iterator"]() { return this.keys(); }
                [iteratorSymbol]() { return this.keys(); }
            }
            return Set;
        }

        function CreateWeakMapPolyfill() {
            const UUID_SIZE = 16;
            const keys = HashMap.create();
            const rootKey = CreateUniqueKey();
            class WeakMap {
                constructor() {
                    this._key = CreateUniqueKey();
                }
                has(target) {
                    const table = GetOrCreateWeakMapTable(target, false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                }
                get(target) {
                    const table = GetOrCreateWeakMapTable(target, false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                }
                set(target, value) {
                    const table = GetOrCreateWeakMapTable(target, true);
                    table[this._key] = value;
                    return this;
                }
                delete(target) {
                    const table = GetOrCreateWeakMapTable(target, false);
                    return table !== undefined ? delete table[this._key] : false;
                }
                clear() {
                    this._key = CreateUniqueKey();
                }
            }
            return WeakMap;

            function CreateUniqueKey() {
                let key;
                do key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }

            function GetOrCreateWeakMapTable(target, create) {
                if (!Object.prototype.hasOwnProperty.call(target, rootKey)) {
                    if (!create) return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }

            function FillRandomBytes(buffer, size) {
                for (let i = 0; i < size; ++i) buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }

            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    const array = new Uint8Array(size);
                    if (typeof crypto !== "undefined") crypto.getRandomValues(array);
                    else if (typeof msCrypto !== "undefined") msCrypto.getRandomValues(array);
                    else FillRandomBytes(array, size);
                    return array;
                }
                return FillRandomBytes(new Array(size), size);
            }

            function CreateUUID() {
                const data = GenRandomBytes(UUID_SIZE);
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                let result = "";
                for (let offset = 0; offset < UUID_SIZE; ++offset) {
                    const byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8) result += "-";
                    if (byte < 16) result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }

        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
        
        function checkArrayAndObject(decorators, target, attributes) {
            if (!IsArray(decorators)) throw new TypeError();
            if (!IsObject(target)) throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                throw new TypeError();
        }
    });
})(Reflect || (Reflect = {}));
