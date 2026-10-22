# 梦游音阶长街 / Scale Street

交互式世界音阶街景：16 类招牌、65 个音阶、双色弥散视觉、独立灯效、深度图、音阶试听和四轨环境声，支持参数调整及 JSON 导出。

在仓库根目录运行 `node scripts/preview.mjs scale-street`，或在本目录运行 `node serve.mjs`，访问 http://127.0.0.1:4178/。可使用 `SCALE_STREET_PORT` 修改端口。浏览器需经用户操作后播放声音。

运行 `node verify-v2.mjs` 检查资源；`node qa-duotone-v11.mjs` 和 `node qa-rail-v10.mjs` 是浏览器回归脚本，需要本地 Playwright。运行 `python package_v2.py` 可生成独立压缩包；源码仓库不包含生成的压缩包、历史截图及参考图。环境音来源与许可见 [ambience/README.md](ambience/README.md)。

此版本来自原工程提交 `7735c52`；原始历史和旧版本保留在原本地仓库。本目录保留运行资源、字体来源及生成脚本。
