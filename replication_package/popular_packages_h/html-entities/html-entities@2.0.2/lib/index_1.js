(function (factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        const globalObj = typeof window !== 'undefined' ? window : 
                          typeof global !== 'undefined' ? global : 
                          typeof self !== 'undefined' ? self : this;
        globalObj.htmlEntities = factory();
    }
}(function () {

    const namedReferences = {
        html5: {
            entities: { /* A map of named entities */ },
            characters: { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }
        }
    };

    const regexPatterns = {
        specialChars: /[<>'"&]/g
    };

    function encode(input, options = { mode: 'specialChars', numeric: 'decimal', level: 'all' }) {
        if (!input) return '';
        const charLevel = namedReferences[options.level || 'all'].characters;
        const isHex = options.numeric === 'hexadecimal';
        
        return input.replace(regexPatterns[options.mode], char => {
            const entity = charLevel[char];
            if (entity) return entity;
            const codePoint = char.codePointAt(0);
            return isHex ? `&#x${codePoint.toString(16)};` : `&#${codePoint};`;
        });
    }

    function decode(input, options = { level: 'all', scope: 'body' }) {
        if (!input) return '';
        const entityMap = namedReferences[options.level].entities;
        const regex = /&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+);?/g; // basic for demonstration
        
        return input.replace(regex, entity => {
            if (entity.charAt(1) !== '#') return entityMap[entity] || entity;
            // More complex handling for numeric entities can be placed here
            return entity; // Placeholder for conversion logic
        });
    }

    return {
        encode,
        decode
    };

}));
