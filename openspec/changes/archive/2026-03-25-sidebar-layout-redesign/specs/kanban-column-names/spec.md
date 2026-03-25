## ADDED Requirements

### Requirement: 看板四列名称为 Todo / In Progress / Dev Done / Published
看板视图的四列标题 SHALL 显示为「待办 / 进行中 / 开发完成 / 已发布」（中文）或「Todo / In Progress / Dev Done / Published」（英文）。

#### Scenario: 中文模式下列名正确
- **WHEN** 语言设置为中文
- **THEN** 看板四列标题依次显示：待办、进行中、开发完成、已发布

#### Scenario: 英文模式下列名正确
- **WHEN** 语言设置为英文
- **THEN** 看板四列标题依次显示：Todo、In Progress、Dev Done、Published

#### Scenario: 语言切换后列名更新
- **WHEN** 用户切换语言
- **THEN** 看板列标题立即更新为对应语言
