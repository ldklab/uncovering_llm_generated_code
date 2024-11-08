'use strict';

const { showInvisibles, generateDifferences } = require('prettier-linter-helpers');
const { INSERT, DELETE, REPLACE } = generateDifferences;

let prettier;

function reportInsert(context, offset, text) {
  const pos = context.getSourceCode().getLocFromIndex(offset);
  const range = [offset, offset];
  context.report({
    message: 'Insert `{{ code }}`',
    data: { code: showInvisibles(text) },
    loc: { start: pos, end: pos },
    fix(fixer) {
      return fixer.insertTextAfterRange(range, text);
    },
  });
}

function reportDelete(context, offset, text) {
  const start = context.getSourceCode().getLocFromIndex(offset);
  const end = context.getSourceCode().getLocFromIndex(offset + text.length);
  const range = [offset, offset + text.length];
  context.report({
    message: 'Delete `{{ code }}`',
    data: { code: showInvisibles(text) },
    loc: { start, end },
    fix(fixer) {
      return fixer.removeRange(range);
    },
  });
}

function reportReplace(context, offset, deleteText, insertText) {
  const start = context.getSourceCode().getLocFromIndex(offset);
  const end = context.getSourceCode().getLocFromIndex(offset + deleteText.length);
  const range = [offset, offset + deleteText.length];
  context.report({
    message: 'Replace `{{ deleteCode }}` with `{{ insertCode }}`',
    data: {
      deleteCode: showInvisibles(deleteText),
      insertCode: showInvisibles(insertText),
    },
    loc: { start, end },
    fix(fixer) {
      return fixer.replaceTextRange(range, insertText);
    },
  });
}

module.exports = {
  configs: {
    recommended: {
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
        'arrow-body-style': 'off',
        'prefer-arrow-callback': 'off',
      },
    },
  },
  rules: {
    prettier: {
      meta: {
        docs: { url: 'https://github.com/prettier/eslint-plugin-prettier#options' },
        type: 'layout',
        fixable: 'code',
        schema: [
          { type: 'object', properties: {}, additionalProperties: true },
          {
            type: 'object',
            properties: {
              usePrettierrc: { type: 'boolean' },
              fileInfoOptions: {
                type: 'object',
                properties: {},
                additionalProperties: true,
              },
            },
            additionalProperties: true,
          },
        ],
      },
      create(context) {
        const usePrettierrc = !context.options[1] || context.options[1].usePrettierrc !== false;
        const eslintFileInfoOptions = (context.options[1] && context.options[1].fileInfoOptions) || {};
        const sourceCode = context.getSourceCode();
        const filepath = context.getFilename();
        const source = sourceCode.text;

        return {
          Program() {
            if (!prettier) {
              prettier = require('prettier');
            }

            const eslintPrettierOptions = context.options[0] || {};
            const prettierRcOptions = usePrettierrc ? prettier.resolveConfig.sync(filepath, { editorconfig: true }) : null;
            const prettierFileInfo = prettier.getFileInfo.sync(filepath, {
              resolveConfig: true,
              ignorePath: '.prettierignore',
              ...eslintFileInfoOptions,
            });

            if (prettierFileInfo.ignored) return;

            const initialOptions = {};
            const parserBlocklist = [null, 'graphql', 'markdown', 'html'];

            if (parserBlocklist.includes(prettierFileInfo.inferredParser)) {
              const supportBabelParser = prettier
                .getSupportInfo()
                .languages.some(language => language.parsers.includes('babel'));

              initialOptions.parser = supportBabelParser ? 'babel' : 'babylon';
            }

            const prettierOptions = {
              ...initialOptions,
              ...prettierRcOptions,
              ...eslintPrettierOptions,
              filepath,
            };

            try {
              const prettierSource = prettier.format(source, prettierOptions);
              if (source !== prettierSource) {
                const differences = generateDifferences(source, prettierSource);

                differences.forEach(difference => {
                  switch (difference.operation) {
                    case INSERT:
                      reportInsert(context, difference.offset, difference.insertText);
                      break;
                    case DELETE:
                      reportDelete(context, difference.offset, difference.deleteText);
                      break;
                    case REPLACE:
                      reportReplace(context, difference.offset, difference.deleteText, difference.insertText);
                      break;
                  }
                });
              }
            } catch (err) {
              if (!(err instanceof SyntaxError)) {
                throw err;
              }

              let message = 'Parsing error: ' + err.message;

              if (err.codeFrame) {
                message = message.replace(`\n${err.codeFrame}`, '');
              }
              if (err.loc) {
                message = message.replace(/ \(\d+:\d+\)$/, '');
              }

              context.report({ message, loc: err.loc });
            }
          },
        };
      },
    },
  },
};
