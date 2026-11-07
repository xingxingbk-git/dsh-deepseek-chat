# 交接说明（当前快照）

> 本文件只记录**当前**状态与最近一轮工作；历史候选细节见 [handoff-archive](handoff-archive.md)，按阶段的工作记录见 [worklog](worklog.md)，需求/架构/路线见 [requirements](requirements.md)、[architecture](architecture.md)、[roadmap](roadmap.md)。

## 当前 Git 状态：PR #11 待审阅（2026-11-08）

用户明确要求为本会话变更创建变更请求。已从 `main/e073147` 新建并推送 `fix-chat-sidebar-alignment` 分支，功能提交 `bbbb313`（11文件），PR #11：https://github.com/xingxingbk-git/dsh-deepseek-chat/pull/11，目标 `main`。包含同轮0.2.18侧栏/图标修复、预编译lib、48项回归与文档；创建前重新通过类型/分发/48项sidebar-rows/diff检查。未合并、未npm发布、未重启；下方“未Git”描述仅代表各阶段当时状态，不再代表当前状态。

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
- **Git**：0.2.12–0.2.17 的全部改动已提交并推送为分支 `dsh-022-links-downloads-and-switcher`（提交 `92ce606`，49 文件），并已创建 **PR #10**：https://github.com/xingxingbk-git/dsh-deepseek-chat/pull/10（base `main`，状态 OPEN、MERGEABLE）。仓库默认分支 `main` 未改动，等待用户审阅合并；合并前请按下方清单复核。
- **兼容范围**：engine 与 3 个 DSH peers 均为 `0.2.0-rc.2 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`。拒绝 0.2.2 早期预发与全部 0.2.3 预发/正式版。
- **验证状态**：类型、分发（33 编译文件 / 4 共享模块）、兼容（26 版本×4 字段）、SDK 契约 11、窗口契约 48、sidebar-022 54、UI 72、标题 38、跨平台裁剪 119×5、外链 35、下载 9（CDP 可信点击）、提示浮层 20、切换器对齐 7 均通过。`tests/authorization.test.ts`、`tests/mode.test.ts` 断言更早行为契约、对应源码未改、不在门禁内，属既有陈旧测试；`pnpm test` 基线因视觉 SDK 依赖缺失不可用。
- **文档结构**：handoff 现只保留当前状态、提交清单与 0.2.12–0.2.17 记录；0.2.11 及更早的旧段落原样归档到 [handoff-archive](handoff-archive.md)。AGENTS 已压缩为入口指南（约 8KB），需求/架构/路线/取证各加了“现行总要求/概览/进度/索引”小节，其余保留为历史记录。
- **待实机验收**：系统默认浏览器外开、Electron 原生“另存为”对话框、真实账号下的外链/附件流程、Windows 原生拖拽与圆角合成。以上均为合成/Node 证据之外的边界，不要写成已验收。

## 提交/合并前检查清单（本次已按此执行，PR 已创建）

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
