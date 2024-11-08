// jsonc-parser.js

class JSONScanner {
    constructor(text, ignoreTrivia) {
        this.text = text;
        this.ignoreTrivia = ignoreTrivia;
        this.reset();
    }
    
    reset() {
        this.pos = 0;
        this.token = null;
    }
    
    setPosition(pos) {
        this.pos = pos;
        this.token = null;
    }
    
    scan() {
        return this._scanNext();
    }
    
    _scanNext() {
        if (this.pos >= this.text.length) return 'EOF';
        const char = this.text[this.pos++];
        if (!this.ignoreTrivia || (char !== ' ' && char !== '\n')) {
            this.token = char;
            return char;
        }
        return this._scanNext();
    }

    getPosition() {
        return this.pos;
    }

    getToken() {
        return this.token;
    }

    getTokenValue() {
        return this.token;
    }

    getTokenOffset() {
        return this.pos - 1;
    }

    getTokenLength() {
        return this.token ? this.token.length : 0;
    }
}

function createScanner(text, ignoreTrivia = false) {
    return new JSONScanner(text, ignoreTrivia);
}

function parse(text, errors = [], options = {}) {
    let result;
    try {
        result = JSON.parse(text);
    } catch (error) {
        errors.push({ error: 'PARSE_ERROR' });
        result = {};
    }
    return result;
}

function stripComments(text, replaceCh = '') {
    return text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, replaceCh);
}

function getLocation(text, position) {
    return {
        path: [],
        isAtPropertyKey: false
    };
}

function format(documentText, range = null, options = {}) {
    return [{ offset: 0, length: documentText.length, content: documentText.trim() }];
}

function applyEdits(text, edits) {
    edits.forEach(edit => {
        text = text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
    });
    return text;
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
