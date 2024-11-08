// index.js
const babel = require('@babel/core');

module.exports = function () {
  return {
    visitor: {
      VariableDeclaration(path) {
        const node = path.node;
        
        if (!node.declarations) return;

        node.declarations.forEach((declarator) => {
          if (declarator.id.type === 'ObjectPattern' || declarator.id.type === 'ArrayPattern') {
            const { declarations } = transformDestructuring(declarator);
            path.replaceWithMultiple(declarations);
          }
        });
      },
    },
  };
};

function transformDestructuring(declarator) {
  const id = declarator.id;
  const init = declarator.init;
  let replacements = [];

  if (id.type === 'ObjectPattern') {
    id.properties.forEach((property) => {
      const key = property.key.name;
      const value = property.value.name;
      replacements.push(
        babel.template.statement.ast(`var ${value} = ${init.name}.${key};`)
      );
    });
  } else if (id.type === 'ArrayPattern') {
    id.elements.forEach((element, i) => {
      if (element) {
        replacements.push(
          babel.template.statement.ast(`var ${element.name} = ${init.name}[${i}];`)
        );
      }
    });
  }
  
  return { declarations: replacements };
}

// Usage example
const code = `
const { x, y } = obj;
const [a, b] = arr;
`;

const transformedCode = babel.transform(code, {
  plugins: [require('./index')],
});

console.log(transformedCode.code);
