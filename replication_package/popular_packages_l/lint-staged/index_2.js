const execa = require('execa');
const micromatch = require('micromatch');

/**
 * Runs commands on staged files based on given glob patterns.
 * @param {Object} config - Mapping of glob patterns to commands.
 * @param {Object} options - Additional options such as concurrency and debug.
 * @returns {Promise<Boolean>} - True if commands are successful, false if any fail.
 */
async function lintStaged(config, options = {}) {
  const stagedFiles = await getStagedFiles();
  
  for (const pattern in config) {
    const matchedFiles = micromatch(stagedFiles, pattern);

    if (matchedFiles.length > 0) {
      const commands = Array.isArray(config[pattern]) ? config[pattern] : [config[pattern]];
      
      for (const cmd of commands) {
        try {
          const fullCommand = `${cmd} ${matchedFiles.join(' ')}`;
          await execa.command(fullCommand, { shell: options.shell !== false });
        } catch (error) {
          if (!options.quiet) {
            console.error(`Error executing "${cmd}" for files "${matchedFiles.join(' ')}":`, error.message);
          }
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Retrieves the list of currently staged files in the git repository.
 * @returns {Promise<Array>} - An array of staged file paths.
 */
async function getStagedFiles() {
  const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
  return stdout.trim().split('\n').filter(file => file);
}

module.exports = lintStaged;

// Example usage block:
(async () => {
  const lintSuccess = await lintStaged(
    {
      '*.js': 'eslint --fix',
      '*.md': 'prettier --write',
    }, 
    {
      shell: true, 
      quiet: false
    }
  );

  if (lintSuccess) {
    console.log('Linting successful.');
  } else {
    console.error('Linting failed.');
  }
})();
