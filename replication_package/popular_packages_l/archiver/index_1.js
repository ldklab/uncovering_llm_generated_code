// Import required modules
const fs = require('fs');
const archiver = require('archiver');

/**
 * Function to create a ZIP archive containing various files and data.
 */
function createArchive() {
  // Define the output path for the ZIP file
  const output = fs.createWriteStream(__dirname + '/example.zip');
  
  // Initialize archiver with ZIP format and highest compression level
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Listen for when the output stream is officially closed
  output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log('Archiving process is complete and the ZIP file descriptor is closed.');
  });

  // Listen for when the data is completely drained
  output.on('end', () => {
    console.log('Data stream has ended.');
  });

  // Handle warnings during the archiving process
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('A file was not found:', err);
    } else {
      throw err;
    }
  });

  // Handle errors during the archiving process
  archive.on('error', (err) => {
    throw err;
  });

  // Direct the archive output to the designated output stream
  archive.pipe(output);

  // Add various files and streams to the archive
  archive.append(fs.createReadStream(`${__dirname}/file1.txt`), { name: 'file1.txt' });
  archive.append('string cheese!', { name: 'file2.txt' });
  archive.append(Buffer.from('buff it!'), { name: 'file3.txt' });
  archive.file('file1.txt', { name: 'file4.txt' });
  archive.directory('subdir/', 'new-subdir');
  archive.directory('subdir/', false);
  archive.glob('file*.txt', { cwd: __dirname });

  // Finalize the archive to ensure all data is flushed
  archive.finalize();
}

// Execute the function to create the archive
createArchive();
