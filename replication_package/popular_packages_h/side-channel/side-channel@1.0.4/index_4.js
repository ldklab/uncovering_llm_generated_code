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

const listGetNode = (list, key) => {
	for (let prev = list, curr; (curr = prev.next) !== null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			curr.next = list.next;
			list.next = curr;
			return curr;
		}
	}
};

const listGet = (objects, key) => {
	const node = listGetNode(objects, key);
	return node && node.value;
};

const listSet = (objects, key, value) => {
	const node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		objects.next = {
			key: key,
			next: objects.next,
			value: value
		};
	}
};

const listHas = (objects, key) => !!listGetNode(objects, key);

module.exports = function getSideChannel() {
	let $wm, $m, $o;
	const channel = {
		assert: (key) => {
			if (!channel.has(key)) {
				throw new $TypeError(`Side channel does not contain ${inspect(key)}`);
			}
		},
		get: (key) => {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				return $wm && $weakMapGet($wm, key);
			} else if ($Map) {
				return $m && $mapGet($m, key);
			} else {
				return $o && listGet($o, key);
			}
		},
		has: (key) => {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				return $wm && $weakMapHas($wm, key);
			} else if ($Map) {
				return $m && $mapHas($m, key);
			} else {
				return $o && listHas($o, key);
			}
		},
		set: (key, value) => {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				$wm = $wm || new $WeakMap();
				$weakMapSet($wm, key, value);
			} else if ($Map) {
				$m = $m || new $Map();
				$mapSet($m, key, value);
			} else {
				$o = $o || { key: {}, next: null };
				listSet($o, key, value);
			}
		}
	};
	return channel;
};
