import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const [html, css, effects, glyphs, recorder, js] = await Promise.all(['dist/index.html', 'dist/style.css', 'dist/effects.js', 'dist/glyphs.js', 'dist/recorder.js', 'dist/app.js'].map(name => readFile(new URL(name, root), 'utf8')));
const output = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('exports/orbital.html', root));
const standalone = html
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script src="effects.js"></script>', () => `<script>\n${effects.replace(/<\/script/gi, '<\\/script')}\n</script>`)
  .replace('<script src="glyphs.js"></script>', () => `<script>\n${glyphs.replace(/<\/script/gi, '<\\/script')}\n</script>`)
  .replace('<script src="recorder.js"></script>', () => `<script>\n${recorder.replace(/<\/script/gi, '<\\/script')}\n</script>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, standalone);
console.log(`单文件 demo 已保存：${output}`);
