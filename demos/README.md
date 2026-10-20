# 项目索引

Codex 根据“开始〈项目名称〉工作，并在电脑端打开视觉预览”中的名称定位工作目录。以下两个入口属于同一个 MiniDisc 项目，共享引擎与模板，不拆成两份代码。

这只是指令示例，不要求逐字复述或完整目录名。“打开某某文件”“继续做那个收藏家”等口语也算项目定位请求：结合名称、简称、目录前缀、页面标题、功能描述和当前对话推断。大小写、空格、连字符不应成为匹配障碍；别名表是线索，不是只接受这些词的白名单。规则和消歧方式见通用流程。

| 项目 / 入口名称 | 可识别的别名 | 工作目录 | 本机预览 Action / 根目录命令 | 页面入口 |
| --- | --- | --- | --- | --- |
| MiniDisc / MD 收藏家 | MD、MiniDisc Atelier、md-atelier、收藏家、MD 收藏室 | `demos/md-atelier/` | 打开 MD 收藏家 / `node scripts/preview.mjs collector` | `dist/collector.html` |
| MD 封面工作台 | MD 封面编辑器、封面工作台、MD 工作台 | `demos/md-atelier/` | 打开 MD 封面工作台 / `node scripts/preview.mjs editor` | `dist/index.html` |

通用流程：[设计工作流程](../docs/project-workflow.md)。MD 的运行与验证细节：[demo README](md-atelier/README.md)。

新增 demo 时必须更新本表：写明名称、常用简称、实际工作目录、可运行的预览入口和命令。为常用入口增加本机 Action；不要假设新项目也使用 MD 的启动脚本。优先用当前对话消除歧义；只有多个独立项目仍无法区分时，才问一句用户指的是哪个。
