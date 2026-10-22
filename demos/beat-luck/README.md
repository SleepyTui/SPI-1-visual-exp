# BEAT LUCK — Rhythm Slot Machine

一个以老虎机为界面的四轨节奏生成器。四个独立转盘分别控制 Kick、Snare、Hi-hat 和 FX；每一个都在 12 种风格之间随机：Techno、Trance、House、UKG、Grime、Trip-Hop、Hip-Hop、Trap、IDM、Breaks、DnB 与 Glitch-Hop。

## 入口与操作

- 浏览器入口：[`dist/index.html`](dist/index.html)。可直接打开；需要稳定的 Web Audio 与本地字体加载时，用下面的预览服务。
- 在仓库根目录执行 `node scripts/preview.mjs beat-luck`，再打开 `http://127.0.0.1:4200/index.html`。
- 拉动右侧拉杆开始。必须按下四个 STOP 键才会完成一轮随机；第一个锁定轨道决定整段 loop 的 BPM。
- LINK 默认关闭：关闭时四条轨道分别选择风格，开启时四轨共享一种风格。空格播放／暂停，`R` 拉杆，`1`–`4` 锁定对应轨道。

## 机柜与音色

MK.II 机柜、房间网格和所有可点击表面使用相同的投影相机和中心灭点。转鼓凹入上柜，控制台向前伸出；下柜检修窗内可看见鼓机电路、线束与转鼓机械结构。`SEE INSIDE` 控制检修窗内结构的可见程度。

每次锁定轨道会同步载入该风格的原创合成鼓机预设。共 12 × 4 = 48 套 voice preset；AUTO 使用风格指定的 VA 或 FM 结构，也可以由 VA／FM 开关覆盖。每轨可继续调整 Tune、Decay、Color、Punch/Snap、Drive、FM Depth、Pan 和 Level，并可以单独试听或重置。

所有鼓声由 Web Audio 在浏览器中合成，不包含节奏 loop 或硬件采样；名称只描述声音设计方向，不代表对特定硬件的精确仿真。

## 文件结构

- `dist/index.html`：页面与交互入口。
- `dist/app.js`：转盘状态、32 步序列、实时调度和 Web Audio 合成。
- `dist/voices.js`：48 个风格／轨道音色预设。
- `dist/cabinet.js`、`dist/cabinet.css`：统一透视机柜和投影交互平面。
- `dist/fonts/`：随 demo 分发的字体与原始许可。

## 验证

```sh
node demos/beat-luck/verify.mjs
```

该检查验证入口文件、12 组风格、48 套音色、投影表面角点和 JavaScript 模块语法。声音必须在支持 Web Audio 的浏览器中经用户手势启用；提交前仍应实际打开页面检查视觉与试听效果。
