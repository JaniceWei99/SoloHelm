## Why

当前布局采用顶部水平 Tab 导航，页面结构扁平，缺乏层次感。改为左侧深色纵向侧边栏 + 右侧内容区的经典布局，更符合桌面应用的交互习惯，同时看板列名需要调整以反映真实工作流阶段。

## What Changes

- **布局重构**：将导航 Tab（灵感/看板/分析）从顶部 navbar 移至左侧固定侧边栏，侧边栏采用深色背景
- **顶部栏精简**：navbar 仅保留 Logo + 工具按钮（主题/语言/历史/设置/新建），不再包含 Tab
- **内容区调整**：右侧内容区包含 summary 指标行 + 各 Tab 对应的页面内容
- **看板列名更新**：四列从「灵感池/进行中/已完成/已发布」改为「Todo / In Progress / Dev Done / Published」（中英文对应）

## Capabilities

### New Capabilities
- `sidebar-nav`: 左侧深色纵向侧边栏导航，包含 Tab 按钮纵向排列、Logo 或图标、active 状态高亮
- `kanban-column-names`: 看板四列重命名为 Todo / In Progress / Dev Done / Published

### Modified Capabilities

_(无现有 spec 需要修改)_

## Impact

- `public/index.html`：DOM 结构重构 — 新增 `<aside>` 侧边栏元素，Tab 按钮移入侧边栏，navbar 精简
- `public/style.css`：大量样式变更 — 新增侧边栏样式（深色背景、纵向 flex），body 改为 flex 布局，内容区增加 margin-left，响应式断点调整
- `public/app.js`：switchTab() 选择器可能需适配新 class 名；i18n 字典 `col.*` 值更新
