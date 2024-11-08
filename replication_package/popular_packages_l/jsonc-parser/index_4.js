// jsonc-parser-rewrite.js

class JSONScanner {
    constructor(text, ignoreTrivia) {
        this.text = text;
        this.ignoreTrivia = ignoreTrivia;
        this.resetScanner();
    }
    
    resetScanner() {
        this.position = 0;
        this.currentToken = null;
    }
    
    updatePosition(newPosition) {
        this.position = newPosition;
        this.currentToken = null;
    }
    
    getNextToken() {
        return this._getNextCharacter();
    }
    
    _getNextCharacter() {
        if (this.position >= this.text.length) return 'EOF';
        
        const currentCharacter = this.text[this.position++];
        if (!this.ignoreTrivia || (currentCharacter !== ' ' && currentCharacter !== '\n')) {
            this.currentToken = currentCharacter;
            return currentCharacter;
        }
        return this._getNextCharacter();
    }

    getCurrentPosition() {
        return this.position;
    }

    getCurrentToken() {
        return this.currentToken;
    }

    getCurrentTokenValue() {
        return this.currentToken;
    }

    getCurrentTokenOffset() {
        return this.position - 1;
    }

    getCurrentTokenLength() {
        return this.currentToken ? this.currentToken.length : 0;
    }
}

function createScanner(text, ignoreTrivia = false) {
    return new JSONScanner(text, ignoreTrivia);
}

function parse(text, errors = [], options = {}) {
    let parseResult;
    try {
        parseResult = JSON.parse(text);
    } catch (error) {
        errors.push({ error: 'PARSE_ERROR' });
        parseResult = {};
    }
    return parseResult;
}

function stripComments(inputText, replacement = '') {
    return inputText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, replacement);
}

function getLocation(inputText, pos) {
    return {
        path: [],
        isAtPropertyKey: false
    };
}

function format(documentText, range = null, options = {}) {
    return [{ offset: 0, length: documentText.length, content: documentText.trim() }];
}

function applyEdits(inputText, edits) {
    edits.forEach(edit => {
        inputText = inputText.substring(0, edit.offset) + edit.content + inputText.substring(edit.offset + edit.length);
    });
    return inputText;
}

module.exports = {
    createScanner,
    parse,
    parseTree: parse,
    visit: parse,
    stripComments,
    getLocation,
    format,
    applyEdits
};
