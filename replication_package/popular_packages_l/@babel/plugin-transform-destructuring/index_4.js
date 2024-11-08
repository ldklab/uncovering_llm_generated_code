// newIndex.js
const babel = require('@babel/core');

module.exports = function () {
  return {
    visitor: {
      VariableDeclaration(path) {
        const declarations = path.node.declarations;
        if (!declarations) return;

        declarations.forEach((declarator) => {
          const idType = declarator.id.type;
          if (idType === 'ObjectPattern' || idType === 'ArrayPattern') {
            const { newDeclarations, comment } = convertDestructuringToAssignments(declarator);
            path.replaceWithMultiple([...newDeclarations, comment]);
          }
        });
      },
    },
  };
};

function convertDestructuringToAssignments(declarator) {
  const { id, init } = declarator;
  const variableAssignments = [];

  if (id.type === 'ObjectPattern') {
    id.properties.forEach(({ key, value }) => {
      const assignmentCode = `var ${value.name} = ${init.name}.${key.name};`;
      variableAssignments.push(babel.template.statement.ast(assignmentCode));
    });
  } else if (id.type === 'ArrayPattern') {
    id.elements.forEach((elem, index) => {
      if (elem) {
        const assignmentCode = `var ${elem.name} = ${init.name}[${index}];`;
        variableAssignments.push(babel.template.statement.ast(assignmentCode));
      }
    });
  }

  return {
    newDeclarations: variableAssignments,
    comment: babel.template.statement.ast(`// original declaration`)
  };
}

// Usage example
const sourceCode = `
const { x, y } = obj;
const [a, b] = arr;
`;

const output = babel.transform(sourceCode, {
  plugins: [require('./newIndex')],
});

console.log(output.code);
