# dsh-deepseek-chat：Agent 开发指南

> 本文件是项目上下文入口。**当前状态**看 [docs/handoff.md](docs/handoff.md)，历史看 [docs/worklog.md](docs/worklog.md) 与 [docs/handoff-archive.md](docs/handoff-archive.md)，需求/架构/路线分别见 [requirements](docs/requirements.md)、[architecture](docs/architecture.md)、[roadmap](docs/roadmap.md)。

## 项目与目标

为 DSH 桌面版提供可逆的 **CHAT / HARNESS** 模式切换：CHAT 在 DSH 内使用真实 DeepSeek 官网（chat.deepseek.com）聊天，HARNESS 恢复用户原来的工作区；切换不丢 Harness 状态和登录（离开 CHAT 会释放网页，见 issue #14 修复）。

- 入口：`src/index.ts`（Host，Cordis 插件）、`src/client.ts`（Web Client）；`package.json` 的 `dsh.bundle.patch` / `dsh.client` 声明扩展点，`cordis.patch.yml` 是 Cordis layer。
- 产物：`lib/` 为**预编译分发**（含 `lib/types/`、`lib/build-manifest.json`），与源码一起提交。
- npm 公开版 **0.2.23**（latest/dist-tags、公开包字节与 integrity/shasum 已核对：240761bytes/44文件，SHA256 `5e2cd85cbacf86896d5fa165fe3ca71dec0eba1b9d94a9730ff0239765b5710b`，公开 tarball 逐字节一致）；本机 desktop 装同字节候选 `5e2cd85cbacf`；本机桌面版为 DSH **0.2.2-rc.1**。

## 当前状态（2026-11-09）
- 0.2.25 候选：Chat 设置控件与 DSH 原生样式对齐——高度统一 34px（原生 Input 高度；按钮同高）、圆角统一 12px（radius-md），自定义快捷键字段从 8px 改为 12px 并对齐原生输入框表面（.5px 边框/bg-layer-3/12px 内边距），清除按钮 8px、`?` 浮层 12px；presentation 86（新增高度/圆角断言）、capture 32 及全部门禁通过。候选 5a36f4b5abf6（241276bytes/44文件，44文件同包、依赖/lock锁定）已装desktop；未发布npm、未推送。请重开验收设置页输入框/按钮外观与 DSH 原生设置是否一致。
- 0.2.24 候选：DSH 0.2 全线兼容——engine/3 peers 改为 `>=0.2.0-rc.1 <0.2.1-0 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`（0.2.0/0.2.1/0.2.2 三条发布线）；旧壳降级：settings.section.icon 缺省走 DOM fallback + inject try/catch，Menu minWidthFromAnchor 兼容 spread；0.2.0/0.2.1 无 file-actions → 附件保存不可用（其余正常）。0.2.0-rc.1 SDK 类型 tsc 通过（未实机）。README 兼容范围改为 0.2.x 三条线并补附件限制。验证：compat29×4、tsc、sdk、全部门禁/负对照/5组×119、构建36产物/4模块通过。候选 8cb4ede480c7（241253bytes/44文件，44文件同包、依赖/lock锁定）已装desktop；未发布npm、未推送。请重开验收常规功能与兼容提示。
- 0.2.23 已公开发布 npm：external provider 登录页通用显示——登录进行中且主文档为外部 HTTPS 认证页（非 deepseek.com、默认端口、无凭据）、DOM 就绪时显示原始页并取消适配计时；Google/Apple/微信/Microsoft/企业 SSO 统一适用；外部页不执行 DeepSeek 脚本、不冒充登录，返回 DeepSeek 恢复原流程；合并时解决 lib/script/README 冲突并重新生成 lib。验证：bootstrap68（含多提供方用例）、header50、guest14、窗口契约48、title38、品牌31、侧栏48、设置85、外链36、下载13、sidebar-022、切换器、快捷键11/捕获32、compat、sdk、负对照、5组窗口×119、构建36产物/4模块通过。正式包 5e2cd85cbacf（240761bytes/44文件，公开 tarball 逐字节一致）已装 desktop；已发布 npm、已推送 main。第三方登录与常规功能由用户实测通过。
- 0.2.22 已公开发布 npm（设置页控件统一 32px 高度、保留卡片分组；新增快捷键切换 CHAT/HARNESS（开关默认开、两个捕获输入框默认 Tab/Tab、相同=T切换、组合键、Esc/Backspace/纯修饰/保留键边界、恢复默认；only 外壳非编辑区生效，CHAT 网页内 Tab 原生）；README 中英重写。快捷键单测8+捕获交互17、设置83、header50、bootstrap51、guest14、窗口契约48、title38、品牌提示31、侧栏48、外链、下载13、负对照、5组窗口×119；构建36产物/4模块。快捷键开关语义：编辑区仅开时显示、开关即时保存、恢复默认始终显示且点击即恢复Tab并开启；输入框改为框内「左侧/右侧」前缀+分隔线+捕获区，并与上方切换按钮行同一行三列对齐；已去掉恢复默认，开关移到标题右侧，底部提示收进 `?` 浮层；捕获引导移入输入框内 placeholder；切换按钮/快捷键/缓存三块合并为带分割线的单面板；标题改为「模式切换快捷键」（修复 h4 内 span）；超长捕获引导持续滚动；macOS 仅保留系统级 Cmd 冲突；空快捷键字段在框内提示「请设置快捷键」，下方不再有提示文案；焦点保护已按用户要求完全回滚（删除 focus-guard 与测试，恢复 mode.select 直连，焦点交还 DSH 原生）；快捷键单测11、捕获回归32、设置85。已公开发布 npm 0.2.22（正式包 239261bytes/44文件，公开 tarball 逐字节一致）；本机 desktop 仍为同代码候选 82a754c491f9（仅版本/README 行不同），未重装/重启；版本回退相关改动未 Git 提交。
- 0.2.22 发布前的本地候选（侧栏品牌行与兼容提示修复）：侧栏品牌行视觉与“顶部新会话接管”解耦——品牌组件独立维护可撤回的不可收缩标记，接管失败词标也不被裁；结构无法识别时隐藏自有词标避免半截；未适配时切换器自动降级图标；兼容提示可关闭/持久化（`brandNoticeDismissed`）、role 改 status，Chat 设置可恢复提示。设置82、品牌提示31、header50、bootstrap51、guest14、窗口契约48、title38、侧栏48、外链、下载13、负对照、5组窗口×119通过。候选633d1b997d34（232613bytes/43文件，43文件同包、依赖/lock锁定）已装desktop；未发布npm、未自动重启。请完整重开后验收品牌行与提示行为。
- 0.2.21 候选：下载通道覆盖普通代码块“下载”、aria-label 下载按钮、直接点击的 a[download] 与二进制附件（pdf/doc/zip/音视频等按 octet-stream 原样保存；文本/代码 text/plain；图片校验头后按实际 MIME），Mermaid 三项菜单不变；blob/data 生成资源不再误报失效外链。未授权程序化下载、iframe 下载、右键另存为、文件上传对话框与语音权限仍受宿主限制。下载回归13、外链生成资源用例、header50、bootstrap51、guest14、窗口契约48、title38、品牌27、侧栏48、设置77、负对照、5组窗口×119通过。候选f1a6c62f964c（231719bytes/43文件，43文件同包、依赖/lock锁定）已装desktop；0.2.21 已公开发布npm（231718bytes/43文件，公开tarball逐字节一致）；未自动重启。设置文案为“CHAT网页是否缓存/缓存网页”，提示说明对比缓存、立即释放与延迟释放（含F12）。请完整重开后在 CHAT 里点普通代码块“下载”和消息图片下载复测，并查看新文案。
- 0.2.20 已公开发布 npm（latest/dist-tags=0.2.20）：CHAT 网页保留方式可在 Chat 设置配置（保留/延迟/立即，延迟 5–3600 秒），默认保留；设置卡与“切换按钮”同布局，`?` 点击展开、移出关闭；窄窗顶部行与分享尺寸已统一。正式包230230bytes/43文件，公开tarball逐字节一致、integrity/shasum匹配、中英README均0.2.20。本机desktop仍装同代码候选b117404ccfea（仅README版本行不同），未重启；代码已合并至 `main/919bb28`。

- 0.2.19 已于用户网页确认后公开发布：完整/install-v1 latest均0.2.19，公开tarball逐字节同正式包（222761bytes/41文件，SHA256=54a3005fe0fa64bb19ed39694b3d73b52c0d517ac98260a3953d431a72f0cfff），临时认证已logout/删除、PTY关闭。未重装/重启；后续新修复0.2.20起。


- 当前源码候选0.2.19：按用户要求移除品牌切换器下保存服务错误/重试浮框，仅Chat设置保留；独立侧栏兼容警告不变。品牌/设置27项、UI72、sidebar48、窗口48、类型与分发通过；候选fa12b7ff7b94（41文件）现已按用户后续明确安装指令装入desktop，安装退出0、41/41同包、持久dependency/lock正确；未自动重启/发布/Git提交，待用户完整重开验收。先前卸载状态已由这次授权安装替代；未修热卸载生命周期。

- 0.2.18 已在用户网页确认后公开发布：完整/install-v1 latest均0.2.18，公开tarball与正式包逐字节一致（222875bytes/41文件，SHA256=451b5236d214583bc16a94d6083634c5f622892b16b0e72bbd83f405fea60626），临时认证已logout/删除、PTY关闭。发布时未重装/重启，后续新修复0.2.19起。0.2.18 已合并至 `main/51a8f6a`。以下“未发布”均是各候选当时状态，不代表当前。

- 最新安装候选为 `cb1983e76d01`（同轮0.2.18）：用户追加搜索/刷新圆角统一，原8px/6px改为一条主题sm规则；sidebar-rows新增动态token/更多xs保护验证共48项通过，UI72/类型/分发通过、41安装文件同包。未重启/npm/Git；下述listArea修复保留。
- 0.2.18 上一安装候选 `ca026f87cc45`：首候选被用户截图否定，生产实现与回归参考均漏掉原生 listArea（负边距抵消 root 右 inset）。已补齐自有 wrapper，回归按官方 root→listArea→treeBody→list 完整结构，新增滚动条边界/溢出/滚动检查，45项通过、首候选在正确基准下18项失败。更多按钮仅变色交互保留；41安装文件同包。首轮36项基准不完整，不能作为已对齐证据。未自动重启/npm/Git，仍同轮0.2.18，待用户完整重开复验；详见handoff顶部。
- 0.2.12–0.2.17 已合并至 `main/e073147`；下列为上一轮交付摘要。

- 0.2.12–0.2.17 已完成并发布：0.2.2 系列适配、外链改系统浏览器、Mermaid 导出附件保存、侧栏提示浮层、提示文案、切换器圆角与右对齐。
- 0.2.17 公开 tarball 已验证与正式包逐字节一致（历史发布证据）；当前本机已升级未发布的 0.2.18 候选。
- **Git**：0.2.12–0.2.20 已合并至 `main`（最近合并提交 `919bb28`）。
- 未实机验收：系统浏览器外开、Electron 原生“另存为”、真实账号流程、Windows 原生拖拽/圆角合成、CHAT 内文件上传对话框、语音输入权限、右键另存为。详见 handoff。

## 目录与职责（简）

| 位置 | 职责 |
| --- | --- |
| `src/core/mode.ts` | CHAT/HARNESS 模式控制与主面板恢复 |
| `src/ui.tsx` | 切换器、导航、设置页、消息状态等 React 组件 |
| `src/web-surface.tsx` | 官网浮层：同一 webview 租约、适配命令、外链与下载桥接 |
| `src/window-drag*.tsx` | CHAT 顶部原生拖拽行与命中几何 |
| `src/sidebar-adapter.ts` | 侧栏品牌/新会话的限定可撤回适配 |
| `src/settings-icon.ts` | 设置页图标：公开 slot 优先，旧壳 DOM fallback |
| `src/brand-notice.tsx` | 授权/不兼容提示的 body 浮层（脱离裁剪祖先） |
| `src/website-*.ts` | 官网导航、会话、语言、排版、外链、下载等纯逻辑模块 |
| `scripts/check-*.mjs` | 兼容/契约/浏览器/分发等检查入口 |
| `tests/` | Node 测试与浏览器 fixture |
| `docs/` | 需求、架构、路线、交接、历史与取证 |

## 版本、发布与 Git 规则

- 每个可交付修复**递增第三段**（如 0.2.16→0.2.17）；同一轮调试/重打包只增一次；纯分析不增号。
- **npm 发布**必须：用户先确认成果 + 当轮明确发布指令。发布前同步中英 README 的发布版与安装示例、必要时更新兼容说明；流程为 `pnpm release:prepare` → 打包 → 用**临时** npm 配置网页登录并发布 → 校验 `latest`/公开 tarball 字节 → logout 并按绝对路径删除临时配置（不改 `~/.npmrc`）。历史发布记录见 worklog。
- **Git** 默认由用户手动提交/推送；只有当轮明确要求时才由 Agent 执行，且不 force、不建 tag。
- 发布授权不自动延续；后续修复从新版本号开始，不覆盖已发布版本。

## 兼容与官方依据

- engine 与 3 个 DSH peers 同值：`0.2.0-rc.2 || >=0.2.1-rc.1 <0.2.2-0 || >=0.2.2-rc.1 <0.2.3-0`。不要写成裸 `<0.2.3`（官方按 `includePrerelease` 语义会误放行 0.2.3 预发）。
- 升级/适配时以官方精确版本分发与类型为准（本机 `app.asar` 为真实归档，需按头部解析读取，禁止整包 grep），参考包存于 ignored `artifacts/`。没有 live Cordis Inspect 时，只能记录静态证据 + 合成/Node 回归，**不得写成实机验收**。
- 不改宿主安装包、不覆写核心状态；插件只通过官方 Slot/服务与限定的公开 DOM 适配实现。

## 已确认产品决策（现行）

- CHAT/HARNESS 可逆，共用同一个网页 guest 与 body portal；网页缓存策略可配置（Chat 设置 →「CHAT网页是否缓存」）：缓存（默认，切回免加载但期间无 F12）、立即释放（HARNESS 下可用 F12，切回重载）、延迟释放（离开后按设定秒数释放缓存，5–3600）。停用/未授权/账号变化仍释放或换租约。
- 官网登录与 DSH 账号独立：未登录也能进入 CHAT；登录记忆只保存官网授权的三个固定 key，经官方 credentials 按 profile 派生 key 保存；退出走 barrier，迟到保存/恢复不得复活旧会话。
- 语言、明暗主题与正文/输入字号跟随 DSH；不提供音色功能（已整体撤回，不要重新引入）。
- CHAT 不打开 HARNESS 右侧栏，也不改变其面板状态；侧栏品牌/新会话适配仅在严格识别时生效，未知结构不猜测。
- CHAT 中的外链交给**系统默认浏览器**（官方 `window.open(...)` 契约），失败只做非阻断提示，不写成网页加载错误。
- 附件保存覆盖用户可信点击的下载：Mermaid 导出菜单、普通代码块“下载”、带下载语义的按钮（含 aria-label）、直接点击的 `a[download]`、图片与常见二进制附件（pdf/office/zip/音视频等）。只在 guest 内有界读取该次下载（≤16 MB），再经官方 `ctx.fileActions` 保存；无用户手势的程序化下载、iframe 内下载、右键“另存为”、非白名单扩展名、文件上传对话框与语音权限仍受宿主限制（已知限制）。
- 插件自有提示改为 body portal 的 fixed 浮层；切换器圆角 8px（内层 7px）、右缘与原生“新会话”同表达式对齐。

## 实现约束（硬性）

- 不覆盖网页全局 API（`createObjectURL`、`anchor.click`、`fetch` 等）、不注入 preload/IPC、不读聊天正文、Cookie、密码或应用私有状态；不扩登录 storage 白名单。
- 不捆绑第二份 Cordis/React；不私改宿主文件；新增依赖须核对目标 DSH 版本。
- 不添加 build/prepare/prepack/install 等自动生命周期；改动源码后显式 `pnpm release:prepare` 并提交整个 `lib/`。
- 每个修复都应有可复现的检查或回归；无法自动化的边界如实写入 handoff。

## 文档职责与同步

- `README.md` / `README.en.md`：只面向使用者（功能、安装、限制、隐私），中英同步；不写排查与内部实现。
- `docs/requirements.md`：现行要求 + 按版本的需求变更记录。
- `docs/architecture.md`：现行架构概览 + 各阶段技术证据与边界。
- `docs/roadmap.md`：当前进度 + 历史路线。
- `docs/handoff.md`：**当前快照**（状态、本轮记录、待验收、提交清单）；旧段落已归档到 `docs/handoff-archive.md`。
- `docs/worklog.md`：按阶段追加的工作日志。
- `docs/references.md`：官方文档/包/公开资源取证。
- 变更完成或暂停交接时：更新 handoff 与 worklog，写清完成/未完成、命令与结果、限制、下一步；不要把聊天原文或敏感数据写进文档。
- **变更请求（PR）不写文档**：创建 PR 的分支、编号、链接与操作过程不记录进 handoff、worklog、AGENTS 或 README；文档只记录版本、功能、验证、发布与验收等实质状态。Git 落点只写已合并的版本与合并提交；未合并的内容不写“已合并”，也不写分支或待合并状态。

## 开工清单

1. 读本文件 + `docs/handoff.md`，再按需读 worklog 近期段落与需求/架构。
2. `git status`、`git fetch`；工作区有未提交改动时先确认归属，不覆盖、不回滚他人成果。
3. 记录当前 DSH、Cordis、React、Node、pnpm 版本（以实际安装为准）。
4. 对未知服务/Slot/API，先读官方包与 `.d.ts`；禁止猜接口。
5. 改动前确认兼容范围与官方依据；改动后跑下方检查并在 handoff 记录。

## 验证命令

```bash
pnpm typecheck
pnpm release:prepare && pnpm check:distribution
pnpm check:compatibility && pnpm check:sdk-contracts
pnpm check:window-contracts && pnpm check:sidebar-022
pnpm check:website-links && pnpm check:website-downloads
pnpm check:brand-notice && pnpm check:switcher-alignment
pnpm check:sidebar-rows
pnpm check:website-guest
pnpm check:website-bootstrap && pnpm check:website-header
pnpm check:shortcuts && pnpm check:shortcut-capture
node scripts/check-website-bootstrap.mjs --negative-control
node scripts/check-website-header.mjs --negative-control
node scripts/check-presentation-settings-browser.mjs
node scripts/check-title-stability-browser.mjs
node scripts/check-window-recognition-headless.mjs   # 5 组窗口/DPI；--quick 单组
git diff --check
```

> `tests/authorization.test.ts`、`tests/mode.test.ts` 断言的是更早行为契约（对应源码已改），不在门禁内；`pnpm test` 基线因视觉 SDK 依赖缺失不可用。不要把这两项当成当前回归通过或失败。
