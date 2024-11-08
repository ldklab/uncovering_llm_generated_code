'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bind/callBound');
const inspect = require('object-inspect');

const $TypeError = require('es-errors/type');
const $WeakMap = GetIntrinsic('%WeakMap%', true);
const $Map = GetIntrinsic('%Map%', true);

const $weakMapGet = callBound('WeakMap.prototype.get', true);
const $weakMapSet = callBound('WeakMap.prototype.set', true);
const $weakMapHas = callBound('WeakMap.prototype.has', true);
const $mapGet = callBound('Map.prototype.get', true);
const $mapSet = callBound('Map.prototype.set', true);
const $mapHas = callBound('Map.prototype.has', true);

function listGetNode(list, key) {
	let prev = list;
	let curr;
	while ((curr = prev.next) !== null) {
		if (curr.key === key) {
			prev.next = curr.next;
			curr.next = list.next;
			list.next = curr;
			return curr;
		}
		prev = curr;
	}
}

function listGet(objects, key) {
	const node = listGetNode(objects, key);
	return node ? node.value : undefined;
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

module.exports = function getSideChannel() {
	let $wm;
	let $m;
	let $o;

	const channel = {
		assert(key) {
			if (!channel.has(key)) {
				throw new $TypeError(`Side channel does not contain ${inspect(key)}`);
			}
		},
		get(key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				return $wm ? $weakMapGet($wm, key) : undefined;
			} else if ($Map) {
				return $m ? $mapGet($m, key) : undefined;
			} else {
				return $o ? listGet($o, key) : undefined;
			}
		},
		has(key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				return $wm ? $weakMapHas($wm, key) : false;
			} else if ($Map) {
				return $m ? $mapHas($m, key) : false;
			} else {
				return $o ? listHas($o, key) : false;
			}
		},
		set(key, value) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if (!$wm) $wm = new $WeakMap();
				$weakMapSet($wm, key, value);
			} else if ($Map) {
				if (!$m) $m = new $Map();
				$mapSet($m, key, value);
			} else {
				if (!$o) $o = { key: {}, next: null };
				listSet($o, key, value);
			}
		}
	};

	return channel;
};
