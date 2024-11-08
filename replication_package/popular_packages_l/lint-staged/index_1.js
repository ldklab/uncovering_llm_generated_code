const execa = require('execa');
const micromatch = require('micromatch');

/**
 * Executes lint-staged tasks based on given configuration.
 * @param {Object} config - Object mapping glob patterns to commands.
 * @param {Object} options - Options for execution such as { shell, quiet }.
 * @returns {Promise<Boolean>} - Resolves to true if all tasks succeed, false otherwise.
 */
async function lintStaged(config, options = {}) {
  const stagedFiles = await fetchStagedFiles();

  for (const pattern in config) {
    const matchedFiles = micromatch(stagedFiles, pattern);

    if (matchedFiles.length > 0) {
      const commandList = Array.isArray(config[pattern]) ? config[pattern] : [config[pattern]];

      for (const command of commandList) {
        try {
          const commandWithFiles = `${command} ${matchedFiles.join(' ')}`;
          await execa.command(commandWithFiles, { shell: options.shell !== false });
        } catch (error) {
          if (!options.quiet) {
            console.error(`Error executing "${command}" on files "${matchedFiles.join(' ')}":`, error.message);
          }
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Retrieves files currently staged in git for commit.
 * @returns {Promise<Array>} - Array of staged file paths.
 */
async function fetchStagedFiles() {
  const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
  return stdout.split('\n').filter(line => line.trim() !== '');
}

module.exports = lintStaged;

// Example usage:
(async () => {
  const lintResult = await lintStaged(
    {
      '*.js': 'eslint --fix',
      '*.md': 'prettier --write',
    },
    {
      shell: true,
      quiet: false,
    }
  );

  if (lintResult) {
    console.log('All linting tasks completed successfully.');
  } else {
    console.error('One or more linting tasks failed.');
  }
})();
