import fs from 'fs/promises';
import path from 'path';

async function rimraf(paths, opts = {}) {
  if (!Array.isArray(paths)) paths = [paths];
  const results = await Promise.all(paths.map(p => removeRecursively(p, opts)));
  return results.every(Boolean);
}

async function removeRecursively(targetPath, opts = {}) {
  try {
    const stats = await fs.lstat(targetPath);
    if (stats.isDirectory()) {
      const entries = await fs.readdir(targetPath);
      await Promise.all(entries.map(entry => 
        removeRecursively(path.join(targetPath, entry), opts)
      ));
      await fs.rmdir(targetPath);
    } else {
      await fs.unlink(targetPath);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

function rimrafSync(paths, opts = {}) {
  if (!Array.isArray(paths)) paths = [paths];
  return paths.every(p => removeSync(p, opts));
}

function removeSync(targetPath, opts = {}) {
  try {
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      const entries = fs.readdirSync(targetPath);
      entries.forEach(entry => removeSync(path.join(targetPath, entry), opts));
      fs.rmdirSync(targetPath);
    } else {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

export {
  rimraf,
  rimrafSync,
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const paths = args.filter(arg => !arg.startsWith('--'));
  rimraf(paths).then(result => {
    console.log('Finished deleting files:', result);
  }).catch(err => {
    console.error('Error deleting files:', err);
  });
}
