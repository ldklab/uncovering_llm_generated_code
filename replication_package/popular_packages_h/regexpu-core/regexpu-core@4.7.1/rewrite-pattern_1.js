'use strict';

const { generate } = require('regjsgen');
const { parse } = require('regjsparser');
const regenerate = require('regenerate');
const unicodeMatchProperty = require('unicode-match-property-ecmascript');
const unicodeMatchPropertyValue = require('unicode-match-property-value-ecmascript');
const iuMappings = require('./data/iu-mappings.js');
const ESCAPE_SETS = require('./data/character-class-escape-sets.js');

const UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
const BMP_SET = regenerate().addRange(0x0, 0xFFFF);
const DOT_SET_UNICODE = UNICODE_SET.clone().remove(0x000A, 0x000D, 0x2028, 0x2029);

const getCharacterClassEscapeSet = (character, unicode, ignoreCase) => {
    if (unicode) {
        return ignoreCase ? ESCAPE_SETS.UNICODE_IGNORE_CASE.get(character) : ESCAPE_SETS.UNICODE.get(character);
    }
    return ESCAPE_SETS.REGULAR.get(character);
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
        const category = unicodeMatchPropertyValue('General_Category', value);
        return getUnicodePropertyValueSet('General_Category', category);
    } catch {}
    const property = unicodeMatchProperty(value);
    return getUnicodePropertyValueSet(property);
};

const getUnicodePropertyEscapeSet = (value, isNegative) => {
    const parts = value.split('=');
    const set = parts.length == 1
        ? handleLoneUnicodePropertyNameOrValue(parts[0])
        : getUnicodePropertyValueSet(unicodeMatchProperty(parts[0]), unicodeMatchPropertyValue(parts[0], parts[1]));
    
    return isNegative ? UNICODE_SET.clone().remove(set) : set.clone();
};

regenerate.prototype.iuAddRange = function(min, max) {
    do {
        const folded = caseFold(min);
        if (folded) {
            this.add(folded);
        }
    } while (++min <= max);
    return this;
};

const caseFold = (codePoint) => iuMappings.get(codePoint) || false;

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
                const { min, max } = item;
                set.addRange(min.codePoint, max.codePoint);
                if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
                    set.iuAddRange(min.codePoint, max.codePoint);
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
    if (characterClassItem.negative) {
        update(characterClassItem, `(?!${set.toString(regenerateOptions)})[\\s\\S]`);
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
    const names = Object.keys(groups.unmatchedReferences);
    if (names.length > 0) {
        throw new Error(`Unknown group names: ${names}`);
    }
};

const processTerm = (item, regenerateOptions, groups) => {
    switch (item.type) {
        case 'dot':
            if (!config.useDotAllFlag) {
                if (config.unicode) {
                    const pattern = getUnicodeDotSet(config.dotAll).toString(regenerateOptions);
                    update(item, pattern);
                } else if (config.dotAll) {
                    update(item, '[\\s\\S]');
                }
            }
            break;
        case 'characterClass':
            processCharacterClass(item, regenerateOptions);
            break;
        case 'unicodePropertyEscape':
            if (config.unicodePropertyEscape) {
                const pattern = getUnicodePropertyEscapeSet(item.value, item.negative).toString(regenerateOptions);
                update(item, pattern);
            }
            break;
        case 'characterClassEscape':
            const pattern = getCharacterClassEscapeSet(item.value, config.unicode, config.ignoreCase).toString(regenerateOptions);
            update(item, pattern);
            break;
        case 'group':
            if (item.behavior === 'normal') groups.lastIndex++;
            if (item.name && config.namedGroup) {
                const name = item.name.value;
                if (groups.names[name]) {
                    throw new Error(`Multiple groups with name (${name}) not allowed`);
                }
                const index = groups.lastIndex;
                delete item.name;

                groups.names[name] = index;
                if (groups.onNamedGroup) {
                    groups.onNamedGroup(name, index);
                }

                if (groups.unmatchedReferences[name]) {
                    for (const reference of groups.unmatchedReferences[name]) {
                        updateNamedReference(reference, index);
                    }
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
    ignoreCase: false,
    unicode: false,
    dotAll: false,
    useDotAllFlag: false,
    useUnicodeFlag: false,
    unicodePropertyEscape: false,
    namedGroup: false
};

const rewritePattern = (pattern, flags, options = {}) => {
    config.unicode = flags?.includes('u');
    const regjsparserFeatures = {
        unicodePropertyEscape: config.unicode,
        namedGroups: true,
        lookbehind: options.lookbehind
    };
    config.ignoreCase = flags?.includes('i');
    const supportDotAllFlag = options.dotAllFlag;
    config.dotAll = supportDotAllFlag && flags?.includes('s');
    config.namedGroup = options.namedGroup;
    config.useDotAllFlag = options.useDotAllFlag;
    config.useUnicodeFlag = options.useUnicodeFlag;
    config.unicodePropertyEscape = options.unicodePropertyEscape;

    if (supportDotAllFlag && config.useDotAllFlag) {
        throw new Error('`useDotAllFlag` and `dotAllFlag` cannot both be true!');
    }

    const regenerateOptions = {
        hasUnicodeFlag: config.useUnicodeFlag,
        bmpOnly: !config.unicode
    };

    const groups = {
        onNamedGroup: options.onNamedGroup,
        lastIndex: 0,
        names: Object.create(null),
        unmatchedReferences: Object.create(null)
    };

    const tree = parse(pattern, flags, regjsparserFeatures);
    processTerm(tree, regenerateOptions, groups);
    assertNoUnmatchedReferences(groups);
    return generate(tree);
};

module.exports = rewritePattern;
