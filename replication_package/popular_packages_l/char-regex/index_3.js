// index.js
'use strict';

const buildCharRegex = () => {
    // Pattern to match Unicode characters, handling complex sequences and graphemes.
    return new RegExp(
        '(?:' +
            // Match standalone combining marks, excluding typical combined cases.
            '(?!\\p{L}\\p{M}*\\p{M})\\p{M}' + 
            '|' +
            // General character match, excluding continuing grapheme sequences.
            '\\P{M}\\p{M}*?' + 
            '|' +
            // Complete grapheme including combining marks, emojis, and ZWJ sequences.
            '\\P{M}\\p{M}*\\p{Emoji}(?:\\u200D\\p{Emoji})*' + 
            ')',
        'gu' // Use global and unicode options for full coverage of Unicode characters.
    );
};

module.exports = buildCharRegex;
