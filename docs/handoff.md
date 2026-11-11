# 交接说明（当前快照）

> 本文件只记录**当前**状态与最近一轮工作；历史候选细节见 [handoff-archive](handoff-archive.md)，按阶段的工作记录见 [worklog](worklog.md)，需求/架构/路线见 [requirements](requirements.md)、[architecture](architecture.md)、[roadmap](roadmap.md)。





## 2026-11-11 0.2.24 已发布 npm

发布 0.2.24（按顺序递增；含自动聚焦、文字头像识别+两处 proof 补齐、快捷键全局优先（网页内注入拦截）、设置控件/文案/英文翻译、DSH 0.2 全线兼容、README 同步）。流程：临时 npm 配置网页登录 → 2FA → publish（202 处理后生效）→ 校验公开 tarball 与正式包**逐字节一致**（245227 bytes / 46 文件，SHA256 `2161c43f2c4b6bc2e0ee73e395acc9e1c44d1624f35c95e8bd11d6ee14976611`）；`latest`/`dist-tags` 已为 0.2.24；临时凭据已 logout、目录删除、PTY 关闭。本机 desktop 仍装 0.2.23 候选 `a10acda7d424`（内容与 0.2.24 相同，仅版本号不同）。本轮已提交并推送 main。

## 2026-11-11 0.2.24 实现：切换快捷键全局优先（网页内注入拦截）

用户实测：HARNESS 输入框与网页内 Tab 的优先级中，CHAT 网页内仍由网页处理 Tab、未切回 HARNESS。根因：Electron `<webview>` 标签**不转发可取消的 `before-input-event`**（该事件只在主进程 WebContents 上可取消），此前基于它的监听在真实环境不会触发；fixture 用 dispatchEvent 模拟因此是假阳性。改为：在 approved guest 内注入一个 capture 阶段 keydown 监听（`window.__dshChatShortcut`），命中配置的任一快捷键时 `preventDefault` + `stopImmediatePropagation`（网页收不到按键），并通过 `console.log('dsh-chat-shortcut:<action>')` 报告；宿主监听 webview 的 `console-message` 事件解析标记后切换。IME 组合、长按重复不处理；配置变化时重新注入更新。回归改为在 fixture 页面**真实执行注入脚本**并断言 Tab 被拦截/IME 不拦截/宿主按 console 标记切换。全部门禁/负对照/5组×119、构建 38 产物通过；候选 `artifacts/dsh-deepseek-chat-0.2.23-a10acda7d424.tgz`（245227bytes/46文件）已装 desktop。本轮已提交并推送 main。

## 2026-11-11 0.2.24 实现：文字头像修复合并与两处补齐

把外部贡献的文字头像识别合并进本地 main（合并提交 `ab240fa`；冲突仅版本相关的 package.json/lib/build-manifest，版本保持已发布 0.2.23 并按源码重建 lib）。审查发现该修复把 proof 值扩为 `footer-v1`/`footer-text-v1`，但另有两个消费者仍硬编码 `footer-v1`：`src/website-conversation-actions.ts`（文字头像账号下重命名/置顶/分享/删除会报错）与 `src/website-sidebar-collapse.ts`（官网侧栏折叠失效）。已改为按属性存在 `[data-dsh-chat-profile-confirmed]` 匹配两种证明，并在 `check:website-text-avatar` 中加源码回归，防止再次遗漏。随后叠加本地的自动聚焦/设置样式/文案改动，重建 lib，跑 text-avatar 31+负对照、composer 单元/fixture、全部门禁、5 组窗口与构建 37 产物通过。候选 `artifacts/dsh-deepseek-chat-0.2.23-0963f0bc1608.tgz`（243527bytes/45文件）已装 desktop（0.2.23 本地候选）。本轮已提交并推送 main。

## 2026-11-11 0.2.24 实现：文字头像账号的密码登录后空白（外部贡献）

Windows DSH 0.2.2-rc.1、正式插件 0.2.23 实机复现：账号密码登录后官网已经进入 `/`，侧栏、账号区和输入框存在，文档为 complete；账号头像是包含一个字母的 div，旁边另有昵称，整个文档没有 img。旧账号识别只从 img 起步，且昵称读取拒绝第二个文字叶子，随后 profile fallback 将 body 设为透明并让 guest 隐藏，最终适配超时。此证据定位文字头像结构，不把国际账号身份泛化为所有账号的原因。

修复在已有侧栏/页脚几何边界内补充文字头像：只接受可聚焦账号行、首个单字符字母/数字头像、单一昵称及菜单图标，排除链接、输入控件、菜单/弹窗和不合格几何。头像字母不计入昵称；独立 footer-text-v1 证明支持隐藏侧栏后的复用与失效撤销。账号菜单使用已验证头像标记，使文字头像的外观同步和退出登录仍能正常触发。图片头像路径保留；凭据白名单、站点请求及认证协议不变。

验证：新增 `check:website-text-avatar` 31 项基于脱敏现场结构的浏览器回归；修复前失败、修复后通过、移除支持的负对照正确检出。类型、compat、SDK、窗口契约、sidebar-022、外链、下载、品牌、切换器、侧栏、guest、bootstrap、header、快捷键/捕获、presentation、title、5 组窗口识别以及 bootstrap/header 负对照通过。额外运行旧 `check-website-settings-browser.mjs`：42 项中 10 项失败，原作者 origin/main 内存对照逐项同样失败，未将该旧 fixture 计为通过。

实机验收（Windows DSH 0.2.2-rc.1，独立临时 profile）：用户自行完成普通账号密码登录后，聊天页、历史镜像、登录已保存状态正常；输入测试草稿并清空（未发送消息）；CHAT/HARNESS 往返、官网刷新均恢复正常；完整退出进程并重新启动后，无需再次输入凭据即恢复登录和聊天页。最终候选包 SHA256 为 c280b61b8214437e9a44749c30ccd7cbd92cc9bc0c35d96f54650f84c15c7878，原有其他 13 个插件和配置保留。未测试所有账号类型、第三方重新授权或真实消息生成；已随 0.2.24 发布 npm。

## 2026-11-11 0.2.24 实现：DSH 0.2 全线兼容与 README 兼容范围整理

按用户要求把兼容范围从「0.2.0-rc.2 / 0.2.1-rc.1 / 0.2.2-rc.1 分段枚举」扩展为 DSH 0.2 全线：`>=0.2.0-rc.1 <0.2.1-0 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`（engine 与 3 个 DSH peers 一致），覆盖 0.2.0 / 0.2.1 / 0.2.2 三条发布线（含各线 RC 与正式版），仍排除 0.2.1/0.2.2 早期内部预发与全部 0.2.3 预发。

兼容性核对：下载 0.2.0-rc.1 与 rc.2 官方 SDK 包逐包 diff——除 primitives 在 rc.2 新增 `MenuGroup`/`observeStickyMenuGroups`（插件未使用）外 API 一致；把 node_modules 替换为 0.2.0-rc.1 全套 SDK 类型跑 tsc，修复两处类型/能力差异后通过：①`settings.section.icon` slot 为 0.2.2 新增，旧壳无此 seat，改为 spec 检测 + inject try/catch + DOM fallback；②Menu 的 `minWidthFromAnchor` 为后加 prop，改为兼容 spread。0.2.0/0.2.1 无 `dsh-client-ui-file-actions`（0.2.2-alpha.3 起才有），附件保存在该两线不可用（已有 optional inject 防护，会提示失败），其余功能正常。

验证：rc.1 SDK 类型 tsc 通过；compat 29 版本×4 字段、tsc、sdk 契约、bootstrap/header/guest/window/title/brand/sidebar/presentation/links/downloads/sidebar-022/switcher/shortcuts/capture、两项负对照、5 组窗口×119、构建 36 产物/4 模块全部通过。README 中英兼容范围已改为「0.2.x（从 0.2.0-rc.1 起，三条发布线）」，并补充 0.2.0/0.2.1 附件保存限制。

候选 `artifacts/dsh-deepseek-chat-0.2.24-8cb4ede480c7.tgz`（241253 bytes/44文件，SHA256 `8cb4ede480c73e90221c65269c50fd944a401722037314e06fea5c9149b005a1`）已装 desktop，44/44 同包、依赖与 lock 锁定；未发布 npm、未自动重启。0.2.0-rc.1 无该版本安装包，未实机验证，仅有类型/契约与合成回归证据。

## 2026-11-11 11:10 0.2.23 已公开发布 npm

用户实测第三方登录与常规功能正常后要求发布。中英 README 发布版/安装示例已同步 0.2.23；类型、构建与分发通过；正式包 `artifacts/dsh-deepseek-chat-0.2.23-5e2cd85cbacf.tgz`（240761 bytes/44文件，SHA256 `5e2cd85cbacf86896d5fa165fe3ca71dec0eba1b9d94a9730ff0239765b5710b`）。

用 0700 临时目录 + 0600 独立 npmrc/cache 完成网页登录（whoami=xingxingbk），用户完成本次发布 2FA；唯一一次 `npm publish` 退出 0 并返回 `+ dsh-deepseek-chat@0.2.23`（提示 processing）。传播后匿名核验：完整元数据与 install-v1 的 `dist-tags.latest` 均为 0.2.23 且版本存在（30 个版本）；公开 tarball 下载 240761 bytes，SHA256 与正式包逐字节一致；`shasum=91b3fae722c9ebec550664ae4a7826d8b33acd475`、`integrity=sha512-NChqKLXsryuiP81XrMcxLP2ZayI/VCLW9IbowR5ufTWcAr4A+l1QLnuxLKuJDrDtRfe48brwiCI2e9FMMUPqog==` 与发布输出一致。临时会话已 logout、临时目录删除、PTY 关闭；未使用用户原 npmrc。

本机 desktop 已装同字节的 0.2.23 候选（`5e2cd85cbacf`），无需重装；未自动重启。0.2.23 内容：external provider 登录页通用显示（Google/Apple/微信/Microsoft/企业 SSO；外部 HTTPS 认证页显示并取消适配计时，不执行 DeepSeek 脚本、不冒充登录，返回 DeepSeek 恢复原流程）、Windows 构建路径分隔符与负对照修复，以及 0.2.22 的设置页统一、模式切换快捷键与 README 重写。

## 0.2.23 设置页统一、快捷键切换与 README 重写（2026-11-10 21:50）

需求：设置页控件高度统一、布局保持卡片但统一细节；新增快捷键切换 CHAT/HARNESS（开关、两个捕获输入框、保存、恢复默认、组合键、边界处理、冲突警告、相同=T切换）；README 重写使用说明与限制。

实现：
- 控件统一 `--dsh-chat-control-height:32px`，设置页输入框/下拉/保存按钮/开关/快捷键输入框同行对齐；保留四张卡并统一下拉标题层级。
- 新增 `src/shortcuts.ts` 纯逻辑：规范化/解析/显示（meta 平台化）、保留键清单、捕获状态机、监听过滤、Toggle/定向语义。
- client 在 `globalThis` capture 监听 keydown：仅窗口聚焦、非编辑元素、非 CHAT 网页、非输入法组合时生效；命中拦截默认行为并切换模式；关闭开关即失效。
- 设置页新增“快捷键切换模式”：开关、两个捕获输入框（聚焦捕获、清空图标、占位与提示）、保存（两框必填）、恢复默认、相同=T 提示；偏好经官方 settings 持久化。
- README 中英重写：核心功能、如何更好地使用（先聊透再动手、省 Token/上下文）、快速开始、功能说明、限制 8 条、隐私、兼容。

验证：快捷键纯逻辑 8 项 + 客户端接线断言；捕获交互浏览器 17 项（组合捕获、Esc、Backspace、纯修饰、保留键、保存、恢复默认、开关持久化）；设置页 83 项（新增控件高度统一）；header 50、bootstrap 51、guest 14、窗口契约 48、title 38、品牌提示 31、侧栏 48、外链、下载 13、负对照、5 组窗口×119 通过；类型与分发 36 产物/4 模块通过。

2026-11-11 01:52 用户决定放弃焦点保护（仍不理想）。已完整回滚：删除 `src/focus-guard.ts` 与 5 项 Node 测试，移除 client 的 `selectModeFromShortcut`/guard 调用与 check:shortcuts 断言，快捷键恢复 `mode.select` 直连；焦点行为交还 DSH 原生（切回 HARNESS 由宿主 composer 自行聚焦）。构建产物回到 36 产物/44 文件，候选 `artifacts/dsh-deepseek-chat-0.2.23-82a754c491f9.tgz`（239279 bytes/44文件，SHA256 `82a754c491f9a426ae09f71186aea8c232e58b6725e64e141471c1d9264b9b32`，与上次回滚版本字节一致）已装 desktop，44/44 同包、依赖与 lock 锁定。未发布 npm、未自动重启。

## 0.2.22 侧栏品牌行与兼容提示修复（2026-11-10 20:45）

问题：部分用户（含装第三方侧栏 UI 插件者）品牌词标被裁成“dee”且出现无法关闭的兼容提示。根因是品牌行视觉依赖接管校验成功：接管失败时不可收缩标记不打，原生容器收缩裁剪词标；提示为常驻 alert、无关闭。

修复：
- `sidebar-adapter` 新增独立的 `markBrandVisual`（可撤回），由品牌组件在识别到 `aria-hidden` 品牌行后自行维护不可收缩标记，接管失败不再影响词标宽度。
- 品牌行结构完全无法识别时，隐藏自有词标，避免半截文字；品牌行保留官网图标。
- 未适配时切换器自动使用图标样式，避免文字胶囊挤压品牌区。
- 兼容提示可关闭并持久化（官方 settings `brandNoticeDismissed`），role 改为 status；Chat 设置新增“重新显示提示”。
- 新增回归：视觉标记独立/可撤回、词标 102px 不裁、未适配图标降级、提示关闭/持久化/恢复（设置页 82 项、品牌提示 31 项）。

类型与分发 35 产物通过；header 50、bootstrap 51、guest 14、窗口契约 48、title 38、品牌提示 31、侧栏 48、设置 82、外链、下载 13、负对照、5 组窗口×119 通过。候选 `artifacts/dsh-deepseek-chat-0.2.22-633d1b997d34.tgz`（232613 bytes/43文件，SHA256 `633d1b997d34d4cbed0e174e204c491cd6aab6a7a56cf31373d11ccaedad87c7`）已装 desktop。未发布 npm、未自动重启。

## 0.2.21 已公开发布 npm（2026-11-09 19:20）

用户明确要求发布。发布前中英 README 的发布版与安装示例同步为 0.2.21；类型与 `release:prepare` 通过；正式包 `artifacts/release-0221/dsh-deepseek-chat-0.2.21.tgz`（231718 bytes/43文件，SHA256 `2fb95234ef3d3bc925a4221b18db1c659e52e1b99bc9f9bc833ec5c35f9ce0d4`）。

经独立临时 npm 配置完成网页登录与发布确认，唯一一次 publish 退出 0（`+ dsh-deepseek-chat@0.2.21`）。注册表传播后核验：`latest` 与 dist-tags 均为 0.2.21；公开 tarball 逐字节同本包、sha512 integrity 与 sha1 shasum 匹配、43 文件、中英 README 均为 0.2.21。临时会话已 logout、目录核实后删除、PTY 关闭；原 `~/.npmrc` 未使用。

本机 desktop 仍装同代码候选 `f1a6c62f964c`（仅 README 版本行不同），未重装/重启。

## 0.2.21 设置文案改为“缓存”（2026-11-09 19:00）

按用户要求调整 Chat 设置文案：标题“离开 CHAT 时网页是否保留”改为“CHAT网页是否缓存”；选项“保留网页”改为“缓存网页”；提示说明改为“缓存网页时，再次切回CHAT模式时无需等待加载，但期间无法打开开发者工具（F12）；立即释放时，在HARNESS下可以使用（F12），但切回CHAT模式时会重新加载网页；延迟释放兼顾两者，会在离开CHAT一段时间后释放缓存。”；下拉 aria-label 同步为“网页缓存方式”。中英 README 与需求现行描述同步使用“缓存”术语。

验证：设置页 77 项（标题/控件/提示交互）通过，其余门禁保持通过。候选 `artifacts/dsh-deepseek-chat-0.2.21-f1a6c62f964c.tgz`（231719 bytes/43文件，SHA256 `f1a6c62f964c4bbba5be5a2a9b9e5885cda85af94c5178408f2aab461b392102`）已装 desktop。未自动重启。

## 0.2.21 下载通道覆盖普通代码块与图片（2026-11-09 18:30）

用户反馈普通代码块（非 Mermaid）右上角“下载”无反应——此前下载通道只识别 Mermaid 的三项导出菜单。扩展同一受限通道：

- 代码块内文本为“下载/Download”、或按钮 `aria-label` 含“下载/download”时授权后续 `a[download]`；Mermaid 仍走原三项菜单路径，普通代码块直接下载。
- 直接点击的 `a[download]` 下载链接无需前置菜单，凭可信点击授权。
- 文本/代码扩展名白名单（py/js/ts/json/yaml/html/sql 等）按 `text/plain` 保存；图片 jpeg/gif/webp/bmp 校验文件头后按实际 MIME 保存；16 MB 上限、文件名与内容校验不变。
- 其他程序化下载（无用户手势）仍不接管，保持宿主策略。
- 二进制附件（pdf/doc/docx/xls/xlsx/ppt/pptx/zip/rar/7z/gz/tar/音视频/电子书等）按 `application/octet-stream` 原样保存；data URL 来源放宽到常见 `image/*`，不再误拒图片。
- `window.open('blob:…'/'data:…')` 不再被当成失效外链报“无法打开该链接”（生成的资源不是可导航链接）。

**未覆盖/待实测**：文件选择上传依赖宿主对话框；语音输入依赖宿主麦克风权限；右键“另存为”、iframe 内下载、无用户手势的程序化下载、非白名单扩展名均不接管。普通“复制”走官网原生剪贴板（只对分享 URL 有 fallback），若复制无反应需另查。

验证：下载通道 13 项（原 9 + 普通代码块 .py、直点 .txt、aria-label .jpeg、二进制 .pdf）；外链新增 blob/data 静默用例；header 50、bootstrap 51、guest 14、窗口契约 48、title 38、品牌 27、侧栏 48、设置 77、外链、负对照、5 组窗口×119 通过；类型与分发 35 产物通过。

候选 `artifacts/dsh-deepseek-chat-0.2.21-5ff291bf1748.tgz`（231681 bytes/43文件，SHA256 `5ff291bf1748f466065d9e7043de156163e47e5a9ee06fe2eac7bcf960a69e74`）已装 desktop，43/43 同包、依赖与 lock 锁定。未发布 npm（0.2.20 为当前公开版）、未自动重启。

## 0.2.20 已公开发布 npm（2026-11-09 14:53）

用户明确要求发布。发布前中英 README 的发布版与安装示例同步为 0.2.20；类型与 `release:prepare` 通过；正式包 `artifacts/release-0220/dsh-deepseek-chat-0.2.20.tgz`（230230 bytes/43文件，SHA256 `efe114d9fc872a1cf2fd35c770216393112a1b97435a682651230735473260d0`）。

经独立临时 npm 配置完成网页登录与发布网页确认，唯一一次 publish 退出 0（`+ dsh-deepseek-chat@0.2.20`）。注册表短暂 404 传播后核验：`latest` 与 dist-tags 均为 0.2.20；公开 tarball 逐字节同本包、sha512 integrity 与 sha1 shasum 匹配、43 文件、中英 README 均为 0.2.20。临时会话已 logout、目录核实后删除、PTY 关闭；原 `~/.npmrc` 未使用。

本机 desktop 仍装同一代码的候选 `b117404ccfea`（仅 README 版本行不同），未重装/重启。代码已合并至 `main/919bb28`。

## 0.2.20 收尾审查：清理残留与补漏（2026-11-09 17:20）

逐项复查本轮改动，处理掉以下遗留：

- **失效注释**：`website-guest` 仍描述“离开 CHAT 释放”，与可配置生命周期不符；`website-navigation` 的就绪注释仍写“只要求身份+隐藏侧栏”，实际还要求顶部行已接管。两处已改为当前行为。
- **常量漂移**：`5/3600/60` 在 client、ui、web-surface 各写一份；统一引用 `preferences.ts` 的 `WEBSITE_RELEASE_DELAY_MIN/MAX` 与 `DEFAULT_SWITCH_PREFERENCES.websiteReleaseDelay`。
- **首帧空值**：延迟输入初值可能为 `undefined` 字符串，改为回退默认 60 秒。
- **重复错误**：保存失败的提示会同时出现在“切换按钮”和“CHAT 网页”两张卡；移除新卡里的重复渲染，统一在偏好卡显示一次。
- **无谓 acquire**：立即释放模式下以 HARNESS 启动时首帧会先创建再释放网页；初始化即置为已释放。
- **旧样式**：确认 `dsh-chat-lifetime-options/choice/delay*` 等上一版类名在样式与 JSX 中均已无残留；9 个启动 Chrome 的测试脚本全部带下载拦截。

验证：类型；构建/分发 35 产物 4 模块；header50、bootstrap51、guest14、窗口契约48、title38、品牌27、侧栏48、设置77、外链、下载9、负对照、5 组窗口×119 全部通过；`git diff --check` 干净。

候选 `artifacts/dsh-deepseek-chat-0.2.20-b117404ccfea.tgz`（230231 bytes/43文件，SHA256 `b117404ccfea87bab25220235e6f1bc933f88418c4c5cd51708a0f319f29bb3b`）已装 desktop，43/43 同包、依赖与 lock 锁定。npm 0.2.20 已发布，代码已合并至 `main/919bb28`；未自动重启。

## 0.2.20 测试脚本不再写入下载目录（2026-11-09 17:00）

用户反馈优化过程会启动多个浏览器并在“下载”文件夹留下大量文件。核查：headless Chrome 测试用例触发了下载，Chrome 默认保存到系统下载目录，强制结束后留下 33 个 53 字节的 `未确认 *.crdownload`；无 headless 进程残留。

处理：清理该 33 个测试残留；给 9 个启动 Chrome 的测试脚本统一加 `Browser.setDownloadBehavior{behavior:'deny'}`，fixture 不再写下载目录。验证依次跑下载/设置/标题/窗口（5 组）测试后，下载目录仍为 0、无 headless 残留。脚本不进入 npm 包，无需重装。

## 0.2.20 提示改为点击展开、移出关闭（2026-11-09 16:40）

按用户要求把 `?` 从悬停 Tooltip 改为点击展开、鼠标移出关闭的说明浮层：`?` 为可聚焦按钮（aria-expanded/Esc 关闭），浮层以标题行相对定位展示在下方，样式沿用卡片描边与主题色；移出标题区域即关闭。

验证：presentation 77 项（点击展开、移出关闭、标题/控件/延迟输入），其余门禁与 5 组窗口×119 通过。候选 `artifacts/dsh-deepseek-chat-0.2.20-480bc247de3f.tgz`（230110 bytes/43文件，SHA256 `480bc247de3f4123ada802fd2094430ec2da9cc2ed2c319a9e2ee78b945fad9c`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 提示文案改为说明取舍（2026-11-09 16:20）

按用户要求把提示图标文案改为说明“保留网页”与“立即释放”的区别：保留时切回 CHAT 无需等待加载，但网页存在期间无法打开开发者工具；立即释放时切回 CHAT 需重新加载，但 HARNESS 下可使用开发者工具；延迟释放兼顾两者。

验证：presentation 75 项通过，其余门禁与 5 组窗口×119 保持通过。候选 `artifacts/dsh-deepseek-chat-0.2.20-fb973ba078d0.tgz`（229851 bytes/43文件，SHA256 `fb973ba078d0ba46ee66073d848c2614679e3378104cea22dbd84373c35790ac`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 设置标题样式与提示文案修正（2026-11-09 16:00）

用户反馈新卡片标题“离开 CHAT 时网页是否保留”字号偏大偏粗，未与“切换按钮”一致；提示图标文案过细。原因：h3 样式作用域只覆盖 `.dsh-chat-presentation-settings`，新卡片类名不同，回退到浏览器默认 h3。修正：把 h3 规则扩展到 `.dsh-chat-website-lifetime`；提示文案简化为“控制离开 CHAT 后网页是否继续保留在内存中。”。presentation 75 项通过，其余门禁与 5 组窗口×119 保持通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-0a3bbbd54b16.tgz`（229731 bytes/43文件，SHA256 `0a3bbbd54b166c88582653f9947ed9bf516e5ebc904fbd7bc8cc83ae0cca3ffb`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 CHAT 网页设置与切换控件对齐（2026-11-09 15:30）

用户反馈：切换选项时出现“切换按钮设置保存失败”；错误文案贴近分割线；选项样式与上方“切换按钮”不一致；要求标题为“离开 CHAT 时网页是否保留”、选项“保留网页/延迟释放/立即释放”，延迟释放时像文字样式一样出现分割线+数字输入（默认60秒）+保存，去掉小字描述，标题后加提示图标悬停显示说明。

修正：
- 保存结果改为与存储快照比对（volatile 写入可能返回 false 但值已生效），错误文案统一为“CHAT 设置保存失败，请重试。”；错误块与分割线间距加大。
- 设置卡改为与“切换按钮”相同的标题行+右侧下拉控件；标题加 `?` 提示图标（Tooltip 显示三种模式的说明）；顺序为保留/延迟/立即；延迟模式显示分割线与数字输入、保存按钮；去掉所有选项下的小字描述。
- 新增样式 `dsh-chat-preference-heading/hint`、`dsh-chat-lifetime-editor`，复用现有 preference-row/divider/labels 布局。

验证：presentation 75项（下拉控件、提示图标、标题文案、延迟输入与分割线、非延迟时隐藏）；bootstrap51、guest14、header50、窗口契约48、title38、品牌27、侧栏48、外链、下载9、负对照、5组窗口×119通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-1dfe5672e7df.tgz`（229818 bytes/43文件，SHA256 `1dfe5672e7df3cf9a2c07a88ff70451f9bdde7e44c40541bb1bbe24f7f8fe8c8`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 CHAT 网页保留方式可配置（2026-11-09 14:50）

用户实测方案 C 后开发者工具仍失效，要求改为可配置：Chat 设置新增“CHAT 网页”，默认保留，可改立即释放或延迟释放（输入秒数），每项带说明。

实现：偏好新增 `websiteLifetime`（retain/immediate/delayed，默认 retain）与 `websiteReleaseDelay`（默认 60，5–3600），经官方 settings 持久化；`holdsWebsiteGuest` 增加 released 参数；web-surface 在 HARNESS 下按偏好保留、立即释放或启动延迟计时（切回 CHAT/设置页会取消计时）。设置卡复用现有 `dsh-chat-settings-card` 布局与 `preference-row`/`note` 样式，选项为单选列表并附说明，延迟输入仅延迟模式显示。

验证：bootstrap 51项（默认保留不释放、立即释放、延迟 5 秒后释放、重进恢复、账号/崩溃/停用仍换租约）；guest14；presentation 74（新卡三选项+延迟输入）；header50、窗口契约48、title38、品牌27、侧栏48、设置72、外链、下载9、负对照、5组窗口×119通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-3c0cbec69bce.tgz`（229828 bytes/43文件，SHA256 `3c0cbec69bcecfea569b6593858f226f01c3174c8ffff083a98848e1f8a302ed`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 切换不再重载（方案 C，2026-11-09 13:30）

用户反馈每次 HARNESS→CHAT 都重新加载，希望恢复秒切。原因：0.2.20 为修 issue #14 在离开 CHAT 时释放网页，再进入必然重建。用户选择方案 C：保留网页进程，切走时主动失焦，尝试兼顾 F12。

修正：`holdsWebsiteGuest` 不再因模式切换返回 false（停用/未授权仍释放）；离开 CHAT 且设置未开时对 webview 调用 `blur()` 并 `window.focus()`，把键盘焦点交还 embedder。页面隐藏但不销毁，切回 CHAT 直接复用同一租约与文档。

验证：bootstrap 47项（离开 CHAT 保留同一 guest、无新 loadURL、重进复用；账号变化/崩溃/停用仍换租约或释放）；guest13（模式不再影响持有，停用/未授权释放）；header50、窗口契约48、title38、品牌27、侧栏48、设置72、外链、下载9、负对照、5组窗口×119通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-8bab8b05886d.tgz`（227995 bytes/43文件，SHA256 `8bab8b05886d0d8ae67be6988514def234b65009f388ba5a64361f482507dbb3`）已装 desktop，43/43 同包、依赖与 lock 锁定。**F12 是否仍可用需要真实 Electron 窗口实测**；若失效则回退释放方案。未自动重启。

## 0.2.20 首次窄窗补采分享尺寸（2026-11-09 13:10）

用户重开后直接最窄切 CHAT、再进会话：分享仍是移动版大尺寸；把窗口调宽再缩窄就正常。

根因：首次宽加载若落在新会话页（无分享），`share-metrics` 未采到；点进会话是站内跳转、视口已窄，需要“同文档补测”。但适配器在发现“窄窗且无尺寸”时**立即**打上一次性标记，而网页侧是否真正启动补测取决于启动控制器是否已就绪；未就绪被跳过时机会已被消耗，该文档永不再试。调宽时宽布局直接采样，故再缩窄正常。

修正：适配器只报告“需要补测”，不再消耗机会；由 Surface 在真正启动补测时计数（每文档≤2 次），新文档重置，站内切换会话重置预算。补测期间保持遮罩，测完恢复。

验证：bootstrap45项（含“未启动不消耗机会”“站内切换重置预算”“新文档重置”），header50、guest13、窗口契约48、title38、品牌27、侧栏48、设置72、外链、下载9、负对照、5组窗口×119通过。fixture 等待上限 3s→8s，避免慢机误报。

候选 `artifacts/dsh-deepseek-chat-0.2.20-bb92409c1656.tgz`（227933 bytes/43文件，SHA256 `bb92409c1656ca9545b12862d0c73cfccd52ce6e00ab5baea9bc9eafdc48a7b7`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 分享几何三档统一（2026-11-09 10:50）

用户确认顶部行已修好，只剩分享按钮：三档宽度下图标大小和悬停背景圆不一致，“分享”二字是官网悬停 tooltip、不需要调整。

根因：上一版只在 ≤767px 归一，且只选 `.ds-button__icon/.ds-icon/svg`；正常宽度仍由官网断点样式控制，窄屏内部结构不匹配时归一等于没盖住，悬停背景也没有尺寸基准。

修正：三档共用同一组实测几何——图标宽高与 `.ds-button__background` 宽高都从桌面按钮采一次，悬停背景以按钮中心对齐；桌面/窄屏都使用这组值，不再分断点。按钮外框仍 28×28，tooltip 保持官网行为。

验证：`check:website-header` 50项（三档背景统一为同一测量值、图标16、外框28、响应式对话/首页行）；bootstrap42、guest13、窗口契约48、title38、品牌27、侧栏48、设置72、外链、下载9、负对照、5组窗口×119通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-77b0c70ca387.tgz`（227901 bytes/43文件，SHA256 `77b0c70ca3876147d42f3286a7ca6b5135046e17b58f602da0ce42d90413bb3d`）已装 desktop，43/43 同包、依赖与 lock 锁定。未自动重启。

## 0.2.20 响应式顶部行接管（2026-11-09 10:40）

用户重开 DSH 后直接缩小窗口切 CHAT：官网菜单（收起侧栏）图标、新会话图标重新露出，分享图标仍是移动版大尺寸。先宽后窄则正常。

根因：顶部行接管只认桌面结构（`._2be88ba` 等）。窄布局加载时官网给的是响应式 DOM，适配器识别失败并清空标记，官网原始顶部控件直接暴露；首页（无标题行）此前从未被接管。

修正：
- 顶部行识别增加响应式分支：按内容区顶部几何 + 公开语义识别。对话页保留真实标题与唯一分享、隐藏官网菜单按钮；新会话页把该行标记为空行、隐藏其子控件并保留 48px 行高。
- 呈现门槛加“顶部行已接管”：检测到但接管失败时保持等待并可重试，不暴露原始控件；完全检测不到顶部行（中间页）以“缺失”放行，避免死锁。
- 解除桌面最小宽度后立即再适配一次，覆盖站点重建响应式顶部行的瞬间。
- 分享尺寸仍只在桌面采一次、窄屏归一，正常宽度零覆写。

验证：`check:website-header` 50项（新增响应式对话行/首页行、菜单隐藏、48px、标题内缩、分享28px）；bootstrap42、guest13、窗口契约48、title38、品牌27、侧栏48、设置72、外链、下载9、负对照、5组窗口×119均通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-4ddb8e280b43.tgz`（227774 bytes/43文件，SHA256 `4ddb8e280b4354e01027ddbfad33288d95748a0944b2fd86b5f01b290cf035e8`）已装 desktop，43/43 文件同包、依赖与 lock 锁定 hash。未发布 npm、未自动重启；请完整退出重开后按“启动即窄窗切 CHAT”复测。

## 0.2.20 显示门槛与分享样式修正（2026-11-09 10:xx）

用户重开后实测两个问题：首次切换 CHAT 右侧显示“CHAT 界面适配超时”；分享按钮悬停背景偏移、三种宽度不一致。

根因（代码可证）：
- 上一轮把“官网原生收起按钮存在”和“已采到桌面分享尺寸”放进了 `desktopReady` 硬门禁。真实官网可能没有该收起控件，或分享按钮的 `--l` class 假设不成立，于是 `ready` 永远不成立，30 秒后报超时并遮蔽整页。这是呈现门槛过严，不是页面加载失败。
- 宽窗口也被注入了分享 `padding` 和 `.ds-button__background{inset/width/height}` 覆写。该背景在官网使用 `left/top:50% + transform` 居中；覆写与原生 transform 叠加后背景圆被二次偏移，表现为悬停背景跑偏，同时正常宽度被改坏。

修正：
- 呈现门槛收敛为“身份已验证 + 原侧栏已隐藏”（与旧版一致）。标题适配、原生收起控件、分享尺寸样本降级为增强证据，缺失不再阻塞呈现；同文档宽测量只做一次（`data-dsh-chat-desktop-chrome-tried`），失败即放弃，不循环遮蔽。
- 正常宽度完全不覆写分享控件内部（padding/icon/背景/焦点/悬停均保留官网原生）。仅 ≤767px 的响应式替换节点归一为采样图标尺寸，悬停背景同步对齐到固定外框。

验证：类型；显式构建/分发35产物4模块；`check:website-header` 42项（含宽屏原生34px悬停背景不被替换、窄屏归一为28px、无收起/无分享证据仍 desktopReady）；`check:website-bootstrap` 42项；guest13、窗口契约48、title38、品牌27、侧栏48、设置72、外链、下载9、两个负对照通过；窗口识别5组视口×119项通过。

候选 `artifacts/dsh-deepseek-chat-0.2.20-304347d400e5.tgz`（227183 bytes/43文件，SHA256 `304347d400e5e0c0b4be9669096859429c9d73e5f125374ec681ee8527051ded`）已用官方 desktop CLI 安装：43/43 文件同包，dependency 与 lock 锁定 hash。未发布 npm、未自动重启；需完整退出重开 DSH 后实测三种宽度下的分享按钮与首次进入。

## 0.2.20 续审当前快照（2026-11-09）

- 用户报告分享图标仍不一致，窗口/侧栏尺寸变化会重载。重新审查确认：旧 `armWideBootstrap` 捕获 viewport.width 且进入 acquire effect 依赖；列表刷新分支直接 reload 未经过 bootstrap；旧 ready/blank finish/6秒宽度兜底并非新文档适配成功证据。此前8项是正则接线检查，不能证明这些行为。
- 已将 guest、文档、几何分离。CHAT 内 resize/分栏侧栏/抽屉开合仅投影布局，身份/模式/显式进程恢复决定租约。初载、真实列表刷新、重试和凭据恢复统一走文档事务；新页面先保持不小于1024px，DOM/主文档加载/桌面隐藏侧栏与标题尺寸证明通过后，确认 guest 的真实尺寸回执再显示。30秒超时遮蔽并给出重试，不露原始网页。headerless首页的首条会话/SPA登录返回可同文档临时测量，不重载。
- 分享控件按已验证的桌面 `--l` 分支实际 SVG/padding 取基准，保留原28px外框，不再写死20px；排除旧 `--xl`、隐藏重名Share、附近匿名图标。补充骨架标题行保护，以及迟到下载/凭据恢复/旧导航错误的 owner/document fence。
- 已通过：类型；显式构建与分发35文件/4共享模块；controller+生产React Surface行为42项；响应式标题/Share33项；两个内存负对照能抓回旧bug；guest规则13、title38、兼容/SDK/sidebar022/窗口契约48、品牌27/侧栏48/切换器、设置72、外链、下载9。完整5组窗口/DPI各119项（共595）通过，日志为证据目录的`window-final.log`。前置失败属于旧fixture的冻结时钟/文档事件与假guest尺寸回执未更新，已修正fixture并保留失败日志，不当成原生验收。
- 证据目录：`artifacts/audit-0220-qBWSpM/`。本轮仍为0.2.20连续调试；正式候选`artifacts/dsh-deepseek-chat-0.2.20-c452c39c5dc7.tgz`，227045 bytes/43文件，SHA256 `c452c39c5dc768ae3868a0eba0f620653234ba38760f978904d793a2b2fdf762`。逐项核对包与源码/产物后，经官方desktop CLI安装；43/43安装文件同包，持久dependency与lock指向不可变hash包。未发布npm、未Git提交/推送、未自动重启；当前运行中GUI仍需用户完整退出重开才算加载新Client。
- 实际版本：DSH 0.2.2-rc.1（Info.plist），Cordis4.1.0、React18.3.1、TypeScript5.8.3、Node24.21.0；项目显式pnpm10.33.2，官方desktop安装器使用pnpm11.28.5。
- 真实待验收：冷启动直接窄窗、首页首条会话、SPA登录返回、三种原生侧栏状态、反复刷新、分享悬停及Electron/DPI尺寸回执；当前线上站点必须仍满足公开DOM契约。自动化不读取实际聊天或凭据，不能代替实机验收。

## 0.2.19 npm 已公开发布（2026-11-08）

用户明确授权发布0.2.19。中英README版本/安装示例更新为0.2.19后，类型/分发33文件4模块通过；正式包222761bytes/41文件，SHA256 `54a3005fe0fa64bb19ed39694b3d73b52c0d517ac98260a3953d431a72f0cfff`。经独立临时配置网页登录与本次publish确认，唯一一次publish退出0；注册表短暂404传播后核验完整/install-v1 latest均0.2.19，公开tarball逐字节同本包、sha512 integrity匹配、41文件和中英README版本正确。临时npm会话已logout、目录核实后删除、PTY关闭，原npm配置未使用。本机desktop安装的仍是发布前0.2.19候选（与公开包仅两份README不同），未重装/重启；发布文档与版本改动本地未提交。

## 0.2.19 已按用户授权安装（2026-11-08）

用户后续明确要求安装试用。已先核对fa12b7ff7b94包SHA256与0.2.19版本，再经官方 `dsh plugin --profile desktop add <candidate> --save-exact` 安装成功（退出0）；41/41安装文件同包，desktop持久dependency与pnpm-lock均指向此候选。未自动重启、未发布npm或Git提交；需用户完整退出并重开DSH确认新Client实际效果。以下“未安装/已卸载”为安装前阶段记录，现已被此状态替代。

## 0.2.20 初期候选：离开 CHAT 释放网页（历史，2026-11-08）

> 此段保留初期尝试背景，不代表当前实现或验收。旧8项bootstrap仅检查源码字符串；旧6秒恢复宽度、对列表刷新已覆盖的结论已由本页续审纠正。候选指纹以后续实测记录为准。

针对 issue #14 实现方案 A：新增 `src/website-guest.ts`（`holdsWebsiteGuest`/`resumeWebsiteUrl`），`src/web-surface.tsx` 的租约 effect 以 `guestWanted` 为门槛并在离开 CHAT 时释放 guest、卸载 webview；进入时记录/恢复上次官网会话 URL，账号变化时清空。`check:website-guest` 13 项通过（纯规则 + 生产源码接线）；类型、分发34文件4模块、品牌27、UI72、侧栏48、外链、下载9、diff通过。0.2.19→0.2.20；包 `artifacts/dsh-deepseek-chat-0.2.20-3bc17156203e.tgz`（223878bytes/42文件，SHA256 `3bc17156203ea5df8c56eb2d86435301f2239ddf9ca885dcf422253da78d5486`）已装 desktop，42/42文件一致、依赖/lock 正确。未自动重启/发布/Git；F12 恢复需用户完整重开后实测，合成检查不能代替 Electron 窗口验收。代价：切回 CHAT 重载页面、草稿丢失，README 已说明。窄窗口最终方案（按用户指出的根因重做）：此前窄窗口分支是在错误前提上打补丁。实际原因是宽窗口先加载桌面布局再适配并收起官网侧栏，而窄窗口一进入就用响应式布局加载，适配器从未见过桌面 DOM。现在 guest 始终先以 1024px 桌面宽度挂载并完成识别/收起/标题适配，新 guest 完成 did-finish-load 且识别 ready 后才恢复；首次进入、刷新/重载与恢复都会重新进入宽加载（armWideBootstrap），等价于“在 CHAT 中缩窗”这条已验证路径；6 秒未就绪超时恢复。窄窗口专用 adapter 分支、隐藏抽屉与几何兜底全部移除，`src/website-navigation.ts` 回到单一宽布局逻辑；不缩放、不显示官网侧栏。新增 check:website-bootstrap 8项；类型/分发34文件4模块、品牌27、侧栏48、外链、下载9通过。旧候选 101518abf124（224469bytes/42文件，SHA256 101518abf1244af3e28e62608e10272a0fd28bc9df8a2ec51041e10ca64658ac）已装入 desktop（42文件同包、依赖锁定）。

## 0.2.19 当前修复：保存服务提示仅在Chat设置显示（2026-11-08）

用户要求移除品牌切换器下方“无法连接CHAT登录保存服务/重试连接”浮框，因为服务断开不影响普通CHAT使用，设置内已有提示。仅删除DshChatBrandControl中state.error的渲染及重试按钮，保留独立sidebarAdapted=false兼容性警告；Chat设置的error/重试入口及登录/连接状态逻辑不改，同时删除不再使用的followup样式。0.2.18→0.2.19递增一次。本机desktop已卸载此插件（依赖与包文件均无），本轮仅构建打包，不擅自安装/重启，不npm/Git发布。卸载残留生命周期问题另见worklog调查，本次不声称修好热卸载。

验证：类型/分发33文件4模块/品牌及设置27项/UI72/sidebar-rows48/窗口48/diff通过。品牌回归现验证HARNESS和CHAT下均无服务错误浮框、设置错误及重试仍有效、官网账号仍可显示、独立兼容警告仍在body portal且清理正常。包 `artifacts/dsh-deepseek-chat-0.2.19-fa12b7ff7b94.tgz`，222762bytes/41文件，SHA256 `fa12b7ff7b94c7e1a7432096dd9ef061e099193fcf89f94675f0b8134a1ec007`，逐文件同源码/产物。已再次确认desktop仍处于卸载状态；当前窗口中的旧Client残留不会因源码变化自动移除。

## 0.2.18 npm 已公开发布（2026-11-08）

用户明确要求发布0.2.18，完成临时配置网页登录及本次publish网页授权。唯一一次 `npm publish` 已返回 `+ dsh-deepseek-chat@0.2.18` 与 `PUBLISH_EXIT=0`；随后用户要求重新确认，已检查确为成功，未重复publish。经过短暂404传播期后，完整/install-v1索引latest均0.2.18、精确版本可读；公开tarball逐字节同正式包、sha512 integrity匹配、41文件和中英README版本核对通过。中英README已同步0.2.18；正式包222875bytes/41文件，SHA256 `451b5236d214583bc16a94d6083634c5f622892b16b0e72bbd83f405fea60626`，与本机候选仅两份README不同。临时npm会话已logout并核实删除临时目录，PTY已关闭；原npm配置未使用。未重装/重启、未执行本轮Git提交推送。README与发布记录仍为本地未提交修改；后续新修复从0.2.19开始。

## 0.2.18 最新候选：搜索/刷新共用圆角规则（2026-11-08）

用户截图指出刷新与搜索悬停色块圆角可能不同。源码确认：搜索为主题 `--dsw-radius-sm`（8px），通用 icon-button 为写死6px。自有CSS将搜索与header刷新合并为同一条sm圆角规则，不改变更多按钮xs（4px）或其他图标。新增三项计算样式验证（8px一致、改token至10px仍同步、更多保持4px），sidebar-rows共48项全过，UI72/类型/分发通过。仍为同轮0.2.18，当前安装包 `artifacts/dsh-deepseek-chat-0.2.18-cb1983e76d01.tgz`（222876bytes/41文件，SHA256 `cb1983e76d01dc11ad20c6aae89a33b6e262c65cb40f8a622282c271d415e20f`），官方安装退出0，41/41文件同包，持久dependency/lock与构建圆角规则已核对。未自动重启/npm/Git，待用户重开看效果；替代下节ca026候选，listArea修复保留。

## 0.2.18 续修候选：补齐 listArea，统一滚动条与行边界（2026-11-08，当前由上节替代）

- 用户截图否定首候选 `673256bc7100` 的滚动条位置和选项宽度，首轮“与原生对齐”的结论撤回。复核本机官方 WorkspaceBrowser JSX（root → listArea → treeBody → list）发现：`listArea` 通过 `margin-right:-edge-inset` 抵消 root 的右 padding。首轮生产代码与回归参考同时漏掉此层，36 项通过不能证明真实 HARNESS 几何。
- 在 `src/ui.tsx` 补自有 `dsh-chat-navigation-list-area`，在 `src/styles.ts` 对应原生 listArea 的左右 margin/padding、flex/min-height 与 overflow；保留首轮更多按钮的仅变色交互。未改宿主、登录或网页数据。
- 修正回归参考为官方完整层级（含 header、listArea、treeBody），新增滚动条四边界、真实溢出与滚动后检查：45/45 通过。同一修正基准在首候选代码上有 18 项预期失败（含滚动条位置和行边界），不再使用首轮错误基准。280px 合成侧栏中：CHAT 与 HARNESS 可见背景均为 x=11..269，滚动条均为 x=273..278、y=48..274（相对各自侧栏）；仅为浏览器合成数据，非用户窗口采样。
- 类型/分发33文件4模块/UI72/sidebar54/切换器对齐7/浮层20/窗口48通过。仍是本轮 0.2.18，不重复增号。
- 当前安装包 `artifacts/dsh-deepseek-chat-0.2.18-ca026f87cc45.tgz`，222865 bytes / 41 文件；SHA256 `ca026f87cc450701c2efe5ce77667511591969ccb2b49d417eb24c6cdcc85fdb`。官方 desktop CLI 安装成功；41/41同包，持久dependency/lock、listArea markup/CSS已核对。未重启/npm/Git，待用户完整重开复验。

## 0.2.18 首候选历史（已被截图否定，由上节替代）

- 用户要求修复 CHAT 对话行偏长，并让更多图标悬停与 HARNESS 一致（仅变色，不出现独立背景块）。基线 `main/e073147`，工作区此前仅有本轮调查日志；PR #10 已合并，旧节的 OPEN 状态是当时记录。本轮未做 Git 写入。
- 只改自有 `src/styles.ts`：navigation 根补原生 edge-inset 右 padding；list 对齐原生左侧补偿与 5px gutter/2px 外距；行使用主题 md 圆角、透明 paint-inset 边框与 padding-box 背景；selected/hover/menu-open 共用原生 hover fill；标题组、搜索头与折叠 rail 同步适配。更多按钮保留 24px 点击区，独立覆盖通用 icon-button 的填充悬停，默认 tertiary、hover primary、背景始终透明；键盘焦点内缩可见，刷新按钮仍保留原来的背景悬停。
- 新增 `check:sidebar-rows`（生产 React/CSS，Menu API stand-in，原生 0.2.2-rc.1 CSS 几何参考与 CDP 强制 hover/focus）：36/36 通过，覆盖 192/280/420px 宽度、8/12/16px inset、长标题、选中/悬停、更多背景/颜色、焦点/菜单/命令、浅色主题、Windows titlebar 标记、禁用与折叠恢复/清理。用 HEAD 旧样式替换后同套检查出现 17 项预期失败（含行边界与更多按钮背景），证明能检出原问题；不是实机截图验收。
- 0.2.17→0.2.18，本轮只增一次。类型、分发 33 文件/4 模块、兼容 26×4、SDK11、sidebar54、UI72、提示浮层20、切换器对齐7、窗口48 均通过。
- 包 `artifacts/dsh-deepseek-chat-0.2.18-673256bc7100.tgz`：222799 bytes / 41 文件；SHA256 `673256bc7100d202697ed8d5a184ef2312fc30d28886495009989b908d1151e8`。官方 desktop CLI 安装成功，41/41 安装文件与包一致，持久 dependency/lock 及构建 CSS 已核对。
- 未自动重启、未 npm 发布、未 Git stage/commit/push；README 保留已公开 0.2.17。待用户完整重开 DSH 验收列表行宽与更多图标交互；如本轮续调仍用 0.2.18，不再次增号。

## 上轮交付状态（2026-11-07，以下为历史快照）

- **已发布**：`dsh-deepseek-chat@0.2.17` 已公开发布到 npm，完整索引与 install-v1 索引 `latest` 均为 0.2.17；公开 tarball 与正式包逐字节一致（222584 bytes / 41 文件，SHA256 `4cb49a0c0a19c7387b3ff3e5c27af32356c3b426c69bf8adfa79d334ec36ba5c`）。正式包 `artifacts/npm-release-0217/`，同名 hash 副本 `artifacts/dsh-deepseek-chat-0.2.17-4cb49a0c0a19.tgz`（均为 ignored）。
- **本机**：DSH 桌面版 0.2.2-rc.1；desktop profile 安装的是发布前同版本候选（41/41 字节自洽，SHA256 `7af60eed48b0…`），与公开包仅两份 README 不同、运行代码一致，因此未重装、未重启。需要看到圆角/对齐/提示等改动时请完整退出并重开 DSH。
- **Git**：0.2.12–0.2.17 的全部改动已提交并推送（分支 `dsh-022-links-downloads-and-switcher`，提交 `92ce606`，49 文件），并已合并至 `main`。
- **兼容范围**：engine 与 3 个 DSH peers 均为 `0.2.0-rc.2 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`。拒绝 0.2.2 早期预发与全部 0.2.3 预发/正式版。
- **验证状态**：类型、分发（33 编译文件 / 4 共享模块）、兼容（26 版本×4 字段）、SDK 契约 11、窗口契约 48、sidebar-022 54、UI 72、标题 38、跨平台裁剪 119×5、外链 35、下载 9（CDP 可信点击）、提示浮层 20、切换器对齐 7 均通过。`tests/authorization.test.ts`、`tests/mode.test.ts` 断言更早行为契约、对应源码未改、不在门禁内，属既有陈旧测试；`pnpm test` 基线因视觉 SDK 依赖缺失不可用。
- **文档结构**：handoff 现只保留当前状态、提交清单与 0.2.12–0.2.17 记录；0.2.11 及更早的旧段落原样归档到 [handoff-archive](handoff-archive.md)。AGENTS 已压缩为入口指南（约 8KB），需求/架构/路线/取证各加了“现行总要求/概览/进度/索引”小节，其余保留为历史记录。
- **待实机验收**：系统默认浏览器外开、Electron 原生“另存为”对话框、真实账号下的外链/附件流程、Windows 原生拖拽与圆角合成。以上均为合成/Node 证据之外的边界，不要写成已验收。

## 提交/合并前检查清单

1. 重新构建并核对产物（源码/版本有改动时必须）：`pnpm release:prepare`，再 `pnpm check:distribution`（应输出 `Prebuilt distribution passed: dsh-deepseek-chat@0.2.17; 33 compiled files match source inputs`）。
2. `git status` 应只包含源码、预编译 `lib/`（含 `lib/types/`、`lib/build-manifest.json`）、`scripts/`、`tests/`、`locale/`、`README*.md`、`docs/`、`AGENTS.md`、`package.json`、`pnpm-lock.yaml`；**不要提交** `artifacts/`、`node_modules/`、`.DS_Store`、任何 `.tgz`、临时目录（均已在 `.gitignore`）。
3. 提交信息建议：`feat: adapt to DSH 0.2.2, fix CHAT links/downloads, align switcher; release 0.2.17`（可按需精简）。
4. 推送后核对 GitHub `main` 与本地 HEAD 一致；`lib/` 必须随源码一起提交，否则 Git 安装会缺预编译产物。
5. 后续新修复从 **0.2.18** 开始；不要覆盖已发布的 0.2.17，npm 发布仍需当轮明确授权。

## 本轮记录（0.2.12 – 0.2.17）

> 以下各节记录**当时**的候选/发布状态；以顶部“当前状态”为准。当前版本 0.2.17 已发布。

## 0.2.17 已公开发布 npm（2026-11-07）

- 用户要求“现在发布一下 npm 新版本”，本轮仅授权 0.2.17 的 npm 公开发布，不授权 Git 提交/推送。发布前把中英 README 的发布版说明与三处安装示例 0.2.11→0.2.17；兼容说明改为覆盖 0.2.0-rc.2、0.2.1 线（>=0.2.1-rc.1）与 0.2.2 线（>=0.2.2-rc.1），并注明 0.2.2 早期预发与 0.2.3+ 仍需适配；功能/限制补充“外链用系统默认浏览器打开”“仅 Mermaid 代码块导出可保存”。
- 正式包 `artifacts/npm-release-0217/dsh-deepseek-chat-0.2.17.tgz`，222584bytes/41 文件，SHA256=`4cb49a0c0a19c7387b3ff3e5c27af32356c3b426c69bf8adfa79d334ec36ba5c`，同项目逐项一致并冻结同名 hash 副本。
- 发布过程：原 npm 登录态已过期（whoami E401），改用独立临时配置 `/private/tmp/dsh-chat-npm-0217/npmrc` 完成 `npm login --auth-type=web`；首次 publish 触发 EOTP，在真实 PTY 中取得完整浏览器授权链接由用户确认后，唯一一次 `npm publish` 返回 `+ dsh-deepseek-chat@0.2.17`。约 110 秒后完整/install-v1 索引 latest 均为 **0.2.17**、精确版本存在；公开 tarball 与本正式包逐字节一致（222584bytes，SHA256 同上，sha512 integrity 匹配），41 文件、package.json 版本 0.2.17、中英 README 均为新发布版与安装示例。
- 与本机已装候选（7af60eed48b0）比较：仅 `README.md`/`README.en.md` 两份不同，31 个 lib 类型与运行文件一致，因此未重装、未重启 DSH。
- 清理：临时 npm 配置已 `npm logout` 并按绝对路径核实为 `/private/tmp/dsh-chat-npm-0217` 后删除，原 `~/.npmrc` 未改动；PTY 会话已关闭。后续新修复从 0.2.18 开始；Git 仍未 stage/commit/push。

## 0.2.17 切换器与原生「新会话」右对齐（2026-11-07，本机候选已安装）

- 用户指出切换器右边缘与「新会话」按钮不齐，要求右对齐（右侧留白一致）。查 0.2.2 官方侧栏几何：根容器 `padding:6px 8px`，logo 行 `padding:0`，原生「新会话」`margin:0 calc(var(--dsh-sidebar-paint-inset,3px) + 1px) 10px`，即右缩进 4px；插件控制宿主原无右缩进，故整体偏右 4px。修法：`.dsh-chat-brand-control-host` 增加 `margin-right:calc(var(--dsh-sidebar-paint-inset, 3px) + 1px)`，与原生按钮同一表达式，折叠/Windows titlebar/宽度变化时同步，无需写死像素。
- 新增回归 `tests/browser/switcher-alignment.fixture.js` + `scripts/check-switcher-alignment.mjs`（`check:switcher-alignment`，7 项）：用官方 0.2.2 侧栏几何合成 logo 行与原生「新会话」，断言切换器右缘与之相等（≤0.5px）、不压住品牌区、Windows titlebar 与加宽侧栏下仍相等、卸载清理。
- 版本自 0.2.16 增一次至 0.2.17。回归：类型、分发 33 文件/4 模块、对齐 7、UI 72、浮层 20、窗口契约 48 通过；`git diff --check` 干净。
- 产物 `artifacts/dsh-02217-candidate/dsh-deepseek-chat-0.2.17.tgz`，222356bytes/41 文件，SHA256=`7af60eed48b04cbf088f830b04129600b614c70a36ae09e9501b661e92d86fa4`，同项目逐项一致并冻结同名 hash 副本；官方 desktop CLI 安装退出 0，41/41 安装字节同包、版本 0.2.17、构建 CSS 含该 margin 规则。
- 未重启 DSH、未发布 npm、未做 Git 提交推送；实际效果需用户完整重开确认。

## 0.2.16 切换器圆角试改 8px（2026-11-07，本机候选已安装）

- 用户看过 12px 后要求改 8px 再试。仅改自有 CSS：外框 `.dsh-chat-brand-control .dsh-chat-modes` 12→8px，内部按钮 11→7px（1px 内边距后同心）。8px 即 DSH 的 `--dsw-radius-sm`（与右上角 Open In 分体按钮同值）。其余尺寸/配色/行为与宿主样式不变。
- 版本自 0.2.15 增一次至 0.2.16。回归：类型、分发 33 文件/4 模块、UI 72、品牌浮层 20、窗口契约 48 通过；`git diff --check` 干净。
- 产物 `artifacts/dsh-02216-candidate/dsh-deepseek-chat-0.2.16.tgz`，222294bytes/41 文件，SHA256=`72cfd1f2491ac9d2e88c6eec9c712e92bfdbe22da45da8dc6e384dc686d98ec1`，同项目逐项一致并冻结同名 hash 副本；官方 desktop CLI 安装退出 0，41/41 安装字节同包、版本 0.2.16、构建 CSS 含 8px/7px。
- 未重启 DSH、未发布 npm、未做 Git 提交推送；效果需用户完整重开确认，若要再调（含回调 5px/4px 或改只动外框）下一轮 0.2.17。

## 0.2.15 切换器圆角试改 12px（2026-11-07，本机候选已安装）

- 用户要求把侧栏 CHAT/HARNESS 切换器组件的圆角改成 12px 看效果。仅改插件自有样式：外框 `.dsh-chat-brand-control .dsh-chat-modes` 由 5px 改 12px，内部两个按钮由 4px 改 11px（留 1px 内边距后与外框同心，避免选中白块出现方角）。其余尺寸/配色/行为不变，宿主样式未动。查阅 DSH 0.2.2 主题 token 确认 `--dsw-radius-md`=12px，宿主「新会话」按钮正是该值，故 12px 与宿主一致。
- 版本自 0.2.14 增一次至 0.2.15。回归：类型、分发 33 文件/4 模块、UI 72、品牌浮层 20、窗口契约 48、跨平台裁剪 119（quick 单档）通过；`git diff --check` 干净。
- 产物 `artifacts/dsh-02215-candidate/dsh-deepseek-chat-0.2.15.tgz`，222292bytes/41 文件，SHA256=`d02a848ffcebbded3f4afb1ee49429b97aa5332dd65f1898fbbffa95bd1e5f7e`，同项目逐项一致并冻结同名 hash 副本；官方 desktop CLI 安装退出 0，41/41 安装字节同包、版本 0.2.15、构建 CSS 含 12px/11px。
- 未重启 DSH、未发布 npm、未做 Git 提交推送；效果需用户完整重开确认。若觉得 12px 太大或内层也应保持 4px，可再调（下一轮 0.2.16）。

## 0.2.14 提示文案去掉尾部句号（2026-11-07，本机候选已安装）

- 用户指出下载/外链提示条（截图“附件已保存。”）作为短提示带句号不合适。仅改文案：`noticeText` 的五条提示统一去掉末尾“。”，并在 locale 增加中英条目（此前这五条未本地化，英文界面会回落中文）。不改任何行为、结构或权限。
- 版本自 0.2.13 增一次至 0.2.14（本轮唯一一次）。回归：类型、分发 33 文件/4 模块、兼容 26×4、外链 35、下载 9、品牌浮层 20、窗口契约 48、UI 72 全通过；`git diff --check` 干净。
- 产物 `artifacts/dsh-02214-candidate/dsh-deepseek-chat-0.2.14.tgz`，222289bytes/41 文件，SHA256=`0b2b4dedad099f9f5986f1dc4743ead51771507504a1219f8be6fd2a38eebba0`，同项目逐项一致并冻结同名 hash 副本；官方 desktop CLI 安装退出 0，41/41 安装字节同包、版本 0.2.14、持久 dependency/lock 同 hash，安装 Client 的五条提示均无尾部句号。
- 未重启 DSH、未发布 npm、未做 Git 提交推送；需用户完整重开后查看提示文案。

## 0.2.13 CHAT 外链、附件下载与黑条来源（2026-11-07，本机候选已安装，待用户重开复验）

- 用户三张截图实报：CHAT 点外链弹“该链接未在此视图中打开”整页错误；Mermaid 的“下载 SVG/PNG/代码”点击无反应；另报 HARNESS 品牌行下偶发黑色横块。本轮自 0.2.12 递增一次至 0.2.13；仅授权适配与本机安装，不自动重启、不发布 npm、不做 Git 提交推送。基线 HEAD/origin/main=`329e861`，fetch 后 0/0；完整保留上轮 28 项 0.2.12 未提交改动。本机 Desktop 0.2.2-rc.1。
- 外链根因：原 `onOpenRequested` 把非官网 URL 判成官网页面错误。按用户“不得打开 HARNESS 右栏”的要求，内置 Browser 属 right Sidebar/dock，未找到不改变 CHAT 布局的公开入口，改用系统默认浏览器：官方外开实现即 `window.open(url,'_blank','noopener,noreferrer')`，Desktop 主进程 `setWindowOpenHandler` 交给 `shell.openExternal` 并拒绝子窗口，故返回 null 属正常。新增 `src/website-links.ts`：仅绝对 http(s)、空用户名密码、长度≤8192；完整 origin 等于官网才留在原 guest 导航，其余交给系统浏览器；`file/blob/data/javascript/mailto/dsh` 等一律拒绝；失败只做非致命提示，不再遮住网页。
- 下载根因：Desktop 对每个 Browser partition 的 `will-download` 无条件 `preventDefault()`，BrowserBridge 无放行接口。改用官方公开 `ctx.fileActions`：新增 `src/website-downloads.ts`（guest 内运行），只响应用户对 Mermaid 导出菜单的真实手势（可信 click/Enter；`.ds-button[role=button]` 含 `.code-info-button-text`＝下载/Download，且所在 `.md-code-block` 内唯一 `.ds-segmented[role=tablist]` 为图表/代码两页签；随后 portal 到 body 的 `[role=menu]` 必须恰好 3 个 `.ds-dropdown-menu-option` 且标签唯一为 下载 SVG/PNG/代码 或 SVG/PNG/Code）。命中后在捕获阶段同步读取该次点击产生的 `a[download]` blob（官网 200ms 后 revoke，故必须立即读；有界 16MiB + 8s 超时 + 单次在途），经 `FileReader` 转 data URL 回主框架；Client 用 `parseWebsiteDownload`/`websiteDownloadBlob` 严格校验名字、MIME、base64、PNG 签名、SVG 根与 UTF-8，再以 `source.read` 交给官方 `fileActions.save(..., canSaveAs?'saveAs':'download')`，由官方在 app realm 建 Blob URL 并调用 Desktop 保存；`cancelled` 静默，`saved`/`requested`/失败分别给非阻断提示。未改 guest 下载禁令、未注入 preload/IPC、未覆盖 `createObjectURL`/`anchor.click`/fetch 等全局 API、未扫描聊天正文或私有状态。
- 黑条：合成复现确认是**本插件自己的** `.dsh-chat-authorization-notice`（连接错误或侧栏不兼容提示）以 `position:absolute` 挂在 24px 高的模式控件里、被原生 logo 行 `overflow:hidden` 裁成约 230×12px 的圆角背景条，文字全被裁掉；与原生 Tooltip/系统 title 泡无关（无 hover 也复现）。改为新增 `src/brand-notice.tsx`：改用 `document.body` portal + `position:fixed`，锚定模式控件右缘、下方 6px、窗口 12px 夹取，ResizeObserver/属性观察/窗口 resize 与滚动更新位置，脱离裁剪祖先；两种提示合并为一个浮框（错误优先 status，含重试；侧栏不兼容作为追加段落）。原生行结构/overflow 未改。
- 回归（全部通过）：类型；分发 33 编译文件/4 共享模块；兼容 26×4；SDK 契约 11；新增 `check:website-links` 35 项 Node；新增 `check:website-downloads` 9 项（真实生产 gate + 合成公开 DOM，CDP 可信点击，覆盖未可信点击不触发、SVG/PNG/源码字节一致、四选项菜单与缺 Mermaid 页签拒绝、无手势下载不接管、结果只消费一次）；新增 `check:brand-notice` 20 项（portal 脱离裁剪、固定定位、230px、暗/亮 token、合并单框、清理）；`check:window-contracts` 48；`check:sidebar-022` 54；UI 72；标题 38；跨平台裁剪 119×5；`git diff --check` 干净。
- 产物：`artifacts/dsh-02213-candidate/dsh-deepseek-chat-0.2.13.tgz`，221985bytes/41 文件，SHA256=`afcc46c9ae5f411741e7c315d75729113d43e52fef20edb282d93c8477adbc6d`，同项目逐项一致（package.json 按既有规则忽略 packageManager），并冻结同名 hash 副本。官方 desktop CLI 安装退出 0，41/41 安装字节同包、版本 0.2.13、持久 dependency/lock 指向同 hash、`dsh.client.inject` 含 file-actions，安装 Client 含外链/下载/浮层代码。
- 边界：外链与下载的官方依据来自 0.2.2-rc.1 分发与公开静态资源（官网公开 bundle 为 10-18 已确认版本，非本轮 fresh 首页）；Mermaid 菜单标签/结构若与线上实际不同则**不接管**（失败关闭），此时官网自身下载仍被宿主策略阻止，属已知限制。仅覆盖 Mermaid 代码块的 SVG/PNG/源码导出，其它附件/站点下载机制未覆盖。未重启 DSH，Electron 原生保存对话框、系统浏览器外开与真实账号仍需用户重开后实机验收。

## 0.2.12 DSH 0.2.2 系列适配（2026-11-07，本机候选已安装，待用户重开验收）

- 用户要求适配现行 DSH 0.2.2 系列。从已发布 0.2.11 递增一次至 0.2.12；本轮仅授权适配/本机安装，不自动重启、不发布 npm、不做 Git 提交推送。开工 main/HEAD/origin/main=`329e861`，工作区干净，fetch 后 0/0。
- 版本证据：本机 Info.plist、ASAR 根与 DSH package.json 三处均 **0.2.2-rc.1**；官方 npm 的 DSH latest/next、开发包 next 同为 0.2.2-rc.1。旧准入 `<0.2.2-0` 明确排除该版。
- 兼容边界：engine 与 3 个 DSH peers 统一扩为 `0.2.0-rc.2 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`，仍拒绝 0.2.2-alpha/beta/rc.0 与全部 0.2.3 预发；`check:compatibility` 改用 26 版本×4 字段并用官方同样的 includePrerelease 语义验证，含“0.2.2-rc.1 必须不被旧范围接受”的可复现断言。开发 SDK 升级到 0.2.2-rc.1 全套（cordis 4.1.0、schemastery 3.19.0、cordis-plugin-group/include 1.1.0）。
- 契约核对（官方 0.2.2-rc.1 分发包 + 本机 ASAR 只读提取，存 ignored `artifacts/dsh-022-rc1-reference`、`artifacts/dsh-022-rc1-npm-reference`、旧版 `artifacts/dsh-021-rc3-reference`）：slots 核心注册/entries/subscribe/inject 与 StoredEntry、layout `panelInfo/selectPanel/toggleSidebar`、settings `configForms`、settings.section 契约、Browser Bridge `protocolVersion=1` + `acquire/release/onOpenRequested`（官方仍只设 name/partition/allowpopups/src）、共享模块表 9 个 baseline 键均保持；typert-protocol/registry 与 api-gateway 只有新增字段（资源解析 resolve、pending events、流压缩），现有调用不受影响。
- 实施的必要适配（均为官方新增能力/真实结构变化，非版本放宽）：
  1. **设置图标改走公开 slot**：0.2.2 起 settings 导航按钮首个子节点由 SVG 变为 `<span aria-hidden>` 包裹 `settings.section.icon` renderSlot，旧 DOM 装饰必然失配。新增 `bindChatSettingsIconSlot`（src/settings-icon.ts）：优先按声明生命周期注册 `settings.section.icon`（id 与 section id 相同，owner props `size/active`），仅在 `ctx.slots.spec('settings.section.icon')` 不存在时才启用原窄 DOM fallback；声明消失时同步回退、注册与观察器成对清理、停止后不再重注册。
  2. **侧栏可选原生新会话按钮**：0.2.2 用 `useRemoteAccess('session/create')` 门控，无权限时 BUTTON 完全缺失且 brand 变为 SPAN。`attachSidebarAdapter` 新增严格正匹配分支（SPAN + 0 个直接 BUTTON + 唯一带 label 的 NAV + 紧跟唯一 DIV region 且其中直接唯一 `sidebar.workspaces` SlotOutlet），旧有唯一紧邻 BUTTON 分支保持；按节点保存/恢复 disabled 与原 marker，动态移除/重建/替换与 owner 重挂均安全，未知结构继续拒绝。
  3. **新抽屉交互锁**：0.2.2 窄窗 drawer 给主区加 `inert`。viewpanel 投影新增可选 `inert`：Panel 读取自身祖先 `[inert]` 并随 viewport 发布（Client 比较含 inert），Surface 同步 inert/aria-hidden/pointer-events，拖拽与采样在该状态下暂停；关闭抽屉后同一 guest/lease 恢复。
  4. **drawer 焦点回归**：原生 drawer 关闭后按 `[data-sidebar-opener]` 找焦点落点，自有展开按钮补该公开标记。
  5. 保留 `guardHarnessSearchReplay` 窄 guard：已核实 0.2.2 workspace 仍是 `useState(0)` + 非 0 retained 请求即展开/聚焦，上游未修复，未扩写 entry.component。
- 回归（全部通过）：类型；分发 30 编译文件/4 共享模块；兼容 26×4；新增 `check:sdk-contracts` 11 项（执行真实官方 SlotRegistry，覆盖旧壳 fallback、晚声明接管、他项隔离、声明撤销回退、重复声明、幂等清理、停止后不重注册、已声明即不启 DOM 观察器，以及 browser bridge/main 槽/icon owner 契约）；`check:window-contracts` 窗口 Node 48（新增 inert-only 发布并撤销 pending 采样、同代次不换 guest）；`check:sidebar-022` 54 项；UI 72 项；标题 38 项；跨平台裁剪 119 项×5 窗口/DPI；`git diff --check` 干净。另：历史 `tests/authorization.test.ts`、`tests/mode.test.ts` 断言的是更早的行为契约（`pending`、`account-profile-unavailable` 等），对应源码本轮未改，`pnpm test` 亦不在门禁脚本内，属既有陈旧测试，未在本轮修复范围。
- 产物：`artifacts/dsh-022-candidate/dsh-deepseek-chat-0.2.12.tgz`，216167bytes/38 文件，SHA256=`570401bd66015acbfdf8f9a145e15011d208df4c5c50c54e1706e433deab94d3`，同项目逐项一致（package.json 按既有规则忽略 packageManager），并冻结同名 hash 副本。官方 desktop CLI 安装退出 0，38/38 安装字节同包、版本 0.2.12、持久 dependency/lock 指向同 hash；安装 Client 含 `settings.section.icon`、`data-sidebar-opener`、`inert` 与 0.2.2 范围。
- 边界：以上是官方静态契约核对 + 合成/Node 回归，**不等** Electron 原生与真实账号实机验收；未重启 DSH。README 保持已发布 0.2.11 的说明不变，发布 0.2.12 时才需把安装示例与兼容说明同步为“支持 0.2.2 发布线”。后续新修复从 0.2.13 开始；npm 发布与 Git 提交推送均需新的明确授权。

---

## 历史（0.2.11 及更早）

已迁至 [handoff-archive](handoff-archive.md)。按阶段的历史记录另见 [worklog](worklog.md)。

## 相关文档

- [requirements](requirements.md)：现行要求与按版本的需求变更记录
- [architecture](architecture.md)：现行架构概览与各阶段技术证据
- [roadmap](roadmap.md)：当前进度与历史路线
- [references](references.md)：官方文档、包与公开资源的取证索引
- [browser-session-capability](browser-session-capability.md)：登录记忆与浏览器能力边界
- [share-copy-investigation](share-copy-investigation.md)：分享复制问题的历史调查
