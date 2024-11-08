// index.js
'use strict';

const buildCharRegex = () => {
    // This pattern accounts for extended grapheme clusters which are used for emoji sequences and other multi-codepoint characters.
    // The pattern consists of matching a character (including emoji) using Unicode property escapes.
    // - `\p{RI}` matches regional indicators for flags.
    // - `\p{Emoji}` ensures we are targeting emojis.
    // - Various other code points and patterns catch complex sequences including 'zwj' and keycap sequence.
    return new RegExp(
        '(?:' +
            // Match a standalone combining mark, when not preceded by a potential base.
            '(?!\\p{L}\\p{M}*\\p{M})\\p{M}' + 
            '|' +
            // Match certain characters only when not followed by an extended sequence continuation marker.
            '\\P{M}\\p{M}*?' + 
            '|' +
            // Match a full character grapheme, possibly combining marks, modifiers, and zero width joiners.
            '\\P{M}\\p{M}*\\p{Emoji}(?:\\u200D\\p{Emoji})*' + 
            ')',
        'gu' // Global flag to find all matches. Unicode flag for handling Unicode code points properly.
    );
};

module.exports = buildCharRegex;
