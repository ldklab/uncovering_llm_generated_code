// graphemer.js

class Graphemer {
    constructor() {
        this.breakRules = this.initializeBreakRules();
    }
    
    initializeBreakRules() {
        return {
            SurrogatePair: (current, next) => {
                return (0xD800 <= current && current <= 0xDBFF) &&
                       (0xDC00 <= next && next <= 0xDFFF);
            },
            CombiningMark: (current, next) => {
                return (this.isBaseChar(current) && this.isCombiningMark(next));
            },
        };
    }
    
    isBaseChar(codePoint) {
        return codePoint >= 0x0041 && codePoint <= 0x007A;
    }
    
    isCombiningMark(codePoint) {
        return codePoint >= 0x0300 && codePoint <= 0x036F;
    }

    splitGraphemes(text) {
        let segments = [];
        let currentSegment = '';
        for (let i = 0; i < text.length; i++) {
            const current = text.charCodeAt(i);
            const next = text.charCodeAt(i + 1);
            currentSegment += text[i];

            if (!this.shouldBreak(current, next)) continue;

            segments.push(currentSegment);
            currentSegment = '';
        }
        
        if (currentSegment) {
            segments.push(currentSegment);
        }
        
        return segments;
    }

    iterateGraphemes(text) {
        return this.splitGraphemes(text).values();
    }

    countGraphemes(text) {
        return this.splitGraphemes(text).length;
    }
    
    shouldBreak(current, next) {
        if (next === undefined) return true;
        if (this.breakRules.SurrogatePair(current, next)) return false;
        if (this.breakRules.CombiningMark(current, next)) return false;
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.default = Graphemer;
}