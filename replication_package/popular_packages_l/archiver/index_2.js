// Import necessary modules for file handling and archiving
const fs = require('fs');
const archiver = require('archiver');

// Function to create a .zip archive
function createZipArchive() {
  // Set the output path for the zip file
  const outputPath = __dirname + '/example.zip';

  // Create a file stream where the zip file will be written
  const outputStream = fs.createWriteStream(outputPath);

  // Initialize a new Archiver instance to create a zip archive with maximum compression
  const zipArchive = archiver('zip', { zlib: { level: 9 } });

  // Log total bytes and status once the archiving process is complete
  outputStream.on('close', () => {
    console.log(`${zipArchive.pointer()} total bytes`);
    console.log('Archiver has been finalized and the output file descriptor has closed.');
  });

  // Handle stream completion without any more data writing
  outputStream.on('end', () => {
    console.log('Data has been drained');
  });

  // Handle cases where there are warnings or errors during the archiving process
  zipArchive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  zipArchive.on('error', (err) => {
    throw err;
  });

  // Connect the archiver stream to the output file stream
  zipArchive.pipe(outputStream);

  // Add various contents to the archive
  zipArchive.append(fs.createReadStream(__dirname + '/file1.txt'), { name: 'file1.txt' });
  zipArchive.append('string cheese!', { name: 'file2.txt' });
  zipArchive.append(Buffer.from('buff it!'), { name: 'file3.txt' });
  zipArchive.file('file1.txt', { name: 'file4.txt' });
  zipArchive.directory('subdir/', 'new-subdir');
  zipArchive.directory('subdir/', false);
  zipArchive.glob('file*.txt', { cwd: __dirname });

  // Complete the archive and finalize it
  zipArchive.finalize();
}

// Execute the function to generate the .zip archive
createZipArchive();
