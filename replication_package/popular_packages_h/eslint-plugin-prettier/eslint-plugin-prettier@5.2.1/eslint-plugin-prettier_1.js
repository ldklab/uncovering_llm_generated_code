'use strict';

// Import utilities and package details
const {
  showInvisibles,
  generateDifferences,
} = require('prettier-linter-helpers');
const { name, version } = require('./package.json');

const { INSERT, DELETE, REPLACE } = generateDifferences;

// Lazy-loaded Prettier; deferring its loading until needed
let prettierFormat;

// Report differences found by Prettier formatting
function reportDifference(context, { operation, offset, deleteText = '', insertText = '' }) {
  const range = [offset, offset + deleteText.length];
  const [start, end] = range.map(index =>
    (context.sourceCode ?? context.getSourceCode()).getLocFromIndex(index),
  );

  context.report({
    messageId: operation,
    data: { deleteText: showInvisibles(deleteText), insertText: showInvisibles(insertText) },
    loc: { start, end },
    fix: fixer => fixer.replaceTextRange(range, insertText),
  });
}

// Define the ESLint plugin configuration and rule
const eslintPluginPrettier = {
  meta: { name, version },
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
              fileInfoOptions: { type: 'object', properties: {}, additionalProperties: true },
            },
            additionalProperties: true,
          },
        ],
        messages: {
          [INSERT]: 'Insert `{{ insertText }}`',
          [DELETE]: 'Delete `{{ deleteText }}`',
          [REPLACE]: 'Replace `{{ deleteText }}` with `{{ insertText }}`',
        },
      },
      create(context) {
        const usePrettierrc = !context.options[1] || context.options[1].usePrettierrc !== false;
        const fileInfoOptions = context.options[1]?.fileInfoOptions || {};

        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const filepath = context.filename ?? context.getFilename();
        const onDiskFilepath = context.physicalFilename ?? context.getPhysicalFilename();
        const source = sourceCode.text;

        return {
          Program() {
            if (!prettierFormat) {
              prettierFormat = require('synckit').createSyncFn(require.resolve('./worker'));
            }

            const eslintPrettierOptions = context.options[0] || {};
            const parser = context.languageOptions?.parser;

            let prettierSource;
            try {
              prettierSource = prettierFormat(
                source,
                {
                  ...eslintPrettierOptions,
                  filepath,
                  onDiskFilepath,
                  parserMeta: parser && (parser.meta || { name: parser.name, version: parser.version }),
                  parserPath: context.parserPath,
                  usePrettierrc,
                },
                fileInfoOptions
              );
            } catch (err) {
              if (!(err instanceof SyntaxError)) throw err;

              let message = 'Parsing error: ' + err.message;
              const error = err;
              if (error.codeFrame) message = message.replace(`\n${error.codeFrame}`, '');
              if (error.loc) message = message.replace(/ \(\d+:\d+\)$/, '');

              context.report({ message, loc: error.loc });
              return;
            }

            if (source !== prettierSource) {
              for (const difference of generateDifferences(source, prettierSource)) {
                reportDifference(context, difference);
              }
            }
          },
        };
      },
    },
  },
};

module.exports = eslintPluginPrettier;
