# 开发路线

## 0.2.9 PR #4依赖交付补齐（2026-10-27，npm已发布，Git交付见handoff）

用户已合并并拉取PR #4；版本增一次至0.2.9，根zod4.6.6实际安装、完整重编、类型/分发/兼容/现行Node与虚构浏览器验证、35文件包核验均完成。候选已按用户授权安装并35/35核对一致；随后用户另行明确要求发布，正式f760包仅两份README不同，其余33运行/元数据文件不变，npm完整/install-v1 latest0.2.9及整个公开包核验完成。未新增或虚构实机验收，不重启DSH或将此轮当作完整安全审计；用户随后已明确授权将源码/lib/说明及内部记录一起提交推送main，保持与公开f760分发一致，不另行发布或增号；准确提交由本阶段Git记录定位，远端核验要求与验证分层见handoff顶部。


## 0.2.8 从 0.2.7 重做拖拽（2026-10-27，已发布npm）

- 已按用户要求用正式0.2.7/HEAD4f8a2b4做精确差分，承认旧固定编辑lane及其通过断言有误；原有Portal/保留guest不是新增根因，不擅改原生HARNESS标题。
- 仅CHAT注册稳定单行+实际控件补集洞，离开先同步撤销再释放；原WebSurface不再持有原生拖动状态或上一帧租约。独立单在途读取和请求deadline防迟到，新增重入epoch、冷HARNESS零注册、同步abort-before-release等控制器回归；leading占位独立于官网CSS适配延迟。
- 识别/账号证明、不露官网侧栏与输入遮蔽独立保留；正常guest恢复基线焦点属性。当前验证/产物以[handoff](handoff.md)顶部为准，先验HARNESS与0.2.7一致，再CHAT短长标题/编辑/分享/模式往返；原生OS及跨webview仍待用户自行重启后复验；用户已单独确认安装5c56且35/35同包，随后明确授权发布npm0.2.8；正式eb669包仅更新两份README、其余33文件同候选，公开索引及包核验完成。npm阶段未重装/重启或Git写入；用户随后另行授权提交推送，完整源码与lib随本次Git交付，准确提交及远端核验见handoff。后续新修复从0.2.9开始，Issue作者待更新复验。

## 0.2.8 首轮顶部拖动岛历史（2026-10-26，已被重做方案替代）

- 已实现现有顶部空白的自有drag islands、完整编辑lane/按钮避让、平台/全屏边界及请求有效期；没有新增顶栏高度或移动guest。真实原生拖窗仍待桌面验收。
- 已修复账号证明耦合主区镜像及unknown无期限等待；保留严格footer证明，未知约5秒只给明确错误/重新识别；按2026-10-27纠正始终保留CHAT自有导航，已证安全布局继续可用，否则遮蔽guest，不显示原官网侧栏，弹窗头像拒绝，plaintext-only草稿受刷新保护。10-27修正的14现行契约、55项×5视口/DPR通过，构建分发完成；原shell34项为前阶段结果。
- 0.2.7→0.2.8本轮只增一次；此前a715已安装，但其原侧栏降级被用户否定。10-27修正7f68包已按用户明确选择替换原desktop、34/34同包且持久dependency/lock同hash，未退出/重启、未公开npm或Git提交推送；下一步用户自行重启复验拖窗/编辑/分享/模式往返。Issue #3的具体现场仍需非敏感尺寸/缩放和拒绝分支，不能直接归咎网络或设备；不自动评论/关闭Issue。包与边界见[handoff](handoff.md)。

## 0.2.7 滚动条、Chat设置图标与 rc.3（2026-10-24，已发布npm）

- 用户已要求实施前日记录的两项UI修复，并解决DSH升级rc.3后的不适配；设置单行图标适配已另获明确同意。
- 已移除CHAT列表对宿主滚动条皮肤的覆盖，设置改16px聊天气泡，未知结构/歧义保留原图标，停用清理；不改官网或认证范围。
- 已核对rc.3官方运行契约并将开发SDK精确升级rc.3。兼容声明从逐个RC枚举改为有界的0.2.1发布线，未知0.2.2预发布及以上仍不放行；这不是自动修复接口或永久兼容承诺。
- 用户指出首候选右侧留白缺失，已按宿主2px外间距及原生行尾公式补齐；真实布局链fixture修前0/2px、修后2/2px，行尾均12px。继续同一0.2.7不重复加号。
- 本轮版本0.2.6→0.2.7只增一次；rc.3类型检查、生产构建/分发25编译文件、18版本×4范围矩阵与34项虚构浏览器回归已通过。此前官方安装器更新原desktop且33/33同b6c候选。
- 用户随后明确要求发布npm，0.2.7现已公开：官方完整/install-v1索引latest均0.2.7，公开33文件包同23564正式包；与本机候选仅两份README不同，其余31文件相同。本轮发布未新增构建/测试、实机验收、重装/重启DSH或Git提交推送；正式包及后续边界见handoff顶部。

## 0.2.6 官网与插件语言跟随DSH（已发布npm）

- 已实现的官网Language目标、未知时等待、移除旧偏好与设置页解耦继续保留。
- 用户最新决定恢复插件自有菜单、提示、Chat设置与固定错误的中英文翻译；集中在locale JSON，复用已有DSH语言状态，不恢复语言选择或界面同步卡。
- 用户追加账号卡无头像方案：移除首字母头像，优化昵称/状态与退出按钮的对齐和间距。
- 补译及无头像布局已实现；追加全状态说明清理与纯加载反馈后的bbf9候选已构建、分发核对并安装原desktop，32/32文件一致并正常重开。用户已确认当前候选验收合格，最新发布证据见handoff。
- 用户追加未登录状态精简：账号卡移除重复登录说明、保留按钮；侧栏使用指定短句并水平居中。已由bbf9统一方案覆盖，已由用户验收。
- 用户再次要求统一启动/加载状态：整组状态标题/说明与重新识别提示彻底删除，加载用“加载中＋后置转圈”的非交互状态，实际错误可重试。bbf9候选已安装并重开，已由用户验收。
- 已完成npm网页登录及本次2FA，沿用bbf9验收包publish退出0；完整索引/install-v1的latest均0.2.6，公开32文件tgz字节及SHA256同验收包。无新增测试、新环境或Git操作；后续修复递增0.2.7。

## 当前：分享按钮定位修复（2026-10-21）

从已恢复的0.2.4实施两处CSS调整，补丁版本0.2.5仅加一次；现有desktop配置安装后，用户已确认本轮修复并授权npm发布。0.2.5已公开，匿名latest和下载包哈希均确认与验收包一致。此前整套官网顶部还原已取消，不带入其源码、文档或测试改动。Git源码与lib仍待用户自行提交推送；交付证据见handoff。

当前检查W030（2026-10-12）：公开0.1.12包仍同验收0ac，用户desktop此前实际加载旧0.1.9已确认。官方CLI指定0.1.12安装成功，完整退出重开后持久依赖/lock/installed仍为`^0.1.12`/0.1.12/0.1.12，23/23文件同正式包；当前未登录界面的蓝色登录按钮、刷新入口和纯原生CHAT设置已确认。本轮未重新登录或验证登录记忆，具体恢复旧依赖的操作未知；仅修正实际安装和升级说明，不改代码/版本或再次公开发布。有限结果见[handoff](handoff.md)，以下W028为历史阶段。

历史交付W028：2026-10-12，W028 / 0.1.12，仅从0.1.11递增一次，开工HEAD与origin/main为086b7abd01ed82b1b44aeafdb3de5d617c9d9a98。最终0ac/14px包构建/分发、pack/CLI安装23/23一致；quit旧50867/50878结束后重开51380/51389无需重登，官网999×820/nav103/compact0/originalNew0/已保存。实际刷新自然30秒超时后中文提示和右侧可用“重试网页”出现，正常点击无需重登恢复导航、刷新可用与记忆，两处错误清除、首页URL哈希保持；最终真实超时→重试流程通过。单条外部新增实证来自旧651b的同一manual reload核心，100行匿名指纹added=1/removed=1，未输出标题/正文；e76f无重试入口失败保留历史，651b/e76f不发布。其他保护/故障矩阵仍待，同一0ac包正常发布0.1.12，匿名版本/两索引、下载同包及空store/空元数据裸名安装12包、23/23文件一致通过；无单元/浏览器测试，未stage/commit/push，源码/lib/README截图待用户提交，进度见[handoff](handoff.md)。

历史交付W027 / 0.1.11：最终0ce构建/分发/正常pack/官方CLI安装23文件一致，本轮正常GUI流程通过：设置真实退出后的登录按钮经Owner close自动关闭设置，主CHAT同一guest999×820正常登录，用户完成后nav103/create=true/originalNew0/compact0/sessionSaved自动恢复。再次完整退出确认44883/44897结束，45240/45249重开无需登录，仍列表103/create=true/compact0/已保存。npm已正常重新登录，whoami=xingxingbk；用户完成官方单次2FA，同一0ce包publish session34434 exit0。匿名完整与install-v1索引均确认0.1.11/latest，公开下载与已验收0ce包完全一致，DSH内置pnpm11.7.0空store/空元数据缓存按裸名安装0.1.11及23/23文件一致通过。无单元/浏览器测试或Git写操作，其他独立矩阵仍待。

## W028当前工作与验收边界

1. 列表旁“＋”改14px手动刷新图标（由16px缩小），保留顶部“新会话”；现有DOM轮询仅反映已加载官网内容，外部网页新增历史需要正常重载官网获取。
2. 专用refresh命令由surface拦截，在当前URL正常reload同一guest，保留lease及guest生命周期代次；busy/error/pending反馈、防连点，仍由公开官网恢复导航。
3. 未发送输入仅在自有guest内判空并返回枚举，不传/存编辑器文本；已识别生成中、登录/退出及settings pending也先暂缓。没有插件草稿备份，不把授权状态更新的草稿保留承诺扩展到整页重载；不自动定时或focus reload，不调用私有API。公开生成识别仅限精确Stop标签、aria-busy及disabled/readonly字段等已知信号，不宣称所有匿名生成控件或附件都有保护；这些保护分支仍待独立实机。
4. 0.1.11→0.1.12已仅递增一次；最终已验收包`artifacts/dsh-deepseek-chat-0.1.12-0acaca2e5f6b.tgz`为138225bytes，SHA256 `0acaca2e5f6b10f1d8e26100db0d25ab075744ee98ba6c006d4008f618e94e4f`、SHA1 `93c4d881c53c56e871226cb4e048126bd92079e5`，Client SHA256 `46a6041d6c144746b485d03809ea1aff6f6a6c5591b314f76309b500df4d3e72`，Host与W027相同，刷新图标14px。生产build/check-distribution、18编译文件/4模块lazy-CJS、正常pack和官方CLI安装exit0，23/23文件与0ac包一致；正常quit50867/50878后pgrep exit1确认结束并normal open51380/51389，无需重登，最终真实超时重试恢复通过。
5. 旧651b/16px候选138016bytes，SHA256 `651b67307c03041f6717d9038e06eccb60722faf8f1e4dd916fcdea1f99b627b`、SHA1 `50f68e0a4c6c3b3581748b25c1589d6511697c75`，已构建安装23/23一致，正常重开无需登录及busy→enabled循环通过，但不是最终候选且不发布。用户在外部网页新增一条对话后，未重启DSH，插件自有列表刷新前后均100行，匿名SHA行指纹比较added=1/removed=1；官网最多加载100行，置顶首行保持。正常刷新完成后enabled=true、官网999×820/nav103/originalNew0/compact0/sessionSaved，首页URL哈希仍7ea330；只比较匿名指纹，不输出标题/正文。该单条外部新增场景实机通过，不扩大为全部历史或多条/分页同步保证。
6. e76f真实再次reload后30秒timeout，busy=false、nav2、列表refresh disabled且无重试入口；失败记录保留，旧包不发布。0ac最小恢复：timeout仅在request identity及auth/generation仍有效时结束刷新，给出中文明确入口并report(false, webError)，使既有右侧“重试网页”入口可用。Client reload清理旧requestId/error，surface取消旧timer；旧await/catch按request身份和docrevision隔离，迟到真实ready只清对应timeout，不覆盖后来错误。源码/构建与最终实际自然超时重试恢复通过。0ac正常重开51380/51389无需重登，官网999×820/nav103/compact0/originalNew0/sessionSaved。实际refresh出现busy=true/disabled及nav2 loading；官网自然再次30秒超时后busy=false，显示“官网加载超时，请点击「重试网页」。”，原生retry-web enabled=true。正常AXPress重试后无需重登，恢复999×820/nav103/compact0/originalNew0/sessionSaved、refresh enabled=true/busy=false，两处旧错误清除，首页URL哈希仍7ea330。该真实超时→重试恢复流程通过，没有故障注入，不承诺每次刷新都在30秒内完成。其他保护/故障分支仍待验，旧651b/e76f不发布；同一0ac包0.1.12正式公开，匿名版本/两索引及下载同包、空缓存裸名安装12包和23/23一致通过，无单元/浏览器测试或Git写操作。
7. 本轮14px真实截图已核视并替换`docs/images/chat-overview.png`，1600×1025 RGB；个人对话行和账号均用实色遮挡，底部一处clip残露已扩大mask修正，合格图无元数据且原始截图已删除。截图用于视觉与打码检查；0ac恢复实证见第6项。

## W027历史工作与验收边界

1. 最新要求替代设置内signing-in官网viewport：CHAT设置完全原生账号/状态/语言/退出/登录，Client/WebSurface独立settingsOpen boolean协调正常尺寸的后台guest，不再嵌入或缩小官网。
2. 设置与主区共用蓝色最小144×40px登录主按钮；设置点击以官方Props.close()关闭settings并总select chat，主CHAT同一guest完成正常官网登录，两处读取同一已确认profile投影与status/revision。
3. compact/footer证明保持受限公共行/有界几何，不因mobile失败放宽；recovering提前fallback前只正常展开一次，完整footer/list/布局确认才ready。API Key/Bearer公开接口不代用官网登录；本次未找到Chat账户查询公开契约，不模拟私有接口，依据见[DeepSeek官方API文档](https://api-docs.deepseek.com/api/deepseek-api/)。
4. 当前正式0ce包136151bytes、SHA256 `0ce1d5c753e85368fa6857fcb005c9b2b80476ed069458b1e5ab58656adc4a21`，构建/分发、正常pack/官方CLI安装exit0，23/23文件一致。完整退出旧43609/43621后重开44883/44897无登录输入，导航/保存与原生设置账号/中文恢复；设置父级仅1 WebArea、无可见嵌入官网。实际logout后仅signed-out card/login144×43px，无旧账号/残线、模式可用；设置login Props.close()自动关设置并到主CHAT999×820、无设置heading。用户已完成新路线正常登录，nav103/create=true/originalNew0/compact0/sessionSaved自动恢复；再次完整quit旧44883/44897结束后45240/45249重开无需登录，仍列表103/create=true/compact0/已保存，本轮正常GUI流程通过。正常重新登录及用户官方单次2FA后，同一0ce包publish session34434 exit0；0.1.11不再增，匿名完整与install-v1索引0.1.11/latest、公开下载同包及DSH pnpm11.7.0空store/空元数据缓存裸名安装12包、23/23文件一致均通过，无单元/浏览器测试或Git写，其他独立矩阵仍待。
5. c041中间包经SHA核对已清理，主页面登录/设置退出有限证据与失败记录保留历史，settings重登564×480/mobile、unsupported/native2/create=false为失败；手动关闭设置恢复桌面导航只用于保留用户会话，不当新方案验收。仅保留当前包及有效回退，AXManualAccessibility已恢复false。最新进度和加载失败/profile隔离/过期/迁移/换账号/卸载/跨浏览器历史剩余矩阵见[handoff](handoff.md)。

历史交付W026 / 0.1.10：最终e031严格footer-v1/布局包已完成构建/分发与官方CLI安装23/23文件一致；正常quit确认旧主/Host结束后重开，无再次填写登录。原生create-enabled=true，账号group昵称长度4/无侧栏文字/退出按钮86×38，固定已登录/已记住网页登录/简体中文齐全。修正临时AX URL的系统类型桥接后，自有guest官网origin确认，native导航103按钮、官网原新建按钮0，新建可用；固定布局未显示重复新建入口。用户完成新npm验证后publish exit0，公开完整与install-v1索引确认0.1.10/latest，正式下载与e031同字节；DSH pnpm11.7.0空store/空元数据缓存按裸名安装12包、版本0.1.10及23/23文件一致通过。本机保留同字节e031本地tgz，不重复安装或GUI验收；该轮未新增或运行单元/浏览器测试，收尾未stage/commit/push，后由用户提交51cf995，不声明全部官网流程验收通过。

## W026历史修复与验收边界

1. 首次导航结构识别保留5秒宽限，fallback持续安全结构探测；只有sidebar、新对话、layout/content完整确认后恢复适配，替代同文档永久fallback规则，避免重复遮罩/compact点击/重开guest。
2. unknown、暂缺导航或profile不推断官网登出；profile出现后才读取设置/恢复偏好，结构未识别提示与网络连接错误区分，旧授权异常按代次/生命周期隔离。
3. 前候选构建/分发与安装核对、正常登录后的固定状态已有证据；后续账号卡改为footer-v1独立行/唯一头像/昵称叶的有界几何证明，移除lastimg与祖先textContent截断，隐藏后复用同一row/avatar proof，latefooter只同步测量已确认track并finally恢复sheet/style。
4. 原生账号group与nowrap/ellipsis/flex-shrink修正已在最终e031做有限检查：账号昵称4字且不含侧栏文字、退出按钮86×38；一次正常退出重开后的固定登录/记忆/中文、新建可用已确认。临时AX URL的类型桥接修正后，自有guest官网origin确认，native导航103按钮、官网原新建按钮0，固定布局未显示重复新建入口；完整过渡/异常/退出重登/迁移矩阵仍待验，详见[handoff](handoff.md)。0.1.10正常npm发布与公开索引/下载、独立consumer/空store/空元数据缓存裸名安装已通过，23/23文件与公开tgz一致；无allowBuilds/ignore-scripts等policy覆盖，临时consumer/store/cache全部清理。本机不重复安装同字节包或GUI验收；同轮不涨号，全部单元/浏览器测试未跑。

历史交付W025 / 0.1.9，基线f2c1277。独立官网登录、取消退出禁用/强制HARNESS、同一guest与status/revision、后台保存及退出barrier已实现。仓库改名/origin更新、npm正式0.1.9/latest发布、最终候选构建/分发与fresh Git检查完成；公开DSH pnpm11.7.0裸名空store安装12包、23文件与tgz一致及Host/lazy Client通过；本机CLI裸名^0.1.9、旧插件不存在且23文件一致。该轮收尾未重启/GUI验收，本次用户故障反馈不推翻分发检查，也不能以分发检查宣称官网问题通过。详见[handoff](handoff.md)。

## W025既有规则与分发证据

1. 取消DSH与官网退出后对模式控件的登录禁用：未登录可进入CHAT明确登录入口，保持模式选择；真实聊天权限仍由官网决定。
2. 设置与对话页共用guest和认证快照；官网确认后立即同步公开账号/导航，后台记忆不阻塞显示。退出操作reset旧读取并建立保存/恢复barrier，先清记忆再官网当前会话logout，迟到结果不得覆盖重登。
3. credentials-local默认全局共享文件；新记录由Host可信profileContext绝对dir的SHA256派生为dsh-deepseek-chat/website-<profile目录SHA256>，与DSH账号独立。Client仅拿scope哈希；缺少可信profile不回退共享固定键或DSH账号键。DSH公开稳定id仅为本插件旧key精确迁移使用，不读其他凭据、不影响入口。
4. 外部浏览器Chat授权尚缺公开OAuth/交换契约，不能复用DSH Platform授权或将唤回窗口当作登录完成；当前交付同guest正常官网登录，不宣称服务方永远没有能力。
5. 包/仓库统一新名，lib预编译与无安装构建hook继续保留。最终package:plugin及fresh Git检查通过；23files/133326bytes包SHA256为e82535818456c7b569580c13f555442bd9396d0b1d0f74829ecce9ff606ab710。正常npm认证/2FA后发布0.1.9/latest成功；公开DSH pnpm11.7.0裸名空store安装12包、23文件一致及Host/lazy Client通过；本机CLI已换npm来源^0.1.9、旧插件不存在且23文件一致。默认pnpm自动添加minimumReleaseAgeExclude，未人为allow/ignore/bypass。尚未重启/GUI验收，登录/退出/迁移/重启仍待实机；Git改名不代表0.1.9代码已推送。

以下旧版本的测试、实机及分发结果保留历史；W025取消旧DSH模式门槛，不能照旧验收条件执行新版本。

上一项有限验收：fc00f27开工，cd07d9c360f4包完成品牌23px外高/1px内间距/原圆角、设置箭头右距12px、冷对话标题与原生编辑定位；生产构建、44项代码和39项浏览器自动回归及真实DSH原生select键盘通过。完整退出后官网登录和简体中文恢复，三张README打码实机图更新，30个旧临时文件清理完成。该UI/登录结果不代替本轮分发验收，不保证未来官网改版兼容。

此前阶段W024/0.1.8：13b2前三次认证/中文恢复仍有效，主区闪烁后显示稳定性未通过。b4bb28dde279修正版已构建安装、完整退出重开并恢复指定对话/中文/已保存登录；首段20次、设置关闭后10次受限采样，各段内标题/置顶区域分别保持一致、未见消失，末样本文字正常，展开/折叠、圆角编辑、模式往返及关闭设置后的短时检查已完成。此为有限观察，不保证永久稳定；真实错误/主题超时仍仅静态与构建确认。e948中间包未激活即被替代，不计实机通过。同轮0.1.8不重复加号；b4当时保留官网提示，f3按用户授权只自动关闭固定环境说明，两次完整重启观察通过。DSH→CHAT兑换未找到公开契约；宿主Session草案仍未批准/部署。此前结果不代替本轮验收，分层证据见handoff，以下保留历史。

历史状态：0.1.5候选共用原DSH侧栏，官网导航镜像与有限适配、原生CHAT设置（官网账号/系统语言，固定暗色）已实现。W018的dsh-chat名称由W025替代；数据源继续是DeepSeek网站本身，不把界面适配称为官方历史API，也不做DSH模型加本地对话替代。

## 阶段 0：需求与官方契约

已完成当前需求阅读、固定版本源码与本机公开 Browser 入口核对。安全 DSH 账号资料/观察、Typert strict descriptors、main/layout/Browser lease 契约已核对。无 live Cordis Inspect，不能把静态核查称作 live 查询。

## 阶段 1：构建与安全模式控制

已实现锁定依赖、TSX、Host/browser打包、tarball、模式控制与原panel恢复；历史DSH账号门槛由W025取消，改用官网会话自身代次隔离。旧Core测试只记录对应历史规则，本轮未运行，不能代替当前实现验收。

2026-10-10 修复源码 Git 安装缺少 prepare 的交付问题；普通 pnpm 10 与 DSH bundled pnpm 11 的固定提交构建许可分别复验，保留 tarball 安装路径。真实 Desktop 已确认插件启用及控件显示，这不等于网站验收。

同日用户发现授权持续pending。已补Client独立remote namespace动态注入、初始失败收敛、35秒期限和刷新入口；23项测试含真实插件Context回归通过。当前Desktop授权收敛实测见handoff，官网与完整恢复矩阵仍待验收。

## 阶段 2：真实网页容器候选版

通过Desktop Browser lease创建安全webview；main占位自然隐藏右栏，persistent shell.overlay保留网站文档。仅测自有矩形，手动切换不销毁网页。入口已按2026-10-10截图移至顶部品牌：装饰槽仅放字标/锚点，官方overlay提供独立交互层；移除底部和角落旧入口。Mac鼠标/键盘、折叠、往返、禁用恢复实测通过，其他平台待验证；保留原快捷键限制说明。

使用开发 harness 验证 guest 创建、加载错误、手动切换保活、账号代次销毁和晚到申请清理；harness 不加载真实官网，不把 mock 网页称作真实聊天。

W015取消整个sidebar/shell.leading覆盖，仅CHAT时替换sidebar.workspaces，保留原顶部/材质/账号。官网分组列表、选中联动和＋新建已在本机观察；已允许的网页适配读取范围、fallback和账号栅栏见architecture/AGENTS。27项测试通过，具体最终包与实测以handoff为准。

W016在用户明确批准的有限DSH侧栏例外下，复用原新会话按钮并捕获click转交官网、CHAT隐藏插件行、品牌剩余间距自动填充；移除网页常驻工具按钮与底部提示，保留错误重试/折叠可达入口。本轮0.1.1→0.1.2一次；登录桥核查未找到Chat SSO支持，官网需单独登录。首次实机漏renderer包装已修正并记入worklog，不能只靠简化fixture宣称通过。

## 阶段 3：真实 Desktop 验收

W017按用户登录截图补布局占位、紧凑头部和首屏闪现保护；删除整个插件工具栏，官方shell.leading提供CHAT折叠控件，settings.section提供原生CHAT设置。系统语言通过官网公开UI写回，以实际值确认；用户取消外观选项后固定暗色。当前实机已有登录态的中文/深色、完整设置、折叠/新建、刷新/往返与恢复结果见handoff；不把已有登录态加载当作首次登录完整验收。

在用户自己的 DSH Desktop 安装预构建包；本人在真实官网正常登录，确认验证码和聊天可用，发送一条可识别的非敏感测试对话，再在系统浏览器同账号确认历史。首次通过用户正常网页操作；不采集密码/Cookie，不复制其他浏览器Session。W024仅保存本插件官网guest的三项自身授权白名单，官方credentials托管；用户正常官网登录、确认保存及同账号三次完整退出重开已经独立验收。发送和另一浏览器历史一致性仍待验证。

后续按用户验收授权复查Harness原panel/右栏/Session、同guest往返、设置/对话页退出重登同步和禁用/卸载原UI恢复。DSH退出不得禁用切换器或强制回HARNESS。独立Web profile的Host加载和缺少native bridge限制不能代替Desktop；未取得官方Chat退出事件桥则如实说明使用公开官网结果。

## 阶段 4：原目标的剩余契约

品牌位置、共享侧栏/真实列表和顶部新会话click适配已有历史证据；其他平台、空账号/分页及辅助技术仍待验。原菜单/快捷键需官方模式拦截契约；账号匹配、Chat第三方OAuth与官方历史API分别核实。官网退出不再要求模式回退；现有DOM状态同步不冒充官方账号事件或授权交换，不抓私有API。

## 阶段 5：发布

W029新规则：先交付本地成果供用户验收，用户确认当轮验收后，还须明确告知可以发布npm/npx当轮版本，Agent才进入公开发布及其登录/2FA流程。历史发布指令、Agent检查通过和自动补丁递增不构成后续版本发布授权。Git提交/推送仍由用户手动执行，或用户明确另行要求Agent执行当轮操作。以下W025–W028记录为已发生的历史分发，不作为下次自动发布依据。

W030已有安装升级有限复核完成（2026-10-12）：公开npm latest/0.1.12包现场仍同0ac，升级前desktop依赖`^0.1.9`及lock解析0.1.9、installed0.1.9，与旧界面吻合。官方CLI指定`dsh-deepseek-chat@0.1.12`正常安装exit0，23/23文件同正式包；`--save-exact`实际仍保存`^0.1.12`，仅记录结果。正常退出旧main51380/Host51389并确认结束，新52900/52916恢复主窗后，CHAT选中、主面板蓝色登录按钮、固定刷新入口及纯原生设置卡均确认；当前未登录时刷新禁用符合规则。再次核对持久依赖/lock/installed为`^0.1.12`/0.1.12/0.1.12、23/23同公开包。本轮没有登录表单、退出重登或登录记忆实证，不能扩充W027历史结果；具体哪次操作恢复旧依赖未知。本轮不改代码/版本、不再次公开发布。后续每次已有安装升级均核对持久依赖、lock、实际installed版本/分发文件和完整重启界面，不能仅以tgz相同或fresh consumer成功判定稳定升级。详细结果以[handoff](handoff.md)为准。

W028 / 0.1.12已仅增一次，最终0ac/14px构建/分发、CLI安装23/23及完整重开、实际自然30秒超时→右侧重试恢复通过；旧651b单条外部新增实证与e76f失败保留历史，中间包不发布。W028正式发布：旧session60618以done-auth E404结束且未发布；同一0ac包在session10510经用户官方单次2FA后publish exit0，0.1.12正式受理。processing首轮索引仍0.1.11保留为历史；随后匿名专用版本、完整与install-v1索引均确认0.1.12/latest。正式tgz为138225bytes，SHA1 `93c4d881c53c56e871226cb4e048126bd92079e5`、SHA256 `0acaca2e5f6b10f1d8e26100db0d25ab075744ee98ba6c006d4008f618e94e4f`，与验收0ac及canonical包完整字节相同，本机23/23文件一致。DSH实际primary Node与内置pnpm11.7.0在独立consumer、空store和空元数据缓存中正常add裸名`dsh-deepseek-chat`，exit0、12包、版本0.1.12，23/23文件与公开包逐字节一致。没有手动allowBuilds/ignore-scripts等policy覆盖，minimumReleaseAgeExclude由pnpm自身添加；finally临时consumer/store/cache全部清理。公开包沿用同字节0ac已确认的重启与真实超时重试证据；其他保护/故障矩阵仍独立待验。本轮未新增或运行单元/浏览器测试，未stage/commit/push；HEAD与origin/main仍086b7abd，源码、lib和README截图待用户自行提交，npm公开不等于Git源码已推送。

历史W027/0.1.11：用户在W025已明确授权仓库改名与npm名称发布。当时公开版本为W027/0.1.11；最终0ce已完成本轮正常GUI退出重登及完整重启恢复。npm正常重新登录whoami=xingxingbk，2026-10-12用户完成新的官方单次2FA，session34434正常publish exit0；npm处理期间短暂保留旧索引，随后匿名公开完整与install-v1索引均确认0.1.11/latest。正式tgz为136151bytes，SHA256 `0ce1d5c753e85368fa6857fcb005c9b2b80476ed069458b1e5ab58656adc4a21`、SHA1 `cf6e95e2d03fa590b20ef0fc60fe41370a6e288d`，与已验收0ce包完全字节一致，本机已安装23/23文件相同。DSH真实primary Node与内置pnpm11.7.0在独立consumer、空store及空元数据缓存中正常add裸名`dsh-deepseek-chat`，exit0、版本0.1.11、12包，23/23文件与公开tgz逐字节一致。无手动allowBuilds或ignore-scripts等policy覆盖；minimumReleaseAgeExclude由pnpm自身添加，临时consumer/store/cache全部finally清理。本机已安装同字节0ce本地tgz，不重复安装或GUI验收，最终包不重打。

历史：以下保留W026正式e031生产构建/分发、官方CLI安装及一次完整重启的有限原生观察：2026-10-12用户完成新的正常npm验证，session24376 publish exit0。匿名公开完整与install-v1索引确认0.1.10/latest，正式tgz为135131bytes、SHA256 `e0316b056d4683160a7df4aa915d10795e2cf8c6a2df1ed14864014ea8ea845d`、SHA1 `3e9e15715a6e8a213754bbfe5bce3e7de0ddd9a7`，与已验本机包完全一致。DSH真实primary Node与pnpm11.7.0在独立consumer/空store/空元数据缓存正常add裸名安装12包exit0，版本0.1.10，23/23文件与公开tgz一致；无allowBuilds/ignore-scripts等policy覆盖，minimumReleaseAgeExclude由pnpm自身添加，临时consumer/store/cache全部finally清理。W026当时保留同字节e031本地tgz，不重复安装或GUI验收。

W025的0.1.9发布、fresh Git、公开裸名安装及本机npm来源检查保留为历史；此前fixture源码manifest排版差异及正式23/23基准见[handoff](handoff.md)。W027本轮正常退出→主页面重登及完整重启已通过；其他登录过渡/异常、迁移、过期、跨浏览器发送与历史一致性仍分别待验，分发结果不替代这些独立流程。本轮未新增或运行单元/浏览器测试，Git仍由用户自行提交/推送代码与上下文；未推送不声称跨设备同步，npm发布与Git提交分别记录。

W019范围已由用户收敛：取消完整四Tab和语音，本轮先交付网页账号、当前会话退出和语言切换，并统一标题/分享顶部布局。原生账号、真实语言读写及配置落盘、暗色和标题/分享展开折叠布局已实机确认；退出当前账号入口有回归覆盖，尚未实际登出用户。W019时重启登录尚未修复；后续W023采用插件自身grant候选，完整Session仍受Browser限制。语言偏好保存不能冒充认证恢复。具体产物、尝试与下一步以handoff/worklog为准。


## W024此前下一步：扩大显示观察与剩余独立矩阵

b4修正版已完成一次完整退出重开、首段20次与设置关闭后10次受限采样（各段内标题/置顶区域分别保持一致、未见消失）及展开/折叠编辑、模式往返、设置读回与关闭后追加观察；当前有限检查中未复现闪烁。前13b2包仅认证/中文通过而显示失败，e948只构建安装未激活，不以它们证明当前界面稳定。继续根据用户实际使用扩大时长与官网状态观察；故障/主题超时、过期、当前CHAT退出清除、账号切换、卸载、发送和另一浏览器历史一致性仍待独立验收。b4为闪烁修正历史产物；最新f3固定环境说明已连续两次完整重启观察通过，第二次重开后已读回原账号已登录、saved及简体中文，关闭设置后原标题正常，收尾停在展开CHAT原对话。最终产物与证据见handoff/worklog；文档观察结论更新在打包之后，代码与安装产物一致。未调用私有认证API、不读取DSH/其他插件授权；宿主定制不是当前前置条件，只有插件grant无法覆盖官网策略时再评估备用提案。

## W024本次完成：首帧、尺寸验收与项目整理

1. 集成持久标题结构CSS与小控件尺寸。官网title/input保留原事件；loading/skeleton及新内容枝无需等textarea或导航标题才定位。同文档不增加全页遮罩、延时或重复点击。桌面分支限定、移动分支隐藏、DSInput隐藏mirror及原生编辑外框已修正；788双标题和ba01021空白中间包均未通过，不作为当前产物。
2. 最终cd07生产构建、官方CLI安装及四文件逐字节匹配完成。代码回归44/44、浏览器默认自动回归39/39，包括首个rAF、无textarea、mirror、折叠/restore及品牌23px/21px/1px/原圆角、箭头右12px。Mac Chrome第40项原生下拉键盘自动尝试失败，保留`--manual-keyboard`另项；真实DSH键盘English→简体中文通过，与39项自动证据分开。
3. 真实DSH三个本次启动首次打开的冷对话各约4秒，48px公开标题条4/3/3个变化帧中，第一帧可空而标题首次出现直接左上角；展开/折叠编辑11/10个变化帧中文字没有上移。未输入/提交新标题，不称完整30fps录像。模式往返、品牌尺寸、箭头及设置关闭回空主页通过；正常quit后确认无main/Host进程，重开24116/24126，已登录、已记住网页登录和简体中文恢复。
4. 当前项目说明与交接已同步，README三图已替换为最终实机打码图。验收后删除30个明确旧文件2544470bytes（19个旧tgz、2张duo模拟图、8份临时Playwright记录、根.DS_Store），清理对应空目录；保留唯一当前cd07包、lib18个构建文件、node_modules/锁文件、运行源码、有效脚本/夹具、README图片及仍被引用的备用设计。

以上为本次有限验收完成，代码与文档保留本地供用户自行审查、提交和推送；仓库URL及其他设备不因本机安装成功自动完成更新。后续根据实际使用扩大显示观察，错误/主题超时、授权过期、官网实际退出清除、账号切换、卸载、发送与另一浏览器历史一致性及其他平台仍为独立矩阵；本轮修正不自动完成这些项，也不保证未来官网改版仍兼容。

## 历史：W024分发进度与当时公网边界（名称/发布范围由W025替代）

1. 已准备包含预构建lib的候选，保留dsh-chat包名和0.1.8；撤除prepare及安装生命周期，开发脚本键改为build:plugin，release:prepare与package:plugin仅手动调用。
2. 当前`node scripts/build.mjs`和`node scripts/check-distribution.mjs`已通过；发布者每次提交前继续核查源码/产物对照清单、manifest、files和全部入口，防止lib落后于源码。
3. 新Git检查已用DSH pnpm11.7.0独立临时source/consumer和全新store正常安装git+file固定提交，无allowBuilds/ignore-scripts，12个包安装通过；19个lib及README/patch/icon一致，Host导入和lazy Client契约通过，fixture finally清理。这是本地Git证据，不沿用旧source-only fixture。
4. 正常pnpm package:plugin已exit0，release:prepare/check-distribution通过，当前唯一23文件、130375bytes包636e1212353e，完整哈希见handoff。Git检查补齐源码哈希及workspaces/postpack防护后再次fresh pnpm11.7.0通过；旧源码/prepare hook和缺失Client的负向副本被拒绝并清理。Host/Client与已验cd07相同，本轮未重跑UI/登录。
5. 文档与候选交给用户审查、提交/推送；公开远端01e仍旧prepare。更新后的公开提交/默认分支须实际包含相同lib与metadata，并独立核实远端安装结果后，才能声明复制仓库URL已可直装。

本轮分发只调整交付方式，既有真实官网、登录隔离、界面和未验矩阵保持原边界。当前方案/本地准备完成不等于远端发布完成；npm包发布与改名不在用户本次选择中。

## 0.1.24 Windows 切换修复（2026-10-17）

- 已完成：定位 portal 合成 click 冒泡到非 macOS 品牌新建按钮；在控件根部阻断，保留侧栏行内 flex 和原生导航语义；浏览器复现/回归及生产构建通过。
- 待完成：真实 Windows DSH 的双向切换、不误开空白会话、logo 官网新建、侧栏伸缩及插件开关验收；用户确认后才可另行发布 npm。

## 0.1.25 DSH 0.2.1-rc.1 适配（2026-10-17）

已核对官方安装产物兼容规则及公开SDK，扩大明确支持范围到0.2.0-rc.2和0.2.1-rc.1；新版SDK编译/分发检查通过，官方CLI安装30/30文件一致，正常重开后用户确认按钮可见且切换正常。官网账号、语言与Windows点击边界保持；扩展功能和Windows新版实机仍待后续验收。0.1.25未发布npm，Git留用户手动操作。

## 0.2.2 / DSH 0.2.1-rc.2（2026-10-17）

完成官方安装产物差异核查、SDK与兼容声明升级、构建/分发和本机官方CLI安装；30/30文件一致。业务逻辑保持，正常重开后待用户确认模式切换。未发布npm、提交推送或扩展到未知宿主版本。

## 0.2.3 / CHAT主题跟随HARNESS（2026-10-17）

替代旧固定暗色策略，目标为当前light/dark含system解析结果同步；实现完成、构建/分发与本机安装30/30文件一致。用户已确认本机浅/深色实际页面同步正常；系统变化/快速往返/重启/Windows等仍分开确认。不重建guest、不新增独立主题配置，不发布npm或Git。

### 0.2.3 npm发布补充（2026-10-17）

用户已确认本机浅色/深色同步正常，并明确授权发布。0.2.3原验收包经官方2FA发布成功，公开latest及版本0.2.3、下载包哈希均独立核对一致。插件与npm版本相同；本轮没有Git提交推送。
