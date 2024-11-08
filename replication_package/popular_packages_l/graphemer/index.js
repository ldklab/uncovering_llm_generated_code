// graphemer.js

class Graphemer {
    constructor() {
        // Load grapheme break data or rules for different Unicode versions here
        this.breakRules = this.loadBreakRules();
    }
    
    loadBreakRules() {
        // This function represents the initialization of the grapheme breaking rules
        // based on Unicode specifications. Normally, this could involve loading a
        // complex set of rules or data, but for simplicity, let's assume a basic setup.
        
        return {
            // These are pseudo-rules for illustration. Real rules would be based on
            // the Unicode UAX #29 report.
            SurrogatePair: (current, next) => {
                return (0xD800 <= current && current <= 0xDBFF) &&
                       (0xDC00 <= next && next <= 0xDFFF);
            },
            CombiningMark: (current, next) => {
                // This is a simplified check.
                return (this.isBaseChar(current) && this.isCombiningMark(next));
            },
            // Other complex rules would go here
        }
    }
    
    isBaseChar(codePoint) {
        // Determine if the codePoint is a base character
        // Simplified check, real checks would be based on Unicode data
        return codePoint >= 0x0041 && codePoint <= 0x007A;
    }
    
    isCombiningMark(codePoint) {
        // Determine if the codePoint is a combining mark
        // Simplified check, real checks would be based on Unicode data
        return codePoint >= 0x0300 && codePoint <= 0x036F;
    }

    splitGraphemes(string) {
        let graphemes = [];
        let currentGrapheme = '';
        for (let i = 0; i < string.length; i++) {
            const currentChar = string.charCodeAt(i);
            const nextChar = string.charCodeAt(i + 1);

            currentGrapheme += string[i];
            
            if (!this.shouldBreak(currentChar, nextChar)) {
                continue;
            }

            graphemes.push(currentGrapheme);
            currentGrapheme = '';
        }
        
        if (currentGrapheme) {
            graphemes.push(currentGrapheme); // push remaining grapheme if there is any
        }
        
        return graphemes;
    }

    iterateGraphemes(string) {
        const graphemes = this.splitGraphemes(string);
        return graphemes.values();
    }

    countGraphemes(string) {
        return this.splitGraphemes(string).length;
    }
    
    shouldBreak(current, next) {
        // Check all break rules to decide if a break should occur
        if (next === undefined) return true; // Always break at the end of the string
        // Example break rule checks:
        if (this.breakRules.SurrogatePair(current, next)) return false;
        if (this.breakRules.CombiningMark(current, next)) return false;
        return true; // Default behavior, break
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.default = Graphemer;
}
