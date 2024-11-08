'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bind/callBound');
const inspect = require('object-inspect');

const $TypeError = GetIntrinsic('%TypeError%');
const $WeakMap = GetIntrinsic('%WeakMap%', true);
const $Map = GetIntrinsic('%Map%', true);

const $weakMapGet = callBound('WeakMap.prototype.get', true);
const $weakMapSet = callBound('WeakMap.prototype.set', true);
const $weakMapHas = callBound('WeakMap.prototype.has', true);
const $mapGet = callBound('Map.prototype.get', true);
const $mapSet = callBound('Map.prototype.set', true);
const $mapHas = callBound('Map.prototype.has', true);

function listGetNode(list, key) {
    for (let prev = list, curr; (curr = prev.next) !== null; prev = curr) {
        if (curr.key === key) {
            prev.next = curr.next;
            curr.next = list.next;
            list.next = curr;
            return curr;
        }
    }
}

function listGet(objects, key) {
    const node = listGetNode(objects, key);
    return node && node.value;
}

function listSet(objects, key, value) {
    const node = listGetNode(objects, key);
    if (node) {
        node.value = value;
    } else {
        objects.next = { key, next: objects.next, value };
    }
}

function listHas(objects, key) {
    return !!listGetNode(objects, key);
}

module.exports = function createSideChannel() {
    let weakMapInstance;
    let mapInstance;
    let listInstance;

    const channel = {
        assert(key) {
            if (!channel.has(key)) {
                throw new $TypeError(`Side channel does not contain ${inspect(key)}`);
            }
        },
        get(key) {
            if ($WeakMap && (typeof key === 'object' || typeof key === 'function')) {
                return weakMapInstance && $weakMapGet(weakMapInstance, key);
            } else if ($Map) {
                return mapInstance && $mapGet(mapInstance, key);
            } else {
                return listInstance && listGet(listInstance, key);
            }
        },
        has(key) {
            if ($WeakMap && (typeof key === 'object' || typeof key === 'function')) {
                return weakMapInstance && $weakMapHas(weakMapInstance, key);
            } else if ($Map) {
                return mapInstance && $mapHas(mapInstance, key);
            } else {
                return listInstance && listHas(listInstance, key);
            }
        },
        set(key, value) {
            if ($WeakMap && (typeof key === 'object' || typeof key === 'function')) {
                if (!weakMapInstance) {
                    weakMapInstance = new $WeakMap();
                }
                $weakMapSet(weakMapInstance, key, value);
            } else if ($Map) {
                if (!mapInstance) {
                    mapInstance = new $Map();
                }
                $mapSet(mapInstance, key, value);
            } else {
                if (!listInstance) {
                    listInstance = { key: {}, next: null };
                }
                listSet(listInstance, key, value);
            }
        }
    };

    return channel;
};
