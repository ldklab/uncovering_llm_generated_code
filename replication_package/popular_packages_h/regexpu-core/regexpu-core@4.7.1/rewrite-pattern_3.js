'use strict';

const generate = require('regjsgen').generate;
const parse = require('regjsparser').parse;
const regenerate = require('regenerate');
const unicodeMatchProperty = require('unicode-match-property-ecmascript');
const unicodeMatchPropertyValue = require('unicode-match-property-value-ecmascript');
const iuMappings = require('./data/iu-mappings.js');
const ESCAPE_SETS = require('./data/character-class-escape-sets.js');

const UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
const BMP_SET = regenerate().addRange(0x0, 0xFFFF);

const DOT_SET_UNICODE = UNICODE_SET.clone().remove(
	0x000A, 0x000D, 0x2028, 0x2029
);

const getCharacterClassEscapeSet = (character, unicode, ignoreCase) => {
	if (unicode) {
		if (ignoreCase) {
			return ESCAPE_SETS.UNICODE_IGNORE_CASE.get(character);
		}
		return ESCAPE_SETS.UNICODE.get(character);
	}
	return ESCAPE_SETS.REGULAR.get(character);
};

const getUnicodeDotSet = (dotAll) => {
	return dotAll ? UNICODE_SET : DOT_SET_UNICODE;
};

const getUnicodePropertyValueSet = (property, value) => {
	const path = value ? `${property}/${value}` : `Binary_Property/${property}`;
	try {
		return require(`regenerate-unicode-properties/${path}.js`);
	} catch (exception) {
		throw new Error(`Failed to recognize value \`${value}\` for property \`${property}\`.`);
	}
};

const handleLoneUnicodePropertyNameOrValue = (value) => {
	try {
		const property = 'General_Category';
		const category = unicodeMatchPropertyValue(property, value);
		return getUnicodePropertyValueSet(property, category);
	} catch (exception) {}
	const property = unicodeMatchProperty(value);
	return getUnicodePropertyValueSet(property);
};

const getUnicodePropertyEscapeSet = (value, isNegative) => {
	const parts = value.split('=');
	const firstPart = parts[0];
	let set;
	if (parts.length == 1) {
		set = handleLoneUnicodePropertyNameOrValue(firstPart);
	} else {
		const property = unicodeMatchProperty(firstPart);
		const value = unicodeMatchPropertyValue(property, parts[1]);
		set = getUnicodePropertyValueSet(property, value);
	}
	if (isNegative) {
		return UNICODE_SET.clone().remove(set);
	}
	return set.clone();
};

regenerate.prototype.iuAddRange = function(min, max) {
	const $this = this;
	do {
		const folded = caseFold(min);
		if (folded) {
			$this.add(folded);
		}
	} while (++min <= max);
	return $this;
};

const update = (item, pattern) => {
	let tree = parse(pattern, config.useUnicodeFlag ? 'u' : '');
	switch (tree.type) {
		case 'characterClass':
		case 'group':
		case 'value':
			break;
		default:
			tree = wrap(tree, pattern);
	}
	Object.assign(item, tree);
};

const wrap = (tree, pattern) => {
	return {
		'type': 'group',
		'behavior': 'ignore',
		'body': [tree],
		'raw': `(?:${pattern})`
	};
};

const caseFold = (codePoint) => {
	return iuMappings.get(codePoint) || false;
};

const processCharacterClass = (characterClassItem, regenerateOptions) => {
	const set = regenerate();
	for (const item of characterClassItem.body) {
		switch (item.type) {
			case 'value':
				set.add(item.codePoint);
				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
					const folded = caseFold(item.codePoint);
					if (folded) {
						set.add(folded);
					}
				}
				break;
			case 'characterClassRange':
				const min = item.min.codePoint;
				const max = item.max.codePoint;
				set.addRange(min, max);
				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
					set.iuAddRange(min, max);
				}
				break;
			case 'characterClassEscape':
				set.add(getCharacterClassEscapeSet(
					item.value,
					config.unicode,
					config.ignoreCase
				));
				break;
			case 'unicodePropertyEscape':
				set.add(getUnicodePropertyEscapeSet(item.value, item.negative));
				break;
			default:
				throw new Error(`Unknown term type: ${item.type}`);
		}
	}
	if (characterClassItem.negative) {
		update(characterClassItem, `(?!${set.toString(regenerateOptions)})[\\s\\S]`)
	} else {
		update(characterClassItem, set.toString(regenerateOptions));
	}
	return characterClassItem;
};

const updateNamedReference = (item, index) => {
	delete item.name;
	item.matchIndex = index;
};

const assertNoUnmatchedReferences = (groups) => {
	const unmatchedReferencesNames = Object.keys(groups.unmatchedReferences);
	if (unmatchedReferencesNames.length > 0) {
		throw new Error(`Unknown group names: ${unmatchedReferencesNames}`);
	}
};

const processTerm = (item, regenerateOptions, groups) => {
	switch (item.type) {
		case 'dot':
			if (config.useDotAllFlag) {
				break;
			} else if (config.unicode) {
				update(
					item,
					getUnicodeDotSet(config.dotAll).toString(regenerateOptions)
				);
			} else if (config.dotAll) {
				update(item, '[\\s\\S]');
			}
			break;
		case 'characterClass':
			item = processCharacterClass(item, regenerateOptions);
			break;
		case 'unicodePropertyEscape':
			if (config.unicodePropertyEscape) {
				update(
					item,
					getUnicodePropertyEscapeSet(item.value, item.negative)
						.toString(regenerateOptions)
				);
			}
			break;
		case 'characterClassEscape':
			update(
				item,
				getCharacterClassEscapeSet(
					item.value,
					config.unicode,
					config.ignoreCase
				).toString(regenerateOptions)
			);
			break;
		case 'group':
			if (item.behavior == 'normal') {
				groups.lastIndex++;
			}
			if (item.name && config.namedGroup) {
				const name = item.name.value;

				if (groups.names[name]) {
					throw new Error(
						`Multiple groups with the same name (${name}) are not allowed.`
					);
				}

				const index = groups.lastIndex;
				delete item.name;

				groups.names[name] = index;
				if (groups.onNamedGroup) {
					groups.onNamedGroup.call(null, name, index);
				}

				if (groups.unmatchedReferences[name]) {
					groups.unmatchedReferences[name].forEach(reference => {
						updateNamedReference(reference, index);
					});
					delete groups.unmatchedReferences[name];
				}
			}
		case 'alternative':
		case 'disjunction':
		case 'quantifier':
			item.body = item.body.map(term => {
				return processTerm(term, regenerateOptions, groups);
			});
			break;
		case 'value':
			const codePoint = item.codePoint;
			const set = regenerate(codePoint);
			if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
				const folded = caseFold(codePoint);
				if (folded) {
					set.add(folded);
				}
			}
			update(item, set.toString(regenerateOptions));
			break;
		case 'reference':
			if (item.name) {
				const name = item.name.value;
				const index = groups.names[name];
				if (index) {
					updateNamedReference(item, index);
					break;
				}

				if (!groups.unmatchedReferences[name]) {
					groups.unmatchedReferences[name] = [];
				}
				groups.unmatchedReferences[name].push(item);
			}
			break;
		case 'anchor':
		case 'empty':
		case 'group':
			break;
		default:
			throw new Error(`Unknown term type: ${item.type}`);
	}
	return item;
};

const config = {
	'ignoreCase': false,
	'unicode': false,
	'dotAll': false,
	'useDotAllFlag': false,
	'useUnicodeFlag': false,
	'unicodePropertyEscape': false,
	'namedGroup': false
};
const rewritePattern = (pattern, flags, options) => {
	config.unicode = flags && flags.includes('u');
	const regjsparserFeatures = {
		'unicodePropertyEscape': config.unicode,
		'namedGroups': true,
		'lookbehind': options && options.lookbehind
	};
	config.ignoreCase = flags && flags.includes('i');
	const supportDotAllFlag = options && options.dotAllFlag;
	config.dotAll = supportDotAllFlag && flags && flags.includes('s');
	config.namedGroup = options && options.namedGroup;
	config.useDotAllFlag = options && options.useDotAllFlag;
	config.useUnicodeFlag = options && options.useUnicodeFlag;
	config.unicodePropertyEscape = options && options.unicodePropertyEscape;
	if (supportDotAllFlag && config.useDotAllFlag) {
		throw new Error('`useDotAllFlag` and `dotAllFlag` cannot both be true!');
	}
	const regenerateOptions = {
		'hasUnicodeFlag': config.useUnicodeFlag,
		'bmpOnly': !config.unicode
	};
	const groups = {
		'onNamedGroup': options && options.onNamedGroup,
		'lastIndex': 0,
		'names': Object.create(null),
		'unmatchedReferences': Object.create(null)
	};
	const tree = parse(pattern, flags, regjsparserFeatures);
	processTerm(tree, regenerateOptions, groups);
	assertNoUnmatchedReferences(groups);
	return generate(tree);
};

module.exports = rewritePattern;
