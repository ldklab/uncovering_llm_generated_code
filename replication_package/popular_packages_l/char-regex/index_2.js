// Build a regex to match extended grapheme clusters
'use strict';

const buildCharRegex = () => {
    return new RegExp(
        '(?:' +
            // Standalone combining mark; not preceded by a base letter
            '(?!\\p{L}\\p{M}*\\p{M})\\p{M}' + 
            '|' +
            // Character not followed by a continuation marker
            '\\P{M}\\p{M}*?' + 
            '|' +
            // Full grapheme cluster; includes emoji, sequences, modifiers
            '\\P{M}\\p{M}*\\p{Emoji}(?:\\u200D\\p{Emoji})*' + 
            ')',
        'gu' // Global and Unicode flags for full string processing
    );
};

module.exports = buildCharRegex;
