## 1. Tab 顺序调整

- [x] 1.1 在 index.html 中将灵感 Tab 按钮 (`data-tab="ideas"`) 移到看板 Tab 按钮 (`data-tab="board"`) 之前
- [x] 1.2 在 app.js 中将默认激活 Tab 从 `switchTab('board')` 改为 `switchTab('ideas')`

## 2. 看板列名更新

- [x] 2.1 更新 i18n 中文字典：`col.todo` → 灵感池、`col.dev` → 进行中、`col.done` → 已完成、`col.publish` → 已发布
- [x] 2.2 更新 i18n 英文字典：`col.todo` → Ideas Pool、`col.dev` → In Progress、`col.done` → Done、`col.publish` → Published
- [x] 2.3 更新 index.html 中看板列标题的默认文本（`data-i18n` 对应的 fallback 文字）

## 3. 验证

- [x] 3.1 启动服务器，验证页面默认显示灵感 Tab
- [x] 3.2 验证 Tab 顺序为灵感 → 看板 → 分析
- [x] 3.3 切换到看板，验证中文列名为灵感池/进行中/已完成/已发布
- [x] 3.4 切换英文，验证列名为 Ideas Pool / In Progress / Done / Published
