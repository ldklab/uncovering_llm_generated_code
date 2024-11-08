'use strict';

const { showInvisibles, generateDifferences } = require('prettier-linter-helpers');
const { name, version } = require('./package.json');

const { INSERT, DELETE, REPLACE } = generateDifferences;

let prettierFormat;

function reportDifference(context, difference) {
  const { operation, offset, deleteText = '', insertText = '' } = difference;
  const range = [offset, offset + deleteText.length];
  const [start, end] = range.map(index =>
    (context.sourceCode ?? context.getSourceCode()).getLocFromIndex(index)
  );

  context.report({
    messageId: operation,
    data: {
      deleteText: showInvisibles(deleteText),
      insertText: showInvisibles(insertText),
    },
    loc: { start, end },
    fix: fixer => fixer.replaceTextRange(range, insertText),
  });
}

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
        docs: {
          url: 'https://github.com/prettier/eslint-plugin-prettier#options',
        },
        type: 'layout',
        fixable: 'code',
        schema: [
          {
            type: 'object',
            properties: {},
            additionalProperties: true,
          },
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
        messages: {
          [INSERT]: 'Insert `{{ insertText }}`',
          [DELETE]: 'Delete `{{ deleteText }}`',
          [REPLACE]: 'Replace `{{ deleteText }}` with `{{ insertText }}`',
        },
      },
      create(context) {
        const usePrettierrc =
          !context.options[1] || context.options[1].usePrettierrc !== false;
        const fileInfoOptions =
          (context.options[1] && context.options[1].fileInfoOptions) || {};
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const filepath = context.filename ?? context.getFilename();
        const onDiskFilepath =
          context.physicalFilename ?? context.getPhysicalFilename();
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
                  parserMeta: parser && (parser.meta ?? { name: parser.name, version: parser.version }),
                  parserPath: context.parserPath,
                  usePrettierrc,
                },
                fileInfoOptions
              );
            } catch (err) {
              if (!(err instanceof SyntaxError)) {
                throw err;
              }

              let message = 'Parsing error: ' + err.message;
              const error = err;

              if (error.codeFrame) {
                message = message.replace(`\n${error.codeFrame}`, '');
              }
              if (error.loc) {
                message = message.replace(/ \(\d+:\d+\)$/, '');
              }

              context.report({ message, loc: error.loc });

              return;
            }

            if (prettierSource == null) {
              return;
            }

            if (source !== prettierSource) {
              const differences = generateDifferences(source, prettierSource);

              for (const difference of differences) {
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
