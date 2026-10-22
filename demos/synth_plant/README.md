# synth-plant · 音色植物

一个无依赖的 SVG 音色植物视觉实验：十株可编辑的植物图鉴，以及三种可调的合成器温室机架。所有画面由 HTML、CSS 和 JavaScript 生成，可离线运行并导出 SVG。

## 打开

在仓库根目录运行：

```bash
node demos/synth_plant/serve.mjs
```

打开终端显示的地址。也可以直接打开 `index.html`。

- `index.html`：十株植物图鉴与逐层视觉编辑器。
- `greenhouse.html`：合成器温室。支持三种机架、植物舱位、独立模块材质、自动配色、动画、内置合成旋律及 SVG 导出。
- `scenes.html`：方形屏幕场景实验。

## 温室操作

每株植物有自己的植物舱和经典合成器控制条（四旋钮、四推子），可分别选择并调整位置、尺寸、材质、渐变和透视。整架参数控制层间退台、顶面透视、半透明材质和动画。点击植物或控制条会播放该音色的短旋律；声音可在参数中关闭。

“自动配色整架植物”按主色生成同色系、邻近色或浅雾色方案，只影响温室。勾选“应用到图鉴”才会同步到图鉴的浏览器本地配方。

## 文件

- `engine.js`：十株植物的 SVG 几何、渐变与导出定义。
- `app.js`：图鉴与视觉编辑器。
- `greenhouse.js` / `greenhouse-audio.js`：机架、模块控制、动画和 Web Audio 音色草图。
- `scenes.js`：方形场景编辑器。
- `assets/`：离线 Space Mono 字体与 SIL OFL 授权。

## 验证

无需安装依赖。可做基础语法检查：

```bash
node --check demos/synth_plant/engine.js
node --check demos/synth_plant/app.js
node --check demos/synth_plant/greenhouse.js
node --check demos/synth_plant/greenhouse-audio.js
```

QA 导出的 SVG、截图和临时报告被忽略，不属于仓库源码。
