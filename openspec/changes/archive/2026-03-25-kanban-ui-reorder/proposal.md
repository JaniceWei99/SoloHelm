## Why

看板和标签页的默认布局不符合用户心智模型。用户期望灵感（Ideas）作为第一入口，看板列顺序也应与工作流一致：灵感池 → 进行中 → 已完成 → 已发布。当前顺序不直观，需要调整。

## What Changes

- **Tab 顺序调整**: 导航标签页从「看板 → 灵感 → 分析」改为「灵感 → 看板 → 分析」
- **看板列重命名**: 四列名称从「待办 / 开发 / 完成 / 发布」改为「灵感池 / 进行中 / 已完成 / 已发布」，英文从「Todo / Dev / Done / Publish」改为「Ideas Pool / In Progress / Done / Published」

## Capabilities

### New Capabilities
- `ui-layout-reorder`: 调整 Tab 顺序和看板列名，使 UI 布局符合用户期望的工作流

### Modified Capabilities

_(无现有 spec 需要修改)_

## Impact

- `public/index.html`: Tab 按钮 DOM 顺序调整；看板列标题默认文本更新
- `public/app.js`: i18n 字典中 `col.*` 和 `nav.*` 相关 key 的中英文翻译更新；Tab 切换逻辑中默认激活 tab 可能需调整
- `public/style.css`: 无影响（样式基于 class/id，不依赖 DOM 顺序）
