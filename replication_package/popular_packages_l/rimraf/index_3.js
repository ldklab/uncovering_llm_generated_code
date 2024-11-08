// rimraf.js - simplified implementation of filesystem recursive deletion
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

async function rimraf(paths) {
  if (!Array.isArray(paths)) paths = [paths];
  const results = await Promise.all(paths.map(removeRecursively));
  return results.every(success => success);
}

async function removeRecursively(targetPath) {
  try {
    const stats = await fs.lstat(targetPath);
    if (stats.isDirectory()) {
      const entries = await fs.readdir(targetPath);
      await Promise.all(entries.map(entry => removeRecursively(path.join(targetPath, entry))));
      await fs.rmdir(targetPath);
    } else {
      await fs.unlink(targetPath);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false; // Ignore non-existent path
    throw err; // Re-throw other errors
  }
}

function rimrafSync(paths) {
  if (!Array.isArray(paths)) paths = [paths];
  try {
    paths.forEach(removeSync);
    return true;
  } catch {
    return false;
  }
}

function removeSync(targetPath) {
  try {
    const stats = fsSync.statSync(targetPath);
    if (stats.isDirectory()) {
      fsSync.readdirSync(targetPath).forEach(entry => removeSync(path.join(targetPath, entry)));
      fsSync.rmdirSync(targetPath);
    } else {
      fsSync.unlinkSync(targetPath);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

export { rimraf, rimrafSync };

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const paths = args.filter(arg => !arg.startsWith('--'));
  rimraf(paths)
    .then(result => console.log('Deletion successful:', result))
    .catch(error => console.error('Error during deletion:', error));
}
