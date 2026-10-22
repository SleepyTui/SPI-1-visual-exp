# SPI-1 visual experiments

这个仓库保存 SPI-1 的可继续开发视觉实验。已迁移的项目包括 `demos/md-atelier/`：一套共享 SVG 引擎的 MiniDisc 封面设计工作台和 MD 收藏家界面；以及 `demos/beat-luck/`：以立体老虎机机柜为界面的四轨 Web Audio 节奏生成器。

设计同事从这里开始：[无需终端命令的接手流程](docs/project-workflow.md)。对 Codex 说“开始〈项目名称〉工作，并在电脑端打开视觉预览”，按 [项目索引](demos/README.md) 定位 demo；修改确认后说“确认提交到云端”。

两个入口：

- [MD 封面设计工作台](demos/md-atelier/dist/index.html)：四层编辑、12 类盘面程序、12 类注塑外壳、12 类字体和 12 类贴纸，支持参数 JSON 与 SVG 导出。
- [MD 收藏家](demos/md-atelier/dist/collector.html)：正方形屏幕、连续滑条、拖动、侧脊点击、按钮和键盘选片；当前唱片突出显示，其他唱片保留 Y 轴立体侧面。
- [BEAT LUCK — Rhythm Slot Machine](demos/beat-luck/dist/index.html)：四个风格转盘控制 Kick、Snare、Hi-hat 和 FX；在 12 种节奏风格间随机组合，支持 LINK、首停 BPM、32 步编辑与 48 套 VA/FM 合成鼓机预设。

最简本地方式是直接打开两个 HTML 文件。需要运行收藏家 QA 或避免浏览器的 `file://` 限制时，在 `demos/md-atelier/` 目录执行：

```powershell
node serve-collector.mjs
```

然后打开 `http://127.0.0.1:4199/collector.html`。验证命令见 [demos/md-atelier/README.md](demos/md-atelier/README.md)。

BEAT LUCK 使用独立的预览端口：在仓库根目录执行 `node scripts/preview.mjs beat-luck`，打开 `http://127.0.0.1:4200/index.html`。运行与验证细节见 [demos/beat-luck/README.md](demos/beat-luck/README.md)。

## 梦游音阶长街

[Scale Street](demos/scale-street/) 是可调双色弥散风格、独立霓虹灯效和四轨环境声的音阶街景 Demo。在仓库根目录运行 `node scripts/preview.mjs scale-street`，打开 `http://127.0.0.1:4178/`；详情见 [项目说明](demos/scale-street/README-GITHUB.md)。
