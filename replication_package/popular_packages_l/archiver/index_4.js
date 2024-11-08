// Import necessary modules
const fs = require('fs');
const archiver = require('archiver');

// Function to create an archive
function createArchive() {
  // Create a write stream for the output file
  const output = fs.createWriteStream(__dirname + '/example.zip');

  // Create an Archiver instance with ZIP format and maximum compression level
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Listener for 'close' event on the output to log when archiving is complete
  output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log('Archiver has been finalized and the output file descriptor has closed.');
  });

  // Listener for 'end' event to log when data has been drained
  output.on('end', () => {
    console.log('Data has been drained');
  });

  // Handle possible warnings and errors from the archive
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err); // Log warning for missing files
    } else {
      throw err; // Rethrow if other types of errors occur
    }
  });

  // Handle error events thrown by the archive
  archive.on('error', (err) => {
    throw err;
  });

  // Pipe the archive data to the output stream
  archive.pipe(output);

  // Append files and data to the archive
  archive.append(fs.createReadStream(__dirname + '/file1.txt'), { name: 'file1.txt' });
  archive.append('string cheese!', { name: 'file2.txt' });
  archive.append(Buffer.from('buff it!'), { name: 'file3.txt' });
  archive.file('file1.txt', { name: 'file4.txt' });
  archive.directory('subdir/', 'new-subdir');
  archive.directory('subdir/', false);
  archive.glob('file*.txt', { cwd: __dirname });

  // Finalize the archive to indicate that no more files will be appended
  archive.finalize();
}

// Create the archive by invoking the function
createArchive();
