// lib/index.js
const { CLIEngine } = require('eslint');
const prettier = require('prettier');
const requireIndex = require('requireindex');
const getPrettierConfig = require('./util/getPrettierConfig');

// load all rules in `rules` directory
module.exports.rules = requireIndex(__dirname + "/rules");

// lib/rules/prettier.js
const prettier = require('prettier');

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
        properties: {
          // Prettier options
        },
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
    const fileInfoOptions = prettierOptionsFromContext.fileInfoOptions || {};

    const sourceCode = context.getSourceCode();
    const filePath = context.getFilename();

    return {
      Program() {
        const prettierRcOptions = usePrettierrc
          ? prettier.resolveConfig.sync(filePath, { editorconfig: true })
          : {};
        const prettierOptions = Object.assign(
          {},
          prettierRcOptions,
          options,
          { filepath: filePath }
        );

        // Get the formatted output
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
const fs = require('fs');
const path = require('path');

function getPrettierConfig(filePath) {
  const options = { editorconfig: true };
  return prettier.resolveConfig.sync(filePath, options);
}

module.exports = getPrettierConfig;
