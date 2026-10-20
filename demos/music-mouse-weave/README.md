# 编织音符机视觉实验

本目录保存 Music Mouse 浏览器原型：录制触发事件、纸带与织布的视觉实验，以及早期织布视觉预览。它是设计实验，不是设备端固件的音乐算法或性能基准。

## 打开

在仓库根目录运行 `node scripts/preview-weave.mjs` 打开录制与回放实验；运行 `node scripts/preview-weave.mjs visual` 打开早期视觉预览。也可以直接在浏览器打开 `weave-record-lab.html` 或 `index.html`；两个页面均无需构建，后者依赖同目录的 `loom-art.js`。声音需要浏览器允许音频并由用户交互启动。

## 文件与验证

- `weave-record-lab.html`：录制、回放、纸带与织布实验。
- `index.html`、`loom-art.js`：早期织布视觉预览及绘图脚本。
- `check-weave-record.cjs`、`check-preview.cjs`：原型自带的浏览器检查；需要 Node.js、可被 Node 找到的 Playwright 和 Microsoft Edge。运行 `node check-weave-record.cjs` 或 `node check-preview.cjs`。测试通过不代表视觉效果已验收。

录制内容与部分设置保存在当前浏览器的 localStorage，不属于仓库文件，也不会随 Git 同步；清理浏览器数据或在另一台电脑打开时不会自动迁移。
