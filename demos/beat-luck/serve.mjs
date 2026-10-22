import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, 'dist');
const port = Number(process.env.BEAT_LUCK_PORT || 4200);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw Error('BEAT_LUCK_PORT 必须是 1 到 65535 之间的端口。');
}

const server = http.createServer((req, res) => {
  let file;
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/__beat_luck_preview') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ app: 'beat-luck', root }));
      return;
    }
    file = path.resolve(root, `.${decodeURIComponent(pathname)}`);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (file === root) file = path.join(root, 'index.html');
  if (!file.startsWith(`${root}${path.sep}`)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
  });
});

server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/index.html`));
