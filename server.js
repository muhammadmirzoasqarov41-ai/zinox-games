const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const groqCheck = require('./api/groq-check');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }

      sendJson(res, 500, { error: 'Internal server error' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.end(data);
  });
}

function resolveStaticPath(urlPath) {
  const normalizedPath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const candidate = normalizedPath === '/' ? '/index.html' : normalizedPath;
  return path.join(ROOT, candidate);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/api/groq-check') {
    let rawBody = '';

    req.on('data', chunk => {
      rawBody += chunk;

      if (rawBody.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      req.body = rawBody;
      await groqCheck(req, res);
    });

    req.on('error', () => {
      sendJson(res, 400, { error: 'Invalid request body' });
    });

    return;
  }

  const filePath = resolveStaticPath(requestUrl.pathname);

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      serveFile(res, path.join(filePath, 'index.html'));
      return;
    }

    if (!error && stats.isFile()) {
      serveFile(res, filePath);
      return;
    }

    if (requestUrl.pathname !== '/' && path.extname(filePath) === '') {
      serveFile(res, path.join(ROOT, 'index.html'));
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  });
});

server.listen(PORT, () => {
  console.log(`Zinox Games server running on port ${PORT}`);
});
