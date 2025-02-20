// Simplified implementation of the `rimraf` functionalities for removing files or directories
import fs from 'fs/promises';
import path from 'path';

// Asynchronously delete files or directories
async function rimraf(paths, opts = {}) {
  if (!Array.isArray(paths)) paths = [paths];
  const results = await Promise.all(paths.map(p => deleteRecursively(p)));
  return results.every(Boolean); // Return true if all deletions were successful
}

// Recursively delete directories and files
async function deleteRecursively(filePath) {
  try {
    const stats = await fs.lstat(filePath);
    if (stats.isDirectory()) {
      const entries = await fs.readdir(filePath);
      const deletionPromises = entries.map(entry => deleteRecursively(path.join(filePath, entry)));
      await Promise.all(deletionPromises);
      await fs.rmdir(filePath);
    } else {
      await fs.unlink(filePath);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false; // Path doesn't exist
    throw err;
  }
}

// Synchronously delete files or directories
function rimrafSync(paths, opts = {}) {
  if (!Array.isArray(paths)) paths = [paths];
  return paths.every(p => deleteRecursivelySync(p));
}

// Recursively delete directories and files synchronously
function deleteRecursivelySync(filePath) {
  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
      const entries = fs.readdirSync(filePath);
      for (const entry of entries) {
        deleteRecursivelySync(path.join(filePath, entry));
      }
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false; // Path doesn't exist
    throw err;
  }
}

export {
  rimraf,
  rimrafSync,
};

// CLI usage implementation for deleting paths provided as command-line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const paths = args.filter(arg => !arg.startsWith('--')); // Simple argument parsing ignoring options
  
  rimraf(paths)
    .then(result => console.log('Finished deleting files:', result))
    .catch(err => console.error('Error deleting files:', err));
}
