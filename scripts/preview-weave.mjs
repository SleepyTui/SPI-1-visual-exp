import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const choice = process.argv[2] || 'record';
if (!['record', 'visual'].includes(choice)) {
  console.error('用法：node scripts/preview-weave.mjs [record|visual]');
  process.exit(1);
}
const file = fileURLToPath(new URL('../demos/music-mouse-weave/' + (choice === 'visual' ? 'index.html' : 'weave-record-lab.html'), import.meta.url));
const url = pathToFileURL(file).href;
console.log('预览入口：' + url);
if (!process.argv.includes('--no-open')) {
  const command = process.platform === 'win32' ? 'rundll32.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', url] : [url];
  const child = spawn(command, args, { stdio: 'ignore' });
  child.on('error', error => { console.error('无法打开浏览器：' + error.message); process.exitCode = 1; });
  child.on('exit', code => { if (code) { console.error('无法自动打开浏览器，请手动使用上面的入口。'); process.exitCode = code; } });
}
