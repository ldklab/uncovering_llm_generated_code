const http = require('http');
const { randomFillSync } = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const busboy = require('busboy');

// Create a server that listens for incoming requests
const server = http.createServer((req, res) => {
  // Handle POST requests, usually from form submissions
  if (req.method === 'POST') {
    const bb = busboy({ headers: req.headers });

    // Event listener for file uploads
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(`File [${name}]: filename: %j, encoding: %j, mimeType: %j`, filename, encoding, mimeType);

      // Generate a random temporary file name and path
      const saveTo = path.join(os.tmpdir(), `busboy-upload-${randomFileName()}`);
      file.pipe(fs.createWriteStream(saveTo));

      // Log the amount of data received and notify when done
      file.on('data', data => {
        console.log(`File [${name}] got ${data.length} bytes`);
      }).on('close', () => {
        console.log(`File [${name}] done`);
      });
    });

    // Event listener for regular form fields
    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: %j`, val);
    });

    // When the busboy instance has fully processed the form
    bb.on('close', () => {
      console.log('Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });

    // Pipe the request into the busboy instance
    req.pipe(bb);

  // Handle GET requests, usually to serve the form
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
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

  // Handle other request methods by returning 404
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start listening on port 8000
server.listen(8000, () => {
  console.log('Listening for requests on port 8000');
});

// Function to generate a random filename for temporary file storage
function randomFileName() {
  const buf = Buffer.alloc(16);
  return randomFillSync(buf).toString('hex');
}
