'use strict';

const types = require('../../tokenizer/types.cjs');

function consumeRaw() {
    return this.Raw(this.consumeUntilLeftCurlyBracket, true);
}

function consumePrelude() {
    const prelude = this.SelectorList();

    if (prelude.type !== 'Raw' &&
        this.eof === false &&
        this.tokenType !== types.LeftCurlyBracket) {
        this.error();
    }

    return prelude;
}

const name = 'Rule';
const walkContext = 'rule';
const structure = {
    prelude: ['SelectorList', 'Raw'],
    block: ['Block']
};

function parse() {
    const startToken = this.tokenIndex;
    const startOffset = this.tokenStart;
    let prelude;
    let block;

    if (this.parseRulePrelude) {
        prelude = this.parseWithFallback(consumePrelude, consumeRaw);
    } else {
        prelude = consumeRaw.call(this, startToken);
    }

    this.skipSC();
    this.eat(types.LeftCurlyBracket);

    block = this.Block(true);

    if (!this.eof) {
        this.eat(types.RightCurlyBracket);
    }

    return {
        type: 'Rule',
        loc: this.getLocation(startOffset, this.tokenStart),
        prelude,
        block
    };
}
function generate(node) {
    this.node(node.prelude);
    this.token(types.LeftCurlyBracket, '{');
    this.node(node.block);
    this.token(types.RightCurlyBracket, '}');
}

exports.generate = generate;
exports.name = name;
exports.parse = parse;
exports.structure = structure;
exports.walkContext = walkContext;
