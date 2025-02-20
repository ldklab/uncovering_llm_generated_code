import fs from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream';
import * as tar from 'tar';

// Create a tarball
async function createTarball() {
  await tar.c(
    {
      gzip: true,
      file: 'archive.tgz'
    },
    ['file1.txt', 'file2.txt']
  );
}

// Extract a tarball
async function extractTarball() {
  await tar.x({
    file: 'archive.tgz'
  });
}

// List contents of a tarball
async function listTarball() {
  await tar.t({
    file: 'archive.tgz',
    onReadEntry: entry => console.log(entry.path)
  });
}

// Replace files in a tarball
async function replaceInTarball() {
  await tar.r(
    {
      file: 'archive.tgz'
    },
    ['newfile.txt']
  );
}

// Update files in a tarball
async function updateTarball() {
  await tar.u(
    {
      file: 'archive.tgz'
    },
    ['file1.txt']
  );
}

// Get filenames from a tarball
async function getTarballFilenames(tarballFilename) {
  const filenames = [];
  await tar.t({
    file: tarballFilename,
    onReadEntry: entry => filenames.push(entry.path)
  });
  return filenames;
}

createTarball();
extractTarball();
listTarball();
replaceInTarball();
updateTarball();
getTarballFilenames('archive.tgz')
  .then(filenames => console.log('Filenames:', filenames))
  .catch(console.error);
