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
		if (Array.isArray(res)) {
			result.push(...res);
		} else {
			result.push(res);
		}
	});
	return result;
}

function hasAstralCodePoint(regenerateData) {
	const data = regenerateData.data;
	return data.length > 0 && data[data.length - 1] >= 0x10000;
}

const ESCAPE_CHARS = /([\\^$.*+?()[\]{}|])/g;

const FULL_UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
const ASTRAL_UNICODE_SET = regenerate().addRange(0x10000, 0x10FFFF);
const NEW_LINE_SET = regenerate(0x000A, 0x000D, 0x2028, 0x2029);

const UNICODE_DOT_SET = FULL_UNICODE_SET.clone().remove(NEW_LINE_SET);

const getEscapeSet = (character, unicode, ignoreCase) => {
	if (unicode) {
		if (ignoreCase) {
			return ESCAPE_SETS.UNICODE_IGNORE_CASE.get(character);
		}
		return ESCAPE_SETS.UNICODE.get(character);
	}
	return ESCAPE_SETS.REGULAR.get(character);
};

const getUnicodeDotSet = (dotAll) => {
	return dotAll ? FULL_UNICODE_SET : UNICODE_DOT_SET;
};

const getUnicodePropertySet = (property, value) => {
	const path = value ? `${property}/${value}` : `Binary_Property/${property}`;
	try {
		return require(`regenerate-unicode-properties/${path}.js`);
	} catch {
		throw new Error(`Failed to recognize value \`${value}\` for property \`${property}\`.`);
	}
};

const handleSingleUnicodeProperty = (value) => {
	try {
		const property = 'General_Category';
		const category = unicodeMatchPropertyValue(property, value);
		return getUnicodePropertySet(property, category);
	} catch {}
	try {
		return getUnicodePropertySet('Property_of_Strings', value);
	} catch {}
	const property = unicodeMatchProperty(value);
	return getUnicodePropertySet(property);
};

const getPropertyEscapeSet = (value, isNegative) => {
	const parts = value.split('=');
	const firstPart = parts[0];
	let set;
	if (parts.length === 1) {
		set = handleSingleUnicodeProperty(firstPart);
	} else {
		const property = unicodeMatchProperty(firstPart);
		const value = unicodeMatchPropertyValue(property, parts[1]);
		set = getUnicodePropertySet(property, value);
	}
	if (isNegative) {
		if (set.strings) {
			throw new Error('Cannot negate Unicode property of strings');
		}
		return {
			characters: FULL_UNICODE_SET.clone().remove(set.characters),
			strings: new Set()
		};
	}
	return {
		characters: set.characters.clone(),
		strings: set.strings ? new Set(set.strings.map(str => str.replace(ESCAPE_CHARS, '\\$1'))) : new Set()
	};
};

const getEmptyClassData = () => ({
	transformed: config.transform.unicodeFlag,
	singleChars: regenerate(),
	longStrings: new Set(),
	hasEmptyString: false,
	first: true,
	maybeIncludesStrings: false
});

const caseFolding = (codePoint) => {
	const asciiFold = requireCaseFoldAscii();
	const unicodeFold = requireCaseFoldUnicode();
	let folded = (unicodeFold ? iuMappings.get(codePoint) : undefined) || [];
	if (typeof folded === 'number') folded = [folded];
	if (asciiFold) {
		if (codePoint >= 0x41 && codePoint <= 0x5A) {
			folded.push(codePoint + 0x20);
		} else if (codePoint >= 0x61 && codePoint <= 0x7A) {
			folded.push(codePoint - 0x20);
		}
	}
	return folded.length === 0 ? false : folded;
};

function requireCaseFoldAscii() {
	return !!config.modifiersData.i;
}

function requireCaseFoldUnicode() {
	if (config.modifiersData.i === false) return false;
	if (!config.transform.unicodeFlag) return false;
	return Boolean(config.modifiersData.i || config.flags.ignoreCase);
}

function adjustCodePointRangeSet(min, max, operation) {
	const $this = this;
	do {
		const folded = caseFolding(min);
		if (folded) {
			$this[operation](folded);
		}
	} while (++min <= max);
	return $this;
}

regenerate.prototype.iuAddRange = function(min, max) {
	return adjustCodePointRangeSet.call(this, min, max, 'add');
};

regenerate.prototype.iuRemoveRange = function(min, max) {
	return adjustCodePointRangeSet.call(this, min, max, 'remove');
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
			tree = wrapInGroup(tree, pattern);
	}
	Object.assign(item, tree);
};

const wrapInGroup = (tree, pattern) => ({
	'type': 'group',
	'behavior': 'ignore',
	'body': [tree],
	'raw': `(?:${pattern})`
});

const handleCharacterClass = (characterClassItem, regenerateOptions, computed = analyzeCharacterClass(characterClassItem, regenerateOptions)) => {
	const { singleChars, transformed, longStrings } = computed;
	if (transformed) {
		const onlyBMP = !hasAstralCodePoint(singleChars);
		const setStr = singleChars.toString({ bmpOnly: onlyBMP });
		if (characterClassItem.negative) {
			if (config.useUnicodeFlag) {
				updatePattern(characterClassItem, `[^${setStr[0] === '[' ? setStr.slice(1, -1) : setStr}]`);
			} else {
				if (config.flags.unicode || config.flags.unicodeSets) {
					if (config.flags.ignoreCase) {
						const astralCharsSet = singleChars.clone().intersection(ASTRAL_UNICODE_SET);
						const surrogateOrBMPSetStr = singleChars
							.clone()
							.remove(astralCharsSet)
							.addRange(0xd800, 0xdfff)
							.toString({ bmpOnly: true });
						const astralNegativeSetStr = ASTRAL_UNICODE_SET
							.clone()
							.remove(astralCharsSet)
							.toString(regenerateOptions);
						updatePattern(characterClassItem, `(?!${surrogateOrBMPSetStr})[^]|${astralNegativeSetStr}`);
					} else {
						const negativeSet = FULL_UNICODE_SET.clone().remove(singleChars);
						updatePattern(characterClassItem, negativeSet.toString(regenerateOptions));
					}
				} else {
					updatePattern(characterClassItem, `(?!${setStr})[^]`);
				}
			}
		} else {
			const hasEmptyStr = longStrings.has('');
			const pieces = Array.from(longStrings).sort((a, b) => b.length - a.length);
			if (setStr !== '[]' || longStrings.size === 0) {
				pieces.splice(pieces.length - (hasEmptyStr ? 1 : 0), 0, setStr);
			}
			updatePattern(characterClassItem, pieces.join('|'));
		}
	}
	return characterClassItem;
};

const analyzeCharacterClass = (characterClassItem, regenerateOptions) => {
	let data = getEmptyClassData();
	let positiveHandler;
	let negativeHandler;
	switch (characterClassItem.kind) {
		case 'union':
			positiveHandler = buildSetHandler('union');
			negativeHandler = buildSetHandler('union-negative');
			break;
		case 'intersection':
			positiveHandler = buildSetHandler('intersection');
			negativeHandler = buildSetHandler('subtraction');
			if (config.transform.unicodeSetsFlag) data.transformed = true;
			break;
		case 'subtraction':
			positiveHandler = buildSetHandler('subtraction');
			negativeHandler = buildSetHandler('intersection');
			if (config.transform.unicodeSetsFlag) data.transformed = true;
			break;
		default:
			throw new Error(`Unknown character class kind: ${characterClassItem.kind}`);
	}
	const caseFoldAscii = requireCaseFoldAscii();
	const caseFoldUnicode = requireCaseFoldUnicode();
	for (const item of characterClassItem.body) {
		switch (item.type) {
			case 'value':
				caseFolding(item.codePoint).forEach((cp) => {
					positiveHandler.single(data, cp);
				});
				break;
			case 'characterClassRange':
				const min = item.min.codePoint;
				const max = item.max.codePoint;
				positiveHandler.range(data, min, max);
				if (caseFoldAscii || caseFoldUnicode) {
					positiveHandler.iuRange(data, min, max);
					data.transformed = true;
				}
				break;
			case 'characterClassEscape':
				positiveHandler.regSet(data, getEscapeSet(item.value, config.flags.unicode || config.flags.unicodeSets, config.flags.ignoreCase));
				break;
			case 'unicodePropertyEscape':
				const nestedData = getPropertyEscapeSet(item.value, item.negative);
				positiveHandler.nested(data, nestedData);
				data.transformed = data.transformed || config.transform.unicodePropertyEscapes || (nestedData.maybeIncludesStrings || characterClassItem.kind !== "union");
				break;
			case 'characterClass':
				const chosenHandler = item.negative ? negativeHandler : positiveHandler;
				const res = analyzeCharacterClass(item, regenerateOptions);
				chosenHandler.nested(data, res);
				data.transformed = true;
				break;
			case 'classStrings':
				positiveHandler.nested(data, gatherClassStringsData(item, regenerateOptions));
				data.transformed = true;
				break;
			default:
				throw new Error(`Unknown term type: ${item.type}`);
		}
		data.first = false;
	}
	if (characterClassItem.negative && data.maybeIncludesStrings) {
		throw new SyntaxError('Cannot negate set containing strings');
	}
	return data;
};

const buildSetHandler = (action) => {
	switch (action) {
		case 'union':
			return {
				single: (current, cp) => current.singleChars.add(cp),
				regSet: (current, set) => current.singleChars.add(set),
				range: (current, start, end) => current.singleChars.addRange(start, end),
				iuRange: (current, start, end) => current.singleChars.iuAddRange(start, end),
				nested: (current, nestedRes) => {
					current.singleChars.add(nestedRes.singleChars);
					for (const str of nestedRes.longStrings) current.longStrings.add(str);
					if (nestedRes.maybeIncludesStrings) current.maybeIncludesStrings = true;
				}
			};
		case 'union-negative':
			const regSet = (current, set) => {
				current.singleChars = FULL_UNICODE_SET.clone().remove(set).add(current.singleChars);
			};
			return {
				single: (current, cp) => {
					const unicode = FULL_UNICODE_SET.clone();
					current.singleChars = current.singleChars.contains(cp) ? unicode : unicode.remove(cp);
				},
				regSet: regSet,
				range: (current, start, end) => current.singleChars = FULL_UNICODE_SET.clone().removeRange(start, end).add(current.singleChars),
				iuRange: (current, start, end) => current.singleChars = FULL_UNICODE_SET.clone().iuRemoveRange(start, end).add(current.singleChars),
				nested: (current, nestedRes) => {
					regSet(current, nestedRes.singleChars);
					if (nestedRes.maybeIncludesStrings) throw new Error('ASSERTION ERROR');
				}
			};
		case 'intersection':
			const regSetIntersection = (current, set) => {
				if (current.first) current.singleChars = set;
				else current.singleChars.intersection(set);
			};
			return {
				single: (current, cp) => {
					current.singleChars = current.first || current.singleChars.contains(cp) ? regenerate(cp) : regenerate();
					current.longStrings.clear();
					current.maybeIncludesStrings = false;
				},
				regSet: regSetIntersection,
				range: (current, start, end) => {
					if (current.first) current.singleChars.addRange(start, end);
					else current.singleChars.intersection(regenerate().addRange(start, end));
					current.longStrings.clear();
					current.maybeIncludesStrings = false;
				},
				iuRange: (current, start, end) => {
					if (current.first) current.singleChars.iuAddRange(start, end);
					else current.singleChars.intersection(regenerate().iuAddRange(start, end));
					current.longStrings.clear();
					current.maybeIncludesStrings = false;
				},
				nested: (current, nestedRes) => {
					regSetIntersection(current, nestedRes.singleChars);
					if (current.first) {
						current.longStrings = nestedRes.longStrings;
						current.maybeIncludesStrings = nestedRes.maybeIncludesStrings;
					} else {
						for (const str of current.longStrings) {
							if (!nestedRes.longStrings.has(str)) current.longStrings.delete(str);
						}
						if (!nestedRes.maybeIncludesStrings) current.maybeIncludesStrings = false;
					}
				}
			};
		case 'subtraction':
			const regSetSubtraction = (current, set) => {
				if (current.first) current.singleChars.add(set);
				else current.singleChars.remove(set);
			};
			return {
				single: (current, cp) => {
					if (current.first) current.singleChars.add(cp);
					else current.singleChars.remove(cp);
				},
				regSet: regSetSubtraction,
				range: (current, start, end) => {
					if (current.first) current.singleChars.addRange(start, end);
					else current.singleChars.removeRange(start, end);
				},
				iuRange: (current, start, end) => {
					if (current.first) current.singleChars.iuAddRange(start, end);
					else current.singleChars.iuRemoveRange(start, end);
				},
				nested: (current, nestedRes) => {
					regSetSubtraction(current, nestedRes.singleChars);
					if (current.first) {
						current.longStrings = nestedRes.longStrings;
						current.maybeIncludesStrings = nestedRes.maybeIncludesStrings;
					} else {
						for (const str of current.longStrings) {
							if (nestedRes.longStrings.has(str)) current.longStrings.delete(str);
						}
					}
				}
			};
		default:
			throw new Error(`Unknown set action: ${characterClassItem.kind}`);
	}
};

const gatherClassStringsData = (classStrings, regenerateOptions) => {
	let data = getEmptyClassData();
	const asciiFold = requireCaseFoldAscii();
	const unicodeFold = requireCaseFoldUnicode();
	for (const string of classStrings.strings) {
		if (string.characters.length === 1) {
			caseFolding(string.characters[0].codePoint).forEach((cp) => {
				data.singleChars.add(cp);
			});
		} else {
			let stringifiedString;
			if (unicodeFold || asciiFold) {
				stringifiedString = '';
				for (const ch of string.characters) {
					let set = regenerate(ch.codePoint);
					const folded = caseFolding(ch.codePoint);
					if (folded) set.add(folded);
					stringifiedString += set.toString(regenerateOptions);
				}
			} else {
				stringifiedString = string.characters.map(ch => generate(ch)).join('');
			}
			data.longStrings.add(stringifiedString);
			data.maybeIncludesStrings = true;
		}
	}
	return data;
};

const assertNoUnmatchedRefs = (groups) => {
	const unmatchedNames = Object.keys(groups.unmatchedReferences);
	if (unmatchedNames.length > 0) {
		throw new Error(`Unknown group names: ${unmatchedNames}`);
	}
};

const handleModifiers = (item, regenerateOptions, groups) => {
	const enabling = item.modifierFlags.enabling;
	const disabling = item.modifierFlags.disabling;
	delete item.modifierFlags;
	item.behavior = 'ignore';
	const oldData = { ...config.modifiersData };
	enabling.split('').forEach(flag => {
		config.modifiersData[flag] = true;
	});
	disabling.split('').forEach(flag => {
		config.modifiersData[flag] = false;
	});
	item.body = item.body.map(term => processTerm(term, regenerateOptions, groups));
	config.modifiersData = oldData;
	return item;
};

const processTerm = (item, regenerateOptions, groups) => {
	switch (item.type) {
		case 'dot':
			if (config.transform.unicodeFlag) {
				updatePattern(
					item,
					getUnicodeDotSet(config.flags.dotAll || config.modifiersData.s).toString(regenerateOptions)
				);
			} else if (config.transform.dotAllFlag || config.modifiersData.s) {
				updatePattern(item, '[^]');
			}
			break;
		case 'characterClass':
			item = handleCharacterClass(item, regenerateOptions);
			break;
		case 'unicodePropertyEscape':
			const unicodePropertyData = getPropertyEscapeSet(item.value, item.negative);
			if (unicodePropertyData.maybeIncludesStrings) {
				if (!config.flags.unicodeSets) {
					throw new Error('Properties of strings are only supported when using the unicodeSets (v) flag.');
				}
				if (config.transform.unicodeSetsFlag) {
					item = handleCharacterClass(item, regenerateOptions, unicodePropertyData);
				}
			} else if (config.transform.unicodePropertyEscapes) {
				updatePattern(item, unicodePropertyData.singleChars.toString(regenerateOptions));
			}
			break;
		case 'characterClassEscape':
			if (config.transform.unicodeFlag) {
				updatePattern(item, getEscapeSet(item.value, true, config.flags.ignoreCase).toString(regenerateOptions));
			}
			break;
		case 'group':
			if (item.behavior === 'normal') {
				groups.lastIndex++;
			}
			if (item.name) {
				const name = item.name.value;
				if (groups.namesConflicts[name]) {
					throw new Error(`Group '${name}' has already been defined in this context.`);
				}
				groups.namesConflicts[name] = true;
				if (config.transform.namedGroups) {
					delete item.name;
				}
				const index = groups.lastIndex;
				if (!groups.names[name]) {
					groups.names[name] = [];
				}
				groups.names[name].push(index);
				if (groups.onNamedGroup) {
					groups.onNamedGroup(name, index);
				}
				if (groups.unmatchedReferences[name]) {
					delete groups.unmatchedReferences[name];
				}
			}
			if (item.modifierFlags && config.transform.modifiers) {
				return handleModifiers(item, regenerateOptions, groups);
			}
		case 'quantifier':
			item.body = item.body.map(term => processTerm(term, regenerateOptions, groups));
			break;
		case 'disjunction':
			const outerConflicts = groups.namesConflicts;
			item.body = item.body.map(term => {
				groups.namesConflicts = Object.create(outerConflicts);
				return processTerm(term, regenerateOptions, groups);
			});
			break;
		case 'alternative':
			item.body = flatMap(item.body, term => {
				const res = processTerm(term, regenerateOptions, groups);
				return res.type === 'alternative' ? res.body : res;
			});
			break;
		case 'value':
			const cp = item.codePoint;
			const set = regenerate(cp);
			const folded = caseFolding(cp);
			if (folded.length === 1 && item.kind === "symbol" && folded[0] >= 0x20 && folded[0] <= 0x7E) {
				break;
			}
			set.add(folded);
			updatePattern(item, set.toString(regenerateOptions));
			break;
		case 'reference':
			if (item.name) {
				const name = item.name.value;
				const indexes = groups.names[name];
				if (!indexes) {
					groups.unmatchedReferences[name] = true;
				}
				if (config.transform.namedGroups) {
					if (indexes) {
						const body = indexes.map(index => ({ 'type': 'reference', 'matchIndex': index, 'raw': '\\' + index }));
						return body.length === 1 ? body[0] : { 'type': 'alternative', 'body': body, 'raw': body.map(term => term.raw).join('') };
					}
					return { 'type': 'group', 'behavior': 'ignore', 'body': [], 'raw': '(?:)' };
				}
			}
			break;
		case 'anchor':
			if (config.modifiersData.m) {
				if (item.kind === 'start') {
					updatePattern(item, `(?:^|(?<=${NEW_LINE_SET.toString()}))`);
				} else if (item.kind === 'end') {
					updatePattern(item, `(?:$|(?=${NEW_LINE_SET.toString()}))`);
				}
			}
		case 'empty':
			break;
		default:
			throw new Error(`Unknown term type: ${item.type}`);
	}
	return item;
};

const config = {
	'flags': {
		'ignoreCase': false,
		'unicode': false,
		'unicodeSets': false,
		'dotAll': false,
		'multiline': false
	},
	'transform': {
		'dotAllFlag': false,
		'unicodeFlag': false,
		'unicodeSetsFlag': false,
		'unicodePropertyEscapes': false,
		'namedGroups': false,
		'modifiers': false,
	},
	'modifiersData': { 'i': undefined, 's': undefined, 'm': undefined },
	get useUnicodeFlag() {
		return (this.flags.unicode || this.flags.unicodeSets) && !this.transform.unicodeFlag;
	}
};

const validateOptions = (options) => {
	if (!options) return;
	for (const key of Object.keys(options)) {
		const value = options[key];
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
	}
};

const hasFlag = (flags, flag) => flags ? flags.includes(flag) : false;

const transformOption = (options, name) => options ? options[name] === 'transform' : false;

const rewritePattern = (pattern, flags, options) => {
	validateOptions(options);
	config.flags.unicode = hasFlag(flags, 'u');
	config.flags.unicodeSets = hasFlag(flags, 'v');
	config.flags.ignoreCase = hasFlag(flags, 'i');
	config.flags.dotAll = hasFlag(flags, 's');
	config.flags.multiline = hasFlag(flags, 'm');
	config.transform.dotAllFlag = config.flags.dotAll && transformOption(options, 'dotAllFlag');
	config.transform.unicodeFlag = (config.flags.unicode || config.flags.unicodeSets) && transformOption(options, 'unicodeFlag');
	config.transform.unicodeSetsFlag = config.flags.unicodeSets && transformOption(options, 'unicodeSetsFlag');
	config.transform.unicodePropertyEscapes = (config.flags.unicode || config.flags.unicodeSets) && (config.transform.unicodeFlag || transformOption(options, 'unicodePropertyEscapes'));
	config.transform.namedGroups = transformOption(options, 'namedGroups');
	config.transform.modifiers = transformOption(options, 'modifiers');
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
	const regenerateOptions = {
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
	const tree = parse(pattern, flags, parserFeatures);
	if (config.transform.modifiers) {
		if (/\(\?[a-z]*-[a-z]+:/.test(pattern)) {
			const allDisabledModifiers = Object.create(null);
			const itemStack = [tree];
			let node;
			while (node = itemStack.pop(), node !== undefined) {
				if (Array.isArray(node)) {
					itemStack.push(...node);
				} else if (typeof node === 'object' && node !== null) {
					for (const key of Object.keys(node)) {
						const value = node[key];
						if (key === 'modifierFlags') {
							if (value.disabling.length > 0) {
								value.disabling.split('').forEach((flag) => {
									allDisabledModifiers[flag] = true;
								});
							}
						} else if (typeof value === 'object' && value !== null) {
							itemStack.push(value);
						}
					}
				}
			}
			for (const flag of Object.keys(allDisabledModifiers)) {
				config.modifiersData[flag] = true;
			}
		}
	}
	processTerm(tree, regenerateOptions, groupInfo);
	assertNoUnmatchedRefs(groupInfo);
	const onNewFlagsCallback = options && options.onNewFlags;
	if (onNewFlagsCallback) {
		let newFlags = flags.split('').filter((flag) => !config.modifiersData[flag]).join('');
		if (config.transform.unicodeSetsFlag) {
			newFlags = newFlags.replace('v', 'u');
		}
		if (config.transform.unicodeFlag) {
			newFlags = newFlags.replace('u', '');
		}
		if (config.transform.dotAllFlag === 'transform') {
			newFlags = newFlags.replace('s', '');
		}
		onNewFlagsCallback(newFlags);
	}
	return generate(tree);
};

module.exports = rewritePattern;
