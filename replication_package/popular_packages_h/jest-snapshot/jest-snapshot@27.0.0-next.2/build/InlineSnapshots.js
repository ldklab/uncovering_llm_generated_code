'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.saveInlineSnapshots = saveInlineSnapshots;

var path = _interopRequireWildcard(require('path'));

var fs = _interopRequireWildcard(require('graceful-fs'));

var _semver = _interopRequireDefault(require('semver'));

var _utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

var Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
var Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
var jestWriteFile =
  global[Symbol.for('jest-native-write-file')] || fs.writeFileSync;
var Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
var jestReadFile =
  global[Symbol.for('jest-native-read-file')] || fs.readFileSync;

// @ts-expect-error requireOutside Babel transform
const babelTraverse = require(require.resolve('@babel/traverse', {
  [(global['jest-symbol-do-not-touch'] || global.Symbol).for(
    'jest-resolve-outside-vm-option'
  )]: true
})).default; // @ts-expect-error requireOutside Babel transform

const generate = require(require.resolve('@babel/generator', {
  [(global['jest-symbol-do-not-touch'] || global.Symbol).for(
    'jest-resolve-outside-vm-option'
  )]: true
})).default; // @ts-expect-error requireOutside Babel transform

const {file, templateElement, templateLiteral} = require(require.resolve(
  '@babel/types',
  {
    [(global['jest-symbol-do-not-touch'] || global.Symbol).for(
      'jest-resolve-outside-vm-option'
    )]: true
  }
)); // @ts-expect-error requireOutside Babel transform

const {parseSync} = require(require.resolve('@babel/core', {
  [(global['jest-symbol-do-not-touch'] || global.Symbol).for(
    'jest-resolve-outside-vm-option'
  )]: true
}));

function saveInlineSnapshots(snapshots, prettierPath) {
  const prettier = prettierPath // @ts-expect-error requireOutside Babel transform
    ? require(require.resolve(prettierPath, {
        [(global['jest-symbol-do-not-touch'] || global.Symbol).for(
          'jest-resolve-outside-vm-option'
        )]: true
      }))
    : undefined;
  const snapshotsByFile = groupSnapshotsByFile(snapshots);

  for (const sourceFilePath of Object.keys(snapshotsByFile)) {
    saveSnapshotsForFile(
      snapshotsByFile[sourceFilePath],
      sourceFilePath,
      prettier && _semver.default.gte(prettier.version, '1.5.0')
        ? prettier
        : undefined
    );
  }
}

const saveSnapshotsForFile = (snapshots, sourceFilePath, prettier) => {
  const sourceFile = jestReadFile(sourceFilePath, 'utf8'); // TypeScript projects may not have a babel config; make sure they can be parsed anyway.

  const presets = [require.resolve('babel-preset-current-node-syntax')];
  const plugins = [];

  if (/\.tsx?$/.test(sourceFilePath)) {
    plugins.push([
      require.resolve('@babel/plugin-syntax-typescript'),
      {
        isTSX: sourceFilePath.endsWith('x')
      }, // unique name to make sure Babel does not complain about a possible duplicate plugin.
      'TypeScript syntax plugin added by Jest snapshot'
    ]);
  } // Record the matcher names seen during traversal and pass them down one
  // by one to formatting parser.

  const snapshotMatcherNames = [];
  const ast = parseSync(sourceFile, {
    filename: sourceFilePath,
    plugins,
    presets,
    root: path.dirname(sourceFilePath)
  });

  if (!ast) {
    throw new Error(`jest-snapshot: Failed to parse ${sourceFilePath}`);
  }

  traverseAst(snapshots, ast, snapshotMatcherNames); // substitute in the snapshots in reverse order, so slice calculations aren't thrown off.

  const sourceFileWithSnapshots = snapshots.reduceRight(
    (sourceSoFar, nextSnapshot) => {
      if (
        !nextSnapshot.node ||
        typeof nextSnapshot.node.start !== 'number' ||
        typeof nextSnapshot.node.end !== 'number'
      ) {
        throw new Error('Jest: no snapshot insert location found');
      }

      return (
        sourceSoFar.slice(0, nextSnapshot.node.start) +
        generate(nextSnapshot.node, {
          retainLines: true
        }).code.trim() +
        sourceSoFar.slice(nextSnapshot.node.end)
      );
    },
    sourceFile
  );
  const newSourceFile = prettier
    ? runPrettier(
        prettier,
        sourceFilePath,
        sourceFileWithSnapshots,
        snapshotMatcherNames
      )
    : sourceFileWithSnapshots;

  if (newSourceFile !== sourceFile) {
    jestWriteFile(sourceFilePath, newSourceFile);
  }
};

const groupSnapshotsBy = createKey => snapshots =>
  snapshots.reduce((object, inlineSnapshot) => {
    const key = createKey(inlineSnapshot);
    return {...object, [key]: (object[key] || []).concat(inlineSnapshot)};
  }, {});

const groupSnapshotsByFrame = groupSnapshotsBy(({frame: {line, column}}) =>
  typeof line === 'number' && typeof column === 'number'
    ? `${line}:${column - 1}`
    : ''
);
const groupSnapshotsByFile = groupSnapshotsBy(({frame: {file}}) => file);

const indent = (snapshot, numIndents, indentation) => {
  const lines = snapshot.split('\n'); // Prevent re-indentation of inline snapshots.

  if (
    lines.length >= 2 &&
    lines[1].startsWith(indentation.repeat(numIndents + 1))
  ) {
    return snapshot;
  }

  return lines
    .map((line, index) => {
      if (index === 0) {
        // First line is either a 1-line snapshot or a blank line.
        return line;
      } else if (index !== lines.length - 1) {
        // Do not indent empty lines.
        if (line === '') {
          return line;
        } // Not last line, indent one level deeper than expect call.

        return indentation.repeat(numIndents + 1) + line;
      } else {
        // The last line should be placed on the same level as the expect call.
        return indentation.repeat(numIndents) + line;
      }
    })
    .join('\n');
};

const resolveAst = fileOrProgram => {
  // Flow uses a 'Program' parent node, babel expects a 'File'.
  let ast = fileOrProgram;

  if (ast.type !== 'File') {
    ast = file(ast, ast.comments, ast.tokens);
    delete ast.program.comments;
  }

  return ast;
};

const traverseAst = (snapshots, fileOrProgram, snapshotMatcherNames) => {
  const ast = resolveAst(fileOrProgram);
  const groupedSnapshots = groupSnapshotsByFrame(snapshots);
  const remainingSnapshots = new Set(snapshots.map(({snapshot}) => snapshot));
  babelTraverse(ast, {
    CallExpression({node}) {
      const {arguments: args, callee} = node;

      if (
        callee.type !== 'MemberExpression' ||
        callee.property.type !== 'Identifier' ||
        callee.property.loc == null
      ) {
        return;
      }

      const {line, column} = callee.property.loc.start;
      const snapshotsForFrame = groupedSnapshots[`${line}:${column}`];

      if (!snapshotsForFrame) {
        return;
      }

      if (snapshotsForFrame.length > 1) {
        throw new Error(
          'Jest: Multiple inline snapshots for the same call are not supported.'
        );
      }

      snapshotMatcherNames.push(callee.property.name);
      const snapshotIndex = args.findIndex(
        ({type}) => type === 'TemplateLiteral'
      );
      const values = snapshotsForFrame.map(inlineSnapshot => {
        inlineSnapshot.node = node;
        const {snapshot} = inlineSnapshot;
        remainingSnapshots.delete(snapshot);
        return templateLiteral(
          [
            templateElement({
              raw: (0, _utils.escapeBacktickString)(snapshot)
            })
          ],
          []
        );
      });
      const replacementNode = values[0];

      if (snapshotIndex > -1) {
        args[snapshotIndex] = replacementNode;
      } else {
        args.push(replacementNode);
      }
    }
  });

  if (remainingSnapshots.size) {
    throw new Error(`Jest: Couldn't locate all inline snapshots.`);
  }
};

const runPrettier = (
  prettier,
  sourceFilePath,
  sourceFileWithSnapshots,
  snapshotMatcherNames
) => {
  // Resolve project configuration.
  // For older versions of Prettier, do not load configuration.
  const config = prettier.resolveConfig
    ? prettier.resolveConfig.sync(sourceFilePath, {
        editorconfig: true
      })
    : null; // Detect the parser for the test file.
  // For older versions of Prettier, fallback to a simple parser detection.
  // @ts-expect-error

  const inferredParser = prettier.getFileInfo
    ? prettier.getFileInfo.sync(sourceFilePath).inferredParser
    : (config && typeof config.parser === 'string' && config.parser) ||
      simpleDetectParser(sourceFilePath);

  if (!inferredParser) {
    throw new Error(
      `Could not infer Prettier parser for file ${sourceFilePath}`
    );
  } // Snapshots have now been inserted. Run prettier to make sure that the code is
  // formatted, except snapshot indentation. Snapshots cannot be formatted until
  // after the initial format because we don't know where the call expression
  // will be placed (specifically its indentation).

  let newSourceFile = prettier.format(sourceFileWithSnapshots, {
    ...config,
    filepath: sourceFilePath
  });

  if (newSourceFile !== sourceFileWithSnapshots) {
    // prettier moved things around, run it again to fix snapshot indentations.
    newSourceFile = prettier.format(newSourceFile, {
      ...config,
      filepath: sourceFilePath,
      parser: createFormattingParser(snapshotMatcherNames, inferredParser)
    });
  }

  return newSourceFile;
}; // This parser formats snapshots to the correct indentation.

const createFormattingParser = (snapshotMatcherNames, inferredParser) => (
  text,
  parsers,
  options
) => {
  // Workaround for https://github.com/prettier/prettier/issues/3150
  options.parser = inferredParser;
  const ast = resolveAst(parsers[inferredParser](text, options));
  babelTraverse(ast, {
    CallExpression({node: {arguments: args, callee}}) {
      var _options$tabWidth, _options$tabWidth2;

      if (
        callee.type !== 'MemberExpression' ||
        callee.property.type !== 'Identifier' ||
        !snapshotMatcherNames.includes(callee.property.name) ||
        !callee.loc ||
        callee.computed
      ) {
        return;
      }

      let snapshotIndex;
      let snapshot;

      for (let i = 0; i < args.length; i++) {
        const node = args[i];

        if (node.type === 'TemplateLiteral') {
          snapshotIndex = i;
          snapshot = node.quasis[0].value.raw;
        }
      }

      if (snapshot === undefined || snapshotIndex === undefined) {
        return;
      }

      const useSpaces = !options.useTabs;
      snapshot = indent(
        snapshot,
        Math.ceil(
          useSpaces
            ? callee.loc.start.column /
                ((_options$tabWidth = options.tabWidth) !== null &&
                _options$tabWidth !== void 0
                  ? _options$tabWidth
                  : 1)
            : callee.loc.start.column / 2 // Each tab is 2 characters.
        ),
        useSpaces
          ? ' '.repeat(
              (_options$tabWidth2 = options.tabWidth) !== null &&
                _options$tabWidth2 !== void 0
                ? _options$tabWidth2
                : 1
            )
          : '\t'
      );
      const replacementNode = templateLiteral(
        [
          templateElement({
            raw: snapshot
          })
        ],
        []
      );
      args[snapshotIndex] = replacementNode;
    }
  });
  return ast;
};

const simpleDetectParser = filePath => {
  const extname = path.extname(filePath);

  if (/\.tsx?$/.test(extname)) {
    return 'typescript';
  }

  return 'babel';
};
