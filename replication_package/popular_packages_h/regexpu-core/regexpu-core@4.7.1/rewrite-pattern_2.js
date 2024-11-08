'use strict';

const { generate } = require('regjsgen');
const { parse } = require('regjsparser');
const regenerate = require('regenerate');
const unicodeMatchProperty = require('unicode-match-property-ecmascript');
const unicodeMatchPropertyValue = require('unicode-match-property-value-ecmascript');
const iuMappings = require('./data/iu-mappings.js');
const ESCAPE_SETS = require('./data/character-class-escape-sets.js');

// Regenerate sets for Unicode handling
const UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
const BMP_SET = regenerate().addRange(0x0, 0xFFFF);
const DOT_SET_UNICODE = UNICODE_SET.clone().remove(0x000A, 0x000D, 0x2028, 0x2029);

// Escape set handling based on flags
const getCharacterClassEscapeSet = (character, unicode, ignoreCase) => {
	return unicode ? (ignoreCase ? ESCAPE_SETS.UNICODE_IGNORE_CASE.get(character) : ESCAPE_SETS.UNICODE.get(character)) 
					: ESCAPE_SETS.REGULAR.get(character);
};

// Dot handling in Unicode
const getUnicodeDotSet = (dotAll) => dotAll ? UNICODE_SET : DOT_SET_UNICODE;

// Property value set retrieval
const getUnicodePropertyValueSet = (property, value) => {
	const path = value ? `${property}/${value}` : `Binary_Property/${property}`;
	try {
		return require(`regenerate-unicode-properties/${path}.js`);
	} catch {
		throw new Error(`Failed to recognize value \`${value}\` for property \`${property}\`.`);
	}
};

// Handling Unicode property names or values
const handleLoneUnicodePropertyNameOrValue = (value) => {
	try {
		const category = unicodeMatchPropertyValue('General_Category', value);
		return getUnicodePropertyValueSet('General_Category', category);
	} catch {}
	const property = unicodeMatchProperty(value);
	return getUnicodePropertyValueSet(property);
};

// Unicode property escape set
const getUnicodePropertyEscapeSet = (value, isNegative) => {
	const parts = value.split('=');
	let set = parts.length === 1 ? handleLoneUnicodePropertyNameOrValue(parts[0]) : getUnicodePropertyValueSet(
		unicodeMatchProperty(parts[0]), 
		unicodeMatchPropertyValue(unicodeMatchProperty(parts[0]), parts[1])
	);
	return isNegative ? UNICODE_SET.clone().remove(set) : set.clone();
};

// Enhancing Regenerate with case folding
regenerate.prototype.iuAddRange = function(min, max) {
	do {
		const folded = caseFold(min);
		if (folded) this.add(folded);
	} while (++min <= max);
	return this;
};

const update = (item, pattern) => {
	let tree = parse(pattern, config.useUnicodeFlag ? 'u' : '');
	if (!['characterClass', 'group', 'value'].includes(tree.type)) {
		tree = wrap(tree, pattern);
	}
	Object.assign(item, tree);
};

const wrap = (tree, pattern) => ({
	'type': 'group',
	'behavior': 'ignore',
	'body': [tree],
	'raw': `(?:${pattern})`
});

const caseFold = (codePoint) => iuMappings.get(codePoint) || false;

const processCharacterClass = (characterClassItem, regenerateOptions) => {
	const set = regenerate();
	for (const item of characterClassItem.body) {
		switch (item.type) {
			case 'value':
				set.add(item.codePoint);
				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
					const folded = caseFold(item.codePoint);
					if (folded) set.add(folded);
				}
				break;
			case 'characterClassRange':
				set.addRange(item.min.codePoint, item.max.codePoint);
				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
					set.iuAddRange(item.min.codePoint, item.max.codePoint);
				}
				break;
			case 'characterClassEscape':
				set.add(getCharacterClassEscapeSet(item.value, config.unicode, config.ignoreCase));
				break;
			case 'unicodePropertyEscape':
				set.add(getUnicodePropertyEscapeSet(item.value, item.negative));
				break;
			default:
				throw new Error(`Unknown term type: ${item.type}`);
		}
	}
	update(characterClassItem, characterClassItem.negative 
		? `(?!${set.toString(regenerateOptions)})[\\s\\S]` 
		: set.toString(regenerateOptions));
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
			if (!config.useDotAllFlag) {
				config.unicode 
					? update(item, getUnicodeDotSet(config.dotAll).toString(regenerateOptions))
					: (config.dotAll && update(item, '[\\s\\S]'));
			}
			break;
		case 'characterClass':
			item = processCharacterClass(item, regenerateOptions);
			break;
		case 'unicodePropertyEscape':
			if (config.unicodePropertyEscape) {
				update(item, getUnicodePropertyEscapeSet(item.value, item.negative).toString(regenerateOptions));
			}
			break;
		case 'characterClassEscape':
			update(item, getCharacterClassEscapeSet(item.value, config.unicode, config.ignoreCase).toString(regenerateOptions));
			break;
		case 'group':
			if (item.behavior == 'normal') groups.lastIndex++;
			if (item.name && config.namedGroup) {
				const name = item.name.value;
				if (groups.names[name]) throw new Error(`Multiple groups with the same name (${name}) are not allowed.`);
				const index = groups.lastIndex;
				delete item.name;
				groups.names[name] = index;
				groups.onNamedGroup?.call(null, name, index);
				if (groups.unmatchedReferences[name]) {
					groups.unmatchedReferences[name].forEach(reference => updateNamedReference(reference, index));
					delete groups.unmatchedReferences[name];
				}
			}
		case 'alternative':
		case 'disjunction':
		case 'quantifier':
			item.body = item.body.map(term => processTerm(term, regenerateOptions, groups));
			break;
		case 'value':
			const codePoint = item.codePoint;
			const set = regenerate(codePoint);
			if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
				const folded = caseFold(codePoint);
				if (folded) set.add(folded);
			}
			update(item, set.toString(regenerateOptions));
			break;
		case 'reference':
			const name = item.name?.value;
			const index = name && groups.names[name];
			if (index) {
				updateNamedReference(item, index);
			} else if (name) {
				(groups.unmatchedReferences[name] ??= []).push(item);
			}
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
	config.unicode = flags?.includes('u');
	const regjsparserFeatures = {
		'unicodePropertyEscape': config.unicode,
		'namedGroups': true,
		'lookbehind': options?.lookbehind
	};
	config.ignoreCase = flags?.includes('i');
	config.dotAll = options?.dotAllFlag && flags?.includes('s');
	config.namedGroup = options?.namedGroup;
	config.useDotAllFlag = options?.useDotAllFlag;
	config.useUnicodeFlag = options?.useUnicodeFlag;
	config.unicodePropertyEscape = options?.unicodePropertyEscape;

	if (options?.dotAllFlag && config.useDotAllFlag) {
		throw new Error('`useDotAllFlag` and `dotAllFlag` cannot both be true!');
	}

	const regenerateOptions = {
		'hasUnicodeFlag': config.useUnicodeFlag,
		'bmpOnly': !config.unicode
	};

	const groups = {
		'onNamedGroup': options?.onNamedGroup,
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
