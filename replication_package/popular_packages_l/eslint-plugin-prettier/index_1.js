// lib/index.js
const { CLIEngine } = require('eslint');
const prettier = require('prettier');
const requireIndex = require('requireindex');

// Export all rules in `rules` directory
module.exports.rules = requireIndex(__dirname + "/rules");

// lib/rules/prettier.js
module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: "Run Prettier as an ESLint rule",
      category: "Stylistic Issues",
      recommended: true
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      {
        type: "object",
        properties: {
          usePrettierrc: { type: "boolean" },
          fileInfoOptions: {
            type: "object",
            properties: {
              withNodeModules: { type: "boolean" }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const prettierOptionsFromContext = context.options[1] || {};
    const usePrettierrc = prettierOptionsFromContext.usePrettierrc !== false;
    const sourceCode = context.getSourceCode();
    const filePath = context.getFilename();

    return {
      Program() {
        const prettierRcOptions = usePrettierrc
          ? prettier.resolveConfig.sync(filePath, { editorconfig: true })
          : {};
        const prettierOptions = { ...prettierRcOptions, ...options, filepath: filePath };

        const formatted = prettier.format(sourceCode.text, prettierOptions);
        
        if (formatted !== sourceCode.text) {
          context.report({
            loc: { line: 1, column: 0 },
            message: 'Code style issues found in the analyzed file. Run `eslint --fix` to automatically fix them.',
            fix(fixer) {
              return fixer.replaceTextRange([0, sourceCode.text.length], formatted);
            }
          });
        }
      }
    };
  }
};

// lib/util/getPrettierConfig.js
const prettier = require('prettier');

function getPrettierConfig(filePath) {
  return prettier.resolveConfig.sync(filePath, { editorconfig: true });
}

module.exports = getPrettierConfig;
