import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.ORBITAL_PORT || 4200);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('ORBITAL_PORT 必须是 1 到 65535 之间的端口。');
  process.exit(1);
}
const base = `http://127.0.0.1:${port}`;
const types = { 'index.html': 'text/html; charset=utf-8', 'style.css': 'text/css; charset=utf-8', 'app.js': 'text/javascript; charset=utf-8', 'effects.js': 'text/javascript; charset=utf-8', 'glyphs.js': 'text/javascript; charset=utf-8', 'recorder.js': 'text/javascript; charset=utf-8' };
function openPage() {
  console.log(`Orbital 预览已就绪：${base}`);
  console.log('此地址仅在运行预览的电脑上有效；保留此终端以继续预览。');
  if (process.argv.includes('--no-open')) return;
  const [command, args] = process.platform === 'win32'
    ? ['rundll32.exe', ['url.dll,FileProtocolHandler', base]]
    : process.platform === 'darwin' ? ['open', [base]] : ['xdg-open', [base]];
  const browser = spawn(command, args, { stdio: 'ignore' });
  browser.on('error', () => console.log(`请在本机浏览器打开 ${base}`));
}
let existing = false;
try {
  const response = await fetch(`${base}/__orbital_preview`, { signal: AbortSignal.timeout(1000) });
  const info = await response.json();
  existing = response.ok && info.app === 'orbital-score' && info.root === root;
} catch { /* Start only our own server. */ }
if (existing) openPage();
else {
  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url, base).pathname;
    if (pathname === '/__orbital_preview') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ app: 'orbital-score', root }));
      return;
    }
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!Object.hasOwn(types, file)) { res.writeHead(404); res.end('Not found'); return; }
    try {
      const body = await readFile(new URL(`./dist/${file}`, import.meta.url));
      res.writeHead(200, { 'Content-Type': types[file], 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(500); res.end('Unable to read preview asset'); }
  });
  server.on('error', error => { console.error(`预览未启动：${error.message}。端口占用时设置 ORBITAL_PORT 使用空闲端口。`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', openPage);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit()));
}
