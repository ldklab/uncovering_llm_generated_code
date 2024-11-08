class Graphemer {
    constructor() {
        this.breakRules = this.loadBreakRules();
    }
    
    loadBreakRules() {
        return {
            SurrogatePair: (current, next) => 
                (0xD800 <= current && current <= 0xDBFF) && (0xDC00 <= next && next <= 0xDFFF),
            CombiningMark: (current, next) => 
                this.isBaseChar(current) && this.isCombiningMark(next),
        }
    }
    
    isBaseChar(codePoint) {
        return codePoint >= 0x0041 && codePoint <= 0x007A;
    }
    
    isCombiningMark(codePoint) {
        return codePoint >= 0x0300 && codePoint <= 0x036F;
    }

    splitGraphemes(string) {
        const graphemes = [];
        let currentGrapheme = '';
        for (let i = 0; i < string.length; i++) {
            const currentChar = string.charCodeAt(i);
            const nextChar = string.charCodeAt(i + 1);
            currentGrapheme += string[i];
            
            if (!this.shouldBreak(currentChar, nextChar)) continue;

            graphemes.push(currentGrapheme);
            currentGrapheme = '';
        }
        if (currentGrapheme) {
            graphemes.push(currentGrapheme);
        }
        return graphemes;
    }

    iterateGraphemes(string) {
        return this.splitGraphemes(string).values();
    }

    countGraphemes(string) {
        return this.splitGraphemes(string).length;
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
