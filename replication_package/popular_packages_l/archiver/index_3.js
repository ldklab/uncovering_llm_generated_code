// Import necessary modules
const fs = require('fs');
const archiver = require('archiver');

// Function to create a ZIP archive
function createArchive() {
  // Define the output path for the ZIP file and create a writable stream for it
  const output = fs.createWriteStream(__dirname + '/example.zip');

  // Initialize a new archiver instance with ZIP format and maximum compression level
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Event listener for when the archive stream closes
  output.on('close', function() {
    console.log(`${archive.pointer()} total bytes`);
    console.log('Archiver has been finalized and the output file descriptor has closed.');
  });

  // Event listener for when the stream has been drained
  output.on('end', function() {
    console.log('Data has been drained');
  });

  // Event listener for warnings in the archiver process
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(err); // Log warnings for missing files, but continue
    } else {
      throw err; // Throw error for other issues
    }
  });

  // Event listener for errors in the archiver process
  archive.on('error', function(err) {
    throw err; // Rethrow archiving errors
  });

  // Direct the archiver to pipe its data into the output file stream
  archive.pipe(output);

  // Add various contents to the archive
  archive.append(fs.createReadStream(__dirname + '/file1.txt'), { name: 'file1.txt' }); // Add a file stream
  archive.append('string cheese!', { name: 'file2.txt' }); // Add a string as a file
  archive.append(Buffer.from('buff it!'), { name: 'file3.txt' }); // Add a Buffer as a file
  archive.file('file1.txt', { name: 'file4.txt' }); // Add a file by its path with a new name
  archive.directory('subdir/', 'new-subdir'); // Add a directory preserving structure under a new path
  archive.directory('subdir/', false); // Add directory contents directly under the root
  archive.glob('file*.txt', { cwd: __dirname }); // Add files matching a pattern

  // Finalize and complete the archive
  archive.finalize();
}

// Execute the function to create the ZIP archive
createArchive();
