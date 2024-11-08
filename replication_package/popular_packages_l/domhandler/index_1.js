// domhandler.js
class DomHandler {
    constructor(callback, options = {}) {
        this.callback = callback;
        this.options = options;
        this.dom = [];
        this.root = { children: this.dom };
    }

    _addIndices(node, start, end) {
        if (this.options.withStartIndices) node.startIndex = start;
        if (this.options.withEndIndices) node.endIndex = end;
    }

    ontext(data, start, end) {
        const node = { type: 'text', data };
        this._addIndices(node, start, end);
        this.dom.push(node);
    }

    onopentag(name, attribs, start, end) {
        const node = {
            type: name,
            name,
            attribs,
            children: []
        };
        this._addIndices(node, start, end);
        this.dom.push(node);
    }

    oncomment(data, start, end) {
        const node = { type: 'comment', data };
        this._addIndices(node, start, end);
        this.dom.push(node);
    }

    onend() {
        if (typeof this.callback === 'function') {
            this.callback(null, this.dom);
        }
    }
}

module.exports = { DomHandler };

// Usage example
const { Parser } = require('htmlparser2');
const { DomHandler } = require('./domhandler.js');

const rawHtml = "Xyz <script language=javascript>var foo = '<<bar>>';</script><!--<!-- Waah! -- -->";
const handler = new DomHandler((error, dom) => {
    if (error) {
        console.error('Parsing error:', error);
    } else {
        console.log('Parsed DOM:', dom);
    }
}, { withStartIndices: true, withEndIndices: true });

const parser = new Parser(handler);
parser.write(rawHtml);
parser.end();
