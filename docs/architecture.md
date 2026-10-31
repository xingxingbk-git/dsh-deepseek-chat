# 架构与可行性

## 0.2.11 账号操作区与原生选择器样式（2026-10-31）

- 操作区与样式下拉共用`--dsh-chat-settings-action-width:200px`（240px 已被用户否定：会明显加宽下拉）。actions `gap:0`+`space-between`让两元素之间剩余空间自适应；链接仅保留左侧`padding:0 0 0 14px`，与原生Button md的14px内边距一致，故链接文字与下拉内文字同起点，且中英文都能在200px内单行。
- 原生选择器填充取证：用户实机截图采样得卡片#2c2c2e、下拉内部#353638、上下边缘无更亮描边；主题表中`--dsw-specific-selector`暗=`--dsw-static-neutral-bluish-800`(#353638)、亮=`--dsw-static-neutral-bluish-60`，即原生选择器用该token填充且无描边。故`.dsh-chat-style-trigger`用`background:var(--dsw-specific-selector);border:0`，hover用`--dsw-alias-interactive-bg-hover-solid`(回退selector)，替代Button outline描边；不改高度/圆角/字体/组件。
- 合成Button stand-in补`boxSizing:border-box`与`padding:0 14px`，与公开Button.module.css一致，避免用无内边距的假按钮证明对齐；fixture提供selector与hover-solid亮暗token以真实渲染填充色。

## 0.2.11 账号操作区文字对齐（2026-10-31，240px 方案已被否定）

- 账号操作区与样式下拉共用`--dsh-chat-settings-action-width:240px`的列宽（原200px不足：加内边距后最宽的中英文组合会换行）。链接`padding:0 14px`与已核实rc.3原生Button md的`0 14px`一致，因此链接文字与下拉按钮内文字起点相同；actions `gap:0`+`space-between`使剩余空间自动落到两元素之间，视觉间隔由链接右侧内边距形成，两行外边缘仍分别对齐。
- 合成Button stand-in补`boxSizing:border-box`与`padding:0 14px`，与公开Button.module.css一致，避免测试用无内边距的假按钮证明对齐。

## 0.2.11 统一主区域裁剪投影（2026-10-31）

- 用户明确要求同一套区域裁剪，不按Win/Mac分别硬编码。临时Windows-marker+16px CSS方案已撤回，未作为最终候选安装；最终无平台分支/固定16px。`surface-clip.ts`仅沿自有main槽的最多12层祖先读取公共DOM几何/computed样式：找与anchor四边一致（<.75px容差）且双轴overflow实际裁剪的内容框，返回其数值px/%圆角，跳过装饰性overflow-visible、不同矩形、body/html外窗圆角；零半径归一化0px。已核实rc.3/rc.5仅centerCol单层对应内容裁剪，Mac为0、Win为16px左上，半径来源为宿主而非本插件常量。
- DshChatChatPanel把本地borderRadius随既有viewport投影；Client同尺寸但半径变化也发布更新。现有ResizeObserver加祖先属性MutationObserver事件驱动重测，观察范围只有自有槽祖先，不遍历guest/页面正文；卸载统一清理，无后台轮询。支持窗口大小/平台样式/主区class/style变化；非现行原生结构的多层不同圆角精确交集、跨容器强制reparent及纯CSS半径动画逐帧追随未实现，不将它泛称任意CSS裁剪引擎。
- 原body portal保留，以免迁移portal目标导致React重建webview而丢草稿/登录。surface按viewport真实borderRadius设置border-radius与overflow:hidden，圆角非0时再显式clip-path inset(round …)裁后代，0时无clip-path，Mac现有矩形几何和外观不变。不会改宿主DOM、native IPC、窗口拖拽计算或guest lease/key/ref。
- 浏览器fixture挂真实主槽测量/Surface/拖拽组件，虚构host clip与DOM webview。覆盖无OS分支的圆角/椭圆同步、平台标记不发明圆角、无效祖先隔离、角落真实elementFromPoint、位移/缩放、同guest模式往返与观察器销毁；可见DOM guest也覆盖，但不等于Windows Electron真实合成/原生拖窗验收。

## 0.2.11 操作区对齐与Windows圆角只读调查（2026-10-31，实施前历史）

- 自有设置根统一定义`--dsh-chat-settings-action-width:200px`，账号actions和样式select共用宽度/flex-basis，右对齐同内边距卡片；actions用space-between与10px最小gap，窄窗换行而非收窄某一列导致错位。只动设置CSS，不修改Mac网页容器。
- 官方ui-layout rc.3与本机rc.5的lib/client.js:73均包含 `[data-windows-titlebar] .…_frame{--dsh-windows-content-radius:16px}` 和 `. …_centerCol{border-radius:var(--dsh-windows-content-radius) 0 0 0;corner-shape:round}`，centerCol overflow:hidden。本机app.asar/lib/preload-app.cjs:573–578只在process.platform为win32时设marker和40px标题栏。该marker比单看data-platform更准确，Mac不应启用。
- 插件src/web-surface.tsx:458–499将固定浮层portal到document.body，:468明确borderRadius:0，因此不在centerCol的圆角裁剪祖先内；宿主main槽只测矩形位置，不传递裁剪链。此路径可解释Windows直角差异。guest是DOM `<webview>`（不是额外坐标WebContentsView），不能断言CSS绝对裁不了；未来仅Windows marker下复用宿主半径+overflow/必要clip-path是否确实裁到Electron guest仍需Windows实机验证。本轮不改web-surface/viewport/拖拽，不把静态调查当作Windows修复。

## 0.2.11 设置样式微调（2026-10-31）

- 继续使用公开Button outline组件，不改退出逻辑；Button公开variant未提供danger，故仅对本插件退出按钮局部覆盖：`state-error-primary`作为文字色、描边用currentColor、默认透明，悬停使用`interactive-bg-hover-danger`半透明红底，禁用不着底并opacity .5。明暗主题由宿主token决定，替代0.2.10中性灰底。
- 核对已安装rc.3 Button.module.css：普通Button字号14px、行高22px；标题15→14px，600字重与行布局不变，下拉自身字体不覆盖。合成Button stand-in同步已核实的14px/22px契约，新增明暗危险色、禁用态和标题字号断言。

## 0.2.10 原生控件精简布局（2026-10-29，历史，音色保持撤回）

- 切换器文本宽度改用 `Range.getBoundingClientRect()` 的小数宽度（不再临时释放宽度、也不读会被裁剪的 scrollWidth），宽度按小数写入并保留 1px 容差，避免 1px 舍入把本可完整显示的文案切出省略号；改动文案时 layout effect 同步重算。保存流程不做可见状态切换（不换文案、不禁用输入、无 aria-busy），仅内部防重复提交。
- 切换器采用“CSS分配空间+单次测量”混合：host 占满剩余行宽(justify-end，pill仍按内容收缩)，按钮尺寸由 useLayoutEffect/ResizeObserver 在测量真实文本宽度与容器可用宽度后写成显式像素宽度，并给出四阶段算法：等宽→收短→截断长→等宽截断，下限=图标模式按钮宽度(内边距×2+15px icon)。测量用临时释放宽度后的 scrollWidth，不轮询坐标、不读宿主私有状态；图标模式下完全交给内容自然宽度。SVG 已抽为组件且已换为用户设计的填充路径（仅保留 path、去除白色底板、fill 用 currentColor 跟随主题，viewBox 20/渲染20 不变（图标态最小宽=8px×2+20px；侧栏 PanelIcon 独立保持 18 不受影响）），替换图标不影响布局契约。只在现有严格验证sidebar形态中标记brand为不可收缩，字标102px/原生图标保持尺寸，剩余空间不足仅压缩控件、文本ellipsis/title不变；属性由原adapter生命周期恢复，不改未知结构。

- 后续卡片统一参照已实读官方settings-account样式：section上下8px、组间16px，card内12px16px、.5px settings-card-stroke描边及radius-xl；分割线用border-l2，actions gap10。填充按最新指令分层：账号卡用bg-base恢复原暗色黑底、下方切换卡及其两个输入框transparent（含hover/focus/disabled），描边/圆角和原生焦点不改；颜色不写死，提供旧主题token fallback。退出登录按钮复用侧栏新会话的半透明浮层观感：interactive-bg-active 填充（暗色 #ffffff24）、interactive-bg-hover-accent 悬停（#ffffff3d）、border-l2-darkmode-thin .5px 描边，全部主题 token 不硬编码；曾用 specific-input-major(#2c2c2e) 因与弹窗底色几乎相同而弃用；官网入口为固定首页标准外链、_blank/noopener noreferrer；静态核对本机主窗HTTP/S新窗口转shell.openExternal，无私有API、账号/会话参数或登录同步，实际OS打开仍待验。

- 用户按截图要求删除页内标题/副说明、账号卡标题/独立登录说明、已记住登录说明、按钮样式可见标签、两输入可见标签和失焦说明；账号/退出/登录记忆逻辑不改。标题与下拉同一flex行居中，分割线下为两输入加一个共用保存按钮。
- 已核对本机官方rc.3公开Menu/Button/Input/下拉图标类型和Button/Input实际转发结构；未发现单独Select导出，生产组合原生Button+Menu（portal/selectedId/原生菜单键盘）及Input，不复制皮肤或私有组件，不再保留自绘select箭头。局部CSS仅布局和框内计数，不覆盖原生按钮字体/焦点样式。
- 草稿由表单父组件持有，切换样式不丢未存值，外部更新只覆盖未修改字段；只显式提交串行保存变更字段，未改/非法/忙时禁用，失败保留草稿可重试、阻止重复提交，IME确认不触发保存。保留原10单位与服务端校验，仅显示计数/颜色，不加校验说明。保存不改网站设置、模式或登录。

## 0.2.10 切换器偏好与标题适配（保留实现）

- 切换按钮偏好使用官方Config+Schemastery volatile字段，Client经`configForms.get(HOST_ENTRY_ID)`读写，命名空间与cordis.patch.yml条目一致；宽度规则为ASCII计1、其它Unicode码点计2累计≤10，正则与服务端schema双重约束，避免绕过UI写入超限值。
- 首候选仅屏蔽标题宿主过渡，用户实测未通过。续修补固定元素仍受祖先transform影响的反例：标题首现1200ms内，仅遍历已确认标题子树及到content的祖先路径，finish有限位置动画，保留原CSS声明、颜色/opacity、无限动画与无关内容；原style节点/截止标记防迟到回调，restore清理。配合原有标题先定位后原生收起，未触及HARNESS/原生拖窗。不把合成反例认作已证实的真实站点唯一根因。
- 音色模块已按用户指令整体撤回：无UI/命令/返回状态/序列化helper/后台调度/locale或相关fixture，官网通用设置恢复本轮前HEAD的语言/主题/退出代码；展示偏好只保留switchStyle/chatLabel/harnessLabel。设置开关只更新自身状态，不再触发额外网页配置动作。

## 0.2.9 Zod与预编译交付（2026-10-27）

PR #4更新依赖与锁后，旧Client仍内嵌4.4.3，触发输入哈希不一致。本轮frozen安装根zod4.6.6，完整重建27编译文件/manifest；Client只保留4.6.6模块标记，Host继续外部加载依赖，不强制改变宿主SDK的其他版本。类型/实际协议严格校验、现行46项Node和95项×5虚构浏览器回归通过；显式max数组可提前拒绝超限，但无界输入仍需应用自身约束，不宣称完整消除CVE。候选与安装/发布边界以handoff为准。


## 0.2.8 拖拽重做：先保持 0.2.7 的 HARNESS（2026-10-27）

- 以发布0.2.7/HEAD4f8a2b4为对照，两者Client逐字相同；旧Portal、保留guest、settings隐藏flex及模式恢复本就存在，不能当新增根因。a715/7f68的旧拖拽模块相同，恒定338px空白禁区和测试left>=362均被认作实现/验收标准错误；HARNESS原生触发链仍未实证，不再归咎宿主默认设定。
- 常驻WebSurface恢复0.2.7的职责：保留guest和200/1200ms导航，不渲染原生拖动DOM、不持有旧drag state/lease，也不在导航空档主动扫几何。移除7f68额外tabIndex，正常网页不显式改pointerEvents；识别失败的遮蔽/inert/禁鼠标及严格身份修复独立保留。新增只读sampler由当前guest注册，受owner/document/origin/viewport/认证代次及CHAT epoch双向检查。
- 原生拖动层作为单独shell.overlay occupant，仅在mountChatNavigation中注册。离开/停用先AbortController.abort，组件同步只对自己的ref设置display:none并移除data-window-drag，再释放Slot；旧异步结果不能在再次进入CHAT后复活。HARNESS冷态没有该occupant或拖动节点，原CoreMode与原生会话标题不改。
- 新层为稳定40px单行正drag及真实控件几何补集no-drag洞，全部pointer-events:none，把网页控件点击交还真实guest。行宽/位置只随viewport/native caption变化，不随标题/洞变化，避免旧多岛数量/矩形持续改动原生表；Windows caption用实际top/height矩形裁剪，不用clipPath推断原生边界。编辑/弹窗/不确认/全屏时撤回；非编辑态不再预留假想最大编辑宽度。
- 几何读取独立于原导航串行队列，仅CHAT存在时采样、严格一个物理在途。同几何不重复发布或拆DOM；500ms只是当前读取deadline，成功几何没有周期租约。失败/超时撤回，迟到拒绝，refresh合并且不制造并发。普通Chrome/虚构Bridge检查不等于Electron原生命中；最终命令、候选hash和实机待验边界见[handoff](handoff.md)。
- 用户随后明确要求发布0.2.8；正式eb669包仅中英README不同于5c56本机候选，33个运行/元数据文件不变，公开35文件包及完整/install-v1 latest0.2.8均核验一致。没有以发布为由重建、重装/重启或补造原生/Windows验收；用户随后另行授权Git提交推送，交付包含同版源码与完整lib，准确提交/远端核验见handoff。

## 0.2.8 首轮拖动岛方案历史（2026-10-26，已由上节替代）

- guest仍铺满原主区，clearance保持0；不新增顶栏或移动网页。自有[window-drag模块](../src/window-drag.ts)仅读取已适配顶部的公开控件/文本盒几何，不读取文字、输入值或存储；生成最多8个顶部空白区域，并保守预留完整标题编辑lane、分享/参考按钮及leading/native控件。host在guest上方放绝对定位小区域，Mac复用官方data-window-drag，Win仅平台内声明app-region；菜单/弹窗/编辑、结构未知、全屏、隐藏模式及缺少安全间隔时撤回。
- 复用已有200ms串行队列/timer采样顶部几何，正常官网导航仍用原200/1200ms节奏，不重建guest或新增私有IPC。几何严格验证尺寸、顺序、有限数值与视口边界；500ms有效期从请求开始计算，命令/load/error/abort失效epoch，返回后二次核对原点、文档、viewport、认证代次和owner，旧guest不能清理新guest区域。并未把CSS/Chrome检查当作跨webview原生拖窗验收。
- Issue #3可证两处缺陷：原来主区boundedContent先于footer证明，主区仅越界2 CSS px亦可阻断账号保存；另合法侧栏但profile未知会无限ready/unknown、隐藏原侧栏而不提示。现将完全相同的footer-v1证明前移到镜像边界之前；布局失败可保留独立证明的账号，但不发布历史/新建权限。2026-10-27用户否定自动恢复原官网侧栏。未知账号独立5秒宽限后给identityUnconfirmed及明确提示；当前严格验证的隐藏侧栏布局可保留layoutReady并继续使用CHAT，只有布局无法证明才保持/设置guest遮蔽，host用既有错误卡片替代，不让原侧栏露出。重新识别只取同guest快照，不reload/新建lease或清登录/草稿；自动异常与SPA sign-in不调用restore，legacy showOriginal不再揭示原导航。
- 额外收紧footer自身及祖先dialog/menu排除，防止弹窗头像或移动后的旧proof误认；不放宽单头像、单昵称叶、几何或存储白名单。刷新保护补齐已有支持的plaintext-only编辑器。Host凭据/profile/epoch及三key内容未改，不读取实际凭据。报告的静态字符串证据不能排除运行时DOM差异；用户Win11正常不代表另一尺寸/账户结构无bug，尚不能确认当事人根因或归咎网络。
- 10-27修正验证为14项现行契约、Chrome155的55项×5视口/DPR组合（实际Settings/WebSurface条件渲染，SDK视觉primitive/Browser桥为stub）、rc.3类型/构建/分发。原shell34项是前阶段通过，历史整套tests仍有已撤销授权/旧RPC替身，不声称全套通过。7f68修正包已按用户10-27明确选择替换本机a715且34/34同包，持久dependency/lock同hash，未退出/重启或Git/npm；原生窗口及对方Win环境仍待验收，证据见[handoff](handoff.md)。

## 0.2.7 滚动条、设置图标与兼容发布线（2026-10-24）

- 原 CHAT 列表设置 `scrollbar-width:thin`，Chromium 会优先使用该标准属性而绕过宿主 `::-webkit-scrollbar` 皮肤。现移除这项局部覆盖，列表增加与 HARNESS 相同的 `scrollbar-gutter:stable`；宽度、thumb、hover 全部沿用官方 ui-theme 的全局规则与 `--dsh-scrollbar-*` / `--dsw-alias-scrollbar-*`，不复制另一套颜色或修改官网。
- 用户复验指出首候选遗漏外侧间距：官方WorkspaceBrowser通过root的右padding、listArea负margin和list的2px右margin让滚动条距侧栏边缘2px，list内侧padding为侧栏inset−5px原生gutter−2px。CHAT续修采用同样的2px右margin和`calc(var(--dsh-sidebar-inline-padding,12px) - 5px - 2px)`右padding，保持默认行尾12px内缩，不把空白叠加挤窄内容。fixture由平面列表改为官方root/listArea/treeBody/list层级，覆盖宽窄/长标题/短列表/溢出恢复；旧样式实测CHAT gap0/HARNESS gap2，修正后均gap2、行尾均12px。
- rc.3 的 settings-general `navIcon(id)` 只按固定内置 id 选图标，未知项齿轮回退，`settings.section` 没有图标参数。用户已明确许可限定例外：新增 `settings-icon.ts`，只识别 `[data-shortcut-modal=settings][role=dialog][aria-modal=true]` 下唯一直接 nav、标准 button/svg/span 且标签精确为本插件中英文的单行。仅加自有标记，用 CSS mask 绘制16px聊天气泡、继承 currentColor、视觉隐藏原装饰 SVG；原标签、SVG节点、点击/键盘行为都不改。重复标签或未知结构撤回，body仅观察portal直接子级、已识别设置overlay仅观察其自身结构/标签（覆盖同overlay的动态双dialog），无全树轮询；Client卸载断开观察并精确恢复已有标记值。
- 旧 0.2.6 兼容声明精确列举到 rc.2，导致官方准入拒绝 0.2.1-rc.3。官方 app-boot 使用 `semver.satisfies(runtimeVersion,range,{includePrerelease:true})`，有 `engines.dsh` 时该准入不再同时用 DSH peers 决定；仍将 engines 与三个Host peer同步为 `0.2.0-rc.2 || >=0.2.1-rc.1 <0.2.2-0`，避免元数据分歧。`-0` 用于排除 0.2.2 的整个预发布区间，不能写成裸 `<0.2.2`；不使用无上界或强制豁免。
- 这允许同一 0.2.1 release train 的后续 RC 及正式版通过版本检查，不表示未来接口能自动修复，也不自动放行所有 0.2.x 补丁（0.2.1→0.2.2 本身就是 patch）。API/网页DOM实变或跨上界时仍需核对。开发 SDK 精确升到已发布的0.2.1-rc.3；Cordis4.0.5/React18.3.1保持共享，新增semver7.8.5仅为开发检查，不增加运行依赖。
- 官网会话、授权保存、语言/主题同步、分享/正文模块未改。rc.3 SDK类型、生产构建/分发与无账号浏览器fixture结果见handoff；不是live Inspect或真实官网/所有平台验收。此前按用户选择由官方安装器更新原desktop且33/33同b6c候选。用户本轮随后明确要求npm发布，0.2.7已公开；正式包仅两份README不同，其余31文件同本机候选。本轮发布不重装/重启DSH或新增实机验证，结果与边界见handoff。

## 官网及插件语言随DSH与Chat设置（0.2.6，按用户最新决定）

目标是内嵌官网实际Language设置同步：DSH中文→官网简体中文，DSH英文→官网English。DSH 0.2.1-rc.2的 @deepseek-ai/dsh-client-locale LocaleRuntime/getSnapshot/subscribe、locale/change 及 syncDocumentLanguage 将当前实际语言写入公开html.lang（zh→zh-CN），插件只读这一投影并仅监听lang属性，不写DSH或推断系统语言。未识别宿主语言时返回null且不写官网语言目标；DSH选跟随系统时仍只使用其解析后的中/英文。

删除 DEFAULT_WEBSITE_LANGUAGE 和Host独立language schema字段（Config为空对象），移除ConfigForms读写/恢复。Schemastery 3.18.5 object resolver的非strict分支允许旧对象未知字段，不需要修改用户profile，且Client/Host业务不读取旧language。删除preferences、setting、settings-read、settings-close及restore-language/restored流程；设置页生命周期只协调账号所需guest可用性，不触发或取消自动同步。仅保留settings-retry作为实际同步失败后的重试入口。

WebSurface每条既有串行命令读取最新宿主语言，只有en/zh-CN可写host-language标记；无目标时撤回该标记。官网设置适配与主题同步使用同一公开General/Language控件通道，读回准确选项后写language-complete，不使用官网Follow system冒充DSH选择。快速变更只撤销过期语言阶段，不覆盖退出或主题请求；超时12秒及错误重试有界。第一次准备画面等目标确认或明确错误，已呈现网页后续同步不重遮整页。复用同guest，不重载、不新增存储/私有API或读取正文，身份/退出代次屏障保留。官网未提供可用公开设置控件时保留真实状态并在可操作时同步，不伪称无条件登录页强改。

用户最新决定恢复插件文案翻译。语言枚举与标准宿主读取函数仍在website-settings.ts，不增加语言状态/配置。locale/zh-CN.json与locale/en.json集中维护UI文案；i18n.ts只按现有language查表，未知消息保留原文；固定错误只在呈现时翻译，内部中文值和退出/超时判断不变。locale-json.d.ts只声明JSON类型，构建将实际JSON文案打入Client；分发输入哈希包含locale目录，防止文案更新后误用旧lib。设置入口为“Chat 设置”/“Chat settings”，删除界面同步整卡、图标、说明与相关CSS/文案，只保留官网账号、已保存登录、登录/退出及真实错误重试。用户追加选择允许无头像：移除首字母占位及其CSS，账号区域以可换行flex布局呈现昵称/状态和退出按钮，收紧分隔间距；不新增头像读取或跨guest图片数据。原官网标题/分享定位、复制兜底、字体和凭据源码不修改。

账号卡状态统一：彻底删除statusTitle/statusDescription、settings-status说明区及重新识别说明，在任何状态均不生成这组DOM。signed-out/signing-in保留原登录动作，loading用非交互div（role=status、aria-busy）显示“加载中”，文字后放官方IconLoadingOutlineRegular并复用既有旋转与减少动画样式；signing-out同样只显示纯状态。无button/onClick/tabIndex，最小高度36px衔接原控件的占位。不为加载提供reload点击，真实错误仍走已有错误区和重试；不改状态来源、超时、认证或guest流程。侧栏只在sign-in提示追加居中样式，文案和英文词条同步缩短，其余列表/错误不改对齐。无认证状态、网页命令或登录流程变更。

本轮无live Cordis Inspect，使用本机官方分发源码和SDK静态契约（settings.section使用既有固定id，依官方SDK契约随语言变化重注册本地化标签“Chat 设置”/“Chat settings”，只在标签实际变化时更新）；Schema空对象兼容为源码核对。构建/分发、原desktop安装、用户验收及npm公开结果以handoff为准；用户已确认当前候选合格，不将其写成Agent自动化界面检查。不新增/运行测试，不另建DSH，不Git/npm发布。此前含“界面同步”卡和保留语言schema的25bad候选已被本节替代，继续同一0.2.6不重复加号。

## 分享按钮定位容器（2026-10-21，0.2.5已发布）

基于用户已恢复的0.2.4，仅在website-header.ts中给现有rowSelector添加position:relative，将shareSelector的position:fixed改为absolute。官网原有对话顶部行的实际宽度作为按钮right:12px的参照；参考面板改变对话宽度时由CSS直接重排，不测量面板、移动DOM或新增observer/轮询。原顶部高度、标题/编辑、侧栏、分享事件与复制后备保持仓库基线。此前整套原生顶部实验已撤回；本次不是复活该实验。构建与安装证据、尚未完成的用户视觉验收见handoff。

当前检查W030（2026-10-12）：公开0.1.12包仍同验收0ac，用户desktop此前实际加载旧0.1.9已确认。官方CLI指定0.1.12安装成功，持久依赖/lock/installed为`^0.1.12`/0.1.12/0.1.12，23/23文件同正式包；完整退出重开后，当前未登录界面的蓝色主登录按钮、刷新入口和纯原生CHAT设置已确认。旧依赖由哪次操作恢复未知，本轮未重新登录或验证登录记忆；具体持久安装边界见下文及[handoff](handoff.md)。以下W028结果为历史分发与当时界面证据。

历史交付W028：2026-10-12，W028 / 0.1.12，仅从0.1.11递增一次，开工HEAD与origin/main为086b7abd01ed82b1b44aeafdb3de5d617c9d9a98。最终0ac/14px包构建/分发、pack/CLI安装23/23一致；quit旧50867/50878结束后重开51380/51389无需重登，官网999×820/nav103/compact0/originalNew0/已保存。实际刷新自然30秒超时后中文提示和右侧可用“重试网页”出现，正常点击无需重登恢复导航、刷新可用与记忆，两处错误清除、首页URL哈希保持；最终真实超时→重试流程通过。单条外部新增实证来自旧651b的同一manual reload核心，100行匿名指纹added=1/removed=1，未输出标题/正文；e76f无重试入口失败保留历史，651b/e76f不发布。其他保护/故障矩阵仍待，同一0ac包正常发布0.1.12，匿名版本/两索引、下载同包及空store/空元数据裸名安装12包、23/23文件一致通过；无单元/浏览器测试，未stage/commit/push，源码/lib/README截图待用户提交，进度见[handoff](handoff.md)。

历史交付W027 / 0.1.11：最终0ce1d5c753e8构建/分发及正常安装23文件一致，本轮正常GUI流程已通过：原生设置真实退出→Owner close自动关设置→主CHAT999×820正常登录→用户完成后自动恢复nav103/create=true/originalNew0/compact0/sessionSaved；再次完整quit确认旧44883/44897结束，新45240/45249无需登录仍nav103/create=true/compact0/已保存。错误/过期/隔离等独立矩阵仍待。npm已正常重新登录，whoami=xingxingbk；用户完成官方单次2FA，同一0ce包publish session34434 exit0。匿名完整与install-v1索引均确认0.1.11/latest，公开下载与已验收0ce包完全一致，DSH内置pnpm11.7.0空store/空元数据缓存按裸名安装0.1.11及23/23文件一致通过。无单元/浏览器测试或Git写操作，进度见[handoff](handoff.md)。

历史交付：W026 / 0.1.10。最终e031严格footer-v1/布局包完成构建/分发核对及官方CLI安装，23/23文件与tgz一致；一次正常quit确认旧主/Host结束后重开，无再次填写登录。原生固定状态确认已登录/已记住网页登录/简体中文，create-enabled=true；账号group昵称长度4、无侧栏文字，退出按钮86×38。修正临时AX URL的系统类型桥接后，自有guest官网origin确认，native导航103按钮、官网原新建按钮0，新建可用。用户完成新npm验证后publish exit0，公开完整与install-v1索引均确认0.1.10/latest；下载tgz与e031完全一致，DSH pnpm11.7.0空store/空元数据缓存裸名安装12包、版本0.1.10及23/23文件一致通过。本机保留相同字节的e031本地tgz来源，不重复安装或GUI验收；该轮未新增或运行单元/浏览器测试，收尾未stage/commit/push，后由用户提交51cf995。有限证据不扩大为全部官网分支通过。

历史交付：W025 / 0.1.9，基线f2c1277。用户取消DSH/官网退出后禁用模式与强制HARNESS，改为独立官网授权、同一guest和两处认证状态同步。Host从启动器可信profileContext.dir派生scope，使用dsh-deepseek-chat/website-<profile目录SHA256>保存自己的grant；旧DSH公开id只用于精确迁移本插件旧记录。GitHub改名/origin更新、npm正式0.1.9/latest发布、最终候选构建/分发及fresh Git检查完成。DSH pnpm11.7.0空consumer/空store裸名安装12包，23文件与发布tgz一致，Host import/lazy Client通过；本机CLI换为npm裸名^0.1.9，旧插件不存在、23文件一致。该轮收尾尚未重启/GUI验收；本次用户故障反馈不能以这些分发结果判为已修复。详见[handoff](handoff.md)。

上一项有限验收：fc00f27开工，cd07d9c360f4包完成持久标题结构CSS、23px品牌控件和设置箭头12px右距的构建安装与实机观察；44项代码、39项浏览器自动回归及真实DSH原生select键盘通过，完整退出后官网登录及简体中文恢复。这些结果保留为对应UI/登录证据，不代替新分发路径验收，也不保证未来官网改版兼容。

此前有限观察：13b2的前三次认证与中文恢复证据仍有效，但随后用户实报主区闪烁，显示稳定性未通过。b4bb28dde279闪烁修正版已构建安装、正常完整退出重开，恢复账号、简体中文和指定对话；首段20次、设置关闭后10次受限采样，各段内标题/置顶区域分别保持一致、未见消失，末样本文字正常。展开/折叠标题展示与圆角编辑、HARNESS/CHAT往返及关闭设置后观察已复查。这是短时观察，非长期或所有官网状态稳定保证；真实错误/主题超时分支仍仅有源码与生产构建证据。f3fb874f2ae4还按用户授权关闭固定环境说明，两次完整重启观察通过；仅该说明，其他提醒不处理。此前结果不代替本轮首帧与尺寸验收，分层证据见handoff。

## 固定基线与来源

- 本机 DSH Info.plist / app.asar package：`0.2.0-rc.2`；archive 只读元数据证实 Cordis `4.0.4`。React 与客户端构建基线为 `18.3.1`；依赖锁定对应 npm 发布包。
- 官方固定源码 tag `dsh-v0.2.0-rc.2`、commit [`639ed015397290b3745d163aafe02ffee4aa3f84`](https://github.com/deepseek-ai/deepseek-harness/tree/639ed015397290b3745d163aafe02ffee4aa3f84)。本轮重读官方 Slots、Client Modules、打包文档，并核对安装版 main/preload 的公开 Browser 入口。
- 当前工具目录无 live Cordis Inspect；所有新接口来自固定官方公开类型、源码和安装版入口的只读核查，不声称 live Inspect 成功。

## 产品与数据来源

CHAT 直接呈现 `https://chat.deepseek.com/`，由网站自行处理登录、会话和服务器历史。插件不实现另一个模型聊天服务，不持久化/合并网页历史。用户2026-10-10允许有限DOM适配，当前在原DSH侧栏镜像已加载的官网导航元数据；这是界面适配，不是官方历史API。

DSH账号与官网授权独立；DSH退出、失效或换账号不禁用模式、不强制回HARNESS。网页账号由真实页面确认；没有公开身份匹配或Chat OAuth交换契约，不能复用Platform凭据。Client统一官网status、revision和guest同步对话页/设置入口。

## Host：独立profile中的官网grant

Host控制器使用官方`credentials`与`typert`管理插件自己的官网grant；DSH公开账号接口仅为兼容旧记录迁移使用，不作为模式权限或官网身份。内部`loadWebsiteSession/saveWebsiteSession/clearWebsiteSession`不向模型开放，Client不能选择任意credential key。

- 默认credentials-local文件为全局共享的`$DSH_HOME/.credentials.yaml`，Provider本身不提供天然profile隔离。Host读取公开启动器服务`ctx.get('profileContext')`，验证dir为绝对路径后SHA256派生scope，当前记录为`credentialKey('dsh-deepseek-chat', 'website-<profile目录SHA256>')`；Client仅拿scope哈希，不提供任意dir或key。缺少可信profileContext时明确报告记忆能力不可用，不回退共享固定键或DSH账号键。当前profile的自身代次串行读写，迟到结果不能覆盖退出或新官网登录；不读取DSH平台或其他插件grant。
- 新profile记录不存在时，DSH官方`getProfile`的公开稳定id只用于计算旧`dsh-chat/website-<DSH账号SHA256>`的精确key并迁移本插件自己的记录；资料失败、未登录或没有旧记录均不关闭CHAT入口，不枚举其他账号记录。
- 显式官网退出先建立保存/恢复barrier，等待并清除当前记忆，再正常操作官网当前会话logout。记忆清除失败显示固定错误，不假报已退出；DSH退出不清除独立官网grant。
- 官网正常登录先发布公开账号/status/revision，后台持久化只影响“已记住”状态，不阻塞页面显示。普通网络错误不伪造官网退出，官网结果仍是登录成立依据。
- `src/protocol.ts` 使用显式 strict InvocationDescriptor 和 Zod codecs，Host 注册 Typert contribution，Client `$mount`；不依赖 SRC 猜方法。流使用官方 `$stream` 监督重连与取消。
- Client先`remote.$mount`再`ctx.inject(['remote', 'remote.dshChat'], ...)`，所有unary/stream调用使用该子Context。仅注入`remote`不包含生成的独立namespace服务；直接从原插件Context调用会抛出`cannot get property "remote.dshChat" without inject`。不能在挂载前把namespace设为外层必需依赖，造成启动相互等待。
- Host连接和协议挂载失败保留固定错误/重试与迟到请求隔离，不强制改变模式。设置退出优先于旧读取，reset旧请求；卸载按依赖先dispose namespace消费者与stream，再撤回contribution。

官方来源为app-boot的ProfileContext、shell-env读取同一公开服务的实现，以及credentials与Gateway的固定类型/源码；deepseek-account公开账号资料仅支撑旧记录身份，Platform的signed-out/session-expired不再决定CHAT入口。官网登录/退出由同一guest的公开结果确认，不能从Host保存成功推导官网接受会话。

历史复现与回归（2026-10-10）：发布的Cordis4.0.4/Gateway0.2.0-rc.2上，真实插件Context缺namespace注入必然拒绝；当时的fixture验证原DSH授权门槛/退出回退，W025已取消这些产品规则。历史测试结果不代替0.1.9实现验收，本轮未新增或运行测试。

## W025：同一guest的认证同步与操作顺序

Client集中维护官网登录status、revision、公开账号信息和记忆状态；设置与对话页读取同一快照、打开同一个guest。未登录显示明确登录按钮，不创建第二份网页登录面板或让用户切换页面手动刷新。真实官网确认登录后立即同步公开状态与导航，固定三key的授权保存后台串行执行；保存失败只能表示记忆未完成，不能把已成功登录重新显示为未登录。

退出操作优先于设置读取/偏好恢复，清空旧请求并推进revision，使迟到读取不能覆盖新状态。Host清记忆barrier完成后才使用官网自己的当前会话logout；确认退出结果后两处统一显示正常登录入口，保留模式切换。再次登录沿用同一guest，正常等待与真正读取错误分开呈现。

系统浏览器可正常打开HTTPS链接，`dsh://open`只唤回DSH窗口；当前公开资料未找到Chat第三方授权码交换/回调。官方Platform Provider默认platform.deepseek.com并固定/dsh/authorize、/dsh/authorized及/oauth/callback，不能换成Chat OAuth。当前采用同guest正常官网登录，不伪造外部浏览器确认授权，也不宣称服务方永远没有该能力。W025的0.1.9生产候选构建、类型、产物、分发及安装检查通过，收尾未重启/GUI验收、未运行单元/浏览器回归；用户随后实报的官网问题由W026修正和重新验收。

## W028：列表手动刷新（最终0ac/14px构建安装、完整重开与真实超时重试恢复通过）

列表旁“＋”改为有明确名称的14px刷新图标（原16px按用户反馈缩小），顶部“新会话”仍创建官网对话。手动刷新只重载插件自己的同一guest，保留当前URL、lease及guest生命周期代次，不创建新容器或切换对话；显示busy/error/pending状态并防连点。发现未发送输入、已识别的生成中状态、登录/退出或settings操作pending时先暂缓，不自动定时或焦点触发重载。未发送输入只在自有guest内判断是否非空，返回有限枚举，不传输、保存或输出实际编辑器文本；重载没有插件草稿备份，不能将授权状态刷新保持草稿的既有规则当作整页重载会保存草稿。公开生成识别仅限精确Stop标签、aria-busy及disabled/readonly字段等已知信号，不宣称所有匿名生成控件或附件都有保护；这些保护分支仍待独立实机。

现有串行DOM轮询/MutationObserver只读取官网已经加载的公开导航，不触发服务端历史拉取。专用refresh命令由`web-surface.tsx`拦截，使用官网当前URL正常reload同一guest；后续文档ready和导航重识别沿用原生命周期栅栏，迟到结果不得覆盖新文档。刷新按钮反馈busy/error/pending，重复点击只维持一次活动请求；暂缓不是成功，不偷偷在定时器、focus或模式往返时重载，也不调用私有历史API。输入保护仅允许自有guest内判空并返回枚举，正文和编辑器原文不进入Host、Client状态或日志。

本轮0.1.11→0.1.12已仅递增一次，同一已验收0ac包正式公开及空缓存裸名安装通过。本轮未新增或运行单元/浏览器测试，未stage/commit/push；HEAD与origin/main仍086b7abd，源码、lib和README截图待用户自行提交，npm公开不等于Git源码已推送。其他独立刷新矩阵继续分开记录。

最终已验收包`artifacts/dsh-deepseek-chat-0.1.12-0acaca2e5f6b.tgz`为138225bytes，SHA256 `0acaca2e5f6b10f1d8e26100db0d25ab075744ee98ba6c006d4008f618e94e4f`、SHA1 `93c4d881c53c56e871226cb4e048126bd92079e5`，Client SHA256 `46a6041d6c144746b485d03809ea1aff6f6a6c5591b314f76309b500df4d3e72`，Host与W027相同，刷新图标14px。生产build/check-distribution、18编译文件/4模块lazy-CJS、正常pack和官方CLI安装exit0，23/23文件与0ac包一致；正常quit50867/50878后pgrep exit1确认结束并normal open51380/51389，无需重登，最终真实超时重试恢复通过。

e76f真实再次reload后30秒timeout，busy=false、nav2、列表refresh disabled且无重试入口；失败记录保留，旧包不发布。0ac最小恢复：timeout仅在request identity及auth/generation仍有效时结束刷新，给出中文明确入口并report(false, webError)，使既有右侧“重试网页”入口可用。Client reload清理旧requestId/error，surface取消旧timer；旧await/catch按request身份和docrevision隔离，迟到真实ready只清对应timeout，不覆盖后来错误。恢复处理已随同一0ac包完成真实自然超时重试流程，其他竞态/保护分支仍待。

0ac正常重开51380/51389无需重登，官网999×820/nav103/compact0/originalNew0/sessionSaved。实际refresh出现busy=true/disabled及nav2 loading；官网自然再次30秒超时后busy=false，显示“官网加载超时，请点击「重试网页」。”，原生retry-web enabled=true。正常AXPress重试后无需重登，恢复999×820/nav103/compact0/originalNew0/sessionSaved、refresh enabled=true/busy=false，两处旧错误清除，首页URL哈希仍7ea330。该真实超时→重试恢复流程通过，没有故障注入，不承诺每次刷新都在30秒内完成。

历史14px中间包：旧候选`artifacts/dsh-deepseek-chat-0.1.12-e76f15b7b457.tgz`为138018bytes，SHA256 `e76f15b7b4577c6bf5e6880fa5a18003c83d8d00399fe492934d0ceec91ce235`、SHA1 `93c77707afe69aea4226f4080e665dcfc1b1bd15`，Client SHA256 `6d80df5c40a6c52fcc2496d0ff8beed9f0cfb1ce8a6dd6868444129ba9b41489`，Host与W027相同。用户反馈图标偏大后刷新图标由16px减为14px；生产build/check-distribution通过18编译文件和4模块lazy-CJS检查，DSH pnpm正常pack/官方CLI安装exit0，23/23文件与e76f包一致。首次正常重开后再次刷新暴露上述30秒timeout；e76f不作为最终候选且不发布。

历史16px候选：旧包`artifacts/dsh-deepseek-chat-0.1.12-651b67307c03.tgz`为138016bytes，SHA256 `651b67307c03041f6717d9038e06eccb60722faf8f1e4dd916fcdea1f99b627b`、SHA1 `50f68e0a4c6c3b3581748b25c1589d6511697c75`。Client SHA256 `4cee3e36d9d4c47eb6c173584e1d2164e584cc17d97275563f335acb20c532b6`，Host与W027相同；build.mjs/check-distribution通过18编译文件及4模块lazy-CJS检查，DSH pnpm正常pack、官方CLI安装exit0，23/23文件与651b包逐字节一致。651b不是最终候选且不发布。

旧651b候选正常quit旧49255/49267后pgrep exit1确认结束，重开50344/50353无需登录；官网999×820、nav103/originalNew0/compact0/sessionSaved恢复。实际点击新refresh时按钮disabled/busy=true并显示中文刷新状态，随后busy=false且enabled=true、nav103/compact0/sessionSaved保留，无错误。前后URL SHA256前缀均为7ea330，确认是公开官网首页；这是同guest当前URL保留的正常循环证据，不证明历史对话URL全矩阵。

用户在外部网页新增一条对话后，未重启DSH，插件自有列表刷新前后均100行，匿名SHA行指纹比较added=1/removed=1；官网最多加载100行，置顶首行保持。正常刷新完成后enabled=true、官网999×820/nav103/originalNew0/compact0/sessionSaved，首页URL哈希仍7ea330；只比较匿名指纹，不输出标题/正文。该单条外部新增场景实机通过，不扩大为全部历史或多条/分页同步保证。

## 历史W027：原生CHAT设置与主页面登录（本轮正常GUI、公开发布及裸名安装已通过）

用户最新要求设置使用普通状态显示，取消整个设置内网页登录pane。Client/WebSurface使用独立settingsOpen boolean记录设置打开，取代settingsViewport的几何/显露职责；设置完全原生展示账号、认证/记忆/识别状态、语言、退出、登录。后台自有guest保持正常窗口尺寸继续识别官网，不以原生设置卡尺寸触发mobile布局，也不覆盖原生输入。设置只读取同一已确认公开profile投影，unknown不推断登出，退出barrier及旧代次隔离保持原规则。

`ui.tsx`/`styles.ts`保持蓝色最小144×40px主登录按钮。设置入口使用官方Props.close()关闭settings并总select chat；随后在主CHAT同一guest展示官网正常登录。不创建第二个网页/授权状态，不在设置内嵌入官网，也不将关闭设置当作认证成功。原生状态和正常重试由统一status/revision更新，语言与退出沿用公开官网操作。

接口核查：[DeepSeek官方API文档](https://api-docs.deepseek.com/api/deepseek-api/)公开认证要求API Key，scheme为HTTP Bearer。本次公开资料未找到能复用官网Chat登录查询账户的契约；不能将Bearer这一格式相同当作官网token可代用的证明。当前只使用同一guest已确认的公开profile投影，不模拟私有登录/账户接口或扩大凭据白名单。

`website-navigation.ts`的compact/footer证明不放宽：匿名SVG只在左上有界公共行内恰好三个独立、可见、可用控件，并且顺序/几何证明侧栏、搜索、新建时接受；行不得含正文、输入、链接或菜单。单个/移动端控件仍须公开命名侧栏用途。recovering提前fallback前仅一次正常展开，文档标记跨fallback/控件替换保留，完整footer/list及layout/content确认才ready。0ce已完成新路线真实退出→主页面用户正常登录，导航/保存自动恢复，并在其后完整重开无需登录；0.1.11同轮不再增，正常publish、公开下载一致性与裸名安装已通过；错误/不同profile等分支仍待。

当前正式包`artifacts/dsh-deepseek-chat-0.1.11-0ce1d5c753e8.tgz`为136151bytes，SHA256 `0ce1d5c753e85368fa6857fcb005c9b2b80476ed069458b1e5ab58656adc4a21`，Client SHA256 `00c9df0385a2b53eb7aa16f2d2ebd167710f533346ceb8beab096ebe63cf88d4`，Host与W026相同；生产build/check-distribution、DSH内置pnpm正常pack和官方CLI安装exit0，23/23文件与包一致。正常quit旧43609/43621后pgrep exit1确认结束，重开44883/44897无需登录输入；CHAT999×820、nav103/create=true/originalNew0/compact0/sessionSaved恢复。

新设置仅native账号卡，昵称长度4/sidebartext=false/logout86×38、已登录/已记住/简体中文齐全，无可见嵌入官网AXWebArea（父级仅1 WebArea）。再实际正常logout成功到signed-out card/login144×43px，无旧账号或残线，两模式可用。设置login通过Props.close()自动关闭settings，主CHAT同一guest999×820正常sign-in、原生无CHAT设置heading；用户已完成该新路线正常登录，native列表自动恢复103、create=true、originalNew0/compact0、记忆已保存。再次完整退出DSH，旧44883/44897确认结束，新45240/45249重开无需登录，仍列表103/create=true/compact0/已保存；本轮正常GUI流程通过，加载失败及其他独立矩阵仍待，无单元/浏览器测试或Git写操作，证据见[handoff](handoff.md)。

历史中间候选`artifacts/dsh-deepseek-chat-0.1.11-c04108c69ee3.tgz`为136331bytes，SHA256 `c04108c69ee36251ec0002272fab658891ec0bb037e753e260c0028dc5218bc1`；生产构建/分发检查与官方CLI安装exit0，23文件一致。正常quit/reopen初始signed-out无1px残留，两处蓝色按钮AX主145×48px/设置144×43px；主页面正常登录无需手动展开，自有guest999×820且origin确认，native nav103/create=true、originalNew0/compact0、sessionSaved。设置无需刷新昵称长度4/sidebartext=false、logout86×38及已登录/已记住/中文。仅记录固定状态/几何，不输出个人内容；这些有限结果保留，不作为最终新方案验收。

该中间候选settings正常logout到真实signed-out时，无旧账号/残线、蓝色login144×43px且两模式enabled；随后settings内重登失败：用户回复已登录后guest564×480为mobile布局，raw unsupported、native2、create=false，账号/导航识别没有恢复。旧“设置内signing-in viewport”路线已由原生设置/主页面登录替代；此前手动正常关闭设置让桌面guest恢复nav103/sessionSaved，只为保留用户刚登录会话，不作为新方案通过证据。新0ce的当前结果与剩余验收以上文为准，历史失败记录保留，c041包经SHA核对已清理，仅保留当前包及有效回退；AXManualAccessibility已恢复false，进度见[handoff](handoff.md)。

## 历史W026：登录过渡与账号结构修正（严格版有限实机证据）

0.1.9路径会将登录SPA提交中暂缺sidebar的页面判为unsupported，再由同文档fallback阻止后续适配。W026首次识别保留5秒宽限；fallback保留原官网可用界面并持续执行安全结构探测，只有sidebar、新对话、layout与content共同确认后才恢复适配。同文档恢复不重复全页遮罩、点击compact或重开guest，替代“fallback后直到新文档都不再适配”的旧规则。

unknown认证、暂缺profile或导航结构不支持不产生signed-out，也不据此清除官网登录状态或记忆。profile真实出现后才执行偏好恢复和设置读取；CHAT设置的结构待识别反馈与网络连接错误分开。旧Host授权请求的异常检查当前代次与dispose状态，不能迟到覆盖已成功的登录。e031严格版一次完整退出重开后的固定状态已确认，过渡/异常全矩阵仍待验；0.1.10 npm正常发布、公开索引/下载及空store/空元数据缓存裸名安装已通过。

账号识别从“最后图片/祖先textContent截断”改为footer-v1证明：限定侧栏底部独立行的有界几何、唯一头像与独立昵称叶；祖先包含历史链接/侧栏内容时拒绝，不把100字截断当作身份验证。隐藏track后仅复用同一row/avatar proof；late footer的几何核查只对本插件已确认track做同步visibility:hidden/fixed测量，finally恢复自己的sheet与style，不持续显露网页侧栏、改写账号文本或扩展读取范围。

原生账号区增加可访问group，昵称nowrap/ellipsis/min-width约束与退出按钮flex-shrink防护防止长内容挤压按钮。只呈现已确认公开昵称及固定状态；几何/临时测量与复用证明的全分支仍独立待验。W026该轮为0.1.10，不重复递增。

e031有限实机：官方CLI安装后23/23文件与tgz一致；正常quit确认旧主/Host完全结束，再开新main35411/Host35429，无再次填写登录。CHAT原生create-enabled=true，设置账号group nickname-length=4、sidebar-text=false、logout-size=86×38，固定已登录/已记住网页登录/简体中文齐全。关闭设置后修正临时AX URL的系统类型桥接，自有guest官网origin确认true，native-nav-buttons=103、original-new-buttons=0，新建enabled=true；此固定布局未显示重复新建入口，不扩大为全部SPA过渡、fallback与late footer分支通过。未读凭据、登录表单或正文，未执行退出账号；完整证据见[handoff](handoff.md)。

## 历史：W024插件自己的网页登录授权（2026-10-11，DSH隔离规则由W025替代）

此前“Browser 内存分区意味着只能改宿主”的结论被修正：`ctx.credentials` 已能持久保存插件自己的 grant；完整网页 Session 与最小授权恢复不是同一能力。

- `src/website-session.ts` 只在当前批准 guest 的 `https://chat.deepseek.com` origin 处理 `userToken`、`__appKit_userInfo` 的 id、`deepseek-device-id:chat`。token/id wrapper 限定 `__version:'0'`，三字段有严格 schema/大小界限；不枚举 storage，不复制 Cookie、IDB、聊天缓存或 MFA 数据。此格式来自官网当前公开 bundle，不是官方稳定 OAuth API。
- `src/website-session-store.ts` 使用官方 `credentialKey` 和 `ctx.credentials.readRecord/modifyRecord/deleteRecord`，key 为 `dsh-chat/website-<可信DSH账号SHA256>`。record 是带固定 origin、版本与可信账号栅栏的 `kind:'grant'`；串行读写清除，并在等待官方写锁前后检查 accountId/epoch/AbortSignal。不会读取 DSH 平台 record 或其他插件 grant。
- `src/protocol.ts` 为三项内部调用声明 strict descriptors；Client/Host 重新确认 DSH 授权及代次。grant 不进入对外 UI snapshot、ConfigForms、模型服务、日志或动态错误消息。官网 userId 不用于断言两处账号相同。
- `src/web-surface.tsx` 正常登录且官网就绪后保存最小 grant；新 guest 只在固定 origin 恢复一次并 reload，由官网自身 bootstrap/current-user 处理验证和历史。不覆写现有格式有效的官网 token。写入 storage 或保存 record 不作为恢复成功证明。
- 当前 CHAT 退出先等待保存完成并删除对应 grant，再使用官网公开退出操作；保存/删除失败显示固定错误。恢复后仍为登录页/过期时清除候选记录、恢复正常官网登录，不反复恢复失效授权。DSH 授权变化释放旧 guest 并隔离迟到结果，不自动删除其他账号记录。

默认 `credentials-local` Provider 是 mode 0600 的本地文件存储；未确认 Keychain/加密，不能宣称 grant 被本插件加密。授权保存模块已完成生产构建并在真实官网正常登录后显示“已记住网页登录”。三次正常退出均按进程名确认相关进程全部结束，重开后无需再次登录即恢复同一官网账号及简体中文。第2次出现官网“使用环境异常”提示，root仅正常点击X关闭，未自动关闭或掩盖；过期、账号切换、实际退出清除与卸载仍须独立验收。13b2第三次仅认证/中文与启动反馈通过，随后主区显示失败；b4修正版完整重启后再读回原账号已登录、已记住网页登录和简体中文，无需再次登录。凭据 API 与公开 bundle 静态依据见 [references](references.md)，可选宿主草案及剩余限制见 [browser-session-capability](browser-session-capability.md)。

## Client：可逆导航与可达入口

`src/core/mode.ts`集中管理mode与原`activePanelId`（包括null）；模式不受DSH/官网登录状态限制。Client只调用公开`layout.panelInfo.getSnapshot()/subscribe()`和`selectPanel()`，没有Session/core状态写入或盲目close/open右栏。

- 插件自有main按官方布局自然隐藏Harness右栏；手动返回HARNESS或卸载恢复原panel并dispose覆盖项，官网登录退出不触发此模式回退。
- Harness侧栏/navigation原树保留；`sidebar.brand.name`仅替换装饰内容：官方DeepSeek字标（自有SVG视口裁掉HARNESS徽标）及自有锚点。实际按钮是官方additive `shell.overlay`的独立组件；不复制/包装未导出的SidebarRoot。W016新增用户批准的有限侧栏DOM适配，见下一条。
- `src/sidebar-adapter.ts`从自己的品牌元素沿已核对rc.2祖先结构定位侧栏，先识别renderer的data-slot=sidebar.brand.name/display:contents包装，再校验aria-hidden品牌identity、data-window-drag行和直接子级新会话按钮；只加自有前缀临时属性，以flex填满品牌间距、CHAT隐藏插件行/空导航区，捕获原新会话click并转交官网new。官网未就绪/登录页时新建不可用，但模式切换可用；HARNESS恢复原disabled和点击行为，卸载移除属性/监听器并恢复原值。绑定归Client所有，品牌因折叠卸载时仍保持，展开重新绑定、Client卸载撤回。观察范围仅该root的childList，不改Session、私有服务或安装包。未知结构不适配，并提示顶部仍为HARNESS语义；不能称为官方新建接口。
- 品牌owner的aria-hidden/外层New Session仍存在，交互层在该祖先外，提供按键与屏幕阅读器语义。rc.2品牌行24px且会裁剪，锚点为112×24px；完全可见才发布矩形，折叠/裁剪时隐藏，重新可见时恢复。底部和右下角旧入口已移除；正常授权无常驻刷新，故障时在顶部说明并重试。Mac实测通过，Web/Windows外层按钮及其他平台仍需实测。
- 两种模式共用原生SidebarRoot；仅CHAT期间通过slots.inject注册 `sidebar.workspaces`，退出后dispose恢复工作区；owner仅wide/expandSidebar。顶部窗口/品牌/新会话视觉、底部真实settings及背景透明/模糊由原组件持续管理，不创建另一套侧栏。
- W017删除整个网页工具栏。CHAT期间按官方shell.leading契约注册展开/官网新建图标，与rc.2原生HeaderLeadingControls使用同一公开图标、28px尺寸、8px间距和Tooltip；HARNESS/卸载dispose恢复内置项。Mac官方AppFrame仅在全折叠时挂载该Slot。guest矩形扣除官方--dsh-frame-top-clearance，避免overlay遮住原生窗口控制；不硬改核心z-index或窗口按钮。
- 官方settings.section注册持久“CHAT设置”，owner仅close；原设置导航/弹窗继续由DSH维护。新增ui-settings开发类型和manifest依赖，不复制私有组件，也不增加运行时共享模块。设置显示真实官网可见账号、系统语言，CHAT明暗跟随HARNESS当前实际主题，无独立外观选择（2026-10-17替代固定暗色）。
- 原菜单/快捷键仍调用uiWorkspace.startSession，没有公开模式替换回调；W016有限例外仅处理顶部鼠标/键盘激活click及非Mac品牌按钮，列表＋曾可新建，W028将其改为手动刷新，顶部新会话保留。监听主面板离开CHAT后清理覆盖，不改写原导航选择；不能把顶部按钮结果当作菜单/快捷键Session保真。
- 所有注册与 stream 都由 Cordis enclosing effect 管理，末尾清理先恢复 panel，再卸载贡献和 guest。完整 Desktop 卸载恢复还需真实验收。

证据：ui-layout/src/client/service.ts:18–49、AppFrame.tsx:40–42；ui-sidebar/src/client/index.ts:65–99、SidebarRoot.tsx:223–249,304–310；ui-slots/src/index.ts:1241–1246；shortcuts/src/client/native.ts:17–30。

## Desktop：真实网页和文档保活

`src/web-surface.tsx` 使用公开 `dshDesktop.browser` (`protocolVersion:1`) 的 `acquire(workspace)/release(lease)/onOpenRequested()`。公开类型来自 ui-sidebar-browser/types，安装版本也只读确认该桥存在。

1. 申请受主进程批准的 lease/partition。
2. React 在自己的 Slot 组件树创建 `<webview name=lease partition=批准值 src=about:blank#lease>`。
3. 首次dom-ready调用公开原生loadURL加载官网；后续使用Electron公开executeJavaScript运行用户允许的界面适配；新网页登录模块仅有上述固定三项官网授权例外。
4. 网页长期挂载在自己的 additive shell.overlay。自己的 main 占位元素通过 ref/ResizeObserver 报告自身矩形，容器定位到主区；不查询或修改 DSH 核心元素。
5. 手动返回Harness只隐藏容器，再次进入仍是同一文档。设置与对话页共用该guest；DSH退出/账号变化不释放独立官网guest。插件卸载释放guest，异步acquire若已取消则立即release。

官方 main 只挂载当前键，直接把 webview 放入 main 会丢失网页文档，因此采用保活 overlay。布局、保活、晚到 acquire 与释放结果需要 mock 和真实 Desktop 分开验收。

主进程校验lease并强制`sandbox:true`、`contextIsolation:true`、`webSecurity:true`、`nodeIntegration:false`。插件不改安装包、header或安全配置。官网grant由插件根据可信Host profile目录派生的key隔离，credentials文件仍可全局共享；Browser内存分区仅存续当前进程，实际官网身份由网站确认，不共享系统浏览器凭据。

证据：ui-sidebar-browser/src/types.ts:19–26、ElectronWebviewPresentation.ts:52–60；apps/desktop/src/preload-browser.ts:7–31、main.ts:229–235、browser-guests.ts:29–41,72–95。原生 Platform View 只支持 usage/top-up，不用于任意 Chat URL。

## 官网导航适配（W015 / 0.1.1）

`src/website-navigation.ts`为自包含DOM适配函数，经Electron公开webview.executeJavaScript仅在插件持有的批准guest执行。限定HTTPS官方origin及已在页面出现的 `/a/chat/s/<id>` 链接，读取标题/分组/选中路径，不访问正文、Cookie、storage、应用私有全局、凭据或请求接口。没有额外依赖、preload或安全策略修改。

网页导航以窄列几何、真实历史链接、新对话标签及不含编辑器等条件定位；原生列表按页面次序分组，可搜索已加载标题，点击真实页面链接/新建元素，加载更早时滚动原网页列表。W017同时隐藏有宽度的外层导航轨道、将编辑器所在内容列扩展、隐藏无文本的紧凑导航头部，消除占位。首次真实主框架新文档在完成初始布局/暗色前使用preparing样式；已呈现的同文档SPA路由、后台加载及临时节点替换不得再次隐藏全页。guest自有MutationObserver在官网React提交后重做有限适配。最新修正也在官网设置同步失败时解除无限遮罩，保留错误及重试，不假报暗色已完成；恢复验证/登录页加载时保留原生连接与重试入口。13b2第三次复验仅确认加载反馈与认证恢复，后续主区闪烁未通过；b4修正后的有限显示观察见文末。设置同步真实错误/主题超时分支尚无实机故障证据，只完成源码与生产构建核查。此前13b2/b4阶段未增加官网环境提示关闭逻辑；最新用户授权与固定说明适配见文末，此旧范围不覆盖最新实现。未知结构恢复原界面，不裁切视口冒充移入侧栏。

设置适配仅操作官网公开显示的头像菜单、系统设置、通用设置、语言下拉/深色按钮及关闭控件。精确标签支持中英文，自定义ds-select通过公开pointerdown/mousedown展开；读回官网值才确认成功。真实设置错误有期限和重试，不输出内部诊断。设置缓存为自有DOM临时属性，官网登录页/恢复/自身revision变化清空，Host/Client返回值限长并隔离旧请求；退出操作优先于旧读取。CHAT设置仅显示官网公开账号、当前会话退出和系统语言，未登录按钮进入同一guest；不提供完整账号安全/数据管理，不读取Cookie、私有应用状态/API或正文。独立登录模块的固定三key例外与设置DOM范围分开。

W016登录核查：固定deepseek-account-platform默认Platform origin为platform.deepseek.com、inference origin为api.deepseek.com；公开PlatformSession仅用于平台嵌入，Browser acquire由主进程生成进程内隔离partition。未发现面向chat.deepseek.com的官方SSO/凭据交换入口，不能复用Platform token冒充官网登录，也不迁移Cookie。这一阶段尚未实现最小grant保存；W024改用官方credentials保存官网自身授权，同账号三次完整退出重开已通过；这仍不构成Platform到Chat的兑换。

串行DOM读取更新可见导航，仅镜像已加载内容，不主动拉取官网服务器历史；设置与对话页共用官网认证结果，HARNESS普通隐藏不需要导航适配，设置登录/退出仍可访问同一guest。Client限定自身revision、文档代次及已加载链接，旧账号回包不能污染新列表。网页payload过滤origin、大小和类型，标题仅作React文本。确认sign_in后清空旧公开账号/导航并呈现正常登录入口，不回HARNESS、不禁用模式，不以此断言DSH退出或两处账号相同。

历史适配已在Mac真实官网确认分组列表、选择联动和当时的＋新建；W028旧651b正常刷新及单条外部新增场景通过，e76f超时失败保留，0ac/14px完整重开与自然超时重试恢复通过，其他保护分支仍待实机，顶部新会话保留；空账号/官网布局变化、动态加载更多与网页内部账号切换仍需扩展实测。公开webview方法文档及固定Sidebar owner契约见references。

## 构建与边界

W029交付边界：构建、打包和本机检查产出本地可审查成果；npm/npx公开发布必须用户确认当轮验收，再明确给出当轮发布指令后执行，既往授权或Agent自验不触发后续发布，也不提前启动发布登录/2FA。Git提交/推送同样依用户当轮指令，版本递增不授权任一对外交付；完整规则见AGENTS。以下公开包与历史发布记录保留为事实。

W030持久安装边界（2026-10-12）：公开latest/0.1.12正式包现场仍同0ac验收包，升级前desktop却为持久依赖`^0.1.9`、lock解析0.1.9、installed0.1.9。宽范围接受已锁定旧版；npm发布或临时覆盖node_modules不等于profile依赖与lock升级，具体哪次操作恢复旧依赖未确定。正常升级指定`dsh-deepseek-chat@0.1.12`，官方CLI `dsh plugin --profile desktop add dsh-deepseek-chat@0.1.12`更新profile安装。本轮正常CLI exit0，23/23文件同正式包；即使传入`--save-exact`，实际保存仍为`^0.1.12`，不承诺精确依赖。正常quit旧main51380/Host51389并确认全结束，新main52900/Host52916；官方`dsh://open/`恢复主窗后CHAT selected1，主登录145×48且primary=true，刷新入口存在（当前未登录enabled=false符合规则）；设置为纯原生状态页，登录144×43且primary=true，可见AXWebArea1，无设置guest。重启后再次核对manifest依赖`^0.1.12`、lock解析0.1.12、installed0.1.12及23/23文件同公开0ac，安装与当前未登录界面有限复核已完成。未操作登录表单、退出重登或验证本轮登录记忆，不扩充W027历史登录证据。以后升级须按同一profile核对持久依赖、lock解析版本/来源、实际版本/完整分发文件、完整重启真实界面四层；fresh consumer或tgz字节一致只证明相应分发层。本轮不改代码/版本、不重新发布，详细结果见[handoff](handoff.md)。

锁定 Cordis 4.0.4、官方 DSH 包 0.2.0-rc.2、React 18.3.1；TSX 支持，Host ESM、Client 单个 lazy-CJS factory、lib/types 声明。Client 仅共享固定 baseline 模块，第三方 Zod inline；feature 服务只通过 ctx/注入使用。build/check-artifact 校验精确 module requests、Host 依赖声明和单工厂结构，tarball 不含源码开发 harness、依赖或凭据。

当前分发方案：包名/仓库名为dsh-deepseek-chat，预编译lib继续随Git与npm包交付；开发者手动build:plugin、release:prepare与package:plugin，不增加prepare或安装生命周期构建。W028正式发布：旧session60618以done-auth E404结束且未发布；同一0ac包在session10510经用户官方单次2FA后publish exit0，0.1.12正式受理。processing首轮索引仍0.1.11保留为历史；随后匿名专用版本、完整与install-v1索引均确认0.1.12/latest。正式tgz为138225bytes，SHA1 `93c4d881c53c56e871226cb4e048126bd92079e5`、SHA256 `0acaca2e5f6b10f1d8e26100db0d25ab075744ee98ba6c006d4008f618e94e4f`，与验收0ac及canonical包完整字节相同，本机23/23文件一致。

历史W027/0.1.11：2026-10-12用户完成新的官方单次2FA，session34434正常publish exit0；npm处理期间短暂保留旧索引，随后匿名公开完整与install-v1索引均确认0.1.11/latest。正式tgz为136151bytes，SHA256 `0ce1d5c753e85368fa6857fcb005c9b2b80476ed069458b1e5ab58656adc4a21`、SHA1 `cf6e95e2d03fa590b20ef0fc60fe41370a6e288d`，与已验收0ce包完全字节一致，本机已安装23/23文件相同。

历史W026最终e031生产构建与分发检查通过，正式包23files/135131bytes，SHA256 `e0316b056d4683160a7df4aa915d10795e2cf8c6a2df1ed14864014ea8ea845d`、SHA1 `3e9e15715a6e8a213754bbfe5bce3e7de0ddd9a7`。2026-10-12用户完成新的正常npm验证，session24376 publish exit0；匿名完整与install-v1索引均确认0.1.10/latest，正式下载tgz与已验e031本机包完全字节一致。

DSH实际primary Node与内置pnpm11.7.0在独立consumer、空store和空元数据缓存中正常add裸名`dsh-deepseek-chat`，exit0、12包、版本0.1.12，23/23文件与公开包逐字节一致。没有手动allowBuilds/ignore-scripts等policy覆盖，minimumReleaseAgeExclude由pnpm自身添加；finally临时consumer/store/cache全部清理。公开包沿用同字节0ac已确认的重启与真实超时重试证据；其他保护/故障矩阵仍独立待验。本轮未新增或运行单元/浏览器测试，未stage/commit/push；HEAD与origin/main仍086b7abd，源码、lib和README截图待用户自行提交，npm公开不等于Git源码已推送。完整证据见[handoff](handoff.md)。

历史W027/0.1.11：DSH真实primary Node与内置pnpm11.7.0在独立consumer、空store及空元数据缓存中正常add裸名`dsh-deepseek-chat`，exit0、版本0.1.11、12包，23/23文件与公开tgz逐字节一致。无手动allowBuilds或ignore-scripts等policy覆盖；minimumReleaseAgeExclude由pnpm自身添加，临时consumer/store/cache全部finally清理。当时W027 0ce已完成本轮正常GUI退出重登及完整重启恢复，本机保留同字节0ce本地tgz，最终包不重打；无单元/浏览器测试或Git写操作。分发结果不代替其他过期/隔离/异常等独立矩阵，完整证据见[handoff](handoff.md)，npm发布与Git代码推送分别记录。

历史W026/0.1.10安装：DSH真实primary Node与pnpm11.7.0在独立consumer、空store和空元数据缓存中正常add裸名安装12包exit0，实际版本0.1.10，23/23文件与公开tgz逐字节一致。未使用allowBuilds、ignore-scripts等policy覆盖；新包minimumReleaseAgeExclude记录由pnpm自身添加，临时consumer/store/cache在finally全部清理。W026当时本机保留同字节e031本地tgz，不重复安装或GUI验收。该次分发检查不扩大为真实退出/重登/迁移、全部登录过渡或跨浏览器历史一致性通过；该轮未新增或运行单元/浏览器测试，收尾未stage/commit/push，后由用户提交51cf995。

历史W025/0.1.9：仓库改名与origin更新完成，生产构建/类型/产物/分发及fresh DSH pnpm11.7 Git fixture安装12包、文件一致、Host import/lazy Client通过。正式包23files/133326bytes，SHA256 `e82535818456c7b569580c13f555442bd9396d0b1d0f74829ecce9ff606ab710`；正常npm认证/2FA后0.1.9/latest发布成功，短暂0.0.0-stage占位处理完成。公开裸名空store安装23文件一致；首次源码package.json字节断言因pack排版/去除packageManager失败，改用发布tgz基准后23/23通过。官方CLI移除旧dsh-chat及本地0.1.9 tgz后add裸名exit0，desktop依赖^0.1.9、oldInstalled=false，23文件一致；pnpm默认生成minimumReleaseAgeExclude，无人为allow/ignore/bypass。该轮收尾未重启/GUI验收，不能用这些历史结果替代W026实机或分发证据。

依据：[pnpm11.7.0 prepare-package源码](https://github.com/pnpm/pnpm/blob/v11.7.0/exec/prepare-package/src/index.ts#L82)中非空prepare无条件触发构建；prepublish/prepack/publish仅在main文件缺失时触发。Git和GitHub archive均进入同一准备判断，再按packlist取文件。pnpm只判断main是否存在，不验证Client/types/patch/icon完整性，所以发布检查必须覆盖全部声明文件。[npm Git依赖官方说明](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#git-urls-as-dependencies)还将build等脚本视作重构建信号，故采用明确的手动脚本名称，避免把本机pnpm条件推成所有安装器的保证。

旧源码分发记录：此前仓库不提交lib，Git通过自包含prepare构建，DSH pnpm11.7.0需为准确Git身份配置allowBuilds；仅--allow-build不替代该许可。2026-10-10故障及复验保留于handoff/worklog，该路线不再作为当前直装方案。W025交付由用户提交为25fc3a2，W026交付已由用户提交为51cf995并与origin/main一致；W027原生设置0ce已完成本轮正常退出重登及其后重启恢复，加载失败等独立分支仍待，未stage/commit/push。同一0ce包0.1.11正常publish、匿名公开索引/下载一致性与空缓存裸名安装已通过；0.1.10历史分发结果不替代0.1.11检查。

浏览器 Web profile 缺少 Desktop bridge 时保持 Harness 禁用，无未经验证的 iframe 回退。官网公开无凭据 HEAD 返回 429，不能据此断定 iframe 嵌入策略。

## 尚未成立的能力

- 用户已完成一次官网正常登录，登录保存及同账号三次完整退出恢复已验收；其他登录方式、验证码流程、发送及另一浏览器同账号历史一致性仍未验收。
- 网页账号与DSH账号匹配、Chat第三方OAuth交换及网页原生历史API；官网退出自动回HARNESS不是当前需求。
- 卸载/授权变化时未发送网页草稿保留与官网流式取消；插件不能提取或调用这些内部能力。
- 网站下载、设备权限、外部 OAuth 弹窗等受原生 Browser 固定策略限制；当前仅在同 guest 接受官方 Chat HTTPS popup。
- 其他DSH版本、Web iframe、Windows/Linux品牌入口实测及完整屏幕阅读器验收。Mac顶部品牌位置已通过本轮实机检查；剩余项不因typecheck/build/mock通过自动变成支持。

## 历史：W018统一名称与插件图标（2026-10-10，名称由W025替代）

插件包、两端name导出、bundle patch及Typert贡献package统一为dsh-chat；Host/Client同步使用dshChat namespace，注册键和自有DOM标记同用dsh-chat前缀，类型为DshChat*。不保留旧名别名，不同时安装两份插件。包名变更涉及新的browser accountStorageKey，按正常网页登录恢复账号历史，不迁移旧guest凭据。

插件管理图片使用package.json顶层icon=./assets/icon.svg，导出./package.json供官方readPluginMeta发现，并将assets/icon.svg加入files及source-only Git安装fixture。DSH rc.2固定源码明确支持manifest相对路径、自包含SVG和256 KiB上限；不用网页DOM或侧栏Slot替换管理页图标。当前仅静态资源/打包验证，不宣称已安装UI验收。

## 历史：W019精简设置与标题布局（2026-10-10，退出回退由W025取消）

完整四Tab官网设置嵌入实机出现超时/空白，用户明确取消该方案。本轮settings.section只承接原生网页账号昵称、退出当前会话和系统语言。website-settings.ts通过官网公开头像菜单进入General，定位Language控件、修改并读回；错误有期限，不伪造成功。官网语言读写、中文/英文往返及官方language=zh-CN配置落盘已通过本机实测，详细分层证据及产物以handoff为准。禁止以“登出所有设备”替代当前会话退出；确认sign_in后回HARNESS并禁用模式，约1.2秒轮询不等于官方退出事件。

主区使用原官网标题/分享节点，固定同一48px顶行；展开标题左距24px，折叠按插件shell.leading实际右缘加16px横向避让，分享距右缘12px，不增加整行垂直留白。官网实际顶栏含三个按钮，分享除公开标签外还以顶行最右侧图标的限定位置信号识别；标题只定位直接显示选中标题的叶元素，覆盖原居中/截断宽度。展开/折叠实机截图通过。仅从导航选中标题定位页头，不读取聊天正文；分享仍保留官网交互，不自动生成链接。

自有react-dom body portal保持guest/lease身份。登录页呈现在原生设置窗格；已登录时官网通用设置操作在后台进行，原生页只显示上述三个控件。操作期间恢复官网导航布局以保留头像菜单锚点，结束后再隐藏；避免透明guest覆盖原生输入。正常viewport后台操作已实测读写成功；不采用屏幕外位置。热更新可能保留旧Slot/状态引用，安装文件正确不等于当前UI已经运行新代码。

Host Config只有language这一volatile非凭据字段；Client使用configForms唯一entry id dsh-chat，官网确认读回后保存。先恢复保存的语言再允许写入新值，避免guest默认语言覆写偏好；账号代次隔离。ConfigEditor写官方Cordis profile patch，不使用私有settings.json或站点storage。32项单测与15项公开DOM夹具只证明对应分支；官方profile落盘已实测，彻底重启后的恢复仍未复验。

W019时重启登录未修复：公开DesktopBrowserBridge.acquire(workspace)不接受持久选项，主进程生成随机内存partition并强制lease匹配。该限制仍针对完整网页Session；W023后续新增独立官网grant保存候选，不需要修改安装包、User-Agent或安全策略，实际恢复待验。


## W021标题与语言恢复修正（2026-10-10）

website-header由强制全宽flex改为自然宽度block，限定48px顶行与最大宽度省略，清除已识别标题/顶行border、radius与shadow；不改变正文。标记不匹配撤回，已存在的插件样式也更新，避免热更新沿用旧CSS。

Host语言默认zh-CN；Client兼容旧空配置，以中文发恢复命令并等官网确认后保存。新文档空快照/登录页重置偏好恢复代次；带settings的loading是多步设置流程，不重置，避免恢复请求循环。显式system/en继续按保存配置恢复。

本机rc.2实际主进程仍为随机无persist前缀partition并强制lease分区匹配。2026-10-10再次核查官方master d743267388641bc76f17c45ce8b4c231aed1d32c（0.2.1-alpha.2）同样明确Cookie和网页存储无法跨应用重启。这证明完整网页分区不持久，不能推导插件无法保存自己的授权；W023后续候选使用官方credentials，未改宿主或迁移Cookie。


## W022标题编辑状态修正（2026-10-10）

官网重命名用input替换展示文字，旧精确标题匹配不能继续作为唯一锚点。适配器保留确认过的顶行与标题专属包装，编辑框只在公开顶行内识别，不读value；整枝替换时仅通过宽顶行与内容右缘分享恢复。标题包装同样移除圆角/outline，编辑框显示蓝色底线并继续由官网处理改名。观察class/type/contenteditable/role变更，排除插件data/style操作；restore清除新增标记。真实展开/收起点击均保持位置，点击空白结束编辑后恢复标题；Esc在收起状态仍留编辑框，不能当作取消改名证据。


## W023圆角编辑态和登录桥研究（2026-10-10）

标题展示与编辑统一字体属性与文字行盒；顶行48px居中，输入28px外框扣除边框/padding后的20px内容与展示文字一致。恢复6px圆角矩形，只在编辑态出现；左侧补偿边框与内边距，field-sizing可用时按文字自适应。不改变识别边界或官网提交机制。

DSH Host getPlatformSession及原生window.dsh桥能支持同issuer Platform用量/充值，但现公开契约不提供Chat Session兑换。Chat公开启动/授权代码用自己的用户store与Google/微信nonce，不把client_type=DSH当票据转换。未请求私有认证API，不能断言服务器同token必定接受/拒绝。后续优先使用插件自己的官网grant和官方credentials恢复。宿主持久Session源码草案保留为可选备用方案，未批准部署；草案缺口见proposals/persistent-browser/DESIGN.md，当前候选与验收边界见本文W023授权节。


## W024闪烁修正与有限显示验证（2026-10-11）

13b2的加载事件无差别清空导航/隐藏页面，触发Client重置preferencesGeneration，再次ready发preferences并清dark-complete、重遮body。认证和中文能恢复，不能据此判定主区持续稳定。e948是中间构建安装产物，未重启激活即被b4替代，不计为实机通过。

W024当时仅在真实主框架新文档导航及dom-ready重置文档代次/呈现状态；后台与子frame加载、SPA就地路由保留已呈现页面，旧文档异步结果隔离。Client只在明确新文档或sign-in时重置偏好恢复；网站首次ready后保留presented标记。官网设置opening/verify阶段只等待公开值或12秒期限，不重复点击。导航短暂缺失保留已显示页面，5秒仍未恢复则撤回适配并置同文档fallback，后续轮询不会重新遮body或点击compact；当时只允许登录页、真正新文档和显式原网页解除该边界。此永久fallback规则由W026持续安全结构探测替代。b4阶段保留错误反馈与官网环境提示；后续仅关闭用户指定的固定环境说明，其他提示与错误保留。

b4修正版真实完整退出重开后，首段20次、设置关闭后10次仅观察标题和指定置顶行，各段内两区域分别保持一致、未见消失，末样本文字正常；展开/折叠展示与编辑同位置、HARNESS/CHAT往返标题保持，原生CHAT设置读回已登录、已记住网页登录及简体中文。上述只覆盖本次短时状态，不证明长期绝无闪烁；实际故障/主题超时、过期、退出清除、换账号、卸载和消息跨浏览器一致性仍待独立验收。


## W024续步：按最新授权关闭固定环境说明

用户要求去掉每次打开的“使用环境异常”说明，替代此前不自动关闭的范围。`src/website-notice.ts` 只在chat.deepseek.com匹配同一真实dialog的中英文标题与完整固定正文；排除表单、输入和iframe，仅点击它自身唯一可见、启用的X，同一元素点击前标记，避免重复。navigation在确认origin后、restore命令外调用，序列化函数随guest适配执行；由官网自身onClose处理关闭偏好，不改UA/检测，不新增storage白名单，不处理其他安全提示、验证码或认证错误。

依据为此前缓存的官方公共main bundle：Electron/Tauri触发该说明，onClose记录closeUnsafeEnvWarn偏好；DSH完整Browser分区不跨重启保存，所以可能每次出现。本轮公共网页403/不可访问，没有新下载成功或“最新官网源码”承诺。

f3fb874f2ae4包已生产构建安装、四文件逐字节匹配。连续两次正常quit确认相关进程全部退出后重开，均未手动点X，原区域无dialog、官网主界面及指定置顶出现；这是对该固定说明的两次观察，不扩大为网站其他状态通过。第二次重开后的原生CHAT设置已读回原账号已登录、已记住网页登录和简体中文，关闭设置后原标题正常；AX实读false/false，停在展开CHAT原对话。

## W024续步：结构CSS与小控件尺寸（本次有限验收完成）

fc00f27为本次开工基线，沿用0.1.8。`src/styles.ts`品牌控件为外高23px、1px内边距、按钮21px，保持外框5px/按钮4px圆角及段间零间隙；只调整插件自有控件。CHAT系统语言仍由原生select和原onChange处理，12px装饰箭头右距12px、pointer-events:none，保留选择与键盘交互。

标题首帧问题来自依赖已选导航标题文本/分享按钮识别顶栏：官网未缓存对话先呈现skeleton，文本及input分支替换时原节点标记失效。现在以自有`data-dsh-chat-header-native-depth`保存已确认content至官网row的直接深度1..12，持续CSS限定这一结构并排除dialog及其后代；标题文本或Share暂缺不清掉该契约。内容枝可在textarea挂载前识别，替换后的loading/skeleton、静态标题和input从首次绘制即使用同一顶行位置。公开组件类只作为当前网站的有限兼容契约，不是稳定官方扩展接口。

适配保留官网原节点及native DOM handlers，不克隆、替换标题或另造重命名输入框，不读取input值或聊天正文。结构host只定位直属含`._9fcbeda`的桌面`.the-header`，同一已确认行的`._1aa2651.the-header`移动分支保持隐藏。DSInput的`.ds-input__mirror`及后代不被通配布局重置，保留官网隐藏宽度测量；清掉输入包装伪元素的额外边框，圆角只由原生可见input呈现。观察器沿用已确认的折叠横向inset，保留skeleton占位尺寸；restore撤回depth、CSS、inset与节点标记。不增加等待计时或同文档全页遮罩，原有sign-in、showOriginal和同文档unsupported fallback边界保持可达。

788中间包曾把两个直属`.the-header`都显示，产生双标题/移动按钮；ba01021首次导航仍观察为空，均未通过。0085仅用于临时公开类名/几何诊断，诊断代码最终已移除；它们均被cd07替代，不能当成当前成功证据。

cd07已生产构建、官方CLI安装，manifest/Host/Client/icon与本地逐字节一致。44/44代码回归和默认39/39浏览器自动项通过；浏览器覆盖首个rAF的skeleton/title/input、新content无textarea、隐藏移动分支、mirror、折叠与restore。Mac Chrome原生select自动键盘第40项未产生change，没有记作通过，保留为`--manual-keyboard`独立选项；真实DSH中↓+Return选择English、↑+Return恢复简体中文另行实测通过。

真实DSH三个首次打开的冷对话各约4秒，仅采48px公开标题条，分别收到4/3/3个变化帧；第一帧允许为空，标题首次出现直接左上角，未见旧位/双标题。展开编辑11个、折叠编辑10个变化帧中文字没有上移；没有输入或提交新标题。ScreenCaptureKit交付变化帧，不能称完整30fps录像。模式往返、品牌尺寸、设置箭头及关闭设置回空主页通过；此次局部短时观察不保证长期或未来官网结构兼容。

最终正常quit后pgrep无main/Host进程，重开main24116/Host24126；真实CHAT设置确认已登录、已记住网页登录、简体中文，无再次登录。README三图已用最终实机图并不透明打码个人信息；清理30个旧验收/临时文件2544470bytes，保留当前唯一包、lib18、node_modules、有效源码/回归/文档。全部修改仍在本地，详细产物哈希与证据见handoff；过期、退出清除、换账号、卸载、发送/跨浏览器历史及其他平台仍须独立验收。

## 历史：W024预构建仓库分发验收与当时公网边界

root已完成当前源码生产构建和check-distribution。新版check-git-install使用DSH bundled pnpm11.7.0，在独立临时Git source、consumer和全新store中正常安装`git+file://…#sha`，无allowBuilds、无ignore-scripts，12个包安装成功。计划提交的19个lib文件及README/patch/icon与安装结果一致，Host import和lazy Client artifact契约通过；临时fixture在finally清理。历史source-only+prepare+allowBuilds验收保留为旧路线，不与这次证据混用。

Git提交产物带来源码与生成文件可能不一致的维护风险，必须在每次交付前手动release:prepare核查。Git包的文件集、tarball文件集与实际安装的入口分别验收，不能根据pnpm发现main就判定插件可用。本次正常package:plugin已exit0，release:prepare/check-distribution通过，当前唯一23文件包636e1212353e（完整元数据见handoff）。只读审查发现Git检查遗漏源码哈希后，已补verifyDistributionManifest和workspaces/postpack防护，再做fresh pnpm11.7.0 Git复验通过；两个检查拒绝临时副本中的旧源码/prepare hook，缺失Client亦被拒绝，副本已清理。

当前包Host/Client SHA256与此前已验cd07完全相同；本轮只新增分发检查与本地安装证据，未重跑真实界面/登录，不将既有UI结果说成本轮新实测。正常打包及本地Git通过也不代表公网GitHub下载已验证。

远端01e仍为旧源码prepare；本轮同0.1.8、未自动stage/commit/push，用户提交/推送后还需核对公开对应提交是否包含相同预构建文件。URL可直装的完成声明必须以更新后的真实远端和安装证据为准，本地fixture只证明本地候选。

## Windows 品牌 portal 事件边界（2026-10-17，0.1.24）

切换控件的 DOM host 保留在品牌行内、品牌节点之后，继续使用 flex 跟随侧栏布局。该 portal 仍是品牌 Slot 的 React 后代，Windows 品牌 React button 的新会话 onClick 会接收到其合成事件。因此控件根部以 React onClick.stopPropagation 隔离子控件点击；不使用 preventDefault 或 capture 阻止子按钮处理，不修改 ModeController 对真实面板导航的离开语义。DOM 品牌捕获监听保留，只负责 CHAT 点 logo 的官网新建。独立 Chromium 已复现修复前错误并验证修复后行为，Windows 原生客户端仍待验收。

## DSH 0.2.1-rc.1 兼容声明（2026-10-17）

旧manifest的三个DSH host peer精确等于0.2.0-rc.2，新宿主0.2.1-rc.1在导入前即拒绝。新版官方app-boot首先检查engines.dsh，缺省时检查DSH peers。插件对已核对的两个版本显式使用0.2.0-rc.2 || 0.2.1-rc.1，engines与peer保持同一范围；Cordis/Schemastery保留4.0/3.18兼容patch范围，开发期固定本机4.0.5/3.18.5及DSH0.2.1-rc.1。实际客户端仍通过宿主共享模块加载，不内联Cordis/React。新版类型编译通过，宿主sidebar品牌/slot与browser acquire/release/onOpenRequested契约静态一致。跨版本实机状态以handoff为准。

## 0.2.1-rc.2 适配（插件0.2.2，2026-10-17）

显式宿主范围追加0.2.1-rc.2，engines和DSH peers保持一致；开发SDK也升到rc.2。已对照实际安装产物：布局、设置、渲染器和网页容器Client及credentials Host相同；sidebar Client仅构建版本文字变化。因此本轮无需改业务逻辑或Windows portal事件边界，生产构建Host/Client字节保持一致。版本门禁规则也相同，不启用兼容豁免。安装/交互证据见handoff顶部。

## CHAT跟随宿主主题（0.2.3，2026-10-17）

web-surface读取官方ThemePresenter在html.style.colorScheme发布的解析后明暗，兼容body[data-ds-dark-theme]后备；只观察这两个元素的对应属性并比较枚举，变更时复用已有串行导航队列与短期快轮询，不重载guest。每条自有guest命令传入light/dark，并将期望值保留在插件自有DOM标记，内部文档观察器也读取同一值。settings adapter复用公开Theme行的对应按钮、严格读回选中值后写入带目标的theme-complete；废弃单一dark-complete。快速切换撤回旧主题目标的阶段/截止时间，语言和退出不被覆盖；新的主题请求仍有12秒截止时间。首次主题完成参与首屏准备，已呈现文档的主题变化不再隐藏整页。restore/原网页模式清理自有主题标记，fallback保留已确认状态防循环；卸载断开宿主观察器。没有修改网站storage、React私有状态、剪贴板或账号Config。登录页缺少公开设置入口时不改变官网主题逻辑。
