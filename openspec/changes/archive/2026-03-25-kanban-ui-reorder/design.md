## Context

SoloHelm 是单页面个人任务管理工具，导航有三个 Tab（看板/灵感/分析），看板有四列（待办/开发/完成/发布）。用户希望灵感 Tab 排第一位，看板列名改为「灵感池/进行中/已完成/已发布」。

当前实现：
- Tab 顺序由 `index.html` 中 `<button data-tab="...">` 的 DOM 顺序决定
- 看板列名由 i18n 字典 `col.todo`/`col.dev`/`col.done`/`col.publish` 控制
- 默认激活 Tab 由 `app.js` 中 `switchTab('board')` 决定

## Goals / Non-Goals

**Goals:**
- Tab 顺序改为：灵感 → 看板 → 分析
- 看板列名改为：灵感池 / 进行中 / 已完成 / 已发布（中文）、Ideas Pool / In Progress / Done / Published（英文）
- 默认打开灵感 Tab

**Non-Goals:**
- 不改变底层 status 值（todo/dev/done/publish/backlog）
- 不改变看板列的 DOM 顺序或功能逻辑
- 不改变 CSS 样式

## Decisions

1. **纯 DOM 顺序 + i18n 文本修改**：只移动 HTML 中 Tab 按钮的位置和更新 i18n 字典文本，不涉及 JS 逻辑重构。
   - 理由：改动最小、风险最低，Tab 切换逻辑基于 `data-tab` 属性，与 DOM 顺序无关。

2. **默认 Tab 改为 ideas**：`switchTab` 初始调用改为 `switchTab('ideas')`。
   - 理由：用户希望灵感作为第一入口，默认应与 Tab 顺序一致。

## Risks / Trade-offs

- [风险] Service Worker 缓存了旧 HTML → 用户刷新后可能需要等缓存更新。影响轻微，可忽略。
