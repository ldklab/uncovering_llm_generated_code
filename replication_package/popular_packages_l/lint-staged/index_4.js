const execa = require('execa');
const micromatch = require('micromatch');

/**
 * Main function to run lint-staged tasks.
 * @param {Object} config - The configuration object with glob pattern keys and command values.
 * @param {Object} options - Additional options (e.g., concurrency, debug).
 * @returns {Promise<Boolean>} - Resolves to true if tasks succeed, false otherwise.
 */
async function lintStaged(config, options = {}) {
  const stagedFiles = await getStagedFiles();
  for (const [globPattern, commands] of Object.entries(config)) {
    const files = micromatch(stagedFiles, globPattern);
    if (files.length > 0) {
      const commandList = Array.isArray(commands) ? commands : [commands];
      for (const command of commandList) {
        const cmdWithFiles = `${command} ${files.join(' ')}`;
        try {
          await execa.command(cmdWithFiles, { shell: options.shell !== false });
        } catch (error) {
          if (!options.quiet) {
            console.error(`Error executing "${command}" with files "${files.join(' ')}":`, error.message);
          }
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Get the list of files staged for commit.
 * @returns {Promise<Array>} - List of staged files.
 */
async function getStagedFiles() {
  const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
  return stdout.split('\n').filter(file => file);
}

module.exports = lintStaged;

// Sample usage:
(async () => {
  const success = await lintStaged({
    '*.js': 'eslint --fix',
    '*.md': 'prettier --write',
  }, { shell: true, quiet: false });
  if (success) {
    console.log('Linting successful.');
  } else {
    console.error('Linting failed.');
  }
})();
