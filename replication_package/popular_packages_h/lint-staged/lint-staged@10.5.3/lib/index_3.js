'use strict';

const dedent = require('dedent');
const { cosmiconfig } = require('cosmiconfig');
const debugLog = require('debug')('lint-staged');
const stringifyObject = require('stringify-object');

const { PREVENTED_EMPTY_COMMIT, GIT_ERROR, RESTORE_STASH_EXAMPLE } = require('./messages');
const printTaskOutput = require('./printTaskOutput');
const runAll = require('./runAll');
const { ApplyEmptyCommitError, GetBackupStashError, GitError } = require('./symbols');
const formatConfig = require('./formatConfig');
const validateConfig = require('./validateConfig');

const errConfigNotFound = new Error('Config could not be found');

function resolveConfig(configPath) {
  try {
    return require.resolve(configPath);
  } catch {
    return configPath;
  }
}

function loadConfig(configPath) {
  const explorer = cosmiconfig('lint-staged', {
    searchPlaces: [
      'package.json',
      '.lintstagedrc',
      '.lintstagedrc.json',
      '.lintstagedrc.yaml',
      '.lintstagedrc.yml',
      '.lintstagedrc.js',
      '.lintstagedrc.cjs',
      'lint-staged.config.js',
      'lint-staged.config.cjs',
    ],
  });
  return configPath ? explorer.load(resolveConfig(configPath)) : explorer.search();
}

/**
 * @typedef {(...any) => void} LogFunction
 * @typedef {{ error: LogFunction, log: LogFunction, warn: LogFunction }} Logger
 *
 * Main function for executing lint-staged tasks.
 *
 * @param {Object} options
 * @param {boolean} [options.allowEmpty] - Allow empty commits.
 * @param {boolean | number} [options.concurrent] - Number of concurrent tasks or false for serial execution.
 * @param {object} [options.config] - Configuration object.
 * @param {string} [options.configPath] - Path to the configuration file.
 * @param {string} [options.cwd] - Current working directory.
 * @param {boolean} [options.debug] - Enable debug mode.
 * @param {number} [options.maxArgLength] - Max argument length.
 * @param {boolean} [options.quiet] - Suppress output.
 * @param {boolean} [options.relative] - Use relative file paths.
 * @param {boolean} [options.shell] - Use shell execution.
 * @param {boolean} [options.stash] - Enable backup stash.
 * @param {boolean} [options.verbose] - Show all task outputs.
 * @param {Logger} [logger]
 *
 * @returns {Promise<boolean>} Result of linting operations.
 */
module.exports = async function lintStaged(
  {
    allowEmpty = false,
    concurrent = true,
    config: configObject,
    configPath,
    cwd = process.cwd(),
    debug = false,
    maxArgLength,
    quiet = false,
    relative = false,
    shell = false,
    stash = true,
    verbose = false,
  } = {},
  logger = console
) {
  try {
    debugLog('Loading config using cosmiconfig');
    const resolved = configObject
      ? { config: configObject, filepath: '(input)' }
      : await loadConfig(configPath);

    if (!resolved) throw errConfigNotFound;

    debugLog('Successfully loaded config from %s:\n%O', resolved.filepath, resolved.config);

    const formattedConfig = formatConfig(resolved.config);
    const config = validateConfig(formattedConfig);

    if (debug) {
      logger.log('Running lint-staged with the following config:');
      logger.log(stringifyObject(config, { indent: '  ' }));
    } else {
      debugLog('lint-staged config:\n%O', config);
    }

    delete process.env.GIT_LITERAL_PATHSPECS;

    try {
      const ctx = await runAll(
        {
          allowEmpty,
          concurrent,
          config,
          cwd,
          debug,
          maxArgLength,
          quiet,
          relative,
          shell,
          stash,
          verbose,
        },
        logger
      );
      debugLog('Tasks were executed successfully!');
      printTaskOutput(ctx, logger);
      return true;
    } catch (runAllError) {
      if (runAllError && runAllError.ctx && runAllError.ctx.errors) {
        const { ctx } = runAllError;
        if (ctx.errors.has(ApplyEmptyCommitError)) {
          logger.warn(PREVENTED_EMPTY_COMMIT);
        } else if (ctx.errors.has(GitError) && !ctx.errors.has(GetBackupStashError)) {
          logger.error(GIT_ERROR);
          if (ctx.shouldBackup) {
            logger.error(RESTORE_STASH_EXAMPLE);
          }
        }
        printTaskOutput(ctx, logger);
        return false;
      }
      throw runAllError;
    }
  } catch (lintStagedError) {
    if (lintStagedError === errConfigNotFound) {
      logger.error(`${lintStagedError.message}.`);
    } else {
      logger.error(dedent`
        Could not parse lint-staged config.
        ${lintStagedError}
      `);
    }
    logger.error();
    logger.error(dedent`
      Please make sure you have created it correctly.
      See https://github.com/okonet/lint-staged#configuration.
    `);

    throw lintStagedError;
  }
};
