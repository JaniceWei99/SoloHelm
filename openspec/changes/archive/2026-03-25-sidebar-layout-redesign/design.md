## Context

当前 SoloHelm 采用经典水平 navbar + Tab 布局：
- navbar 包含 Logo + 3 个 Tab 按钮（居中）+ 工具按钮（右侧）
- Tab 内容区铺满全宽
- Tab 切换由 `switchTab()` 函数通过 `.active` class 控制显隐
- 看板列名刚改为「灵感池/进行中/已完成/已发布」

## Goals / Non-Goals

**Goals:**
- 左侧固定侧边栏（~200px 宽），深色背景（不随主题切换），纵向排列 Tab 按钮
- 顶部 navbar 精简为 Logo + 工具按钮行
- 右侧内容区自适应剩余宽度，包含 summary + 页面内容
- 看板列名改为 Todo / In Progress / Dev Done / Published（中文：待办 / 进行中 / 开发完成 / 已发布）
- 移动端侧边栏可折叠或隐藏

**Non-Goals:**
- 不改变 Tab 切换的 JS 逻辑（仅改 DOM 位置和 class 名）
- 不改变底层 status 值（todo/dev/done/publish）
- 不改变后端 API

## Decisions

1. **侧边栏实现方案：固定定位 `<aside>` 元素**
   - 使用 `position: fixed; left: 0; top: 0; height: 100vh; width: 200px`
   - 内容区 `margin-left: 200px`
   - 理由：实现简单，无需改动 JS 布局逻辑；固定定位保证滚动时侧边栏不动
   - 备选方案：CSS Grid body 布局 — 更优雅但改动更大，不必要

2. **侧边栏深色配色：使用硬编码深色值，不跟随主题**
   - 背景 `#1e293b`，文字 `#94a3b8`，active 高亮 `var(--accent)`
   - 理由：用户明确要求深色系侧边栏，无论 light/dark 主题都保持一致

3. **Tab 按钮保留 `.main-tab` class 和 `data-tab` 属性**
   - switchTab() 函数无需修改选择器
   - 只需将 `.main-tabs` 的 CSS 从 `display: flex`（水平）改为 `flex-direction: column`（纵向）

4. **移动端（≤768px）侧边栏折叠为底部 Tab 栏**
   - 理由：小屏幕上侧边栏占用过多空间，底部栏更符合移动端习惯

## Risks / Trade-offs

- [风险] 侧边栏占用 200px 宽度，看板 4 列在中等屏幕可能拥挤 → 看板区域仍可滚动，且响应式断点会将 4 列改为 2 列
- [风险] Service Worker 缓存旧 CSS → 影响轻微，刷新即可
