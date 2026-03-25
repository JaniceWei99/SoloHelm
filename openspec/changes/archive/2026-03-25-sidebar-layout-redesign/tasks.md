## 1. HTML 结构重构 (index.html)

- [x] 1.1 在 `<nav>` 之前新增 `<aside class="sidebar">` 元素，将 `.main-tabs` 移入其中
- [x] 1.2 在侧边栏顶部添加 Logo 区域（SoloHelm 图标+文字）
- [x] 1.3 从 navbar 中移除 `.main-tabs` 容器，navbar 仅保留工具按钮区域
- [x] 1.4 更新看板列标题默认文本：待办 / 进行中 / 开发完成 / 已发布

## 2. CSS 侧边栏样式 (style.css)

- [x] 2.1 添加 `.sidebar` 样式：`position: fixed; left: 0; top: 0; width: 200px; height: 100vh; background: #1e293b; flex-direction: column`
- [x] 2.2 调整 `.main-tabs` 为纵向布局：`flex-direction: column; width: 100%`
- [x] 2.3 调整 `.main-tab` 为纵向按钮样式：左对齐、全宽、padding 调整、浅色文字、active 高亮
- [x] 2.4 移除 `.main-tab.active::after` 底部指示器，改为左侧指示器或背景高亮
- [x] 2.5 调整 `.navbar`：移除 tab 相关样式，添加 `margin-left: 200px`
- [x] 2.6 为所有 `.tab-content` 添加 `margin-left: 200px`
- [x] 2.7 更新响应式断点：≤768px 时侧边栏隐藏或改为底部栏，内容区恢复全宽

## 3. i18n 看板列名更新 (app.js)

- [x] 3.1 更新中文字典 `col.*`：待办 / 进行中 / 开发完成 / 已发布
- [x] 3.2 更新英文字典 `col.*`：Todo / In Progress / Dev Done / Published

## 4. 验证

- [x] 4.1 语法检查：`node -c public/app.js`
- [x] 4.2 启动服务器，验证侧边栏在左侧显示、深色背景
- [x] 4.3 验证 Tab 点击切换内容正常
- [x] 4.4 验证看板列名中文为「待办/进行中/开发完成/已发布」
- [x] 4.5 验证切换英文后列名为「Todo / In Progress / Dev Done / Published」
- [x] 4.6 验证 light/dark 主题切换时侧边栏保持深色
