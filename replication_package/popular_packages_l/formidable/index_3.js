import http from 'node:http';
import formidable from 'formidable';

const server = http.createServer((req, res) => {
  if (req.method.toLowerCase() === 'post' && req.url === '/upload') {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Error in file upload');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ fields, files }, null, 2));
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <label for="title">Title:</label><br>
        <input type="text" id="title" name="title"><br>
        <label for="upload">Upload File:</label><br>
        <input type="file" id="upload" name="upload" multiple="multiple"><br>
        <button type="submit">Upload</button>
      </form>
    `);
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}...`);
});
