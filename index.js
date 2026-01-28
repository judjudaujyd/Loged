const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const VIDEO_PATH = 'https://drive.google.com/file/d/1RdUdLat0gJNI_IgmwpEB3UF0bXYR4HK_/view?usp=drivesdk'; // Or a URL if streaming from elsewhere

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.connection.remoteAddress} accessed`);

  // Support for Range requests for better streaming
  const range = req.headers.range;
  if (!range) {
    res.writeHead(416, { 'Content-Range': `bytes */${fs.statSync(VIDEO_PATH).size}` });
    return res.end();
  }

  const videoSize = fs.statSync(VIDEO_PATH).size;
  const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks
  const start = Number(range.replace(/bytes=/, '').split('-')[0]);
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': 'video/mp4',
  });

  const stream = fs.createReadStream(VIDEO_PATH, { start, end });
  stream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
