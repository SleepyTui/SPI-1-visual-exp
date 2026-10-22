# 街道环境声：三段 CC0 采样与一轨原创音乐

脚步、车辆、人声分别来自 Freesound 的公开试听文件。逐项核对源页面的 CC0 声明后下载，不需要登录或 API 密钥。原始 MP3 保留在本目录，`SOURCES.json` 保存作者、源页面、公开试听地址、许可与 SHA-256。许可核对日期与原始链接保留在本文，运行不请求原网站。

| 轨道 | 作者与来源 | 本地处理 |
|---|---|---|
| 脚步与人流 | [Frigus_XIII · footsteps on surfaced road in boots](https://freesound.org/people/Frigus_XIII/sounds/456428/) | 音量归一与循环接缝交叉淡化 |
| 车辆经过 | [semenov_nick · 00 - Car_across.wav](https://freesound.org/people/semenov_nick/sounds/380730/) | 音量归一与循环接缝交叉淡化 |
| 人群说话 | [Selector · A large crowd of people talking. Short version](https://freesound.org/people/Selector/sounds/365240/) | 音量归一与循环接缝交叉淡化 |
| 远处店铺音乐 | `ambience-v4.js` 的 `shopMusic()` 原创合成 | 24 秒旋律、和弦、低音及打击循环，经低通滤波模拟远处店铺扬声器 |

采样均为通用声音素材，不声称香港现场录音。未使用第三方商业音乐录音。CC0 说明见 [Creative Commons](https://creativecommons.org/publicdomain/zero/1.0/)。核对日期：2026-10-18。

`ambience-cache.js` 内嵌相同的三个 MP3，以支持 file:// 离线打开；运行不会向原网站发送请求。首次点击环境声按钮后解码，四轨分别进入增益控制，再经过公共的背景压低和总音量控制。选中音阶的乐段开始时，背景自动降低；完成或停止后平滑恢复。环境声默认关闭，载入参数不会自动发声。
