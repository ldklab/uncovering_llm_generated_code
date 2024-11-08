(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

const { parse } = require('graphql/language/parser');

function normalize(str) {
    return str.replace(/[\s,]+/g, ' ').trim();
}

let docCache = {};
let fragmentSourceMap = {};

function cacheKeyFromLoc(loc) {
    return normalize(loc.source.body.substring(loc.start, loc.end));
}

function resetCaches() {
    docCache = {};
    fragmentSourceMap = {};
}

let printFragmentWarnings = true;
function processFragments(ast) {
    const astFragmentMap = {};
    const definitions = [];

    for (const fragmentDefinition of ast.definitions) {
        if (fragmentDefinition.kind === 'FragmentDefinition') {
            const fragmentName = fragmentDefinition.name.value;
            const sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);

            if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {
                if (printFragmentWarnings) {
                    console.warn(
                        `Warning: fragment with name ${fragmentName} already exists.\n` +
                        `graphql-tag enforces all fragment names across your application to be unique; ` +
                        `read more about this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names`
                    );
                }
                fragmentSourceMap[fragmentName][sourceKey] = true;
            } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
                fragmentSourceMap[fragmentName] = { [sourceKey]: true };
            }

            if (!astFragmentMap[sourceKey]) {
                astFragmentMap[sourceKey] = true;
                definitions.push(fragmentDefinition);
            }
        } else {
            definitions.push(fragmentDefinition);
        }
    }

    ast.definitions = definitions;
    return ast;
}

function disableFragmentWarnings() {
    printFragmentWarnings = false;
}

function stripLoc(doc, removeLocAtThisLevel) {
    const docType = Object.prototype.toString.call(doc);

    if (docType === '[object Array]') {
        return doc.map(d => stripLoc(d, removeLocAtThisLevel));
    }

    if (docType !== '[object Object]') {
        throw new Error('Unexpected input.');
    }

    if (removeLocAtThisLevel && doc.loc) {
        delete doc.loc;
    }

    if (doc.loc) {
        delete doc.loc.startToken;
        delete doc.loc.endToken;
    }

    const keys = Object.keys(doc);

    for (const key of keys) {
        const value = doc[key];
        const valueType = Object.prototype.toString.call(value);

        if (valueType === '[object Object]' || valueType === '[object Array]') {
            doc[key] = stripLoc(value, true);
        }
    }

    return doc;
}

let experimentalFragmentVariables = false;
function parseDocument(doc) {
    const cacheKey = normalize(doc);

    if (docCache[cacheKey]) {
        return docCache[cacheKey];
    }

    let parsed = parse(doc, { experimentalFragmentVariables });
    if (!parsed || parsed.kind !== 'Document') {
        throw new Error('Not a valid GraphQL document.');
    }

    parsed = processFragments(parsed);
    parsed = stripLoc(parsed, false);
    docCache[cacheKey] = parsed;

    return parsed;
}

function enableExperimentalFragmentVariables() {
    experimentalFragmentVariables = true;
}

function disableExperimentalFragmentVariables() {
    experimentalFragmentVariables = false;
}

function gql(...args) {
    const literals = args[0];
    let result = typeof literals === "string" ? literals : literals[0];

    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg && arg.kind === 'Document') {
            result += arg.loc.source.body;
        } else {
            result += args[i];
        }
        result += literals[i];
    }

    return parseDocument(result);
}

gql.default = gql;
gql.resetCaches = resetCaches;
gql.disableFragmentWarnings = disableFragmentWarnings;
gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

module.exports = gql;

})));
//# sourceMappingURL=graphql-tag.umd.js.map
