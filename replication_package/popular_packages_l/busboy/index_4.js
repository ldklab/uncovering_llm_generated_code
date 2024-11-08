const http = require('http');
const { randomFillSync } = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const busboy = require('busboy');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    const bb = busboy({ headers: req.headers });

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(`File [${name}]: filename: %j, encoding: %j, mimeType: %j`, filename, encoding, mimeType);
      
      const savePath = path.join(os.tmpdir(), `busboy-upload-${generateRandomFileName()}`);
      file.pipe(fs.createWriteStream(savePath));

      file.on('data', data => {
        console.log(`File [${name}] got ${data.length} bytes`);
      }).on('close', () => {
        console.log(`File [${name}] done`);
      });
    });

    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: %j`, val);
    });

    bb.on('close', () => {
      console.log('Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });

    req.pipe(bb);
  } else if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html', Connection: 'close' });
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
    res.writeHead(404);
    res.end();
  }
});

server.listen(8000, () => {
  console.log('Listening for requests on port 8000');
});

function generateRandomFileName() {
  const buf = Buffer.alloc(16);
  return randomFillSync(buf).toString('hex');
}
