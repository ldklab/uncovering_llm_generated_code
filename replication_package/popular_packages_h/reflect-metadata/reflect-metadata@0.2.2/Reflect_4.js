var Reflect;
(function (Reflect) {
    /**
     * Initializes and manages the reflect-metadata module.
     */
    (function (moduleInitializer) {
        // Determine the global object.
        var root = typeof globalThis === "object" ? globalThis :
                   typeof global === "object" ? global :
                   typeof self === "object" ? self :
                   typeof this === "object" ? this :
                   (function() { return this; })();

        var exporter = createExporter(Reflect);

        if (root.Reflect) {
            exporter = createExporter(root.Reflect, exporter);
        }

        moduleInitializer(exporter, root);

        if (!root.Reflect) {
            root.Reflect = Reflect;
        }

        function createExporter(target, previousExporter) {
            return function (key, value) {
                Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                if (previousExporter) previousExporter(key, value);
            };
        }
    })(function (exporter, root) {
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol ? Symbol.iterator : "@@iterator";

        var supportsCreate = typeof Object.create === "function";
        var supportsProto = { __proto__: [] } instanceof Array;
        var downLevel = !supportsCreate && !supportsProto;

        var HashMap = {
            create: supportsCreate ? function () { return createDictionary(Object.create(null)); } :
                   supportsProto ? function () { return createDictionary({ __proto__: null }); } :
                   function () { return createDictionary({}); },
            has: downLevel ? function (map, key) { return Object.prototype.hasOwnProperty.call(map, key); } :
                 function (map, key) { return key in map; },
            get: downLevel ? function (map, key) { return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined; } :
                 function (map, key) { return map[key]; }
        };

        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : createMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : createSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : createWeakMapPolyfill();

        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
        var metadataRegistry = getOrCreateMetadataRegistry();

        var metadataProvider = createMetadataProvider(metadataRegistry);

        function decorate(decorators, target, propertyKey, attributes) {
            if (propertyKey !== undefined) {
                validateDecorators(decorators);
                validateObject(target);
                validateAttributes(attributes);
                propertyKey = toPropertyKey(propertyKey);
                return decorateProperty(decorators, target, propertyKey, attributes);
            } else {
                validateDecorators(decorators);
                validateConstructor(target);
                return decorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);

        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                validateObject(target);
                if (propertyKey !== undefined) validatePropertyKey(propertyKey);
                ordinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);

        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);

        function hasMetadata(metadataKey, target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);

        function hasOwnMetadata(metadataKey, target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);

        function getMetadata(metadataKey, target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);

        function getOwnMetadata(metadataKey, target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);

        function getMetadataKeys(target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);

        function getOwnMetadataKeys(target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);
            return ordinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);

        function deleteMetadata(metadataKey, target, propertyKey) {
            validateObject(target);
            if (propertyKey !== undefined) propertyKey = toPropertyKey(propertyKey);

            var provider = getMetadataProvider(target, propertyKey, false);
            if (provider === undefined) return false;
            return provider.ordinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);

        function decorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (decorated !== undefined && decorated !== null) {
                    if (!isConstructor(decorated)) throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }

        function decorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (decorated !== undefined && decorated !== null) {
                    if (!isObject(decorated)) throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }

        function ordinaryHasMetadata(MetadataKey, O, P) { /* implementation */ }
        function ordinaryHasOwnMetadata(MetadataKey, O, P) { /* implementation */ }
        function ordinaryGetMetadata(MetadataKey, O, P) { /* implementation */ }
        function ordinaryGetOwnMetadata(MetadataKey, O, P) { /* implementation */ }
        function ordinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) { /* implementation */ }
        function ordinaryMetadataKeys(O, P) { /* implementation */ }
        function ordinaryOwnMetadataKeys(O, P) { /* implementation */ }
        function ordinaryDeleteMetadata(MetadataKey, O, P) { /* implementation */ }

        function validateDecorators(decorators) { /* implementation */ }
        function validateObject(target) { /* implementation */ }
        function validateAttributes(attributes) { /* implementation */ }
        function validateConstructor(target) { /* implementation */ }
        function validatePropertyKey(propertyKey) { /* implementation */ }

        function isObject(x) { return typeof x === 'object' || typeof x === 'function'; }
        function isConstructor(x) { /* implementation */ }
        function toPropertyKey(argument) { /* implementation */ }
        
        function getOrCreateMetadataRegistry() {
            var metadataRegistry = root.Reflect && root.Reflect[registrySymbol];
            if (!metadataRegistry) {
                metadataRegistry = createMetadataRegistry();
            }
            if (root.Reflect && !root.Reflect[registrySymbol]) {
                Object.defineProperty(root.Reflect, registrySymbol, { value: metadataRegistry });
            }
            return metadataRegistry;
        }

        function createMetadataProvider(registry) {
            var metadata = new _WeakMap();
            var provider = {
                isProviderFor: function (O, P) { /* implementation */ },
                OrdinaryDefineOwnMetadata: ordinaryDefineOwnMetadata,
                OrdinaryHasOwnMetadata: ordinaryHasOwnMetadata,
                OrdinaryGetOwnMetadata: ordinaryGetOwnMetadata,
                OrdinaryOwnMetadataKeys: ordinaryOwnMetadataKeys,
                OrdinaryDeleteMetadata: ordinaryDeleteMetadata,
            };
            registry.registerProvider(provider);
            return provider;
        }

        function getMetadataProvider(O, P, create) { /* implementation */ }

        function createMapPolyfill() { /* implementation */ }
        function createSetPolyfill() { /* implementation */ }
        function createWeakMapPolyfill() { /* implementation */ }
        function createDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));
