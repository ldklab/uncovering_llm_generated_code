import fs from 'fs';
import zlib from 'zlib';
import * as tar from 'tar';

// This function creates a compressed tarball ('archive.tgz') 
// containing the specified files ('file1.txt' and 'file2.txt').
async function createTarball() {
  await tar.c(
    {
      gzip: true,
      file: 'archive.tgz',
    },
    ['file1.txt', 'file2.txt']
  );
}

// This function extracts the contents of a tarball ('archive.tgz') to the current directory.
async function extractTarball() {
  await tar.x({
    file: 'archive.tgz',
  });
}

// This function lists the contents of a tarball ('archive.tgz') by printing the file paths inside.
async function listTarball() {
  await tar.t({
    file: 'archive.tgz',
    onReadEntry: (entry) => console.log(entry.path),
  });
}

// This function adds new file(s) ('newfile.txt') to an existing tarball ('archive.tgz').
async function replaceInTarball() {
  await tar.r(
    {
      file: 'archive.tgz',
    },
    ['newfile.txt']
  );
}

// This function updates specified files ('file1.txt') in an existing tarball ('archive.tgz').
async function updateTarball() {
  await tar.u(
    {
      file: 'archive.tgz',
    },
    ['file1.txt']
  );
}

// This function returns an array of filenames from a given tarball ('archive.tgz').
async function getTarballFilenames(tarballFilename) {
  const filenames = [];
  await tar.t({
    file: tarballFilename,
    onReadEntry: (entry) => filenames.push(entry.path),
  });
  return filenames;
}

// Execute functions to demonstrate their usage
(async function () {
  try {
    await createTarball();
    await extractTarball();
    await listTarball();
    await replaceInTarball();
    await updateTarball();
    const filenames = await getTarballFilenames('archive.tgz');
    console.log('Filenames:', filenames);
  } catch (error) {
    console.error(error);
  }
})();
