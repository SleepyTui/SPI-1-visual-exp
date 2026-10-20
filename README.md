# SPI-1 visual experiments

这个仓库保存 SPI-1 的可继续开发视觉实验。当前已迁移的实验是 `demos/md-atelier/`：一套共享 SVG 引擎的 MiniDisc 封面设计工作台和 MD 收藏家界面。

两个入口：

- [MD 封面设计工作台](demos/md-atelier/dist/index.html)：四层编辑、12 类盘面程序、12 类注塑外壳、12 类字体和 12 类贴纸，支持参数 JSON 与 SVG 导出。
- [MD 收藏家](demos/md-atelier/dist/collector.html)：正方形屏幕、连续滑条、拖动、侧脊点击、按钮和键盘选片；当前唱片突出显示，其他唱片保留 Y 轴立体侧面。

最简本地方式是直接打开两个 HTML 文件。需要运行收藏家 QA 或避免浏览器的 `file://` 限制时，在 `demos/md-atelier/` 目录执行：

```powershell
node serve-collector.mjs
```

然后打开 `http://127.0.0.1:4199/collector.html`。验证命令见 [demos/md-atelier/README.md](demos/md-atelier/README.md)。
