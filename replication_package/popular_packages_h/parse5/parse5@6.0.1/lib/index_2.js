'use strict';

const Parser = require('./parser');
const Serializer = require('./serializer');

module.exports = {
    parse(html, options) {
        return new Parser(options).parse(html);
    },

    parseFragment(contextOrHtml, maybeHtml, options) {
        let fragmentContext = null;
        let html = contextOrHtml;

        if (typeof contextOrHtml === 'string') {
            options = maybeHtml;
        } else {
            fragmentContext = contextOrHtml;
            html = maybeHtml;
        }

        return new Parser(options).parseFragment(html, fragmentContext);
    },

    serialize(node, options) {
        return new Serializer(node, options).serialize();
    }
};
