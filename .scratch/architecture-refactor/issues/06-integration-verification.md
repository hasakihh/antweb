# 06 — 完成架构重构后的整体验证

**What to build:** 对前 5 张工单形成的统一数据、会话状态和错误处理做一次整体验证，确认各页面仍能正常运行，并清理因重构遗留的旧名称、旧引用和重复 mock 数据。

**Blocked by:** 02 — 统一 Dashboard 与风险分析数据 read-model；03 — 统一后端 route 错误和数据契约；04 — 拆分 AI 会话 session module；05 — 建立 monitoring session module

**Status:** ready-for-agent

- [ ] 全部页面可以正常构建和打开
- [ ] Dashboard、风险、AI、监控页面使用新的 module 和数据入口
- [ ] 旧文件名、旧导出名和无调用方的旧引用已清理
- [ ] 后端接入文档和文件更名记录与实际代码一致
- [ ] 现有页面视觉和主要交互保持一致
- [ ] 完成 lint、build 和浏览器手动检查，不新增测试脚本
