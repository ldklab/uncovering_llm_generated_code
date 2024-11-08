// Import necessary modules
const fs = require('fs');
const archiver = require('archiver');

// Function to create an archive
function createArchive() {
  // Create a write stream for the output file
  const output = fs.createWriteStream(__dirname + '/example.zip');

  // Create an Archiver instance with ZIP format and compression level 9
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Set up event listeners for the output stream
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  output.on('end', function() {
    console.log('Data has been drained');
  });

  // Set up event listeners for archiver warnings and errors
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function(err) {
    throw err;
  });

  // Pipe the archive data to the output file
  archive.pipe(output);

  // Append files to the archive
  archive.append(fs.createReadStream(__dirname + '/file1.txt'), { name: 'file1.txt' });
  archive.append('string cheese!', { name: 'file2.txt' });
  archive.append(Buffer.from('buff it!'), { name: 'file3.txt' });
  archive.file('file1.txt', { name: 'file4.txt' });
  archive.directory('subdir/', 'new-subdir');
  archive.directory('subdir/', false);
  archive.glob('file*.txt', { cwd: __dirname });

  // Finalize the archive
  archive.finalize();
}

// Call the function to create the archive
createArchive();
