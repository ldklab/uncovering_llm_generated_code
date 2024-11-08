import fs from 'fs';
import zlib from 'zlib';
import * as tar from 'tar';

// A function to create a compressed tarball (.tgz) containing specified files
async function createTarball() {
  await tar.c(
    {
      gzip: true, // Enables gzip compression
      file: 'archive.tgz' // Output file name
    },
    ['file1.txt', 'file2.txt'] // List of files to include in the tarball
  );
}

// A function to extract contents from a specified tarball
async function extractTarball() {
  await tar.x({
    file: 'archive.tgz' // Input tarball file to extract
  });
}

// A function to list all file paths within a tarball
async function listTarball() {
  await tar.t({
    file: 'archive.tgz', // Input tarball file to list contents
    onReadEntry: entry => console.log(entry.path) // Log each entry path during listing
  });
}

// A function to replace or add a file in an existing tarball
async function replaceInTarball() {
  await tar.r(
    {
      file: 'archive.tgz' // Input tarball file to modify
    },
    ['newfile.txt'] // The new or updated file to add
  );
}

// A function to update a specific file in an existing tarball with its newer version
async function updateTarball() {
  await tar.u(
    {
      file: 'archive.tgz' // Input tarball file to update
    },
    ['file1.txt'] // Files to update inside the tarball
  );
}

// A function to retrieve all filenames from a specified tarball file
async function getTarballFilenames(tarballFilename) {
  const filenames = []; // Initialize an array to hold filenames
  await tar.t({
    file: tarballFilename, // The tarball file to read from
    onReadEntry: entry => filenames.push(entry.path) // Store each entry path in the array
  });
  return filenames; // Return the array of filenames
}

// Execute tarball operations
createTarball();
extractTarball();
listTarball();
replaceInTarball();
updateTarball();
getTarballFilenames('archive.tgz')
  .then(filenames => console.log('Filenames:', filenames))
  .catch(console.error);
