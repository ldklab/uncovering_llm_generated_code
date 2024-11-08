var Reflect = (Reflect || {});

(function (Reflect) {
    const isCallable = (fn) => typeof fn === 'function';
    const isObject = (obj) => typeof obj === 'object' && obj !== null;
    const isUndefined = (value) => value === undefined;
    const isSymbol = (value) => typeof value === 'symbol';

    class PolyfillMap {
        constructor() {
            this._keys = [];
            this._values = [];
        }

        has(key) {
            return this._keys.indexOf(key) !== -1;
        }

        set(key, value) {
            const index = this._keys.indexOf(key);
            if (index === -1) {
                this._keys.push(key);
                this._values.push(value);
            } else {
                this._values[index] = value;
            }
        }

        get(key) {
            const index = this._keys.indexOf(key);
            if (index === -1) return undefined;
            return this._values[index];
        }

        delete(key) {
            const index = this._keys.indexOf(key);
            if (index === -1) return false;
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            return true;
        }

        clear() {
            this._keys = [];
            this._values = [];
        }

        get size() {
            return this._keys.length;
        }

        keys() {
            return this._keys;
        }

        entries() {
            return this._keys.map((key, index) => [key, this._values[index]]);
        }
    }

    const _Map = typeof Map !== 'undefined' ? Map : PolyfillMap;
    let metadata = new _Map();

    function decorate(decorators, target, propertyKey, attributes) {
        if (!Array.isArray(decorators)) throw new TypeError();
        if (!isObject(target)) throw new TypeError();

        if (propertyKey !== undefined) {
            propertyKey = 
            ToPropertyKey(propertyKey);
                return decorateProperty(decorators, target, propertyKey, attributes);
        } else {
            return decorateConstructor(decorators, target);
        }
    }

    function metadata(metadataKey, metadataValue) {
        return function (target, propertyKey) {
            if (!isObject(target)) throw new TypeError();
            if (propertyKey !== undefined && !isPropertyKey(propertyKey))
                throw new TypeError();
            return defineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        };
    }

    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
        if (!isObject(target)) throw new TypeError();
        return defineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }

    function hasMetadata(metadataKey, target, propertyKey) {
        if (!isObject(target)) throw new TypeError();
        return ordinaryHasMetadata(metadataKey, target, propertyKey);
    }

    function getMetadata(metadataKey, target, propertyKey) {
        if (!isObject(target)) throw new TypeError();
        return ordinaryGetMetadata(metadataKey, target, propertyKey);
    }

    function ToPropertyKey(argument) {
        if (isSymbol(argument)) return argument;
        return String(argument);
    }

    function isPropertyKey(argument) {
        return typeof argument === "string" || isSymbol(argument);
    }

    function defineOwnMetadata(metadataKey, metadataValue, target, propertyKey) {
        let targetMap = metadata.get(target);
        if (!targetMap) {
            targetMap = new _Map();
            metadata.set(target, targetMap);
        }
        let keyMap = targetMap.get(propertyKey);
        if (!keyMap) {
            keyMap = new _Map();
            targetMap.set(propertyKey, keyMap);
        }
        keyMap.set(metadataKey, metadataValue);
    }

    function ordinaryHasMetadata(metadataKey, target, propertyKey) {
        if (!metadata.has(target)) return false;
        if (!metadata.get(target).has(propertyKey)) return false;
        return metadata.get(target).get(propertyKey).has(metadataKey);
    }

    function ordinaryGetMetadata(metadataKey, target, propertyKey) {
        if (!ordinaryHasMetadata(metadataKey, target, propertyKey)) return undefined;
        return metadata.get(target).get(propertyKey).get(metadataKey);
    }

    Reflect.decorate = decorate;
    Reflect.metadata = metadata;
    Reflect.defineMetadata = defineMetadata;
    Reflect.hasMetadata = hasMetadata;
    Reflect.getMetadata = getMetadata;

})(Reflect);

// This code implements a basic metadata reflection API following the principles of reflect-metadata.
