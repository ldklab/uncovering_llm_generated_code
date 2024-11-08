const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
const SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
const SPLIT_REPLACE_VALUE = "$1\0$2";
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";

// Splitting functions
export function split(value) {
    let result = value.trim();
    result = result
        .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
        .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE)
        .replace(DEFAULT_STRIP_REGEXP, "\0");

    let start = 0;
    let end = result.length;
    while (result.charAt(start) === "\0") start++;
    while (end > start && result.charAt(end - 1) === "\0") end--;

    return start < end ? result.slice(start, end).split("\0") : [];
}

export function splitSeparateNumbers(value) {
    const words = split(value);
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
        if (match) {
            const offset = match.index + (match[1] ?? match[2]).length;
            words.splice(i, 1, word.slice(0, offset), word.slice(offset));
        }
    }
    return words;
}

// Case transformation functions
export function noCase(input, options) {
    return transform(input, options, (word) => word.toLowerCase(), " ");
}

export function camelCase(input, options) {
    return transform(input, options, (word, index) => index === 0 ? word.toLowerCase() : capitalize(word, options?.locale), "");
}

export function pascalCase(input, options) {
    return transform(input, options, (word) => capitalize(word, options?.locale), "");
}

export function pascalSnakeCase(input, options) {
    return capitalCase(input, { delimiter: "_", ...options });
}

export function capitalCase(input, options) {
    const delimiter = options?.delimiter ?? " ";
    return transform(input, options, (word) => capitalize(word, options?.locale), delimiter);
}

export function constantCase(input, options) {
    return transform(input, options, (word) => word.toUpperCase(), "_");
}

export function dotCase(input, options) {
    return noCase(input, { delimiter: ".", ...options });
}

export function kebabCase(input, options) {
    return noCase(input, { delimiter: "-", ...options });
}

export function pathCase(input, options) {
    return noCase(input, { delimiter: "/", ...options });
}

export function sentenceCase(input, options) {
    return formatSentence(input, options);
}

export function snakeCase(input, options) {
    return noCase(input, { delimiter: "_", ...options });
}

export function trainCase(input, options) {
    return capitalCase(input, { delimiter: "-", ...options });
}

// Helper functions
function lowerFactory(locale) {
    return function (input) {
        return locale === false ? input.toLowerCase() : input.toLocaleLowerCase(locale);
    };
}

function upperFactory(locale) {
    return function (input) {
        return locale === false ? input.toUpperCase() : input.toLocaleUpperCase(locale);
    };
}

function capitalize(word, locale) {
    if (!word) return "";
    const [first, ...rest] = word;
    const toLower = lowerFactory(locale);
    const toUpper = upperFactory(locale);
    return toUpper(first) + toLower(rest.join(''));
}

function transform(input, options, transformFn, delimiter) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    return prefix + words.map((word, index) => transformFn(word, index)).join(options?.delimiter ?? delimiter) + suffix;
}

function formatSentence(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    const transform = capitalCaseTransformFactory(lowerFactory(options?.locale), upperFactory(options?.locale));
    return prefix + words.map((word, index) => index === 0 ? transform(word) : word.toLowerCase()).join(options?.delimiter ?? " ") + suffix;
}

function splitPrefixSuffix(input, options = {}) {
    const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
    const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
    const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;

    let prefixIndex = 0;
    let suffixIndex = input.length;

    while (prefixIndex < suffixIndex && prefixCharacters.includes(input[prefixIndex])) {
        prefixIndex++;
    }

    while (suffixIndex > prefixIndex && suffixCharacters.includes(input[suffixIndex - 1])) {
        suffixIndex--;
    }

    return [
        input.slice(0, prefixIndex),
        splitFn(input.slice(prefixIndex, suffixIndex)),
        input.slice(suffixIndex)
    ];
}

function capitalCaseTransformFactory(lowerFn, upperFn) {
    return function (word) {
        return upperFn(word[0]) + lowerFn(word.slice(1));
    };
}
