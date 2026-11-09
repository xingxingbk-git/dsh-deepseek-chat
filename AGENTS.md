# dsh-deepseek-chat：Agent 开发指南

> 本文件是项目上下文入口。**当前状态**看 [docs/handoff.md](docs/handoff.md)，历史看 [docs/worklog.md](docs/worklog.md) 与 [docs/handoff-archive.md](docs/handoff-archive.md)，需求/架构/路线分别见 [requirements](docs/requirements.md)、[architecture](docs/architecture.md)、[roadmap](docs/roadmap.md)。

## 项目与目标

为 DSH 桌面版提供可逆的 **CHAT / HARNESS** 模式切换：CHAT 在 DSH 内使用真实 DeepSeek 官网（chat.deepseek.com）聊天，HARNESS 恢复用户原来的工作区；切换不丢 Harness 状态和登录（离开 CHAT 会释放网页，见 issue #14 修复）。

- 入口：`src/index.ts`（Host，Cordis 插件）、`src/client.ts`（Web Client）；`package.json` 的 `dsh.bundle.patch` / `dsh.client` 声明扩展点，`cordis.patch.yml` 是 Cordis layer。
- 产物：`lib/` 为**预编译分发**（含 `lib/types/`、`lib/build-manifest.json`），与源码一起提交。
- npm 公开版 **0.2.20**（latest/dist-tags、公开包字节与 integrity/shasum 已核对）；本机 desktop 装同一代码的候选 b117404ccfea（仅 README 版本行不同）；本机桌面版为 DSH **0.2.2-rc.1**。

## 当前状态（2026-11-09）
- 0.2.20 已公开发布 npm（latest/dist-tags=0.2.20）：CHAT 网页保留方式可在 Chat 设置配置（保留/延迟/立即，延迟 5–3600 秒），默认保留；设置卡与“切换按钮”同布局，`?` 点击展开、移出关闭；窄窗顶部行与分享尺寸已统一。正式包230230bytes/43文件，公开tarball逐字节一致、integrity/shasum匹配、中英README均0.2.20。本机desktop仍装同代码候选b117404ccfea（仅README版本行不同），未重启；代码经 PR #15 合并至 `main/919bb28`。

- 0.2.19 已于用户网页确认后公开发布：完整/install-v1 latest均0.2.19，公开tarball逐字节同正式包（222761bytes/41文件，SHA256=54a3005fe0fa64bb19ed39694b3d73b52c0d517ac98260a3953d431a72f0cfff），临时认证已logout/删除、PTY关闭。未重装/重启、未Git提交；README/发布记录仍为本地未提交改动，后续新修复0.2.20起。


- 当前源码候选0.2.19：按用户要求移除品牌切换器下保存服务错误/重试浮框，仅Chat设置保留；独立侧栏兼容警告不变。品牌/设置27项、UI72、sidebar48、窗口48、类型与分发通过；候选fa12b7ff7b94（41文件）现已按用户后续明确安装指令装入desktop，安装退出0、41/41同包、持久dependency/lock正确；未自动重启/发布/Git提交，待用户完整重开验收。先前卸载状态已由这次授权安装替代；未修热卸载生命周期。

- 0.2.18 已在用户网页确认后公开发布：完整/install-v1 latest均0.2.18，公开tarball与正式包逐字节一致（222875bytes/41文件，SHA256=451b5236d214583bc16a94d6083634c5f622892b16b0e72bbd83f405fea60626），临时认证已logout/删除、PTY关闭。发布时未重装/重启，后续新修复0.2.19起。PR #11现已合并至main/51a8f6a；用户要求将剩余5份发布文档独立创建变更请求，本轮分支docs-npm-release-0218，不重复提交功能或发布npm。以下“未发布”均是各候选当时状态，不代表当前。

- 最新安装候选为 `cb1983e76d01`（同轮0.2.18）：用户追加搜索/刷新圆角统一，原8px/6px改为一条主题sm规则；sidebar-rows新增动态token/更多xs保护验证共48项通过，UI72/类型/分发通过、41安装文件同包。未重启/npm/Git；下述listArea修复保留。
- 0.2.18 上一安装候选 `ca026f87cc45`：首候选被用户截图否定，生产实现与回归参考均漏掉原生 listArea（负边距抵消 root 右 inset）。已补齐自有 wrapper，回归按官方 root→listArea→treeBody→list 完整结构，新增滚动条边界/溢出/滚动检查，45项通过、首候选在正确基准下18项失败。更多按钮仅变色交互保留；41安装文件同包。首轮36项基准不完整，不能作为已对齐证据。未自动重启/npm/Git，仍同轮0.2.18，待用户完整重开复验；详见handoff顶部。
- PR #10 已合并，当前代码基线 `main/e073147`；下列为上一轮交付摘要。

- 0.2.12–0.2.17 已完成并发布：0.2.2 系列适配、外链改系统浏览器、Mermaid 导出附件保存、侧栏提示浮层、提示文案、切换器圆角与右对齐。
- 0.2.17 公开 tarball 已验证与正式包逐字节一致（历史发布证据）；当前本机已升级未发布的 0.2.18 候选。
- **Git**：0.2.12–0.2.17 经 PR #10 合并至 `main/e073147`；0.2.18 经 PR #11 合并至 `main/51a8f6a`；0.2.19 经 PR #13 合并至 `main/34d46bb`；0.2.20 经 PR #15 合并至 `main/919bb28`（功能提交 8c28429，PR 记录 d3c70f3）。
- 未实机验收：系统浏览器外开、Electron 原生“另存为”、真实账号流程、Windows 原生拖拽/圆角合成。详见 handoff。

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

- CHAT/HARNESS 可逆，共用同一个网页 guest 与 body portal；网页保留方式可配置（Chat 设置 → CHAT 网页）：保留（默认，秒切）、立即释放（DevTools 快捷键始终可用）、延迟释放（离开后按设定秒数释放，5–3600）。停用/未授权/账号变化仍释放或换租约。
- 官网登录与 DSH 账号独立：未登录也能进入 CHAT；登录记忆只保存官网授权的三个固定 key，经官方 credentials 按 profile 派生 key 保存；退出走 barrier，迟到保存/恢复不得复活旧会话。
- 语言、明暗主题与正文/输入字号跟随 DSH；不提供音色功能（已整体撤回，不要重新引入）。
- CHAT 不打开 HARNESS 右侧栏，也不改变其面板状态；侧栏品牌/新会话适配仅在严格识别时生效，未知结构不猜测。
- CHAT 中的外链交给**系统默认浏览器**（官方 `window.open(...)` 契约），失败只做非阻断提示，不写成网页加载错误。
- 附件保存只覆盖 **Mermaid 代码块**的 SVG/PNG/源码导出：仅在用户可信点击导出菜单后，于 guest 内有界读取该次下载，再经官方 `ctx.fileActions` 保存；其他下载仍受宿主策略限制（已知限制）。
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
node scripts/check-website-bootstrap.mjs --negative-control
node scripts/check-website-header.mjs --negative-control
node scripts/check-presentation-settings-browser.mjs
node scripts/check-title-stability-browser.mjs
node scripts/check-window-recognition-headless.mjs   # 5 组窗口/DPI；--quick 单组
git diff --check
```

> `tests/authorization.test.ts`、`tests/mode.test.ts` 断言的是更早行为契约（对应源码已改），不在门禁内；`pnpm test` 基线因视觉 SDK 依赖缺失不可用。不要把这两项当成当前回归通过或失败。
