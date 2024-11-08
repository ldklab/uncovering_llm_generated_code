const http = require('http');
const { randomFillSync } = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const busboy = require('busboy');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    // Create a new Busboy instance to parse form data
    const bb = busboy({ headers: req.headers });

    // Handle file uploads
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(`File [${name}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}`);
      
      const saveTo = path.join(os.tmpdir(), `busboy-upload-${generateRandomFileName()}`);
      file.pipe(fs.createWriteStream(saveTo));

      file.on('data', data => {
        console.log(`File [${name}] received ${data.length} bytes`);
      }).on('close', () => {
        console.log(`File [${name}] upload complete`);
      });
    });

    // Handle non-file fields
    bb.on('field', (name, val) => {
      console.log(`Field [${name}]: value: ${val}`);
    });

    // Finish parsing form
    bb.on('close', () => {
      console.log('Completed parsing form data');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });

    req.pipe(bb);
  } else if (req.method === 'GET') {
    // Serve the HTML form for file upload and text input
    res.writeHead(200, { Connection: 'close', 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head></head>
        <body>
          <form method="POST" enctype="multipart/form-data">
            <input type="file" name="filefield"><br />
            <input type="text" name="textfield"><br />
            <input type="submit">
          </form>
        </body>
      </html>
    `);
  } else {
    // Respond with 404 for other HTTP methods
    res.writeHead(404);
    res.end();
  }
});

// Start listening for HTTP requests
server.listen(8000, () => {
  console.log('Server is listening on port 8000');
});

// Generate a random filename for each uploaded file
function generateRandomFileName() {
  const buffer = Buffer.alloc(16);
  return randomFillSync(buffer).toString('hex');
}
