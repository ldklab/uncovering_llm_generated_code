'use strict';

const { generate } = require('regjsgen');
const { parse } = require('regjsparser');
const regenerate = require('regenerate');
const unicodeMatchProperty = require('unicode-match-property-ecmascript');
const unicodeMatchPropertyValue = require('unicode-match-property-value-ecmascript');
const iuMappings = require('./data/iu-mappings.js');
const ESCAPE_SETS = require('./data/character-class-escape-sets.js');

function flatMap(array, callback) {
	const result = [];
	array.forEach(item => {
		const res = callback(item);
		Array.isArray(res) ? result.push(...res) : result.push(res);
	});
	return result;
}

function containsAstral(chars) {
	return chars.data.length >= 1 && chars.data[chars.data.length - 1] >= 0x10000;
}

const SPECIAL_CHARS = /([\\^$.*+?()[\]{}|])/g;
const UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
const ASTRAL_SET = regenerate().addRange(0x10000, 0x10FFFF);
const NEWLINE_SET = regenerate().add(0x000A, 0x000D, 0x2028, 0x2029);
const DOT_SET_UNICODE = UNICODE_SET.clone().remove(NEWLINE_SET);

const getEscapeSet = (char, unicode, ignoreCase) => {
	if (unicode && ignoreCase) return ESCAPE_SETS.UNICODE_IGNORE_CASE.get(char);
	if (unicode) return ESCAPE_SETS.UNICODE.get(char);
	return ESCAPE_SETS.REGULAR.get(char);
};

const getUnicodeDotSet = dotAll => dotAll ? UNICODE_SET : DOT_SET_UNICODE;

const getPropertyValueSet = (property, value) => {
	const path = value ? `${property}/${value}` : `Binary_Property/${property}`;
	try {
		return require(`regenerate-unicode-properties/${path}.js`);
	} catch {
		throw new Error(`Failed to recognize value \`${value}\` for property \`${property}\`.`);
	}
};

const handleLoneNameOrValue = value => {
	try {
		const prop = 'General_Category';
		const category = unicodeMatchPropertyValue(prop, value);
		return getPropertyValueSet(prop, category);
	} catch {}
	try {
		return getPropertyValueSet('Property_of_Strings', value);
	} catch {}
	const prop = unicodeMatchProperty(value);
	return getPropertyValueSet(prop);
};

const getPropertyEscapeSet = (value, isNegative) => {
	const parts = value.split('=');
	const firstPart = parts[0];
	let set = parts.length === 1 ? 
		handleLoneNameOrValue(firstPart) : 
		getPropertyValueSet(unicodeMatchProperty(firstPart), unicodeMatchPropertyValue(unicodeMatchProperty(firstPart), parts[1]));

	if (isNegative) {
		if (set.strings) throw new Error('Cannot negate Unicode property of strings');
		return { characters: UNICODE_SET.clone().remove(set.characters), strings: new Set() };
	}
	return {
		characters: set.characters.clone(),
		strings: new Set(Array.from(set.strings || []).map(str => str.replace(SPECIAL_CHARS, '\\$1')))
	};
};

const getEscapeCharacterClassData = (property, isNegative) => {
	const set = getPropertyEscapeSet(property, isNegative);
	const data = getCharacterClassEmptyData();
	data.singleChars = set.characters;
	if (set.strings.size) {
		data.longStrings = set.strings;
		data.maybeIncludesStrings = true;
	}
	return data;
};

function needCaseFoldAscii() {
	return !!config.modifiersData.i;
}

function needCaseFoldUnicode() {
	if (config.modifiersData.i === false) return false;
	if (!config.transform.unicodeFlag) return false;
	return Boolean(config.modifiersData.i || config.flags.ignoreCase);
}

regenerate.prototype.iuAddRange = function(min, max) {
	for (let i = min; i <= max; i++) this.add(caseFold(i, needCaseFoldAscii(), needCaseFoldUnicode()));
	return this;
};

regenerate.prototype.iuRemoveRange = function(min, max) {
	for (let i = min; i <= max; i++) this.remove(caseFold(i, needCaseFoldAscii(), needCaseFoldUnicode()));
	return this;
};

const updatePattern = (item, pattern) => {
	let tree = parse(pattern, config.useUnicodeFlag ? 'u' : '', {
		lookbehind: true,
		namedGroups: true,
		unicodePropertyEscape: true,
		unicodeSet: true,
		modifiers: true,
	});
	switch (tree.type) {
		case 'characterClass':
		case 'group':
		case 'value':
			break;
		default:
			tree = wrapPattern(tree, pattern);
	}
	Object.assign(item, tree);
};

const wrapPattern = (tree, pattern) => ({
	'type': 'group',
	'behavior': 'ignore',
	'body': [tree],
	'raw': `(?:${pattern})`
});

const caseFold = (codePoint, includeAscii, includeUnicode) => {
	let folded = (includeUnicode ? iuMappings.get(codePoint) : undefined) || [];
	if (typeof folded === 'number') folded = [folded];
	if (includeAscii) {
		if (codePoint >= 0x41 && codePoint <= 0x5A) folded.push(codePoint + 0x20);
		else if (codePoint >= 0x61 && codePoint <= 0x7A) folded.push(codePoint - 0x20);
	}
	return folded.length ? folded : false;
};

const handlerBuilder = action => {
	switch (action) {
		case 'union':
			return {
				single: (data, cp) => data.singleChars.add(cp),
				regSet: (data, set) => data.singleChars.add(set),
				range: (data, start, end) => data.singleChars.addRange(start, end),
				iuRange: (data, start, end) => data.singleChars.iuAddRange(start, end),
				nested: (data, nd) => {
					data.singleChars.add(nd.singleChars);
					nd.longStrings.forEach(s => data.longStrings.add(s));
					if (nd.maybeIncludesStrings) data.maybeIncludesStrings = true;
				}
			};
		case 'union-negative':
			const negateRegSet = (data, set) => {
				data.singleChars = UNICODE_SET.clone().remove(set).add(data.singleChars);
			};
			return {
				single: (data, cp) => {
					let unicode = UNICODE_SET.clone();
					data.singleChars = data.singleChars.contains(cp) ? unicode : unicode.remove(cp);
				},
				regSet: negateRegSet,
				range: (data, start, end) => {
					data.singleChars = UNICODE_SET.clone().removeRange(start, end).add(data.singleChars);
				},
				iuRange: (data, start, end) => {
					data.singleChars = UNICODE_SET.clone().iuRemoveRange(start, end).add(data.singleChars);
				},
				nested: (data, nd) => {
					negateRegSet(data, nd.singleChars);
					if (nd.maybeIncludesStrings) throw new Error('ASSERTION ERROR');
				}
			};
		case 'intersection':
			const intersectRegSet = (data, set) => data.first ? data.singleChars = set : data.singleChars.intersection(set);
			return {
				single: (data, cp) => {
					data.singleChars = data.first || data.singleChars.contains(cp) ? regenerate(cp) : regenerate();
					data.longStrings.clear();
					data.maybeIncludesStrings = false;
				},
				regSet: intersectRegSet,
				range: (data, start, end) => {
					if (data.first) data.singleChars.addRange(start, end);
					else data.singleChars.intersection(regenerate().addRange(start, end));
					data.longStrings.clear();
					data.maybeIncludesStrings = false;
				},
				iuRange: (data, start, end) => {
					if (data.first) data.singleChars.iuAddRange(start, end);
					else data.singleChars.intersection(regenerate().iuAddRange(start, end));
					data.longStrings.clear();
					data.maybeIncludesStrings = false;
				},
				nested: (data, nd) => {
					intersectRegSet(data, nd.singleChars);
					if (data.first) {
						data.longStrings = nd.longStrings;
						data.maybeIncludesStrings = nd.maybeIncludesStrings;
					} else {
						[...data.longStrings].forEach(s => { if (!nd.longStrings.has(s)) data.longStrings.delete(s); });
						if (!nd.maybeIncludesStrings) data.maybeIncludesStrings = false;
					}
				}
			};
		case 'subtraction':
			const subtractRegSet = (data, set) => data.first ? data.singleChars.add(set) : data.singleChars.remove(set);
			return {
				single: (data, cp) => data.first ? data.singleChars.add(cp) : data.singleChars.remove(cp),
				regSet: subtractRegSet,
				range: (data, start, end) => data.first ? data.singleChars.addRange(start, end) : data.singleChars.removeRange(start, end),
				iuRange: (data, start, end) => data.first ? data.singleChars.iuAddRange(start, end) : data.singleChars.iuRemoveRange(start, end),
				nested: (data, nd) => {
					subtractRegSet(data, nd.singleChars);
					if (data.first) {
						data.longStrings = nd.longStrings;
						data.maybeIncludesStrings = nd.maybeIncludesStrings;
					} else {
						[...data.longStrings].forEach(s => { if (nd.longStrings.has(s)) data.longStrings.delete(s); });
					}
				}
			};
		default:
			throw new Error(`Unknown set action: ${ characterClassItem.kind }`);
	}
};

const getEmptyClassData = () => ({
	transformed: config.transform.unicodeFlag,
	singleChars: regenerate(),
	longStrings: new Set(),
	hasEmptyString: false,
	first: true,
	maybeIncludesStrings: false
});

const foldMaybe = cp => {
	const includesAscii = configNeedCaseFoldAscii();
	const includesUnicode = configNeedCaseFoldUnicode();
	if (includesAscii || includesUnicode) {
		const folded = caseFold(cp, includesAscii, includesUnicode);
		if (folded) return [cp, folded];
	}
	return [cp];
};

const computeClassStrings = (classStrings, options) => {
	let data = getEmptyClassData();
	const caseFoldAscii = configNeedCaseFoldAscii();
	const caseFoldUnicode = configNeedCaseFoldUnicode();

	for (const string of classStrings.strings) {
		if (string.characters.length === 1) {
			foldMaybe(string.characters[0].codePoint).forEach(cp => data.singleChars.add(cp));
		} else {
			let str;
			if (caseFoldUnicode || caseFoldAscii) {
				str = '';
				for (const ch of string.characters) {
					let set = regenerate(ch.codePoint);
					const folded = foldMaybe(ch.codePoint);
					if (folded) set.add(folded);
					str += set.toString(options);
				}
			} else {
				str = string.characters.map(ch => generate(ch)).join('');
			}

			data.longStrings.add(str);
			data.maybeIncludesStrings = true;
		}
	}

	return data;
}

const computeClass = (item, options) => {
	let data = getEmptyClassData();

	let handlePos;
	let handleNeg;

	switch (item.kind) {
		case 'union':
			handlePos = handlerBuilder('union');
			handleNeg = handlerBuilder('union-negative');
			break;
		case 'intersection':
			handlePos = handlerBuilder('intersection');
			handleNeg = handlerBuilder('subtraction');
			if (config.transform.unicodeSetsFlag) data.transformed = true;
			break;
		case 'subtraction':
			handlePos = handlerBuilder('subtraction');
			handleNeg = handlerBuilder('intersection');
			if (config.transform.unicodeSetsFlag) data.transformed = true;
			break;
		default:
			throw new Error(`Unknown character class kind: ${ item.kind }`);
	}

	const caseFoldAscii = configNeedCaseFoldAscii();
	const caseFoldUnicode = configNeedCaseFoldUnicode();

	for (const entry of item.body) {
		switch (entry.type) {
			case 'value':
				foldMaybe(entry.codePoint).forEach(cp => handlePos.single(data, cp));
				break;
			case 'characterClassRange':
				const min = entry.min.codePoint;
				const max = entry.max.codePoint;
				handlePos.range(data, min, max);
				if (caseFoldAscii || caseFoldUnicode) {
					handlePos.iuRange(data, min, max);
					data.transformed = true;
				}
				break;
			case 'characterClassEscape':
				handlePos.regSet(data, getEscapeSet(entry.value, config.flags.unicode || config.flags.unicodeSets, config.flags.ignoreCase));
				break;
			case 'unicodePropertyEscape':
				const nested = getEscapeCharacterClassData(entry.value, entry.negative);
				handlePos.nested(data, nested);
				data.transformed = data.transformed || config.transform.unicodePropertyEscapes || (config.transform.unicodeSetsFlag && (nested.maybeIncludesStrings || item.kind !== "union"));
				break;
			case 'characterClass':
				const handler = entry.negative ? handleNeg : handlePos;
				const res = computeClass(entry, options);
				handler.nested(data, res);
				data.transformed = true;
				break;
			case 'classStrings':
				handlePos.nested(data, computeClassStrings(entry, options));
				data.transformed = true;
				break;
			default:
				throw new Error(`Unknown term type: ${ entry.type }`);
		}

		data.first = false;
	}

	if (item.negative && data.maybeIncludesStrings) throw new SyntaxError('Cannot negate set containing strings');

	return data;
}

const processClass = (item, options, computed = computeClass(item, options)) => {
	const negative = item.negative;
	const { singleChars, transformed, longStrings } = computed;
	if (transformed) {
		const bmpOnly = containsAstral(singleChars);
		const setStr = singleChars.toString({ ...options, bmpOnly });
		if (negative) {
			if (config.useUnicodeFlag) {
				updatePattern(item, `[^${setStr[0] === '[' ? setStr.slice(1, -1) : setStr}]`)
			} else {
				if (config.flags.unicode || config.flags.unicodeSets) {
					if (config.flags.ignoreCase) {
						const astralCharsSet = singleChars.clone().intersection(ASTRAL_SET);
						const surrogateOrBMPSetStr = singleChars.clone().remove(astralCharsSet).addRange(0xd800, 0xdfff).toString({ bmpOnly: true });
						const astralNegSetStr = ASTRAL_SET.clone().remove(astralCharsSet).toString(options);
						updatePattern(item, `(?!${surrogateOrBMPSetStr})[^]|${astralNegSetStr}`);
					} else {
						const negativeSet = UNICODE_SET.clone().remove(singleChars);
						updatePattern(item, negativeSet.toString(options));
					}
				} else {
					updatePattern(item, `(?!${setStr})[^]`);
				}
			}
		} else {
			const hasEmptyString = longStrings.has('');
			const pieces = [...longStrings].sort((a, b) => b.length - a.length);

			if (setStr !== '[]' || !longStrings.size) {
				pieces.splice(pieces.length - (hasEmptyString ? 1 : 0), 0, setStr);
			}

			updatePattern(item, pieces.join('|'));
		}
	}
	return item;
};

const checkUnmatchedReferences = groups => {
	const unmatchedNames = Object.keys(groups.unmatchedReferences);
	if (unmatchedNames.length) throw new Error(`Unknown group names: ${unmatchedNames}`);
};

const handleModifiers = (item, options, groups) => {
	const enabling = item.modifierFlags.enabling;
	const disabling = item.modifierFlags.disabling;

	delete item.modifierFlags;
	item.behavior = 'ignore';
	const oldData = { ...config.modifiersData };

	enabling.split('').forEach(flag => config.modifiersData[flag] = true);
	disabling.split('').forEach(flag => config.modifiersData[flag] = false);

	item.body = item.body.map(term => processTerm(term, options, groups));

	config.modifiersData = oldData;

	return item;
}

const processTerm = (item, options, groups) => {
	switch (item.type) {
		case 'dot':
			if (config.transform.unicodeFlag) {
				updatePattern(item, getUnicodeDotSet(config.flags.dotAll || config.modifiersData.s).toString(options));
			} else if (config.transform.dotAllFlag || config.modifiersData.s) {
				updatePattern(item, '[^]');
			}
			break;
		case 'characterClass':
			return processClass(item, options);
		case 'unicodePropertyEscape':
			const data = getEscapeCharacterClassData(item.value, item.negative);
			if (data.maybeIncludesStrings) {
				if (!config.flags.unicodeSets) {
					throw new Error('Properties of strings are only supported with unicodeSets (v) flag.');
				}
				if (config.transform.unicodeSetsFlag) {
					data.transformed = true;
					return processClass(item, options, data);
				}
			} else if (config.transform.unicodePropertyEscapes) {
				updatePattern(item, data.singleChars.toString(options));
			}
			break;
		case 'characterClassEscape':
			if (config.transform.unicodeFlag) {
				updatePattern(item, getEscapeSet(item.value, true, config.flags.ignoreCase).toString(options));
			}
			break;
		case 'group':
			if (item.behavior === 'normal') groups.lastIndex++;
			if (item.name) {
				const name = item.name.value;
				if (groups.namesConflicts[name]) throw new Error(`Group '${name}' already defined in this context.`);
				groups.namesConflicts[name] = true;
				if (config.transform.namedGroups) delete item.name;
				const index = groups.lastIndex;
				if (!groups.names[name]) groups.names[name] = [];
				groups.names[name].push(index);
				if (groups.onNamedGroup) groups.onNamedGroup(name, index);
				if (groups.unmatchedReferences[name]) delete groups.unmatchedReferences[name];
			}
			if (item.modifierFlags && config.transform.modifiers) return handleModifiers(item, options, groups);
		case 'quantifier':
			item.body = item.body.map(term => processTerm(term, options, groups));
			break;
		case 'disjunction':
			const outerConflicts = groups.namesConflicts;
			item.body = item.body.map(term => {
				groups.namesConflicts = Object.create(outerConflicts);
				return processTerm(term, options, groups);
			});
			break;
		case 'alternative':
			item.body = flatMap(item.body, term => {
				const res = processTerm(term, options, groups);
				return res.type === 'alternative' ? res.body : res;
			});
			break;
		case 'value':
			const cp = item.codePoint;
			const set = regenerate(cp).add(foldMaybe(cp));
			if (set.size === 1 && item.kind === 'symbol' && cp >= 0x20 && cp <= 0x7E) break;
			updatePattern(item, set.toString(options));
			break;
		case 'reference':
			if (item.name) {
				const name = item.name.value;
				const indexes = groups.names[name];
				if (!indexes) groups.unmatchedReferences[name] = true;
				if (config.transform.namedGroups) {
					if (indexes) {
						const body = indexes.map(index => ({
							'type': 'reference',
							'matchIndex': index,
							'raw': '\\' + index,
						}));
						if (body.length === 1) return body[0];
						return { 'type': 'alternative', 'body': body, 'raw': body.map(term => term.raw).join('') };
					}
					return { 'type': 'group', 'behavior': 'ignore', 'body': [], 'raw': '(?:)' };
				}
			}
			break;
		case 'anchor':
			if (config.modifiersData.m) {
				if (item.kind === 'start') updatePattern(item, `(?:^|(?<=${NEWLINE_SET.toString()}))`);
				if (item.kind === 'end') updatePattern(item, `(?:$|(?=${NEWLINE_SET.toString()}))`);
			}
		case 'empty':
			break;
		default:
			throw new Error(`Unknown term type: ${ item.type }`);
	}
	return item;
};

const config = {
	'flags': {
		'ignoreCase': false,
		'unicode': false,
		'unicodeSets': false,
		'dotAll': false,
		'multiline': false,
	},
	'transform': {
		'dotAllFlag': false,
		'unicodeFlag': false,
		'unicodeSetsFlag': false,
		'unicodePropertyEscapes': false,
		'namedGroups': false,
		'modifiers': false,
	},
	'modifiersData': {
		'i': undefined,
		's': undefined,
		'm': undefined,
	},
	get useUnicodeFlag() {
		return (this.flags.unicode || this.flags.unicodeSets) && !this.transform.unicodeFlag;
	}
};

const validateOptions = options => {
	if (!options) return;
	Object.entries(options).forEach(([key, value]) => {
		switch (key) {
			case 'dotAllFlag':
			case 'unicodeFlag':
			case 'unicodePropertyEscapes':
			case 'unicodeSetsFlag':
			case 'namedGroups':
				if (value !== null && value !== false && value !== 'transform') {
					throw new Error(`.${key} must be false (default) or 'transform'.`);
				}
				break;
			case 'modifiers':
				if (value !== null && value !== false && value !== 'parse' && value !== 'transform') {
					throw new Error(`.${key} must be false (default), 'parse' or 'transform'.`);
				}
				break;
			case 'onNamedGroup':
			case 'onNewFlags':
				if (value !== null && typeof value !== 'function') {
					throw new Error(`.${key} must be a function.`);
				}
				break;
			default:
				throw new Error(`.${key} is not a valid regexpu-core option.`);
		}
	});
};

const hasFlag = (flags, flag) => flags ? flags.includes(flag) : false;
const transform = (options, name) => options ? options[name] === 'transform' : false;

const rewritePattern = (pattern, flags, options) => {
	validateOptions(options);

	config.flags.unicode = hasFlag(flags, 'u');
	config.flags.unicodeSets = hasFlag(flags, 'v');
	config.flags.ignoreCase = hasFlag(flags, 'i');
	config.flags.dotAll = hasFlag(flags, 's');
	config.flags.multiline = hasFlag(flags, 'm');

	config.transform.dotAllFlag = config.flags.dotAll && transform(options, 'dotAllFlag');
	config.transform.unicodeFlag = (config.flags.unicode || config.flags.unicodeSets) && transform(options, 'unicodeFlag');
	config.transform.unicodeSetsFlag = config.flags.unicodeSets && transform(options, 'unicodeSetsFlag');
	config.transform.unicodePropertyEscapes = (config.flags.unicode || config.flags.unicodeSets) && (transform(options, 'unicodeFlag') || transform(options, 'unicodePropertyEscapes'));
	config.transform.namedGroups = transform(options, 'namedGroups');
	config.transform.modifiers = transform(options, 'modifiers');

	config.modifiersData.i = undefined;
	config.modifiersData.s = undefined;
	config.modifiersData.m = undefined;

	const parserFeatures = {
		'modifiers': Boolean(options && options.modifiers),
		'unicodePropertyEscape': true,
		'unicodeSet': true,
		'namedGroups': true,
		'lookbehind': true,
	};

	const regenOptions = {
		'hasUnicodeFlag': config.useUnicodeFlag,
		'bmpOnly': !config.flags.unicode && !config.flags.unicodeSets
	};

	const groupInfo = {
		'onNamedGroup': options && options.onNamedGroup,
		'lastIndex': 0,
		'names': Object.create(null),
		'namesConflicts': Object.create(null),
		'unmatchedReferences': Object.create(null)
	};

	const ast = parse(pattern, flags, parserFeatures);

	if (config.transform.modifiers) {
		if (/\(\?[a-z]*-[a-z]+:/.test(pattern)) {
			const allDisabledMods = Object.create(null);
			const stack = [ast];
			let node;
			while (node = stack.pop(), node != undefined) {
				if (Array.isArray(node)) stack.push(...node);
				else if (typeof node === 'object' && node !== null) {
					Object.entries(node).forEach(([key, value]) => {
						if (key === 'modifierFlags' && value.disabling.length) {
							value.disabling.split('').forEach(flag => allDisabledMods[flag] = true);
						} else if (typeof value === 'object' && value !== null) {
							stack.push(value);
						}
					});
				}
			}
			Object.keys(allDisabledMods).forEach(flag => config.modifiersData[flag] = true);
		}
	}

	processTerm(ast, regenOptions, groupInfo);
	checkUnmatchedReferences(groupInfo);

	const onNewFlagsCallback = options && options.onNewFlags;
	if (onNewFlagsCallback) {
		let newFlags = flags.split('').filter(flag => !config.modifiersData[flag]).join('');
		if (config.transform.unicodeSetsFlag) newFlags = newFlags.replace('v', 'u');
		if (config.transform.unicodeFlag) newFlags = newFlags.replace('u', '');
		if (config.transform.dotAllFlag === 'transform') newFlags = newFlags.replace('s', '');
		onNewFlagsCallback(newFlags);
	}

	return generate(ast);
};

module.exports = rewritePattern;
