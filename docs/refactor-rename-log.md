# 文件更名记录

所有文件更名都要在这里记录旧名称、新名称、原因和影响范围。没有实际更名的重构不需要虚构记录。

| 日期 | 旧名称 | 新名称 | 原因 | 影响范围 |
| --- | --- | --- | --- | --- |
| 2026-08-26 | `components/ui/v0-ai-chat.tsx` | `components/ai/ai-chat-workbench.tsx` | 去掉脚手架来源命名，改用领域名称 | overview 页面调用 |
| 2026-08-26 | `components/ui/v0-ai-chat.module.css` | `components/ai/ai-chat-workbench.module.css` | 与 AI 会话模块保持同一目录和语义命名 | AI 会话样式引用 |
| 2026-08-26 | `VercelV0Chat` | `AiChatWorkbench` | 导出名称不再暴露脚手架来源 | overview 页面导入 |

后续更名请在对应代码提交中同步更新本表。
