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
  for (const globPattern in config) {
    const files = micromatch(stagedFiles, globPattern);
    if (files.length > 0) {
      const commands = Array.isArray(config[globPattern]) ? config[globPattern] : [config[globPattern]];
      for (const command of commands) {
        try {
          const cmdWithFiles = `${command} ${files.join(' ')}`;
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
  return stdout.split('\n').filter(Boolean);
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
