## ADDED Requirements

### Requirement: 侧边栏固定在左侧
页面 SHALL 在左侧显示一个固定定位的纵向侧边栏，宽度约 200px，高度占满视口。

#### Scenario: 页面加载后侧边栏可见
- **WHEN** 用户打开页面
- **THEN** 左侧显示深色背景的纵向侧边栏，包含 Tab 按钮

#### Scenario: 滚动页面时侧边栏固定
- **WHEN** 用户向下滚动内容区
- **THEN** 侧边栏保持固定不动

### Requirement: 侧边栏采用深色背景
侧边栏 SHALL 始终使用深色背景配色，不随 light/dark 主题切换而改变。

#### Scenario: Light 主题下侧边栏仍为深色
- **WHEN** 页面处于 light 主题
- **THEN** 侧边栏背景为深色（#1e293b 或类似深色）

#### Scenario: Dark 主题下侧边栏保持深色
- **WHEN** 页面切换到 dark 主题
- **THEN** 侧边栏外观无明显变化

### Requirement: Tab 按钮纵向排列在侧边栏中
侧边栏 SHALL 包含灵感、看板、分析三个 Tab 按钮，纵向排列，每个按钮包含图标和文字标签。

#### Scenario: Tab 顺序正确
- **WHEN** 用户查看侧边栏
- **THEN** Tab 从上到下依次为：灵感、看板、分析

#### Scenario: 点击 Tab 切换内容
- **WHEN** 用户点击侧边栏中的某个 Tab
- **THEN** 右侧内容区切换为对应页面，被点击的 Tab 显示 active 高亮

### Requirement: 顶部栏不再包含 Tab
顶部 navbar SHALL 仅包含 Logo 和工具按钮（主题切换/语言切换/历史/设置/新建），不再包含 Tab 按钮。

#### Scenario: navbar 中无 Tab 按钮
- **WHEN** 用户查看顶部栏
- **THEN** 仅看到 SoloHelm Logo 和工具按钮，没有灵感/看板/分析 Tab

### Requirement: 内容区占据侧边栏右侧空间
右侧内容区 SHALL 占据侧边栏右侧的全部剩余空间，显示 summary 指标和当前 Tab 的页面内容。

#### Scenario: 内容区不与侧边栏重叠
- **WHEN** 页面正常显示
- **THEN** 内容区从侧边栏右边缘开始，不与侧边栏重叠
