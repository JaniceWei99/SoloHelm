# SoloHelm

> **One Person Company** 的个人项目管理工具 — 从灵感到发布的完整管道。

SoloHelm 是一款为独立开发者 / 一人公司量身打造的轻量任务管理工具。零配置、自托管、完整数据所有权，用最少的技术负担覆盖灵感收集、任务看板、数据分析三大场景。

---

## 预览

| 深色主题 | 浅色主题 |
|:--------:|:--------:|
| 左侧固定深色侧边栏 + 看板视图 | 切换浅色后内容区变白 |

```
┌──────────┬──────────────────────────────────┐
│ SoloHelm │  [主题] [语言] [历史] [设置] [+] │
│          ├──────────────────────────────────┤
│  灵感    │                                  │
│  看板    │         Tab 内容区域              │
│  分析    │   Kanban / List / Timeline ...    │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

---

## 核心特性

### 灵感池 (Ideas)
- 快速记录灵感，支持实时搜索和语音输入（Web Speech API）
- 灵感可一键转为任务 (To Todo)，任务也可退回灵感池 (To Idea)
- 语音速记 — 不用打字，张口就录

### 看板 (Board)
- **5 阶段生命周期**：`backlog` → `todo` → `dev` → `done` → `publish`
- **三种视图**：Kanban 拖拽看板 / List 紧凑列表 / Timeline 时间线
- **4 列看板**：待办 · 进行中 · 开发完成 · 已发布
- 拖拽移动任务跨列，点击状态标记循环（空 → 进行中 → 阻塞）
- 子任务/Checklist 带进度条
- 周期性任务 — 完成时自动克隆为新 todo（daily / weekly / monthly）

### 分析 (Analytics)
- 4 张 Chart.js 图表：状态分布 / 优先级分布 / 周速率 / 燃尽图
- Hero 指标面板：今日任务、风险项、活跃数

### 其他亮点

| 功能 | 说明 |
|------|------|
| 侧边栏导航 | 左侧 200px 深色固定侧边栏，纵向切换 Tab |
| 中英文切换 | i18n 系统，~350 个翻译 key，一键切换 |
| 深色 / 浅色主题 | 侧边栏始终深色，内容区跟随主题 |
| 键盘快捷键 | `1` `2` `3` 切 Tab、`N` 新建、`/` 搜索、`?` 帮助、`Ctrl+Z` 撤销 |
| 数据导出/导入 | JSON / CSV 导出，JSON 导入 |
| Undo 撤销 | 删除和状态变更 5 秒内可撤销（Toast + Undo 按钮） |
| PWA 离线支持 | Service Worker 缓存，可安装到桌面/手机 |
| 活动日志 | 全量变更历史，支持按任务查看 |
| 响应式布局 | 桌面侧边栏，移动端（≤768px）底部 Tab 栏 |
| 前后端校验 | 枚举/长度校验，防止脏数据写入 |

---

## 快速开始

### 一键安装（推荐）

从 GitHub 下载 ZIP 解压后，双击对应系统的安装文件即可：

| 系统 | 文件 | 操作 |
|------|------|------|
| **Windows** | `install-windows.bat` | 双击运行 |
| **macOS** | `install-macos.command` | 双击运行 |
| **Linux** | `install-linux.sh` | 终端执行 `bash install-linux.sh` |

脚本会自动检测并安装 Node.js、安装依赖、启动服务并打开浏览器。

> **macOS 首次双击提示"无法验证开发者"**：右键点击文件 → 选择"打开" → 点击"打开"。

### 手动安装

#### 环境要求

- **Node.js** >= 16

#### 安装 & 启动

```bash
git clone https://github.com/JaniceWei99/SoloHelm.git
cd SoloHelm
npm install
npm start
```

打开浏览器访问 **http://localhost:3000** 即可使用。首次启动会自动创建数据库并注入演示数据。

### 一行命令（已安装 Node.js）

```bash
git clone https://github.com/JaniceWei99/SoloHelm.git && cd SoloHelm && npm install && npm start
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务监听端口 |
| `NODE_ENV` | — | 设为 `production` 可关闭 Express 调试信息、启用缓存 |

数据库路径固定为 `<项目根>/data/board.db`（Docker 中为 `/app/data/board.db`），通过挂载 volume 实现持久化。

```bash
# 示例：更换端口
PORT=8080 npm start
```

---

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 后端 | Node.js + Express | RESTful API，~565 行 |
| 数据库 | SQLite (sql.js) | 内存运行，持久化到 `data/board.db` |
| 前端 | 纯 HTML/CSS/JS | 无框架、无构建步骤，单页应用 |
| 图表 | Chart.js 4.x (CDN) | 状态/优先级/速率/燃尽图 |
| 图标 | FontAwesome 6.5.1 (CDN) | 全站图标 |
| 字体 | Inter (Google Fonts) | UI 字体 |
| PWA | Service Worker + Manifest | 离线缓存 + 可安装 |

**零构建** — 没有 webpack、没有 TypeScript。`npm start` 一键运行，也支持 Docker 和 Kubernetes 部署。

---

## 项目结构

```
.
├── server.js                # Express 后端 (~565 行)
├── package.json
├── Dockerfile               # 多阶段 Docker 构建
├── .dockerignore
├── install-windows.bat      # Windows 一键安装（双击运行）
├── install-macos.command    # macOS 一键安装（双击运行）
├── install-linux.sh         # Linux 一键安装
├── public/
│   ├── index.html           # 单页应用入口 (~350 行)
│   ├── app.js               # 前端逻辑 + i18n (~1705 行)
│   ├── style.css            # 全部样式 (~364 行)
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service Worker
├── helm/solohelm/           # Helm Chart (Kubernetes 部署)
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/           # K8s 资源模板
├── data/
│   └── board.db             # SQLite 数据库 (自动创建)
├── doc/
│   ├── user-guide.md            # 用户指南 (功能、工作流、快捷键)
│   ├── deploy.md                # 部署指南 (Docker / Helm / 裸机)
│   └── competitive-analysis.md  # 竞品分析 + 版本变更记录
└── openspec/                # OpenSpec 变更归档 (proposals, designs, specs, tasks)
```

---

## API 参考

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/tasks` | 获取全部任务 |
| `GET` | `/api/tasks/:id` | 获取单个任务 |
| `POST` | `/api/tasks` | 创建任务 |
| `PUT` | `/api/tasks/:id` | 更新任务 |
| `DELETE` | `/api/tasks/:id` | 删除任务 |
| `GET` | `/api/tasks/:id/history` | 任务变更历史 |
| `POST` | `/api/tasks/:id/clone` | 克隆任务（周期性） |
| `GET` | `/api/history` | 全局活动日志 |
| `GET` | `/api/analytics` | 分析数据 |
| `GET` | `/api/export` | 导出全部任务 (JSON) |
| `POST` | `/api/import` | 批量导入任务 (JSON) |

### 示例

```bash
# 创建任务
curl -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title": "设计新 Logo", "priority": "P1", "status": "todo"}'

# 获取全部任务
curl http://localhost:3000/api/tasks

# 导出数据
curl http://localhost:3000/api/export -o backup.json
```

---

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `1` | 切换到灵感 Tab |
| `2` | 切换到看板 Tab |
| `3` | 切换到分析 Tab |
| `N` | 新建任务/灵感 |
| `/` | 聚焦搜索框 |
| `Esc` | 关闭弹窗/面板 |
| `?` | 显示快捷键帮助 |
| `Ctrl+Z` | 撤销上一个操作 |

---

## 与竞品对比

| 功能 | SoloHelm | Trello | Linear | Todoist |
|------|----------|--------|--------|---------|
| 自托管/数据所有权 | **完全自有** | 厂商托管 | 厂商托管 | 厂商托管 |
| 价格 | **免费** | 免费/付费 | $8/月起 | 免费/付费 |
| 灵感池 + 看板管道 | **原生支持** | 无 | 无 | 无 |
| 5 阶段发布流程 | **有** | 自定义 | 自定义 | 无 |
| 子任务/Checklist | **有** | 有 | 有 | 有 |
| 数据可视化 | **4 图表** | 插件 | 有 | 无 |
| 时间线视图 | **有** | 插件 | 有 | 无 |
| 离线支持 | **PWA** | 部分 | 完整 | 部分 |
| 周期性任务 | **有** | 插件 | 无 | 有 |
| 多语言 | **中/英** | 多语言 | 多语言 | 多语言 |
| 零配置启动 | **npm start** | 需注册 | 需注册 | 需注册 |

---

## 数据备份与迁移

详见 [doc/deploy.md — 数据备份与恢复](doc/deploy.md#数据备份与恢复)。

---

## 部署

支持一键安装、Docker、Kubernetes (Helm)、裸机 (PM2/systemd + Nginx) 多种部署方式。

详见 **[doc/deploy.md](doc/deploy.md)**。

快速参考：

```bash
# 一键安装（自动检测系统、安装 Node.js、启动服务）
bash install-linux.sh              # Linux
bash install-linux.sh --service    # Linux — 注册为 systemd 服务（开机自启）
bash install-linux.sh --docker     # Linux — Docker 构建并运行
# Docker
docker build -t solohelm:latest .
docker run -d --name solohelm -p 3000:3000 -v solohelm-data:/app/data solohelm:latest

# Kubernetes (Helm)
helm install solohelm ./helm/solohelm

# 裸机 (PM2)
pm2 start server.js --name solohelm
```

---

## 开发说明

- 修改前端文件后刷新浏览器即可，无需重启服务
- 修改 `server.js` 后需重启 Node 进程
- 数据库会自动迁移（新增列、导入旧 JSON 数据）
- 使用 `sql.js`（纯 JS SQLite），无需安装原生编译工具

---

## 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| **v2.0.2** | 2026-04-01 | 一键安装脚本（Windows/macOS/Linux 双击部署） |
| **v1.0.0** | 2026-03-25 | 单页应用重构 + 侧边栏导航 + 中英文 i18n + 完整功能 |

详细变更记录见 [doc/competitive-analysis.md](doc/competitive-analysis.md)。

---

## 常见问题排查

详见 [doc/deploy.md — 常见问题排查](doc/deploy.md#常见问题排查)。

---

## 许可证

MIT

---

<p align="center">
  <b>SoloHelm</b> — 专为一人公司打造的项目管理工具<br>
  如果觉得有用，欢迎 Star!
</p>
