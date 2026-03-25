# OpenSpec 驱动 vs 对话驱动

两种方式都是在对话中提需求，区别在于**需求到代码之间有没有一层文档化的中间产物**。

## 对话驱动

```
用户说需求 → AI 直接改代码 → 完成
```

- 需求理解、方案决策、任务拆解全部发生在对话上下文中
- 代码是唯一产出物
- 如果要回溯"当时为什么这样做"，需要翻聊天记录或 summary
- 适合小改动、探索性修改、一次性任务

## OpenSpec 驱动

```
用户说需求 → explore（澄清） → propose（生成文档） → 用户确认 → apply（按文档写代码） → archive（归档）
```

多了一层**持久化的文档**，记录在 `openspec/changes/<name>/` 目录下：

| 文件 | 作用 | 对话驱动中的对应物 |
|------|------|-------------------|
| `proposal.md` | Why（为什么做）、What Changed（做了什么）、Impact（影响范围） | 散落在聊天记录里 |
| `design.md` | 架构决策、方案对比、trade-off 分析 | AI 脑子里想了但没写下来 |
| `specs/*.md` | 行为规范（Given/When/Then），可验证的预期 | 无 |
| `tasks.md` | 实现步骤（带 checkbox） | 临时 todo list，会话结束即消失 |
| `.openspec.yaml` | 元数据（schema、创建日期） | 无 |

## 四个阶段

### 1. Explore（探索）
讨论需求、澄清边界、评估方案。不产出代码，只产出共识。

> "三个页面合并成 tab 好还是 accordion 好？"
> "配色改了之后 dark mode 还保留吗？"
> "重命名要不要做 localStorage 迁移？"

### 2. Propose（提案）
一步生成完整的 change 目录，包含 proposal、design、specs、tasks。用户审阅确认后才进入实现。

这是**最关键的区别**——先有文档，再动代码。

### 3. Apply（实现）
按 `tasks.md` 逐项写代码，参考 `specs/*.md` 确保行为符合规范。每完成一项勾掉 checkbox。

### 4. Archive（归档）
实现完成后归档到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。

## 怎么选

| 场景 | 推荐方式 |
|------|---------|
| 改个变量名、修个 typo | 对话 |
| 加一个小功能（< 30 分钟） | 对话 |
| 新功能模块、架构变更 | OpenSpec |
| 涉及多文件的重构 | OpenSpec |
| 需要回溯决策原因的改动 | OpenSpec |
| 多次迭代、分阶段实现 | OpenSpec |

简单说：**改动越大、越需要回溯，越值得走 OpenSpec。**
