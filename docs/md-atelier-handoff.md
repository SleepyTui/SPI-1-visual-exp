# MiniDisc Atelier 交接说明

## 结构与共享边界

`demos/md-atelier/dist/engine.js` 是两个 demo 共用的生成引擎。封面由四个独立可调图层组成：圆形 3 寸风格盘面、塑料外壳、右侧中间标签和左侧贴纸。每层都有透明度、饱和度、明度等合成控制；盘面、外壳材质、标签字体和贴纸各有 12 类方向。`dist/index.html` 是编辑工作台，`dist/collector.html` 是收藏家浏览器。

`templates/` 当前包含 12 套音乐谱系：NewAge/Ethereal/Drone、AcidJazz/JazzHiphop、CloudRap/Alt R&B、Chillout/Chillwave、DownTempo/TripHop、MicroHouse/Ambient House、DubTechno/DeepTechno、Future Garage/Ambient Garage、DreamTrance/Psydub、Braindance/IDM、Progressive Breaks/Deep Breaks、Atmospheric Jungle/Ambient Drum n Bass。每套有 JSON 参数和 SVG 导出，另有总览 SVG。

## 收藏家交互与材质决策

收藏家使用正方形屏幕，一次突出一张 MD，底部滑条是主选择器，也支持拖动唱片架、点击侧脊、左右按钮和键盘。两侧唱片绕 Y 轴旋转，保留少量正面或背面；位置越远，内部图案通过景深、轻微失焦、低对比和色彩收敛进入背景，唱片整体透明度保持不变。

所有收藏家唱片使用统一乳白半透明磨砂外壳。`collector-material.js` 将内部彩色图案、外壳和表面印字拆成独立层：内部色块允许扩散，外壳提供高光和乳白雾化，标题、编号、贴纸印字和侧脊文字保持清晰。选中项恢复清晰内部图案与完整色彩；收藏家导出同一套磨砂材质 SVG。工作台继续导出原始复古四层 SVG，避免两个 demo 的编辑数据漂移。

## 状态、迁移和边界

工作台保存的参数 JSON 是跨设备迁移的稳定载体，包含四层参数、模板编号和随机种子。收藏家的星标、自制 MD 列表和最近选中的唱片只存在浏览器 `localStorage`，不会自动同步；自制 MD 的来源仍是导入的工作台 JSON。当前实现上限为收藏家 36 张唱片。

当前边界是视觉收藏 demo，不包含音频播放、账号同步、云端数据库或真实 MD 机械尺寸验证。`.openai/hosting.json` 没有迁移：它绑定此前本地 Sites 项目身份，不属于 GitHub 源码，继续携带会把错误的站点身份带入新仓库。

## 已知问题与后续入口

- 验证脚本的 Playwright/Edge 路径仍面向当前 Codex Windows 运行时；跨机器使用时需要替换为目标环境的浏览器自动化配置。
- 字体没有转曲，跨系统会产生字体替换；可在下一阶段加入字体文件或 SVG 字形缓存。
- SVG 滤镜在不同设计软件中的实现有差异，浏览器是当前主要验收环境。
- 当前 QA 覆盖交互状态、导出、参数往返和窄屏，但真实设备触控、打印色彩和长时间运行尚未验证。
- 下一阶段适合把收藏家材质参数抽成可编辑收藏家主题，并为侧脊排序、标签搜索和跨设备 JSON 收藏包增加数据层。
