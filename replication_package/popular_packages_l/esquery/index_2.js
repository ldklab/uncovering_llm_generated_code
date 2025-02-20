const esprima = require('esprima');

class ESQuery {
    constructor(ast) {
        this.ast = ast;
    }

    query(selector) {
        const queryObj = this.parseSelector(selector);
        return this.findMatches(this.ast, queryObj);
    }
    
    parseSelector(selector) {
        const components = selector.split(' ');
        return components.map(component => this.parseComponent(component));
    }

    parseComponent(component) {
        if (component.includes('[')) {
            const [attr, value] = component.match(/\[(.*?)\]/)[1].split('=');
            return { type: 'attribute', attribute: attr, value: value };
        }
        if (component.startsWith(':')) {
            return { type: 'pseudo', pseudo: component.slice(1) };
        }
        if (component === '>') {
            return { type: 'combinator', combinator: 'child' };
        }
        return { type: 'node', nodeType: component };
    }

    findMatches(node, queryObj, results = [], parent = null) {
        for (let query of queryObj) {
            if (this.isMatch(node, query, parent)) {
                results.push(node);
            }

            if (node.body && Array.isArray(node.body)) {
                node.body.forEach(child => this.findMatches(child, queryObj, results, node));
            }
        }
        
        return results;
    }

    isMatch(node, query, parent) {
        switch (query.type) {
            case 'node':
                return node.type === query.nodeType;
            case 'attribute':
                return node[query.attribute] === query.value;
            case 'pseudo':
                return this.matchPseudo(node, query.pseudo);
            case 'combinator':
                return parent && parent.type === query.parentNodeType;
            default:
                return false;
        }
    }
    
    matchPseudo(node, pseudo) {
        if (pseudo === 'first-child') {
            return node.parent && node.parent.body[0] === node;
        }
        if (pseudo === 'last-child') {
            return node.parent && node.parent.body[node.parent.body.length - 1] === node;
        }
        return false;
    }
}

// Example usage:
const code = `
    function example(a, b) {
        return a + b;
    }

    for (let i = 0; i < 10; i++) {
        console.log(i);
    }
`;

const ast = esprima.parseScript(code);
const esquery = new ESQuery(ast);

const results = esquery.query('ForStatement');
console.log('Query Results:', results);
