![DeepSeek Chat：CHAT 与 HARNESS 一键切换](<docs/images/readme-cover.png>)

<h1 align="center">DeepSeek Chat</h1>

<p align="center"><strong>在 DeepSeek Harness 中，一键切换网页聊天与原工作区。</strong></p>

<p align="center"><strong>简体中文</strong> · <a href="README.en.md">English</a></p>

---

DeepSeek Chat 是一款 **DSH 桌面插件**。选择 **CHAT**，即可在 DSH 内使用真实的 [DeepSeek Chat 官网](https://chat.deepseek.com/)；选择 **HARNESS**，随时返回原来的工作区。

当前版本 **0.2.9**· 适配 **DSH 桌面版** · CHAT 网页的语言、外观和字号跟随 DSH。

## 功能预览

### 在 DSH 里使用 DeepSeek 网页聊天

![CHAT 模式：DSH 侧栏与 DeepSeek 官网聊天页面](<docs/images/chat-overview.png>)

- 在 DSH 内使用官网聊天，并在侧栏浏览已加载的对话、置顶和日期分组。
- 搜索、打开历史对话，或通过顶部“新会话”开始聊天。
- 通过对话右侧的菜单重命名、置顶、分享和删除对话。
- 点击“对话”右侧的刷新图标，更新官网页面和对话列表。
- 语言、明暗主题和内容字号自动跟随 DSH 设置。

### 随时切回 HARNESS

![品牌行中的 CHAT 与 HARNESS 模式切换器](<docs/images/mode-switch.png>)

通过左上角 DeepSeek 品牌旁的 **CHAT / HARNESS** 切换器选择模式。切回 HARNESS 会恢复之前的主面板，再进入 CHAT 时回到刚才的网页。

### 独立的官网登录与登录记忆

在 **设置 → Chat 设置** 中查看官网账号、登录记忆或退出登录。CHAT 使用独立的网页登录，不与其他浏览器或 DSH 平台账号共享登录状态。

正常登录后，设置页出现 **“已记住网页登录”**，表示本次授权已保存。重开同一个 DSH 配置环境时，插件会尝试恢复；官网授权过期后仍需重新登录。

## 安装

### 按名称安装（当前发布版）

在 DSH 插件安装输入框中输入：

```text
dsh-deepseek-chat@0.2.9
```

也可以使用命令行：

```bash
dsh plugin --profile desktop add dsh-deepseek-chat@0.2.9
```

首次安装和更新已有插件均可使用。刚发布的版本若被 DSH 的发布时间策略暂时拦截，可稍后重试。

### 从 GitHub 安装

在 DSH 插件安装输入框中粘贴：

```text
https://github.com/xingxingbk-git/dsh-deepseek-chat
```

或使用命令行：

```bash
dsh plugin --profile desktop add https://github.com/xingxingbk-git/dsh-deepseek-chat
```

此方式安装仓库中已推送的版本，无需手动构建。需要系统已安装 Git；Windows 可先安装 [Git for Windows](https://git-scm.com/install/windows)，再重开 DSH。

### 使用本地安装包

将 `.tgz` 安装包交给 DSH 插件管理器，或使用命令行：

```bash
dsh plugin --profile desktop add /absolute/path/dsh-deepseek-chat-0.2.9.tgz
```

将路径替换为实际安装包位置。

**安装或更新后，请完整退出并重新打开 DSH。** 使用其他配置环境时，将命令中的 `desktop` 替换为对应名称。更多说明参见 [DSH 官方插件安装文档](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)。

## 开始使用

1. 选择 **CHAT**，点击 **登录 DeepSeek**，在插件内的官网页面正常登录。
2. 登录后，账号和对话列表会自动同步；可在 **设置 → Chat 设置** 查看登录记忆状态。
3. 在 **DSH 设置 → 通用设置** 调整语言、外观和字号，CHAT 会自动跟随。
4. 需要返回原工作区时，切换到 **HARNESS**。退出官网账号可在 **Chat 设置** 中操作。

## 使用说明与限制

- **运行环境：**适用于 DSH 桌面版，兼容 0.2.0-rc.2 及从 0.2.1-rc.1 开始的 0.2.1 发布线；0.2.2 及以上版本需要适配，暂不支持 DSH Web。
- **对话列表：**列表和搜索仅包含官网已加载的导航内容。官网页面结构变化可能影响账号或列表识别，可根据界面提示重试。
- **登录状态：**登录记忆仅用于同一 DSH 配置环境；授权过期、撤销或官网登录机制变化后，可能需要重新登录，不保证永久免登录。
- **草稿与刷新：**模式切换会保留网页，但刷新、停用、卸载或退出 DSH 前，请先保留未发送内容。插件不会额外备份草稿。
- **快捷键与网页能力：**Harness 原有的新会话快捷键和菜单仍作用于 HARNESS；CHAT 请使用其顶部“新会话”按钮。下载、设备权限和部分弹窗受 DSH 的浏览器安全策略限制。

## 隐私与数据

聊天内容和账号历史由 DeepSeek 官网处理。插件为显示账号与导航，读取官网可见的昵称、对话标题、分组和链接；这些导航信息仅在当前登录期间保留于内存。

登录记忆只保存官网授权所需的最小信息，通过 DSH 官方凭据服务管理，并按配置环境隔离。退出登录会清除本插件的登录记忆。

插件不会将密码、Cookie 或聊天正文保存到登录记忆中，不读取 DSH 或其他插件的令牌，也不访问其他浏览器的登录数据。

## 卸载

在 DSH 插件管理器中移除，或执行：

```bash
dsh plugin --profile desktop remove dsh-deepseek-chat
```
