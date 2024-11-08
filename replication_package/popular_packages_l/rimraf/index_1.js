// simplified version of rimraf functionalities
import fs from 'fs/promises';
import path from 'path';

// Main asynchronous function to delete paths recursively
async function rimraf(paths, opts = {}) {
  if (!Array.isArray(paths)) paths = [paths];
  const results = await Promise.all(paths.map(p => removeRecursively(p, opts)));
  return results.every(Boolean);
}

// Helper function to recursively delete directory contents
function removeRecursively(dirPath, opts = {}) {
  return fs.lstat(dirPath).then(stats => {
    if (stats.isDirectory()) {
      return fs.readdir(dirPath).then(entries => {
        const removalPromises = entries.map(entry => 
          removeRecursively(path.join(dirPath, entry), opts)
        );
        return Promise.all(removalPromises).then(() => fs.rmdir(dirPath));
      });
    } else {
      return fs.unlink(dirPath);
    }
  }).catch(err => {
    if (err.code === 'ENOENT') return false;
    throw err;
  });
}

// Synchronous version of the function to delete paths recursively
function rimrafSync(paths, opts = {}) {
  if (!Array.isArray(paths)) paths = [paths];
  return paths.every(p => removeSync(p, opts));
}

// Helper function for the synchronous version
function removeSync(dirPath, opts = {}) {
  try {
    const stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
      const entries = fs.readdirSync(dirPath);
      entries.forEach(entry => removeSync(path.join(dirPath, entry), opts));
      fs.rmdirSync(dirPath);
    } else {
      fs.unlinkSync(dirPath);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

// Export the functions to be used in other modules
export {
  rimraf,
  rimrafSync,
};

// Command-line interface behavior when script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const paths = [];
  for (let arg of args) {
    if (arg.startsWith('--')) continue; 
    paths.push(arg);
  }
  rimraf(paths).then(result => {
    console.log('Finished deleting files:', result);
  }).catch(err => {
    console.error('Error deleting files:', err);
  });
}
