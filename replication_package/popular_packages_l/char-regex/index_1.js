// index.js
'use strict';

const createUnicodeCharacterRegex = () => {
    const regexPattern = 
          '(?:' +
            '(?!\\p{L}\\p{M}*\\p{M})\\p{M}' + 
            '|' +
            '\\P{M}\\p{M}*?' +
            '|' +
            '\\P{M}\\p{M}*\\p{Emoji}(?:\\u200D\\p{Emoji})*' + 
          ')';
          
    return new RegExp(regexPattern, 'gu');
};

module.exports = createUnicodeCharacterRegex;
