## ADDED Requirements

### Requirement: Tab 顺序为灵感优先
导航标签页 SHALL 按「灵感 → 看板 → 分析」顺序排列，灵感 Tab 在最左侧。

#### Scenario: 页面加载后 Tab 顺序正确
- **WHEN** 用户打开页面
- **THEN** 导航栏 Tab 按钮从左到右依次为：灵感、看板、分析

### Requirement: 默认激活灵感 Tab
页面首次加载时 SHALL 默认显示灵感 Tab 内容。

#### Scenario: 首次加载显示灵感页
- **WHEN** 用户首次打开页面（无 localStorage 记录）
- **THEN** 灵感 Tab 处于激活状态，显示灵感池内容

### Requirement: 看板列名与工作流一致
看板四列标题 SHALL 显示为「灵感池 / 进行中 / 已完成 / 已发布」（中文）或「Ideas Pool / In Progress / Done / Published」（英文）。

#### Scenario: 中文模式下看板列名正确
- **WHEN** 语言设置为中文
- **THEN** 看板四列标题依次显示：灵感池、进行中、已完成、已发布

#### Scenario: 英文模式下看板列名正确
- **WHEN** 语言设置为英文
- **THEN** 看板四列标题依次显示：Ideas Pool、In Progress、Done、Published

#### Scenario: 切换语言后看板列名更新
- **WHEN** 用户在看板页面点击语言切换按钮
- **THEN** 四列标题立即切换为对应语言的名称
