// css-what.js
class CSSwhat {
  
  static parse(selector) {
    const result = [];
    const groups = selector.split(',');
  
    for (const group of groups) {
      const tokens = [];
      let current = '';
      let inAttribute = false;
      let inPseudo = false;
  
      for (let char of group.trim()) {
        if (char === '[') {
          inAttribute = true;
          if (current) {
            tokens.push({ type: 'tag', name: current });
            current = '';
          }
        } else if (char === ']') {
          tokens.push({ type: 'attribute', name: current, action: 'exists', value: '', ignoreCase: false });
          current = '';
          inAttribute = false;
        } else if (char === ':' && !inAttribute) {
          if (current) {
            tokens.push({ type: 'tag', name: current });
            current = '';
          }
          inPseudo = true;
        } else if (['>', '<', '~', '+'].includes(char) && !inAttribute && !inPseudo) {
          if (current) {
            tokens.push({ type: 'tag', name: current });
            current = '';
          }
          const typeMap = { '>': 'child', '<': 'parent', '~': 'sibling', '+': 'adjacent' };
          tokens.push({ type: typeMap[char] });
        } else if (char.match(/\s/) && !inAttribute && !inPseudo) {
          if (current) {
            tokens.push({ type: 'tag', name: current });
            current = '';
          }
          tokens.push({ type: 'descendant' });
        } else if (char === '(' && inPseudo) {
          const [name, data] = current.split('(');
          tokens.push({ type: 'pseudo', name: name, data: data.slice(0, -1) });
          current = '';
          inPseudo = false;
        } else if (char === ')' && inPseudo) {
          tokens.push({ type: 'pseudo', name: current, data: null });
          current = '';
          inPseudo = false;
        } else {
          current += char;
        }
      }
  
      if (current) {
        tokens.push({ type: 'tag', name: current });
      }
  
      result.push(tokens);
    }
    return result;
  }
  
  static stringify(selector) {
    return selector.map(group => group.map(token => {
      switch (token.type) {
        case 'tag': return token.name;
        case 'attribute': return `[${token.name}]`;
        case 'pseudo': return `:${token.name}${token.data ? '(' + token.data + ')' : ''}`;
        case 'child': return '>';
        case 'parent': return '<';
        case 'sibling': return '~';
        case 'adjacent': return '+';
        case 'descendant': return ' ';
        case 'universal': return '*';
        case 'column-combinator': return '||';
        default: return '';
      }
    }).join('')).join(', ');
  }
  
}

module.exports = CSSwhat;

// Example usage:
const CSSwhat = require('./css-what');

// Parsing a simple example
console.log(CSSwhat.parse("foo[bar]:baz"));

// Stringifying the parsed selector back
console.log(CSSwhat.stringify([[{ type: "tag", name: "foo" }, { type: "attribute", name: "bar", action: "exists", value: "", ignoreCase: false }, { type: "pseudo", name: "baz", data: null }]]));
