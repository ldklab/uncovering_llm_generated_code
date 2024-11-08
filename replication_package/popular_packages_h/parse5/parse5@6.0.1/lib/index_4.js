'use strict';

const Parser = require('./parser');
const Serializer = require('./serializer');

exports.parse = (html, options) => new Parser(options).parse(html);

exports.parseFragment = (fragmentContext, html, options) => {
    if (typeof fragmentContext === 'string') {
        [fragmentContext, html, options] = [null, fragmentContext, html];
    }
    return new Parser(options).parseFragment(html, fragmentContext);
};

exports.serialize = (node, options) => new Serializer(node, options).serialize();
