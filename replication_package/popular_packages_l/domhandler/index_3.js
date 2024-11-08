// domhandler.js
class DomHandler {
    constructor(callback, options = {}) {
        this.callback = callback;
        this.options = options;
        this.dom = [];
        this.root = { children: this.dom };
    }

    // Adds start and end indices to a node if options allow
    _addIndices(node, start, end) {
        if (this.options.withStartIndices) node.startIndex = start;
        if (this.options.withEndIndices) node.endIndex = end;
    }

    // Handles text nodes
    ontext(data, start, end) {
        const node = { data, type: 'text' };
        this._addIndices(node, start, end);
        this.dom.push(node);
    }

    // Handles tag opening
    onopentag(name, attribs, start, end) {
        const node = {
            type: name,
            name: name,
            attribs: attribs,
            children: []
        };
        this._addIndices(node, start, end);
        this.dom.push(node);
    }

    // Handles comments
    oncomment(data, start, end) {
        const node = { data, type: 'comment' };
        this._addIndices(node, start, end);
        this.dom.push(node);
    }

    // Called when the parsing ends
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
