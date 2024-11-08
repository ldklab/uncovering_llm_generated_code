import tar from 'tar';

// Create a tarball containing 'file1.txt' and 'file2.txt', and gzip it
async function createTarball() {
  await tar.create(
    {
      gzip: true,
      file: 'archive.tgz'
    },
    ['file1.txt', 'file2.txt']
  );
}

// Extract all contents from 'archive.tgz'
async function extractTarball() {
  await tar.extract({
    file: 'archive.tgz'
  });
}

// Log the paths of all entries in 'archive.tgz'
async function listTarball() {
  await tar.list({
    file: 'archive.tgz',
    onentry: entry => console.log(entry.path)
  });
}

// Replace or add 'newfile.txt' to 'archive.tgz'
async function replaceInTarball() {
  await tar.replace(
    {
      file: 'archive.tgz'
    },
    ['newfile.txt']
  );
}

// Update 'file1.txt' in 'archive.tgz' if it exists
async function updateTarball() {
  await tar.update(
    {
      file: 'archive.tgz'
    },
    ['file1.txt']
  );
}

// Get and return the filenames from a specified tarball
async function getTarballFilenames(tarballFilename) {
  const filenames = [];
  await tar.list({
    file: tarballFilename,
    onentry: entry => filenames.push(entry.path)
  });
  return filenames;
}

// Execute all the functions to demonstrate usage
(async function demo() {
  await createTarball();
  await extractTarball();
  await listTarball();
  await replaceInTarball();
  await updateTarball();
  try {
    const filenames = await getTarballFilenames('archive.tgz');
    console.log('Filenames:', filenames);
  } catch (error) {
    console.error(error);
  }
})();
