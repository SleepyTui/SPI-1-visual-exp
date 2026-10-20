import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const demo = fileURLToPath(new URL('../demos/md-atelier/', import.meta.url));
const root = path.join(demo, 'dist');
const port = Number(process.env.MD_ATELIER_PORT || 4199);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('MD_ATELIER_PORT 必须是 1 到 65535 之间的端口。');
  process.exit(1);
}
const base = `http://127.0.0.1:${port}`;
const page = process.argv[2] || 'collector';
if (!['collector', 'editor'].includes(page)) {
  console.error('请选择 collector（收藏家）或 editor（封面工作台）。');
  process.exit(1);
}
const url = `${base}/${page === 'editor' ? 'index' : 'collector'}.html`;

async function runningHere() {
  try {
    const response = await fetch(`${base}/__md_preview`, { signal: AbortSignal.timeout(1000) });
    const data = await response.json();
    return response.ok && data.app === 'md-atelier' && data.root === root;
  } catch {
    return false;
  }
}

function openPage() {
  console.log(`预览已就绪：${url}`);
  console.log('修改后刷新页面即可；请保留预览服务所在的终端。');
  if (process.argv.includes('--no-open')) return;
  let command, args;
  if (process.platform === 'win32') {
    command = 'rundll32.exe';
    args = ['url.dll,FileProtocolHandler', url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else {
    command = 'xdg-open';
    args = [url];
  }
  const browser = spawn(command, args, { stdio: 'ignore' });
  browser.on('error', () => console.log(`请在运行本任务的电脑浏览器中打开：${url}`));
  browser.on('exit', code => {
    if (code) console.log(`未能自动打开浏览器，请手动打开：${url}`);
  });
}

if (await runningHere()) {
  openPage();
} else {
  const server = spawn(process.execPath, [path.join(demo, 'serve-collector.mjs')], {
    cwd: demo, stdio: ['ignore', 'pipe', 'inherit'],
  });
  let opened = false;
  server.stdout.on('data', async data => {
    process.stdout.write(data);
    if (!opened && await runningHere()) {
      opened = true;
      openPage();
    }
  });
  server.on('error', error => {
    console.error(`预览启动失败：${error.message}`);
    process.exitCode = 1;
  });
  server.on('exit', code => {
    if (code && !opened) console.error(`预览未启动。${port} 端口可能被其他项目占用，请让 Codex 检查；不要结束其他人的服务。`);
    process.exitCode = code || 0;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.kill(signal));
  }
}
