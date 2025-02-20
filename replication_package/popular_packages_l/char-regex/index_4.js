// index.js
'use strict';

// Function to build a regular expression for matching Unicode characters, 
// including complex emoji and grapheme clusters.
const buildCharRegex = () => {
    return new RegExp(
        '(?:' +
            // Matches a standalone combining mark if not preceded by a base character.
            '(?!\\p{L}\\p{M}*\\p{M})\\p{M}' + 
            '|' +
            // Matches characters not followed by continuation markers for extended sequences.
            '\\P{M}\\p{M}*?' + 
            '|' +
            // Matches a full grapheme, which may contain combining marks, 
            // emoji, modifiers, and zero-width joiners.
            '\\P{M}\\p{M}*\\p{Emoji}(?:\\u200D\\p{Emoji})*' + 
            ')',
        'gu' // Global and Unicode flags are used for proper Unicode handling and finding all matches.
    );
};

// Export the function for use in other files.
module.exports = buildCharRegex;
