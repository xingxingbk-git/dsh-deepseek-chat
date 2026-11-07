# 资料来源与取证

## 索引（2026-11-07）

- **项目文档**：[README](../README.md)、[需求](requirements.md)、[架构](architecture.md)、[路线](roadmap.md)、[交接](handoff.md)、[历史](handoff-archive.md)、[工作日志](worklog.md)。
- **官方 DSH 依据**：按精确版本从 npm registry / 本机 `app.asar` 只读提取；包与提取件放在 ignored `artifacts/`（`dsh-022-rc1-reference`、`dsh-022-rc1-npm-reference`、`dsh-021-rc3-reference`、`chat-links-022-*` 等），**不随仓库提交**。
- **官网公开资产**：仅在未登录状态下读取公开静态 bundle；不携带 Cookie、不请求账户接口，结论不覆盖服务端未公开能力。
- **npm 发布取证**：每次发布记录版本、tarball 字节与 SHA256、索引 latest 校验结果，见 [worklog](worklog.md) 对应阶段与 handoff 当前状态。

> 以下为按主题追加的取证记录（新在上）。


## 0.2.8 npm公开分发核验（2026-10-27）

- 用户当轮明确授权并完成官方登录/单次发布验证，npm唯一一次publish退出0。匿名[精确版本接口](https://registry.npmjs.org/dsh-deepseek-chat/0.2.8)HTTP200，完整及Accept=application/vnd.npm.install-v1+json的官方索引均latest0.2.8；公开下载35文件包逐字节同eb669d985d97正式包，SHA256=eb669d985d9707da607fb39ebb42d617d6bcfdd684da656ea7ae912290816c1b，SHA1与SHA512 integrity同时匹配，详见[公开核验摘要](../artifacts/npm-release-0.2.8-20261027/public-proof.json)。
- 正式包仅中英README不同于已安装5c56候选，其余33运行/元数据文件同字节；此次不是新增实机/浏览器验收，未Git同步或重装/重启。临时npm认证已logout/删除，原配置不改；下次修复须新版本和新的明确发布授权。

## 0.2.8 基线复查与重做依据（2026-10-27）

- 精确0.2.7正式包SHA23564ed32fef的Client逐字节同HEAD4f8a2b4；a715/7f68的旧拖窗模块及CSS相同。body Portal、settings隐藏flex、retained guest、Slot及核心Mode均基线已存在，不能独自解释新增回归；新增native区域/采样生命周期先隔离。旧338预留右界是至少、并非至多；旧fixture甚至把left>=362当通过，本轮已按真实短长title占位替换。
- 原生会话头的data-window-drag整行标记与交互控件no-drag仍是官方机制；普通/新会话确有titleCluster/controls分支，但静态源码不证明用户偶发现场的唯一根因。官方Darwin drag-recall基于data-window-drag矩形/数量签名变化短暂标记body，稳定后撤回；不能把observer或timer存在本身等同永久禁拖。
- 原生CSS亦让[tabindex]成为no-drag，但隔离Chrome实测基线webview已从body Portal继承no-drag，添加tabIndex前后computed app-region都相同，不能据此单独定责。重做恢复正常guest的基线焦点属性，错误状态用inert/禁鼠标保护，未改SDK或宿主DOM。
- 新实现仅通过已核公开Slot、AbortSignal、React Portal与自有bridge仅读几何；未调用猜测的Native IPC或真正UI Inspect。46项Node含实际client/ModeController及虚构remote契约，95项×5 Chrome156组合含真实WebSurface/WindowDragSurface+视觉SDK/Browser替身；均只到逻辑/CSS/DOM边界，不是Electron/OS或Win实机证据。原生未验项与候选见[handoff](handoff.md)。

## 0.2.8首轮拖窗及Issue #3依据历史（2026-10-26，10-27修正）

- 2026-10-27用户明确拒绝“失败显示官网原侧栏”，旧a715策略已撤回。新增/修正回归直接验证保留隐藏样式、已知CHAT布局可继续使用、未知布局遮蔽、草稿/路由不变、legacy showOriginal及SPA sign-in不露原侧栏；实际WebSurface组件+虚构Browser桥还验证错误卡片、禁用隐藏guest点击/Tab、相同lease重新识别及无reload/logout/mode切换。最终55项×5组合、14项Node契约通过；以下46/13是首候选历史，不代表现行策略。没有真实原生窗口/Win实机或实际账号操作。

- 同版本官方layout README第36–43行及sidebar Client第395–402行：data-window-drag标记行的实际盒子，Darwin由ui-web映射；leading/top clearance由官方投影。实际preload-app.cjs第50–69行提供data-platform/data-fullscreen，573–579行提供Win标题栏40px token；main.js第11935–11967行确认Mac hiddenInset交通灯与Win titleBarOverlay。
- 实核本机官方frontend assets/index-BNyAYEM7.css：Darwin的[data-window-drag]为drag、[data-window-drag-recall]为no-drag、body>:not(#root)为no-drag。仅给guest背后的root header加标记不可靠，故用自有前置小区域，不改原包。Browser公开桥只有acquire/release/onOpenRequested，没有假设window.startDrag。
- 用户提供的[Issue #3](https://github.com/xingxingbk-git/dsh-deepseek-chat/issues/3)报告已读。只读子代理对0.2.7做内存虚构DOM对照：缺sidebar约5秒后unsupported（不是报告所称永久loading）；缺profile60秒仍ready/unknown且镜像空；合法footer配main右侧越界2px也完全跳过profile检查。会话Map provider/三key形状和win32路径仅为虚构验证，未读实际vault或运行Windows。
- 新Chrome155 fixture为实际适配器/几何/刷新函数与Settings条件渲染，SDK按钮/图标为惰性stub；46项在1280×800的DPR1/1.25/1.5/2及760×600 DPR1通过。现行13项Node契约涵盖失效epoch/请求起点TTL/旧尺寸/不明身份及独立证明；旧shell34项回归通过。没有把同CSS viewport的DPR测试写成真实系统缩放或Electron原生命中验证。复现入口为pnpm check:window-contracts、pnpm check:window-recognition（打开打印URL）与pnpm check:shell-ui。

## 0.2.7 / DSH 0.2.1-rc.3 依据（2026-10-24）

### 续步：外侧间距与明确版本复核

- 官方WorkspaceBrowser同版`lib/client.js:2721`的root右padding/listArea负margin/list2px右margin共同决定外侧留白，list右padding为inset−5px−2px。新fixture使用这一真实布局链；旧样式0/2px对照失败，修后CHAT/HARNESS均2px、默认行尾均12px，34项通过。此前26项仅覆盖皮肤及图标，不能据其声称已覆盖间距。
- 本地semver检查已明确加入`0.2.1-rc.4`，共18版本×4字段：rc.1/rc.3/rc.4/0.2.1正式版均放行，0.2.2-rc.1拒绝。rc.1早于当前rc.3。
- 子代理匿名核对[官方npm元数据](https://registry.npmjs.org/@deepseek-ai%2Fdsh)：当时rc.1/rc.3存在，未查到rc.4版本/发布时间。因此rc.4只证明当前范围预留，不声称已取得rc.4接口或实机通过。
- rc.1静态核对使用官方tarball，如[app-boot](https://registry.npmjs.org/@deepseek-ai/dsh-app-boot/-/dsh-app-boot-0.2.1-rc.1.tgz)、[Browser](https://registry.npmjs.org/@deepseek-ai/dsh-client-ui-sidebar-browser/-/dsh-client-ui-sidebar-browser-0.2.1-rc.1.tgz)、[primitives](https://registry.npmjs.org/@deepseek-ai/dsh-client-ui-primitives/-/dsh-client-ui-primitives-0.2.1-rc.1.tgz)。15包仅在内存解压比较；Browser/layout/slots/credentials/Typert/gateway/renderer/settings/account/store/app-boot所比代码声明一致。primitives/sidebar整包有差异，但插件全部已用导出/props、brand/workspaces owner和模块表键在rc.1存在。未安装或运行rc.1，不能写成rc.1实机验收。

### 首候选依据

本轮没有live Cordis Inspect。先只读核对本机官方DSH0.2.1-rc.3分发源码，再安装npm已发布的同版本开发SDK作TypeScript与构建验证；两种证据不冒充真实账号运行。

- 官方 `@deepseek-ai/dsh-app-boot@0.2.1-rc.3/lib/index.js:251–325`：276–277为`includePrerelease:true`；280–297有engines时优先其单项准入，否则回退DSH peers。插件管理器同版本`lib/index.js:402–431,708–758`复用此评估；不必每次RC精确枚举，不使用豁免代替兼容。
- 官方 `@deepseek-ai/dsh-client-ui-theme@0.2.1-rc.3/lib/client.js:1421–1422` 的scrollbar.css：WebKit共享皮肤宽5px、圆角thumb与hover token，非WebKit才用标准thin。Workspace同版本`lib/client.js:2721`列表使用stable gutter；CHAT局部thin覆盖造成差异，本轮只撤掉覆盖。
- 官方 `@deepseek-ai/dsh-client-ui-settings-general@0.2.1-rc.3/lib/client.js:243–268,295–317`：未知设置id固定齿轮，button的直接子级为SVG和label span，无图标registrant参数。用户授权后才增加仅本插件行的可撤回外观适配；不修改上述官方文件。
- 子代理静态对照：rc.3与开工rc.2的credentials/typert-protocol、registry service、gateway client、ui-renderer、ui-settings所核对分发文件逐字节相同；layout/sidebar/browser整包有变化，但panelInfo/selectPanel、相关Slot owner、browser protocolVersion1/acquire/release/onOpenRequested、html.lang及已解析主题投影的所用契约保持。此有限核查不等于整包无变更或全功能实机通过。
- 主线程真实安装开发SDK0.2.1-rc.3后typecheck与production build/distribution成功。semver7.8.5开发检查用与官方相同的includePrerelease选项，17版本×4字段验证排除0.2.2所有预发；独立Chrome155虚构fixture26项验证滚动条主题/动态宽度、图标中英/唯一结构/动态双dialog降级恢复/清理，不加载真实DSH或官网。复现入口为`pnpm check:compatibility`与`pnpm check:shell-ui`（后者打开打印的本地URL），结果见handoff。

## 0.2.6语言依据（2026-10-22）

本轮账号卡加载反馈另核对本地官方SDK：IconLoadingOutlineRegular提供aria-hidden图标；纯状态div使用标准role=status/aria-busy，与原生Button无关。文字后置图标，旋转复用插件现有CSS，未增加运行时模块或live接口。

本机DSH 0.2.1-rc.2官方app.asar内 @deepseek-ai/dsh-client-locale/lib/client.js 的 syncDocumentLanguage（约1172行）、LocaleRuntime getSnapshot/subscribe 及 publish 的 locale/change（约1449行），证明 html.lang 为官方已解析语言投影。settings.section 原有契约也已核对；其slots.d.ts明确label由注册方本地化，并在语言变化时以同一id重注册；本轮按用户最新决定恢复插件UI翻译，沿用现有语言订阅更新标签。以上为官方分发源码和SDK静态核查，无live Inspect，不表示真实中英切换已经验收。插件读取标准投影，不新增locale依赖或调用未知API。

实际开发以 DeepSeek Harness 官方文档和目标安装版本为准。本文件区分项目创建阶段记录、2026-10-09 静态复核和用户确认的产品决策，不将不同设备/工具的证据混写成同一次 live 验证。

2026-10-11当前W025 / 0.1.9，基线f2c1277已由用户提交。新规则为独立官网授权，取消退出禁用与强制HARNESS；同guest、status/revision同步、可信Host profile目录派生key及旧记录精确迁移见architecture/requirements。仓库改名/origin更新、正常npm正式0.1.9/latest发布、最终候选构建/分发及fresh Git检查已完成。公开DSH pnpm11.7.0裸名空store安装12包、23文件与发布tgz一致及Host/lazy Client通过；本机CLI换为裸名^0.1.9、旧插件不存在且23文件一致。未重启/GUI验收，未运行本轮单元/浏览器/GUI回归，未stage/commit/push。详见[handoff](handoff.md)；以下旧包、旧源码与旧门槛证据仅对应历史版本，不替代官网登录/退出/重登/迁移/重启验收。

## 当前验证基线（2026-10-09）

本轮新增实现依据：用户要求实际官网数据，采用 Desktop Browser 嵌入候选路线，详情见 architecture/requirements。旧创建阶段摘要及历史模型 API 资料不构成独立本地聊天的数据源许可。

- 本次 macOS 安装包：DSH **0.2.0-rc.2**，Cordis **4.0.4**，浏览器共享 React **18.3.1**；UI renderer/layout/sidebar/conversation 包 **0.2.0-rc.2**。这是安装产物证据，不是对所有设备的版本承诺。
- 官方 tag：`dsh-v0.2.0-rc.2`；commit：`639ed015397290b3745d163aafe02ffee4aa3f84`。不同版本先重新核查契约。
- 官方入门、打包、Client Modules、Slots、Web Client、Sidebar/Layout/右栏正文已读取；初始环境曾只获得检索摘要，不再代表当前文档读取状态。
- 本次 Codex 工具中没有 Cordis Inspect；下面的 live 查询是项目创建阶段的记录。本次复核用官方固定版本源码及安装产物，未调用业务接口、未热加载插件。
- 当前产品规则（W025）由用户确认：CHAT独立官网授权；未登录可进入同一guest的明确登录入口，DSH/官网退出不禁用切换器、不强制HARNESS。真实网站仍决定聊天权限，不提供匿名/API替代聊天；规则本身不证明官方Chat OAuth或历史API已可用。

## DSH 官方插件开发文档

- [DeepSeek Harness 官网：Developer Preview / Everything is a plugin](https://www.deepseek.com/harness/en/) — 官方产品介绍，说明 DSH 基于 Cordis 插件体系。
- [Your first plugin](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/) — 官方插件入门；已读正文，插件导出 `apply(ctx: Context)`，教程通过 patch 加载。
- [Plugin configuration](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/config) — 官方 Config schema / 插件入口资料。
- [Package and install a plugin](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish) — 官方打包/安装教程；bundle 用 `dsh.bundle.patch` 指向 Cordis patch，涉及 Host 共享包时应按官方 peer/dev dependency 规范配置。
- [Cordis Tutorial](https://deepseek-harness.github.io/deepseek-harness/en/develop/cordis-tutorial/) — Cordis 插件生命周期、Service 与组合机制。

## DSH 官方 Web Client / Slots 文档

- [Web Client architecture](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/web-client) — 官方 Web Client 架构：client modules、API Gateway、Slots 等基础设施。
- [Client Modules](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/client-modules) — 官方说明 package 声明 `dsh.client`（`platform: 'web'`、可选 `inject`）并通过 `exports['./client']` 暴露 browser bundle；browser 模块表采用 lazy-CJS factory。
- [Web Client Slots](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/slots) — Slot 类型、注册、inject、生命周期与替换行为。
- [Right Sidebar](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/sidebar-right) — 右侧栏与 layout/slot 能力说明。
- [Cookbook: adding a package](https://deepseek-harness.github.io/deepseek-harness/en/reference/cookbook/adding-a-package) — 官方 workspace 包结构和约束；用于核对 Host/Client package 结构。
- [Cookbook: live configuration forms](https://deepseek-harness.github.io/deepseek-harness/en/reference/cookbook/adding-a-settings-card) — 官方 client bundle / client module 以及 package UI 示例。
- [DeepSeek AI 官方仓库：deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — 源码、package 和 bundle patch 可对照当前版本。

## 固定版本 UI 证据

- [0.2.0-rc.2 SidebarRoot](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar/src/client/SidebarRoot.tsx#L223) — 品牌有 `aria-hidden` 祖先；Web/Windows外层触发New Session；独立New Session按钮不在 `sidebar.workspaces` 内；折叠时品牌名不显示。该Slot仍仅作装饰，W013以自有锚点+独立shell.overlay实现视觉品牌位置；Mac实测不等于Web/Windows外层点击行为已验收。
- [0.2.0-rc.2 Sidebar 注册](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar/src/client/index.ts) — 品牌、workspace、footer 和 panel list 等槽的声明及生命周期参考。
- [0.2.0-rc.2 Layout 服务](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-layout/src/client/service.ts) — `panelInfo`、主面板导航及布局服务契约；恢复原 panel ID 与盲目返回默认 Conversation 不同。
- [Layout 包文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-layout/README.md) 与 [Sidebar 包文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-sidebar/README.md) — 了解当前设计；master 可能领先，涉及行为时用固定版本核查。
- [Client 构建 preset](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/tsdown.client.ts) 与 [Modules README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/modules/README.md) — lazy-CJS、共享模块身份、依赖图与 external 规则。当前构建仍须在匹配版本中实际验证。

安装产物静态复核还确认：自有 `main` panel 被选中时，内置右栏按 `activePanelId` 隐藏，并保留 Session 子树。优先验证这种导航行为，不能先用 `closeRightbar/openRightbar` 改写原呈现状态。标签/全屏/宽度恢复仍需真实往返测试。详见 [审查快照](review-2026-10-09.md) 与当前 [架构](architecture.md)。

## DeepSeek Chat / 开源边界

- [DeepSeek V3 官方模型仓库](https://github.com/deepseek-ai/DeepSeek-V3) — 开源模型相关代码；不能据此推断 chat.deepseek.com 前端、服务端、账号历史 API 开源或允许第三方调用。
- [DeepSeek API 官方文档](https://api-docs.deepseek.com/en/) — 公开 API 文档入口；API 对话不等于网页账号历史同步。
- [DeepSeek 官网](https://www.deepseek.com/) — 官方产品入口。
- [DeepSeek Chat](https://chat.deepseek.com/) — 历史未登录访问转到`/sign_in`，没有匿名聊天入口；网页聊天需要登录不等于插件模式必须禁用。W025已取消DSH门槛，未登录可进入官网正常登录；页面观察不等于第三方OAuth契约。
- [Responses API](https://api-docs.deepseek.com/api/create-response/) — 明确模型 API 无状态，历史由调用方提供；不能作为网页账号历史同步的证据。
- [DeepSeek 隐私政策](https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html) — 2026-02-10 版本的注册登录说明和用户手动导出历史路径；手动导入未验证，不能代替自动同步。

## 项目创建阶段的 Inspect 摘要（历史记录，待各设备重新查询）

原记录来自创建项目时的 DSH Web Client 连接，记载查询了 `Slots.listSubTree`、`Service.listService` 和 Host Config directory；本次 Codex 未重复查询，不将这些名称当作业务 API：

- `sidebar.brand.name`：品牌 mark 旁的单槽，当前 occupied，可通过插件贡献内容替换。
- `sidebar.workspaces`：Workspace Browser 区域单槽，拥有者属性含 `wide` 与 `expandSidebar`，替换风险为 `shadows-shipped-ui`。
- `main`：开放 key 的 keyed slot，当前已有 `conversation`、`plugins`；可注册自有 panel key。
- `sidebar.panellist`：按 id 对应 main panel 的 panel navigation list slot。
- Client `layout` Service 有 `selectPanel(panelId | null)`、`closeRightbar()`、`openRightbar(track, fullscreen)`。
- Host Service catalog 有 `deepseekAccount`、`authorization`、`credentials`；这不能证明网页对话历史开放。未发现可确认账号历史同步的依据。

该历史 Inspect 未返回运行时精确 DSH 版本。单槽存在不等于可交互，服务存在不等于网页历史接口开放；使用当前修订的架构和固定版本证据，不能直接照历史猜测实现。

## 后续必须补齐的官方证据

历史源码方案（2026-10-10安装问题复核）：当时仓库不含lib，[官方打包文档的 GitHub 构建脚本说明](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish#installing-from-github-the-build-script-catch)支持通过自包含prepare补入口，用户需为pnpm授予该Git包构建许可；预构建tarball不需安装时构建。本机Desktop profile当时缺Host/Client lib入口，不能以先前tarball成功推断Git安装可用。当前用户选择改为Git包含预构建lib，最新判断与待验范围见文末，此旧记录不构成必须长期使用prepare的要求。

1. 新设备重新核查官方credentials、Browser与Gateway契约；DSH公开profile仅用于旧插件grant精确迁移，不读取平台凭据或其他插件record，不重新引入模式门槛。
2. 确认设置和对话页共用guest、认证status/revision，官网登录/退出同步且迟到操作不能覆盖新状态；新建/快捷键另按其实际公开能力核查。
3. 用真实 DSH 加载插件，验证 panel 切换、原侧栏恢复、右栏恢复和插件禁用/卸载。
4. 网页历史读取/同步需要单独的官方第三方授权与 API 文档；目前未找到，继续标为待验证。

每项新增证据记录日期、实际版本、官方 URL/tag/commit 或 Inspect 的准确 Provider/Method、观察结果、限制及可复现步骤。不要依赖某台设备的本地安装路径或临时提取副本接力。

## 第三方资料（辅助，不作为规范）

- [dsh-plugin-dev-guide](https://github.com/anweat/dsh-plugin-dev-guide) — 第三方开发指南，自述基于官方文档整理。
- [dsh-plugin.org](https://dsh-plugin.org/tutorials/develop-plugin-guide) — 第三方教程。

第三方资料仅用于定位线索；遇到冲突以 DSH 官方文档、当前 package contracts 和 Inspect 结果为准。

## 历史固定公开契约证据（2026-10-09，DSH门槛由W025取消）

全部链接固定 commit `639ed015397290b3745d163aafe02ffee4aa3f84`，本轮无 live Inspect。对应源码路径和行号在 architecture 中列出；无需安装提取文件才能接力。

- [安全账号 getState/getProfile/watch](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account/src/index.ts)；[credential-stored 与资料类型](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account/src/types.ts)。ready 且 stable profile ID 才确认门槛；不读取凭据。
- [官方账号 Provider 的登出/拒绝/资料和 record key](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account-platform/src/index.ts)；[不含内容的 record-updated 事件](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/credentials/src/types.ts)。只观察固定 key，不调用 readRecord 或 secrets 方法。
- [公开 DesktopBrowserBridge types](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar-browser/src/types.ts)；[官方 preload Browser 桥](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/apps/desktop/src/preload-browser.ts)。只提供 acquire/release/approved popup，没有网页身份或登出通知。
- [主进程 Guest 安全与存储策略](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/apps/desktop/src/browser-guests.ts)；[官方 Browser bootstrap 属性](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar-browser/src/client/electron/ElectronWebviewPresentation.ts)。固定隔离，内存分区，无原生下载/设备权限许可。
- [main 只渲染当前键](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-layout/src/client/AppFrame.tsx)；[Slots 定义](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-layout/src/client/index.ts)。保活容器置于自己的 additive shell.overlay，以自己的 main ref 矩形定位。
- [官方 Typert Gateway 调用/严格验证/取消](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/api/gateway/README.md)。本仓库 server.test 使用实际目标 Cordis/Typert/Gateway 在无网络的假账号服务上验证绑定，不冒充真实账号测试。
- 2026-10-10授权pending核查：上述Gateway文档明确每个namespace是独立`remote.<namespace>`服务；Cordis4.0.4发布包`lib/types/registry.d.ts`的`Context.inject`定义说明按服务可用性加载/卸载回调。实际插件Context复现缺`remote.dshChat`注入错误，root Context调用不触发此限制；生产Client回归已纳入server.test，没有live Inspect或凭据读取。
- 本机 app.asar 只读元数据/公开 bundled main/preload 核对确实为 rc.2，存在上述 Browser 桥；没有修改安装包或读取用户会话。
- 官网公开无凭据 HTTP HEAD 返回 429，浏览器抓取也受限。这不是 iframe CSP/XFO 的可靠证据，不能声称 Web iframe 可用；Desktop 路线依赖其公开顶层 guest，实际官网登录及聊天仍待实测。

## W013品牌入口证据（2026-10-10）

固定commit仍为 `639ed015397290b3745d163aafe02ffee4aa3f84`，无live Inspect。上述SidebarRoot及Sidebar注册源码、[固定Slots owner类型](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-slots/src/index.ts)证实品牌name允许自有宽度、祖先隐藏与24px裁剪，shell.overlay为独立交互扩展层；公开ui-sidebar/client不导出SidebarRoot。

`@deepseek-ai/dsh-client-ui-primitives@0.2.0-rc.2`发布包的BrandWordmark本身含DeepSeek文字和HARNESS徽标，includeMark=false只去掉鱼图。插件仅在自己渲染的SVG外套视口裁掉徽标，不选择/修改内置SVG。预览从已安装发布包取未改的FishLogo/BrandWordmark片段，不依赖临时提取副本。

Mac真实DSH的AX/截图确认顶部按钮可达、鼠标及Shift-Tab/Enter可切换，折叠隐藏展开恢复，禁用恢复原徽标；官网页面在既有网页登录状态下显示历史导航，没有记录历史标题/URL或发送消息。其他平台、完整右栏矩阵与两端历史一致性仍待验收，见handoff/worklog。本轮web工具读取固定GitHub页面遇Cache miss；契约核查使用已取得的固定源码与发布包，不将抓取失败写成新成功证据。

## W015共用侧栏与有限官网适配证据（2026-10-10）

- [固定Sidebar Slot契约](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar/src/client/contract/slots.ts)：sidebar.workspaces拥有整块浏览区域，owner仅wide/expandSidebar；顶部New Session回调属于SidebarRoot私有注入，settings为独立foot。发布包类型与固定SidebarRoot源码再次核对，无live Inspect。
- [固定Workspace导航实现](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-workspace/src/client/navigation.ts)：startSession直接选择/建立Harness会话，无公开模式替换或veto回调；本轮没有猴子补丁或修改该服务。
- [Electron公开webview.executeJavaScript](https://www.electronjs.org/docs/latest/api/webview-tag#webviewexecutejavascriptcode-usergesture)：仅用于插件自己的批准guest中执行用户已允许的DOM界面适配。文档为当前公开API，目标rc.2实际方法可用性另由本机列表/新建/选中实测确认，不能写成DSH提供了历史API。
- 本轮成功重读官方Slots文档及上述固定navigation/index源码；官网实际可访问导航链接结构由本机页面观察确认。只保存技术证据和结果摘要，不将个人历史标题/链接或正文写入仓库文档。

## W016侧栏与共用登录核查（2026-10-10）

- [rc.2 SidebarRoot](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar/src/client/SidebarRoot.tsx)及[原生样式](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar/src/client/SidebarRoot.module.css)：新会话/全局面板外层由shell控制，品牌identity/name为收缩inline-flex。本轮读固定源码与发布类型；无live Inspect。用户明确批准有限DSH侧栏适配，不把临时属性/capture事件称为官方扩展回调。
- [rc.2 DeepSeekAccount](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account/src/index.ts)及[Platform实现](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account-platform/src/index.ts)：默认Platform为platform.deepseek.com，inference为api.deepseek.com，Host-only PlatformSession不是Chat网页登录SSO。
- [rc.2 Browser guests](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/apps/desktop/src/browser-guests.ts)：acquire生成不带persist前缀的进程内隔离partition，不共享系统浏览器或DSH账号会话。结合公开Account/Browser面，在本版本未发现Chat免登录桥；结论仅限已核查公开能力，不宣称服务方永远不支持。
- 当前官方Slots文档成功浏览；web工具对两处raw URL返回Internal Error后，使用HTTPS下载固定公开源码核查，不读取本机凭据或改部署。截图/AX显示DSH已授权但官网处于sign_in；不将上轮曾登录状态写成当前状态。

## W017原生设置与窗口布局核查（2026-10-10）

- [官方Settings说明](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/settings)、[添加设置卡片](https://deepseek-harness.github.io/deepseek-harness/en/reference/cookbook/adding-a-settings-card)及[Slots契约](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/slots)：本轮已浏览，设置导航通过settings.section组成；具体owner以目标版本类型为准。
- [固定ui-settings Slots](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-settings/src/contract/slots.ts)：settings.section根list，owner只有close，id/order/label形成原生设置导航。开发依赖/manifest按rc.2锁定，无live Inspect。
- [固定AppFrame](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-layout/src/client/AppFrame.tsx)及同目录AppFrame.module.css：Mac折叠shell.leading挂载与官方frame-top-clearance、窗口坐标/z层次。本插件扣除公开顶部留白，避免guest遮住窗口控件。
- [固定HeaderLeadingControls](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar/src/client/HeaderLeadingControls.tsx)及同目录样式：公开图标/Tooltip、28px按钮/8px间距。CHAT替换该Slot的动作语义，HARNESS撤回；不复制私有feature组件。
- 官网实际公开界面显示ds-button/ds-select、中文“系统设置”及“通用设置”，本机公开UI确认语言简体中文/主题深色。只记结构和验证结果，不保存个人标题/正文/凭据。直接公共GET为429，不用于判断guest布局；所有实机结论来自DSH实际guest。

## W018名称与管理图标核查（2026-10-10）

- [固定rc.2 Plugin display metadata](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/docs/cookbook/adding-a-package.md#plugin-display-metadata)及[固定app-boot元数据说明](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/boot/app-boot/README.md#reading-plugin-display-metadata)：已读取正文，package.json需通过exports可见，icon为相对文件路径且包含在files中；支持自包含SVG、不超过256 KiB。manifest图标适配管理列表，不替换产品品牌。官方master另有./icon支持，本项目只使用rc.2已确认的顶层icon。
- 新SSH地址git@github.com:xingxingbk-git/dsh-chat.git已通过git ls-remote读取HEAD=39cce8b7134937a58174037f38f20d0402f9db4a；仅证明地址可访问，不宣称本轮源码已推送。gh未登录，不要求用户另行授权，使用现有SSH完成只读验证。

## W019配置与重启调查（2026-10-10）

- 再读[官方live configuration forms](https://deepseek-harness.github.io/deepseek-harness/en/reference/cookbook/adding-a-settings-card)：Config volatile、唯一entry id、ConfigEditor写回、重启和实例身份验收。页面为当前文档；本轮实现以rc.2发布包为准。
- [rc.2 settings provider](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/settings/src/index.ts)、[rc.2 ui-settings Host owner](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-settings/src/index.ts)及对应已安装类型：volatile fields由settings.describe投影，ConfigEditor/profile patch保存，auto:false提供自定义页。没有live Inspect。
- [rc.2 Browser guests](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/apps/desktop/src/browser-guests.ts)和当前master同文件再次检查：随机内存partition、lease匹配检查；公开types没有persist参数。GitHub web抓取有Cache miss，结论来自已读取固定公开源码/本机发布产物，不把失败抓取说成成功。主进程持久化提案为本地设计文档，未向上游发消息。
- 原生Modal层级以@deepseek-ai/dsh-client-ui-primitives@0.2.0-rc.2发布包Modal.module.css确认1000，react-dom是官方共享模块。网页实际设置的四类、账号公开资料、Voice、训练开关、共享/导出/删除和条款/隐私入口均通过现有登录态只读观察；没有执行账号解绑/删除、数据导出/删除、隐私修改或发送消息。新版完整操作仍待验收。

- W019最新范围已取消四Tab/Voice。上述官网完整设置观察仅是历史证据；当前只实现账号昵称、当前会话退出和语言。实机定位器回归已对照仓库HEAD旧版适配，官网语言读取与配置落盘分别核查；所有结论以handoff最新分层为准。


## W021持久会话再次核查（2026-10-10）

- [最新固定官方Browser限制](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/client/ui-sidebar-browser/README.md#known-limitations-and-deferred-work)：Cookie与网页存储不跨应用重启。GitHub网页抓取Cache miss；只读代理通过原始公开源码及GitHub API核对固定SHA，未将失败网页抓取写成成功。
- [同SHA browser-guests.ts](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/apps/desktop/src/browser-guests.ts)：随机内存partition与强制lease匹配。本机DSH0.2.0-rc.2发布产物主进程同实现；稳定workspace键只保证进程内隔离/复用。
- Playwright独立浏览器可以打开官网公开登录页面；未输入凭据或登录，不能据此判断官网已登录聊天顶栏。布局适配依据用户截图和现有公开标题/分享节点；当前DSH查看结果见handoff。


## W023登录研究来源（2026-10-10）

- [官方Platform账户服务](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/credentials/deepseek-account-platform/src/index.ts#L359)：getPlatformSession/resolveToken的来源约束；[Platform预加载桥](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/apps/desktop/src/preload-platform-account.ts#L5)：仅同issuer主frame。
- 无登录公共脚本：Chat main.8d6a4f4bfa.js SHA256 f0953f4d9054db295b269914bf3e39fdb2d82d70639356ff52e282bb8c9d1a9f；default-vendors.df13be609e.js 7af105d175559a592678d8d51e9ab4d3a8744e7709412e37d80c66037462a3ea；Platform main.1c97ecbfe0.js 736ed7b9d461bce6feabce707ab5e25cb911d5dd981e152c66c2021dda7a51b3；9500.e576e9b5c1.js b3ff14264db995ccbbe2d0ee7d6629a15d73feec64d9509a6fd25442e68da33a。资源位于官方fe-static.deepseek.com/chat/static或platform/static；只分析公开启动/授权逻辑，不带Cookie，不请求账户接口。结论不覆盖全部动态块和服务端未公开能力。
- [Electron Session partition](https://www.electronjs.org/docs/latest/api/session#sessionfrompartitionpartition-options)：persist前缀与内存分区的区别。


## W023续步：插件自己的官网grant（2026-10-11）

以下是公开源码的静态证据。它们证明凭据存储API和当前官网bootstrap形态；真实保存与跨退出恢复的独立证据见下方W024实机记录，不能将静态源码本身当作实机验证。最终安装结果以handoff最新分层为准。

- 官方固定master `d743267388641bc76f17c45ce8b4c231aed1d32c`：[Credentials API](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/credentials/credentials/src/index.ts)、[record与grant类型](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/credentials/credentials/src/types.ts)、[credentials-local Provider](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/credentials/credentials-local/README.md)。Host可readRecord/modifyRecord/deleteRecord；默认本地文件mode0600，不作Keychain/加密承诺。目标rc.2使用匹配发布包，不把master当已安装升级。
- [官方Authorization flow](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/credentials/authorization/README.md)支持插件自己的授权流程和提交record，但不自带Chat授权协议，也不提供DSH到CHAT兑换。
- 对照：[dsh-codex-subscription v2.3.0 / DshOAuthAccountVault](https://github.com/WSL043/dsh-codex-subscription/blob/a3e1fc1f771b31348d8966439b4379c5e52f0a53/lib/index.js#L2119)，tag commit `a3e1fc1f771b31348d8966439b4379c5e52f0a53`；本机包源码Git blob一致为`f54777f26bb43316e16cb361832de6c820b94dcb`。静态read/modify/delete自己的grant、OAuth登录与刷新路径均可见；它保存access/refresh等授权，直接走provider请求，不内嵌ChatGPT官网。不读取其实际credentials记录，不能以它证明Chat网页恢复必定成功。
- 官网公开资产：[main.8d6a4f4bfa.js](https://fe-static.deepseek.com/chat/static/main.8d6a4f4bfa.js)，SHA256 `f0953f4d9054db295b269914bf3e39fdb2d82d70639356ff52e282bb8c9d1a9f`；[default-vendors.df13be609e.js](https://fe-static.deepseek.com/chat/static/default-vendors.df13be609e.js)，SHA256 `7af105d175559a592678d8d51e9ab4d3a8744e7709412e37d80c66037462a3ea`。无登录重新下载哈希一致；首页429/403，未确认当前首页仍引用这两个资源。静态AppKit使用userToken和__appKit_userInfo的id；StorageHandle wrapper为{value,__version:'0'}；设备key为deepseek-device-id:chat的raw UUID。
- 同bundle的bootstrap有token时由官网自身current-user验证；没有看到refresh-token路线。客户端请求可能仍携带服务端Cookie/风控状态，不能因静态最小字段成立保证全认证策略兼容。IDB包含MFA不可导出密钥和聊天缓存，新候选不读取这些数据。
- 本项目候选对应src/website-session.ts、website-session-store.ts、protocol.ts、server.ts、client.ts、web-surface.tsx：固定origin与三key、官方自有grant、strict内部RPC、可信账号/epoch栅栏、一次恢复reload与失效正常登录。属于实现与静态依据；W024同账号三次完整退出重开已有独立实机证据，不由这些源码证明。
- 此前Browser无persist的观察只针对完整Session；不能推导插件无法记住自己的授权。[宿主源码草案](proposals/persistent-browser/DESIGN.md)仍未编译/部署/重启验证，是可选备用，不是当前实现前置条件。


## W024登录恢复与标题复查实机证据（2026-10-11）

- 目标为用户本机DSH 0.2.0-rc.2、插件0.1.8。用户本人在官网正常登录后，CHAT设置显示固定“已记住网页登录”。前两次正常quit均按进程名确认相关进程全部退出，再重开；均无需再次登录或验证码，官网验证后恢复同一公开账号及简体中文。第2次官网出现“使用环境异常”说明，仅正常点击X关闭后读回已登录；插件未自动关闭或掩盖该提示。
- 登录保存截图 `/private/tmp/dsh-chat-auth-saved-before-restart-018.png`；两轮恢复截图 `/private/tmp/dsh-chat-full-restart-1-ready-018.png`、`/private/tmp/dsh-chat-full-restart-2-after-notice-018.png`。第1次最初空白，等待官网验证后才读回成功。截图仅作本机验收证据，不提交Git，不读取或输出实际授权payload。
- 仅选择已加载导航中用户指定的置顶对话、确认恢复原标题；证据 `/private/tmp/dsh-chat-restored-known-conversation-018.png`。展开/折叠展示与编辑位置证据 `/private/tmp/dsh-chat-title-restored-display-018.png`、`/private/tmp/dsh-chat-title-restored-edit-018.png`、`/private/tmp/dsh-chat-title-restored-collapsed-display-018.png`、`/private/tmp/dsh-chat-title-restored-collapsed-edit-018.png`。没有输入、发送或重命名，不保存个人正文/历史到仓库，不据此证明另一浏览器消息一致性。
- 最新两文件修正为 `src/website-navigation.ts` 设置同步错误时解除无限paint gate并保留错误/重试、不伪造暗色；`src/web-surface.tsx` 恢复验证及登录加载时保留原生连接/重试入口。该13b2/b4阶段源码没有官网提示关闭逻辑，属于旧范围；最新用户授权的固定说明适配见文末。13b2包已完成第三次认证/中文恢复与启动反馈复验，但用户随后实报主区闪烁，显示稳定性未通过；当前b4修正版有限结果见下节。设置同步真实错误/主题超时分支仅有源码与生产构建证据，未故障注入实测。过期、实际退出清除、换账号与卸载仍待独立验收。

- 历史13b2包（认证/中文通过、后续显示失败） `artifacts/dsh-chat-0.1.8-13b2b6bdb426.tgz`，21文件，SHA256 `13b2b6bdb426d214befdc7c87a8e5dd80101416a85d6d53e076324780718a372`；官方desktop CLI exit0、+1/-2、pnpm11.7.0，generic peer warning保留。安装manifest/Host/Client/icon与本地逐字节一致；Host仍为 `1d65da67fefe7377e960e4bb84396485af5ddf2bca6f728a324309942bba12d8`，Client SHA256 `43775fdfcd83a5cb64a43a9f953e4c7774a3f46b6a53727d3fc6a68e3bf10661`。
- 第3次正常quit确认相关进程全部退出后重开，main显示打开官网、原生CHAT设置显示“正在连接…”和重试；截图 `/private/tmp/dsh-chat-final-package-startup-018.png`、`/private/tmp/dsh-chat-final-package-restored-018.png`。关闭设置使官网前台完成验证后，未输入登录信息/验证码，也未再次关闭官网说明弹窗，读回原账号已登录、已记住网页登录和简体中文，证据 `/private/tmp/dsh-chat-final-package-confirmed-018.png`；置顶导航恢复证据 `/private/tmp/dsh-chat-final-package-nav-ready-018.png`。至此连续3次完整重启恢复通过，最后一次运行最终加载反馈代码；这不证明官网不会再显示环境提示或所有流程已验收。
- 本次第三轮验收的文档更新晚于上述artifact。包内README记录打包时的两次通过，仍为有效阶段证据；代码与当前安装一致，不因验收文档增加重打包或安装。


## W024闪烁修正版b4与受限观察证据（2026-10-11）

- 闪烁修正区分新主文档与后台/子frame/SPA加载，Client仅明确新文档/sign-in复位偏好；网站presented标记避免后续偏好重遮，opening/verify阶段等待公开值。导航暂缺5秒回退后置同文档fallback，阻止后续轮询重新gate/compact。layout_fix只读复核该循环及登录页/新文档/原官网/固定错误可达；静态结论不代替实机。
- 中间e948b579e901包仅生产构建和安装，未重启激活即由b4替代；此前13b2的前三次认证/中文恢复证据仍有效，显示稳定性未通过。当前包 `artifacts/dsh-chat-0.1.8-b4bb28dde279.tgz`，21文件，SHA256 `b4bb28dde2791acc7ae1ca0365eb5d78e0df945f9d91983c6f9f60626fe482f5`。生产构建与官方CLI exit0通过；安装manifest/Host/Client/icon均与本地逐字节匹配。Client SHA256 `bb35347ab644cf8c5b7a1f75d74d764bd5290b88c5ed77cac36f5c39039fabcd`，Host仍为 `1d65da67fefe7377e960e4bb84396485af5ddf2bca6f728a324309942bba12d8`，manifest/icon沿用原版本。
- 正常quit后ps确认相关进程全无，再重开，指定置顶和标题恢复。首段20次、设置关闭后10次受限像素采样，各段内标题/置顶区域分别保持一致、未见消失；末样本直接看图文字正常。合并后每区域共30次有2个像素状态，不声称跨阶段所有像素相同。证据目录 `/private/tmp/dsh-chat-flashfix-observe-018`、`/private/tmp/dsh-chat-flashfix-final-observe-018`。不读取正文或实际授权payload；这些短时采样不证明长时或所有官网状态绝无闪烁。
- 公开顶行/指定导航、展开/折叠展示与编辑、模式往返和账号语言证据分别为 `/private/tmp/dsh-chat-flashfix-start-pin-018.png`、`/private/tmp/dsh-chat-flashfix-title-display-018.png`、`/private/tmp/dsh-chat-flashfix-title-edit-018.png`、`/private/tmp/dsh-chat-flashfix-collapsed-display-018.png`、`/private/tmp/dsh-chat-flashfix-collapsed-edit-018.png`、`/private/tmp/dsh-chat-flashfix-roundtrip-title-018.png`、`/private/tmp/dsh-chat-flashfix-account-language-018.png`。root确认圆角编辑框文字不移位，原生设置读回同账号已登录/已记住网页登录/简体中文，无重新登录。AX标志直接读回false/false，停在展开CHAT指定原对话。截图仅本机证据，不提交Git；真正错误/主题超时、过期、退出清除、换账号、卸载及消息跨浏览器一致性仍待验。


## W024固定环境说明来源与f3验收（2026-10-11）

- 本轮依据此前缓存的官方公共 `main.8d6a4f4bfa.js`，不是fresh下载：公共网页今日403/不可访问。缓存中Electron/Tauri环境触发固定说明，官网自身onClose记录closeUnsafeEnvWarn关闭偏好；DSH内存Browser分区不保留该偏好，解释重开后再次出现。插件不直接读取/写入此key，不扩展登录storage白名单或修改UA/检测。
- 用户最新要求取代旧“不自动关闭”。`src/website-notice.ts` 精确匹配真实dialog中英文标题和完整固定正文、排除表单/输入/iframe，只点自身唯一可见启用X并先标记同元素；navigation确认origin后、restore外调用并序列化。header_interaction_review静态审查通过，仅处理此固定说明，不处理其他安全/验证码/认证错误。
- 最终包 `artifacts/dsh-chat-0.1.8-f3fb874f2ae4.tgz`，22文件，SHA256 `f3fb874f2ae455f74287e6aecd992ba923d590c2463e348e1cbf6b8f6af50a98`。生产构建和CLI exit0；安装Host/Client/manifest/icon四文件逐字节MATCH。Client SHA256 `31961eb7e580dc448804976e820166a717ffb2cefc742047a861ec294478bde8`，其余三项同b4。
- 连续两次正常quit、ps确认相关进程全无后重开，未手动点X，原提示区域无dialog，官网主页/公共模型提示与指定置顶恢复。证据 `/private/tmp/dsh-chat-env-notice-before-018.png`、`/private/tmp/dsh-chat-env-notice-after-restart-1-018.png`、`/private/tmp/dsh-chat-env-pin-restart-1-018.png`、`/private/tmp/dsh-chat-env-notice-after-restart-2-018.png`、`/private/tmp/dsh-chat-env-pin-restart-2-018.png`；仅确认固定说明两次收起，不泛化其他网页状态。第二次原生CHAT设置读回原账号已登录、已记住网页登录与简体中文，证据 `/private/tmp/dsh-chat-env-account-language-018.png`；关闭设置后原对话标题正常，证据 `/private/tmp/dsh-chat-env-final-title-018.png`。AX实读false/false，停在展开CHAT原对话，无手动点环境提示X、输入、发送或重命名。

## 历史：W024仓库地址直装来源、本地实测与当时公网边界（2026-10-11）

- [pnpm11.7.0 prepare-package固定源码](https://github.com/pnpm/pnpm/blob/v11.7.0/exec/prepare-package/src/index.ts#L82)：packageShouldBeBuilt在非空prepare存在时直接要求构建；否则只有prepublish/prepack/publish存在且main文件不存在才要求构建。allowBuild拒绝点在同文件L37–46。本机DSH实际pnpm11.7.0发布bundle的preparePackage/packageShouldBeBuilt与该固定源码一致；静态依据与下方本地安装实测分别记录。
- 本机bundle的Git fetcher和GitHub archive fetcher都先调用preparePackage再packlist。即使移除prepare，若保留prepack且Git包中main缺失，仍会触发构建许可；即使main存在，pnpm也不验证Client/其他声明入口。因此新方案须跟踪完整lib，并由发布检查核对files、manifest和源码产物对照清单。
- [npm官方Git依赖说明](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#git-urls-as-dependencies)：workspaces或build/prepare/prepack/preinstall/install/postinstall会使Git依赖走安装开发依赖和构建路径；预构建仓库应避免这些脚本键。当前计划改用普通手动build:plugin/release:prepare/package:plugin，而不是把pnpm对main存在的条件推广到其他安装器。
- 用户选择仅仓库地址分发，包名继续dsh-chat，本轮仍0.1.8。root已完成`node scripts/build.mjs`与`node scripts/check-distribution.mjs`，新版check-git-install用DSH pnpm11.7.0独立临时Git source/consumer和全新store，正常安装git+file固定提交；无allowBuilds/ignore-scripts，12个包安装成功，19个lib及README/patch/icon一致，Host import和lazy Client artifact契约通过，fixture finally清理。旧source-only+prepare许可验收仅保留为历史。
- 正常pnpm package:plugin已exit0，release:prepare/check-distribution通过，当前唯一包636e1212353e，23文件、130375bytes，完整SHA256见handoff。Git检查补齐verifyDistributionManifest源码哈希验证和workspaces/postpack防护后，fresh pnpm11.7.0再次通过；两个检查拒绝旧源码/prepare hook，缺失Client亦被拒绝，临时副本清理完成。运行Host/Client与此前cd07哈希完全相同，本轮未重跑界面/登录验收。
- 此次为本地Git fixture与正常打包证据，未执行推送后公网GitHub URL安装，不能据此宣布当前公开默认分支已更新或URL已完成直装。
- 公开远端01e当前仍是旧prepare源码方案，用户自行审查、提交/推送本轮文件；未自动stage/commit/push。Git包含lib和新脚本须在实际公开提交核实，URL完成声明还需对应远端安装证据。本地候选、tarball或fixture成功均不自动代表当前默认分支已更新。

## W025：独立官网授权、外部浏览器边界与npm名称发布（2026-10-11）

- [固定官方Credentials类型](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/credentials/src/types.ts)与[本地Provider](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/credentials-local/README.md)支撑插件自己的grant。[Provider固定实现](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/credentials-local/src/index.ts#L81)默认全局`$DSH_HOME/.credentials.yaml`，不能假设天然profile隔离。Host改用可信profile目录派生`dsh-deepseek-chat/website-<profile目录SHA256>`；旧dsh-chat/website-<DSH账号SHA256>仅使用官方公开稳定id精确迁移，Client不能传任意dir或record key。API支持不等于本轮退出/重登同步已实机验收。
- [固定app-boot ProfileContext](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/boot/app-boot/src/profile-context.ts#L15)公开声明启动器提供的name、dir、home等事实，[入口导出](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/boot/app-boot/src/index.ts#L20)及[官方shell-env调用](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/shell/shell-env/src/index.ts#L164)确认可用`ctx.get('profileContext')`。本插件Host验证绝对dir后派生scope，Client仅取得哈希；缺少可信profileContext不回退共享固定键或DSH账号键。
- [rc.2 DesktopBrowserBridge](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/client/ui-sidebar-browser/src/types.ts)仅公开acquire/release/onOpenRequested，无外部系统浏览器会话导入。固定[desktop main](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/apps/desktop/src/main.ts#L1228)只处理dsh://open唤回窗口；正常HTTP(S)外链打开能力不是Chat授权回调。
- [官方Platform Provider文档](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account-platform/README.md)及[固定实现](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/credentials/deepseek-account-platform/src/index.ts#L53)：默认platform.deepseek.com，PKCE /oauth/callback与auth_init/auth_exchange只面向Platform，固定/dsh/authorize和/dsh/authorized；不能冒称可兑换chat.deepseek.com网页登录。此次官方资料搜索未找到Chat第三方client_id/scope/redirect_uri/授权码交换契约，结论只限公开核查，不断言服务方永远没有能力。
- [GitHub官方仓库改名说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)与[gh repo rename](https://cli.github.com/manual/gh_repo_rename)明确admin可改名、旧Git地址重定向并建议更新origin。本轮正常gh核查原仓库为ADMIN；实际改名后读回xingxingbk-git/dsh-deepseek-chat及新URL，origin已更新。仅改名，不代表本轮0.1.9代码已提交/推送。
- npm公开registry最初对dsh-deepseek-chat返回HTTP404，表示当时未占用。最初npm whoami返回ENEEDAUTH；用户通过官方网页登录后，root确认认证为xingxingbk。首次正常publish被E403拒绝，提示需要2FA；用户正常配置并完成验证后正式publish exit0，公开名称、0.1.9版本和latest均已确认。[npm网页登录](https://docs.npmjs.com/accessing-npm-using-2fa/)、[2FA发布要求](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/)与[官方发布说明](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/)是依据。不读取或输出npmrc/token，不创建bypass token；短暂0.0.0-stage处理占位已完成，不作为额外正式版本验收。
- [DSH官方包安装](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)支持npm预编译包按名称安装。因此用户口语“发布到npx”的目标按npm名称入口实现，正式包dsh-deepseek-chat@0.1.9已公开，不需要新增独立CLI。最终package:plugin的生产构建/类型/产物/分发检查通过；23files/133326bytes，SHA256为`e82535818456c7b569580c13f555442bd9396d0b1d0f74829ecce9ff606ab710`。最新fresh DSH pnpm11.7 Git fixture安装12包、逐字节/Host import/lazy Client通过，无allowBuilds或ignore-scripts。
- 公开npm安装证据：DSH pnpm11.7.0空consumer/空store add裸名安装12包，解析0.1.9；23文件与正式发布tgz逐字节一致，Host import/lazy Client通过，fixture清理完成。首次fixture对源码package.json的bytes断言差异来自pnpm pack规范化排版/packageManager剔除，改对正式tgz后23/23通过，不是安装故障。本机官方CLI已移除旧dsh-chat与本地tgz后add裸名exit0，desktop依赖^0.1.9、oldInstalled=false，23文件一致。默认pnpm自动增加该版本minimumReleaseAgeExclude，无人为allowBuilds/ignore-scripts/bypass。尚未重启/GUI验收，未运行本轮单元/浏览器回归；完整证据见[handoff](handoff.md)。

## 2026-10-17 / DSH 0.2.1-rc.1 本机契约依据

Info.plist与app.asar内dsh/package.json均为0.2.1-rc.1，runtime/versions.json为Node24.21.0/pnpm11.28.5；Cordis4.0.5、Schemastery3.18.5。官方安装产物dsh-app-boot/lib/index.js的evaluatePluginCompatibility/unmetRequirements明确engines.dsh优先，否则逐个DSH peer检查（includePrerelease=true），不是插件网页加载失败。新版公开SDK所有直接DSH devDependencies已升级并生产编译。sidebar品牌平台分支、slots注册、layout、configForms与browser bridge按发布包公开接口核查；不能把类型编译等同于真实网页操作通过。官方开发入口仍见本文Package and install a plugin链接；本轮无可用live Cordis Inspect。

## 2026-10-17 / DSH 0.2.1-rc.2 官方安装产物

本机Info.plist与app.asar/dsh/package.json为0.2.1-rc.2，sidebar构建332895e；Cordis4.0.5/Schemastery3.18.5，Node24.21.0/pnpm11.28.5。与之前0.2.1-rc.1安装产物逐文件对比：ui-layout、ui-settings、ui-renderer、ui-sidebar-browser的lib/client.js相同；credentials/lib/index.js相同；sidebar/lib/client.js只localBuildVersion由rc.1-ed75efe改为rc.2-332895e。app-boot的engines.dsh优先和includePrerelease规则仍在。本次SDK0.2.1-rc.2生产编译通过；上述是限定接口证据，不代表所有跨平台/网页功能已实测。

## 2026-10-17 / 宿主主题投影契约

官方DSH0.2.1-rc.2的ui-layout/lib/client.js ThemePresenter.apply(snapshot)将snapshot.active.colorScheme写入document.documentElement.style.colorScheme，并按dark切换body的data-ds-dark-theme属性；ui-theme ThemeRuntime.buildSnapshot把system偏好和prefers-color-scheme解析为active.colorScheme，再发theme/change。插件只读取这些限定公开DOM字段，不借用主题内部store，不调用猜测服务。官网侧继续现有公开Settings/General/Theme行按钮及可见选中状态，读取结果后确认目标主题；没有新增官网网络API或storage访问。

## 2026-10-18 / 当前官网两套复制实现

正常匿名首页浏览HTTP200，script src确认main.a0ce88b684.js；fresh公共脚本中copyBotResponse调用aY（writeText失败后execCommand后备），copyShareLinkError对应m仅writeText及warning。DSH0.2.1-rc.2 guest权限拒绝代码仍在。已以当前原函数/相同虚构URL/独立浏览器原生denied对照，未把返回true当作OS文本已核对。资源hash、位置、复现范围及拟修方案见[分享复制调查](share-copy-investigation.md)。

## DSH 0.2.2-rc.1 适配依据（2026-11-07）

- 版本证据：本机 `Info.plist`、ASAR 根 `package.json` 与 `dsh/package.json` 三处均为 0.2.2-rc.1；官方 npm 的 DSH `latest`/`next` 及开发包 `next` 同为该版，0.2.1 线仍为已发布旧版。
- 只读参考：用 ASAR 头部解析（非目录访问）提取布局/侧栏/设置/renderer/credentials/typert/app-boot 等包到 ignored `artifacts/dsh-022-rc1-reference/`；按 sha512 integrity 校验下载完整官方 npm 0.2.2-rc.1 包（含 slots/store/primitives/settings-general/web）到 `artifacts/dsh-022-rc1-npm-reference/proof.json`；旧 0.2.1-rc.3 声明/产物留存 `artifacts/dsh-021-rc3-reference/` 供逐项对比。
- 结论要点：slots `register/entries/subscribe/inject/spec`、StoredEntry、layout 面板服务、settings configForms 与 section 契约、Browser Bridge（protocolVersion=1，官方仍只设 name/partition/allowpopups/src）、client-web 共享模块表 9 个 baseline 键均保持；typert-api 仅新增可选字段。真实变化为 settings 图标进入公开 `settings.section.icon` 槽、`session/create` 权限可移除原生新会话按钮并使 brand 变 SPAN、窄窗 drawer 给主区加 `inert` 并按 `[data-sidebar-opener]` 恢复焦点。
- 边界：均为官方分发静态核对与本地合成/Node 回归，不是 Electron 原生或真实账号实机验收。

## 0.2.13 外链与附件下载依据（2026-11-07）

- Desktop 下载策略：本机 0.2.2-rc.1 `app.asar` 只读提取 `lib/main.js`、`lib/preload-app.cjs` 到 ignored `artifacts/chat-links-022-desktop-reference/`；其中 Browser 会话 `will-download` 无条件 `preventDefault`（每个 lease 独立随机 partition），BrowserBridge 仅 `acquire/release/onOpenRequested`。公开 `dshDesktop.fileActions.save` 由主窗口 preload 暴露，接受 http/https/blob/data，下载走主应用 defaultSession。
- 官方文件保存 SDK：`artifacts/chat-links-022-npm-reference/dsh-client-ui-file-actions/`（npm 0.2.2-rc.1，sha512 校验）；`save(source,'download'|'saveAs')`，`read(signal)` 时由 app realm 读 Blob 并自建对象 URL，因此 guest blob URL 不能跨分区直接使用（[Blob storage partitioning](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob#storage_partitioning)）。
- 外开：Desktop 主窗口 `setWindowOpenHandler` 对 http(s) 调 `shell.openExternal` 并 deny 子窗口；官方 toolbar/右键菜单同样使用 `window.open(url,'_blank','noopener,noreferrer')`（sidebar-browser 与 open-in-app 的 client.js 均可见），故 null 返回值不是失败。
- 官网导出结构：仅依据此前已确认的公开静态 bundle（10-18 版本，非本轮 fresh 首页）——Mermaid 代码块有唯一图表/代码页签与“下载/Download”按钮，导出菜单 portal 到 body 且恰好三项（下载 SVG/PNG/代码；英文 SVG/PNG/Code），helper 为 `Blob → createObjectURL → a[download] → append → click → 200ms 后 revoke`。本轮未重新下载官网资产，未读取任何账号/会话/附件。
- 边界：以上为静态契约与合成/CDP 点击回归依据，不是 Electron 原生保存对话框、系统浏览器外开或线上真实菜单的验收。
