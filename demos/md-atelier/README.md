# MiniDisc Atelier

这个目录同时保存两个共享同一套 SVG 引擎的 demo：封面设计工作台和 MD 收藏家。两者都使用 `dist/engine.js`、同一组 12 套模板数据，并保持相同的四层模型。

## 入口与运行

- 直接打开 `dist/index.html` 进入封面设计工作台。
- 直接打开 `dist/collector.html` 进入收藏家；若浏览器限制本地文件脚本或需要运行 QA，在本目录执行 `node serve-collector.mjs`，再打开 `http://127.0.0.1:4199/collector.html`。

工作台编辑盘面、塑料外壳、右侧标签和左侧贴纸四层。收藏家一次突出一张 MD，其他唱片以 Y 轴立体角度呈现侧面或少量正面，并通过滑条、拖动、侧脊点击、左右按钮和键盘选择。

## 保存、载入与导出

工作台的“保存参数”导出 JSON；“载入参数”可在另一台电脑恢复可编辑状态。两个 demo 都可以导出 SVG；收藏家导出统一乳白磨砂壳和扩散渐变材质版本。`templates/` 中保留 12 套模板的 JSON、SVG 与总览 SVG。

浏览器 `localStorage` 只保存当前浏览器中的最近状态、星标和收藏家收入的自制 MD，不会自动跨电脑同步。跨设备迁移请使用工作台导出的 JSON。

## 验证

在本目录执行封面工作台验证：

```powershell
node verify.mjs
```

收藏家 QA 需要先保持预览服务运行，再在第二个终端执行：

```powershell
node serve-collector.mjs
node qa-collector.mjs
```

验证会检查 12 张模板、四层结构、滑条连续状态、吸附、键盘、侧脊和拖动、星标、JSON 导入、SVG 导出、localStorage 与窄屏布局，并将报告和截图写入 `qa/`。脚本使用当前 Codex 运行时中的 Playwright/Edge 路径；如果换到没有该运行时的电脑，请安装 Playwright 和可用浏览器，或只运行本地人工检查。

字体依赖本机字体，缺失时浏览器会替换字体；SVG 滤镜在不同矢量软件中的显示可能不同。浏览器自动验证通过不等于所有系统上的视觉验收，仍应在目标电脑打开两个入口检查字体、滤镜和导出效果。
