# 交接说明（当前快照）

> 本文件只记录**当前**状态与最近一轮工作；历史候选细节见 [handoff-archive](handoff-archive.md)，按阶段的工作记录见 [worklog](worklog.md)，需求/架构/路线见 [requirements](requirements.md)、[architecture](architecture.md)、[roadmap](roadmap.md)。

## 当前状态（2026-11-07）

- **已发布**：`dsh-deepseek-chat@0.2.17` 已公开发布到 npm，完整索引与 install-v1 索引 `latest` 均为 0.2.17；公开 tarball 与正式包逐字节一致（222584 bytes / 41 文件，SHA256 `4cb49a0c0a19c7387b3ff3e5c27af32356c3b426c69bf8adfa79d334ec36ba5c`）。正式包 `artifacts/npm-release-0217/`，同名 hash 副本 `artifacts/dsh-deepseek-chat-0.2.17-4cb49a0c0a19.tgz`（均为 ignored）。
- **本机**：DSH 桌面版 0.2.2-rc.1；desktop profile 安装的是发布前同版本候选（41/41 字节自洽，SHA256 `7af60eed48b0…`），与公开包仅两份 README 不同、运行代码一致，因此未重装、未重启。需要看到圆角/对齐/提示等改动时请完整退出并重开 DSH。
- **Git**：仍未 stage/commit/push。工作区相对 `329e861`（main/HEAD/origin/main）有 48 项改动，包含 0.2.12–0.2.17 全部交付；提交清单见下节。
- **兼容范围**：engine 与 3 个 DSH peers 均为 `0.2.0-rc.2 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`。拒绝 0.2.2 早期预发与全部 0.2.3 预发/正式版。
- **验证状态**：类型、分发（33 编译文件 / 4 共享模块）、兼容（26 版本×4 字段）、SDK 契约 11、窗口契约 48、sidebar-022 54、UI 72、标题 38、跨平台裁剪 119×5、外链 35、下载 9（CDP 可信点击）、提示浮层 20、切换器对齐 7 均通过。`tests/authorization.test.ts`、`tests/mode.test.ts` 断言更早行为契约、对应源码未改、不在门禁内，属既有陈旧测试；`pnpm test` 基线因视觉 SDK 依赖缺失不可用。
- **文档结构**：handoff 现只保留当前状态、提交清单与 0.2.12–0.2.17 记录；0.2.11 及更早的旧段落原样归档到 [handoff-archive](handoff-archive.md)。AGENTS 已压缩为入口指南（约 8KB），需求/架构/路线/取证各加了“现行总要求/概览/进度/索引”小节，其余保留为历史记录。
- **待实机验收**：系统默认浏览器外开、Electron 原生“另存为”对话框、真实账号下的外链/附件流程、Windows 原生拖拽与圆角合成。以上均为合成/Node 证据之外的边界，不要写成已验收。

## 提交 GitHub 前检查清单

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
