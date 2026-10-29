import { createPortal } from 'react-dom'
import { createElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { BrandWordmark, IconSearchOutlineRegular, IconCloseFillRegular, IconNewChatOutlineRegular, IconPanelLeftOutlineRegular, IconRefreshOutlineRegular, IconLoadingOutlineRegular, IconEllipsisOutlineRegular, IconEditOutlineRegular, IconPinOutlineRegular, IconShareOutlineRegular, IconTrashOutlineRegular, Menu, Modal, Button, Input, IconChevronDownOutlineRegular, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComponentType } from 'react'
import type { StoredEntry } from '@deepseek-ai/dsh-client-ui-slots'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { acquireChatStyles, ensureChatStyles } from './styles.js'
import { translate } from './i18n.js'
import type { WebsiteCommand, WebsiteNavigation } from './website-navigation.js'
import type { ChatLanguage } from './website-settings.js'
import type { WebsiteSession } from './protocol.js'
import type { WindowDragRegion } from './window-drag.js'
import { DEFAULT_SWITCH_PREFERENCES, SWITCH_LABEL_LIMIT, switchLabelWidth, validSwitchLabel, type SwitchPreferences } from './preferences.js'

export type DshChatMode = 'chat' | 'harness'

export interface DshChatViewportRect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** Only in-memory navigation metadata; never message bodies or account secrets. */
export interface DshChatViewState {
  readonly mode: DshChatMode
  readonly modeEnabled: boolean
  readonly authorizationStatus: 'pending' | 'authorized' | 'unauthorized' | 'unavailable'
  readonly availabilityMessage: string
  readonly accountLabel: string | null
  readonly error: string | null
  readonly desktopAvailable: boolean
  readonly webLoading: boolean
  readonly webError: string | null
  readonly accountStorageKey: string | null
  readonly authorizationGeneration: number
  readonly websiteReloadRevision: number
  readonly settingsOpen: boolean
  readonly language: ChatLanguage | null
  readonly websiteAuthenticationStatus: 'loading' | 'signed-out' | 'signing-in' | 'signed-in' | 'signing-out' | 'error'
  readonly websiteAuthenticationRevision: number
  readonly websiteSessionStatus: 'idle' | 'saved' | 'error'
  readonly websiteSessionError: string | null
  readonly viewport: DshChatViewportRect | null
  readonly brandAnchor: DshChatViewportRect | null
  readonly sidebarAdapted: boolean | null
  readonly websiteNavigation: WebsiteNavigation
  readonly websiteNavigationRefreshing: boolean
  readonly websiteNavigationRefreshError: string | null
  readonly showWebsiteNavigation: boolean
  readonly switchPreferences?: SwitchPreferences
  readonly switchPreferencesStatus?: 'loading' | 'ready' | 'unavailable'
  readonly switchPreferencesPending?: boolean
  readonly switchPreferencesError?: string | null
}

export interface DshChatUIBridge {
  getSnapshot(): DshChatViewState
  subscribe(listener: () => void): () => void
  selectMode(mode: DshChatMode): void
  refreshAuthorization(): void
  manageAccount(): void
  beginWebsiteSignIn(): void
  toggleSidebar(): void
  attachViewport(element: HTMLElement | null): void
  updateViewport(rect: DshChatViewportRect | null): void
  updateBrandAnchor(rect: DshChatViewportRect | null, owner?: HTMLElement): void
  attachSidebar(element: HTMLElement): void
  reloadWebsite(): void
  refreshWebsiteNavigation(): void
  reportWebsiteNavigationRefresh(generation: number, state: { readonly requestId: number; readonly refreshing: boolean; readonly error: string | null }): void
  reportWebsiteState(generation: number, state: { readonly loading: boolean; readonly error: string | null }): void
  reportWebsiteNavigation(generation: number, value: unknown, newDocument?: boolean): void
  bindWebsiteNavigation(generation: number, handler: (command: WebsiteCommand) => Promise<void>): () => void
  /** Read-only, current-document geometry; only a CHAT-owned overlay consumes it. */
  readWindowDrag(viewport: DshChatViewportRect): Promise<readonly WindowDragRegion[]>
  bindWindowDragSampler(generation: number, handler: (viewport: DshChatViewportRect) => Promise<readonly WindowDragRegion[]>): () => void
  commandWebsite(command: WebsiteCommand): void
  renameWebsiteConversation(href: string, title: string): Promise<void>
  toggleWebsiteNavigation(): void
  setSettingsOpen(open: boolean): void
  setSwitchPreference?(field: keyof SwitchPreferences, value: string): Promise<boolean>
  logoutWebsite(): void
  loadWebsiteSession(generation: number): Promise<WebsiteSession | null>
  saveWebsiteSession(generation: number, session: WebsiteSession): Promise<boolean>
  clearWebsiteSession(generation: number): Promise<boolean>
  reportWebsiteSessionError(generation: number, message: string): void
}

export interface DshChatBridgeProps { readonly bridge: DshChatUIBridge }

export function useDshChat(bridge: DshChatUIBridge): DshChatViewState {
  return useSyncExternalStore(bridge.subscribe, bridge.getSnapshot, bridge.getSnapshot)
}

export function DshChatStyles() {
  useLayoutEffect(() => acquireChatStyles(document), [])
  return null
}

function PanelIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.5" y="3" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 3v14" stroke="currentColor" strokeWidth="1.4" />
  </svg>
}

/** rc.2's official wordmark includes its HARNESS badge in the SVG artwork.
 * Crop only our own presentation to the DeepSeek lettering (x=26..128). */
function DshChatWordmark() {
  return <svg className="dsh-chat-brand-wordmark" width="102" height="24" viewBox="0 0 102 24" aria-hidden="true">
    <BrandWordmark includeMark={false} size={24} />
  </svg>
}

export function DshChatModeSelector({ bridge, state, compact = false }: DshChatBridgeProps & {
  readonly state: DshChatViewState
  readonly compact?: boolean
}) {
  const description = useId()
  const t = (text: string | null | undefined) => translate(state.language, text)
  const preferences = state.switchPreferences ?? DEFAULT_SWITCH_PREFERENCES
  const icon = preferences.switchStyle === 'icon'
  return <div className={compact ? 'dsh-chat-mode-compact' : 'dsh-chat-mode-wrap'}>
    <fieldset className="dsh-chat-modes" data-switch-style={preferences.switchStyle} data-custom-labels={preferences.chatLabel!=='CHAT' || preferences.harnessLabel!=='HARNESS'} disabled={!state.modeEnabled} aria-describedby={description}>
      <legend className="dsh-chat-sr-only">{t("工作模式")}</legend>
      <button type="button" aria-label={t("CHAT 官网聊天模式")} aria-pressed={state.mode === 'chat'} onClick={() => bridge.selectMode('chat')} title={`${preferences.chatLabel} · ${t('CHAT 官网聊天模式')}`}>
        {icon ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 3.5h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg> : <span className="dsh-chat-mode-label">{preferences.chatLabel}</span>}
      </button>
      <button type="button" aria-label={t("HARNESS 工作区模式")} aria-pressed={state.mode === 'harness'} onClick={() => bridge.selectMode('harness')} title={`${preferences.harnessLabel} · ${t('HARNESS 工作区模式')}`}>
        {icon ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 5-4 5 4 5m8-10 4 5-4 5m-3-12-2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> : <span className="dsh-chat-mode-label">{preferences.harnessLabel}</span>}
      </button>
    </fieldset>
    <span id={description} className="dsh-chat-sr-only">{t(state.availabilityMessage || '选择 CHAT 或 HARNESS 工作模式。')}</span>
  </div>
}

/** Keep interactive controls in the sidebar row, outside its decorative/new-chat brand. */
export function DshChatBrandName({ bridge }: PropsRuntime<'sidebar.brand.name'> & DshChatBridgeProps) {
  const name = useRef<HTMLSpanElement>(null)
  const [controlHost, setControlHost] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const group = name.current
    if (!group) return
    const host = document.createElement('span')
    host.className = 'dsh-chat-brand-control-host'
    const reconcile = () => {
      if (!group.isConnected) { host.remove(); return }
      bridge.attachSidebar(group)
      const outlet = group.parentElement
      const seat = outlet?.getAttribute('data-slot') === 'sidebar.brand.name' ? outlet.parentElement : outlet
      const identity = seat?.parentElement
      const brand = identity?.parentElement
      const row = brand?.parentElement
      if (!identity || identity.getAttribute('aria-hidden') !== 'true' || !brand || !row?.hasAttribute('data-window-drag')) {
        host.remove()
        return
      }
      // Keep the DOM outside the hidden brand/button; React portal events still
      // follow the brand ancestry and are isolated by DshChatBrandControl.
      if (host.parentElement !== row || brand.nextElementSibling !== host) brand.after(host)
    }
    reconcile()
    setControlHost(host)
    const observer = new MutationObserver(reconcile)
    observer.observe(host.parentElement?.parentElement ?? group, { childList: true, subtree: true })
    // Preserve the independent CSSOM recovery needed after plugin reloads.
    // Position, clipping and sidebar animations are entirely browser-owned.
    const styleRecovery = window.setInterval(() => ensureChatStyles(document), 250)
    return () => {
      observer.disconnect()
      window.clearInterval(styleRecovery)
      host.remove()
    }
  }, [bridge])
  return <><span ref={name} className="dsh-chat-brand-name">
    <DshChatStyles />
    <DshChatWordmark />
  </span>{controlHost && createPortal(<DshChatBrandControl bridge={bridge}/>, controlHost)}</>
}

function DshChatAuthorizationNotice({ bridge, state }: DshChatBridgeProps & { readonly state: DshChatViewState }) {
  const t = (text: string | null | undefined) => translate(state.language, text)
  if (!state.error) return null
  return <div className="dsh-chat-authorization-notice" role="status">
    <p>{t(state.error)}</p>
    <button type="button" className="dsh-chat-text-button" onClick={() => bridge.refreshAuthorization()}>{t("重试连接")}</button>
  </div>
}

/** DOM siblings remain React descendants of the Windows New Session brand. */
export function DshChatBrandControl({ bridge }: DshChatBridgeProps) {
  const state = useDshChat(bridge)
  const t = (text: string | null | undefined) => translate(state.language, text)
  return <div className="dsh-chat-brand-control" aria-label={t("dsh-deepseek-chat 模式选择")}
    onClick={event => event.stopPropagation()}>
    <DshChatStyles />
    <DshChatModeSelector bridge={bridge} state={state} />
    <DshChatAuthorizationNotice bridge={bridge} state={state} />
    {state.sidebarAdapted === false && <div className="dsh-chat-authorization-notice" role="alert">{t("当前侧栏不兼容：顶部新会话仍使用 HARNESS。CHAT 请展开官网导航后新建对话。")}</div>}
  </div>
}

function DshChatConversationRow({bridge, item, selected, disabled, onRename, language}: DshChatBridgeProps & {
  item: WebsiteNavigation['conversations'][number]; selected: boolean; disabled: boolean; onRename: () => void; language: ChatLanguage | null
}) {
  const t = (text: string | null | undefined) => translate(language, text)
  const [open, setOpen] = useState(false)
  const pinned = /^(置顶|Pinned|Pin)$/i.test(item.group)
  useLayoutEffect(() => { if (disabled) setOpen(false) }, [disabled])
  return <div className="dsh-chat-conversation-item" data-selected={selected || undefined} data-menu-open={open || undefined}>
    <button type="button" className="dsh-chat-conversation-row" title={item.title} aria-current={selected ? 'page' : undefined} disabled={disabled} onDoubleClick={onRename} onClick={()=>bridge.commandWebsite({type:'open',href:item.href})}>{item.title}</button>
    <Menu open={open && !disabled} portal closeOnPointerLeave onClose={()=>setOpen(false)} anchor={
      <button type="button" className="dsh-chat-conversation-more dsh-chat-icon-button" aria-label={t('更多操作：{title}').replace('{title}',item.title)} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={()=>setOpen(value=>!value)}><IconEllipsisOutlineRegular size={16}/></button>
    } items={[
      {id:'rename',label:t('重命名'),icon:<IconEditOutlineRegular size={16}/>},
      {id:pinned ? 'unpin' : 'pin',label:t(pinned ? '取消置顶' : '置顶'),icon:<IconPinOutlineRegular size={16}/>},
      {id:'share',label:t('分享'),icon:<IconShareOutlineRegular size={16}/>},
      {id:'delete',label:t('删除'),icon:<IconTrashOutlineRegular size={16}/>,danger:true},
    ]} onSelect={action=>{
      setOpen(false)
      if(action==='rename') {onRename();return}
      if(action==='pin' || action==='unpin' || action==='share' || action==='delete') bridge.commandWebsite({type:'conversation-action',href:item.href,action})
    }}/>
  </div>
}

/** Same Modal, buttons, input geometry and IME handling as HARNESS RenameSession. */
function DshChatRenameConversation({bridge, item, onClose, language}: DshChatBridgeProps & {
  item: WebsiteNavigation['conversations'][number]; onClose: () => void; language: ChatLanguage | null
}) {
  const t = (text: string | null | undefined) => translate(language, text)
  const [draft,setDraft] = useState(item.title)
  const [renaming,setRenaming] = useState(false)
  const [error,setError] = useState<string | null>(null)
  const composing = useRef(false)
  const trimmed = draft.trim()
  const blocked = renaming || trimmed===''
  const close = () => {if(!renaming) onClose()}
  const confirm = () => {
    if(blocked) return
    setRenaming(true);setError(null)
    void bridge.renameWebsiteConversation(item.href,trimmed).then(onClose).catch(reason=>{
      setRenaming(false);setError(reason instanceof Error ? reason.message : '重命名失败，请重试。')
    })
  }
  return <Modal open onClose={close} closeLabel={t("关闭")} title={t("重命名会话")} footer={<>
    <Button variant="outline" disabled={renaming} onClick={close}>{t("取消")}</Button>
    <Button variant="primary" disabled={blocked} onClick={confirm}>{t(renaming ? '正在重命名…' : '重命名')}</Button>
  </>}>
    <DshChatStyles/>
    <input className="dsh-chat-rename-input" value={draft} aria-label={t("会话名称")} data-modal-autofocus maxLength={300} disabled={renaming}
      onFocus={event=>event.target.select()} onChange={event=>{setDraft(event.target.value);setError(null)}}
      onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}}
      onKeyDown={event=>{if(event.key==='Enter' && !composing.current && !event.nativeEvent.isComposing){event.preventDefault();confirm()}}}/>
    {error && <div className="dsh-chat-rename-error" role="alert">{t(error)}</div>}
  </Modal>
}

/** rc.2 replays its retained request counter on WorkspaceBrowser remount.
 * Adapt only the view hook; never mutate the host request store or actions. */
export function guardHarnessSearchReplay(entry: StoredEntry): (() => void) | null {
  if (entry.locale !== 'workspace' || typeof entry.component !== 'function'
    || !entry.children?.['sidebar.workspaces.session.menu.item'] || !entry.inject) return null
  const original = entry.component as ComponentType<Record<string, unknown>>
  type SearchState = { searchRequest: number; [key: string]: unknown }
  type SearchHook = <T>(selector: (state: SearchState) => T) => T
  function SearchRequestGuard(props: Record<string, unknown>) {
    const originalHook = props.useWorkspaceShortcuts as SearchHook
    const request = originalHook(state => state.searchRequest)
    const mountedRequest = useRef(request)
    const guardedHook = useCallback<SearchHook>(selector => originalHook(state =>
      selector(state.searchRequest === mountedRequest.current ? {...state, searchRequest: 0} : state)), [originalHook])
    return createElement(original, {...props, useWorkspaceShortcuts: guardedHook})
  }
  function GuardedWorkspace(props: Record<string, unknown>) {
    return typeof props.useWorkspaceShortcuts === 'function'
      ? createElement(SearchRequestGuard,props) : createElement(original,props)
  }
  entry.component = GuardedWorkspace
  return () => { if (entry.component === GuardedWorkspace) entry.component = original }
}

/** Only the middle browsing region changes; the shipped shell and Settings stay mounted. */
export function DshChatChatNavigation({ bridge, wide, expandSidebar }: PropsRuntime<'sidebar.workspaces'> & DshChatBridgeProps) {
  const state = useDshChat(bridge)
  const t = (text: string | null | undefined) => translate(state.language, text)
  const [renameTarget,setRenameTarget] = useState<WebsiteNavigation['conversations'][number] | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const searchRoot = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const closeSearch = () => {setQuery('');setSearching(false)}
  useLayoutEffect(() => {if (wide && searching) searchInput.current?.focus({preventScroll:true})}, [wide, searching])
  useEffect(() => {
    if (!wide || !searching) return
    const outside = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || searchRoot.current?.contains(event.target)) return
      searchInput.current?.blur()
      if (!query.trim()) setSearching(false)
    }
    document.addEventListener('click',outside)
    return () => document.removeEventListener('click',outside)
  },[wide,searching,query])
  const navigation = state.websiteNavigation
  const refreshing = state.websiteNavigationRefreshing
  const refreshDisabled = !state.modeEnabled || !state.desktopAvailable || refreshing || state.webLoading
    || navigation.authenticated!==true || ['signing-in','signing-out'].includes(state.websiteAuthenticationStatus) || navigation.settings?.pending
  const groups = new Map<string, typeof navigation.conversations[number][]>()
  for (const item of navigation.conversations) {
    if (!item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())) continue
    const rows = groups.get(item.group) ?? []
    rows.push(item); groups.set(item.group, rows)
  }
  return <section className={`dsh-chat-navigation${wide ? '' : ' dsh-chat-navigation-rail'}`} aria-label={t("官网对话导航")}>
    <DshChatStyles />
    {renameTarget && <DshChatRenameConversation key={renameTarget.href} bridge={bridge} language={state.language} item={renameTarget} onClose={()=>setRenameTarget(null)}/>}
    {!wide ? <button type="button" className="dsh-chat-icon-button" onClick={expandSidebar} aria-label={t("展开官网对话列表")}><PanelIcon /></button> : <>
      <header className="dsh-chat-navigation-header" data-searching={searching || undefined}>
        <span className="dsh-chat-search-label">{t("对话")}</span>
        <div className="dsh-chat-search-slot">
          <div ref={searchRoot} className="dsh-chat-search" onClick={()=>setSearching(true)}>
            <Tooltip label={t("搜索官网对话")} delayMs={500} disabled={searching}><button ref={searchButton} type="button" className="dsh-chat-search-button" aria-label={t("搜索官网对话")} aria-expanded={searching} onClick={()=>setSearching(true)}><IconSearchOutlineRegular size={searching ? 11 : 14}/></button></Tooltip>
            <input ref={searchInput} className="dsh-chat-search-input" type="text" aria-label={t("搜索已加载的官网对话标题")} placeholder={t("搜索会话名称")} maxLength={300} value={query} tabIndex={searching ? 0 : -1} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape' && !event.nativeEvent.isComposing){event.preventDefault();event.stopPropagation();closeSearch();searchButton.current?.focus({preventScroll:true})}}}/>
            {searching && <button type="button" className="dsh-chat-search-clear" aria-label={t("关闭官网对话搜索")} onClick={event=>{event.stopPropagation();closeSearch()}}><IconCloseFillRegular/></button>}
          </div>
        </div>
        <div className="dsh-chat-search-actions"><Tooltip label={t(refreshing ? '正在刷新官网对话列表…' : '刷新官网对话列表')} delayMs={500}><button type="button" className="dsh-chat-icon-button" aria-label={t("刷新官网对话列表")} aria-busy={refreshing} disabled={refreshDisabled} onClick={()=>bridge.refreshWebsiteNavigation()}><IconRefreshOutlineRegular size={14} className={refreshing ? 'dsh-chat-refreshing' : undefined}/></button></Tooltip></div>
      </header>
      <div className="dsh-chat-navigation-list">
        {refreshing && <p className="dsh-chat-navigation-status" role="status">{t("正在刷新官网对话列表…")}</p>}
        {navigation.authenticated===true && navigation.status==='ready' ? <>
          {[...groups].map(([label, rows]) => <section key={label} className="dsh-chat-conversation-group" aria-label={label}>
            <h3>{label}</h3>
            {rows.map(item => <DshChatConversationRow key={item.href} bridge={bridge} language={state.language} item={item} selected={navigation.selectedHref===item.href} disabled={Boolean(refreshDisabled)} onRename={()=>setRenameTarget(item)}/>)}
          </section>)}
          {groups.size === 0 && <p className="dsh-chat-navigation-status">{t(query ? '没有匹配的对话' : '暂无对话')}</p>}
          {!query && navigation.conversations.length > 0 && <button type="button" className="dsh-chat-text-button" onClick={() => bridge.commandWebsite({type:'more'})}>{t("加载更早的对话")}</button>}
        </> : <p className={`dsh-chat-navigation-status${navigation.status==='sign-in' ? ' dsh-chat-navigation-sign-in' : ''}`} role="status">{t(navigation.status === 'sign-in' ? 'CHAT 尚未登录，请在右侧登录' : navigation.status === 'unsupported' ? '暂未识别官网列表，请使用右侧官网导航。' : '正在加载官网对话…')}</p>}
        {navigation.error && <p className="dsh-chat-navigation-status" role="alert">{t(navigation.error)}</p>}
        {state.websiteNavigationRefreshError && <p className="dsh-chat-navigation-status" role="alert">{t(state.websiteNavigationRefreshError)}</p>}
        {state.websiteNavigationRefreshError==='官网对话列表同步超时，请点击「重新加载」。' && <button type="button" className="dsh-chat-text-button" onClick={()=>bridge.reloadWebsite()} disabled={!state.modeEnabled || !state.desktopAvailable || ['signing-in','signing-out'].includes(state.websiteAuthenticationStatus)}>{t("重新加载")}</button>}
      </div>
    </>}
  </section>
}

/** Measures only this plugin's own element; website content lives in the retained overlay. */
export function DshChatChatPanel({ bridge }: PropsRuntime<'main'> & DshChatBridgeProps) {
  const state = useDshChat(bridge)
  const t = (text: string | null | undefined) => translate(state.language, text)
  const anchor = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = anchor.current
    if (element === null) return
    bridge.attachViewport(element)
    const measure = () => {
      const rect = element.getBoundingClientRect()
      bridge.updateViewport({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      bridge.attachViewport(null)
      bridge.updateViewport(null)
    }
  }, [bridge])
  return <div className="dsh-chat-main-anchor" ref={anchor} aria-label={t("DeepSeek 官网聊天视图")}>
    <DshChatStyles />
    {!state.desktopAvailable && <div className="dsh-chat-unavailable"><h2>{t("需要 DSH 桌面版")}</h2><p>{t("当前环境未提供官方内嵌浏览器能力。")}</p><button type="button" onClick={() => bridge.selectMode('harness')}>{t("返回 HARNESS")}</button></div>}
  </div>
}

/** Same public primitive icons, geometry and tooltip behavior as native rc.2 chrome. */
export function DshChatLeadingControls({bridge}: PropsRuntime<'shell.leading'> & DshChatBridgeProps) {
  const state = useDshChat(bridge)
  const t = (text: string | null | undefined) => translate(state.language, text)
  return <div className="dsh-chat-leading"><DshChatStyles />
    <Tooltip label={t("展开侧边栏")} delayMs={500}><button type="button" aria-label={t("展开侧边栏")} onClick={() => bridge.toggleSidebar()}><IconPanelLeftOutlineRegular size={16}/></button></Tooltip>
    <Tooltip label={t("新建对话")} delayMs={500}><button type="button" aria-label={t("新建官网对话")} disabled={!state.modeEnabled || !state.websiteNavigation.canCreate} onClick={() => bridge.commandWebsite({type:'new'})}><IconNewChatOutlineRegular size={16}/></button></Tooltip>
  </div>
}

function ChatPresentationSettings({bridge,state}: {bridge:DshChatUIBridge;state:DshChatViewState}) {
  const t=(text:string)=>translate(state.language,text)
  const preferences=state.switchPreferences ?? DEFAULT_SWITCH_PREFERENCES
  const enabled=state.switchPreferencesStatus==='ready' && Boolean(bridge.setSwitchPreference)
  const [draft,setDraft]=useState({chatLabel:preferences.chatLabel,harnessLabel:preferences.harnessLabel})
  const previous=useRef({chatLabel:preferences.chatLabel,harnessLabel:preferences.harnessLabel})
  const [menuOpen,setMenuOpen]=useState(false), [saving,setSaving]=useState(false), [saveError,setSaveError]=useState<string|null>(null)
  const savingNow=useRef(false), composing=useRef(false), mounted=useRef(true)
  const headingId=useId()
  const busy=saving || Boolean(state.switchPreferencesPending)
  const dirty=draft.chatLabel!==preferences.chatLabel || draft.harnessLabel!==preferences.harnessLabel
  const valid=validSwitchLabel(draft.chatLabel) && validSwitchLabel(draft.harnessLabel)
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
  useEffect(()=>{
    const old=previous.current
    setDraft(current=>({chatLabel:current.chatLabel===old.chatLabel ? preferences.chatLabel : current.chatLabel,harnessLabel:current.harnessLabel===old.harnessLabel ? preferences.harnessLabel : current.harnessLabel}))
    previous.current={chatLabel:preferences.chatLabel,harnessLabel:preferences.harnessLabel}
  },[preferences.chatLabel,preferences.harnessLabel])
  useEffect(()=>{if(!enabled || busy)setMenuOpen(false)},[enabled,busy])
  useEffect(()=>{if(preferences.switchStyle!=='text')composing.current=false},[preferences.switchStyle])
  const save=async()=>{
    if(!enabled || busy || savingNow.current || composing.current || !dirty || !valid || !bridge.setSwitchPreference)return
    savingNow.current=true;setSaving(true);setSaveError(null)
    try {
      for(const field of ['chatLabel','harnessLabel'] as const) {
        if(draft[field]===preferences[field])continue
        if(!await bridge.setSwitchPreference(field,draft[field]))throw new Error('save failed')
      }
    } catch {if(mounted.current)setSaveError('切换按钮设置保存失败，请重试。')}
    finally {savingNow.current=false;if(mounted.current)setSaving(false)}
  }
  const error=saveError || state.switchPreferencesError
  return <section className="dsh-chat-settings-card dsh-chat-presentation-settings" aria-labelledby={headingId}>
    <div className="dsh-chat-preference-row">
      <h3 id={headingId}>{t('切换按钮')}</h3>
      <div className="dsh-chat-preference-select">
        <Menu open={menuOpen && enabled && !busy} portal minWidthFromAnchor autoFocus align="end"
          className="dsh-chat-style-menu" selectedId={preferences.switchStyle}
          items={[{id:'text',label:t('文字样式')},{id:'icon',label:t('图标样式')}]}
          onClose={()=>setMenuOpen(false)} onSelect={value=>{setMenuOpen(false);if(enabled && !busy && (value==='text' || value==='icon'))void bridge.setSwitchPreference?.('switchStyle',value)}}
          anchor={<Button className="dsh-chat-style-trigger" variant="outline" disabled={!enabled || busy} aria-label={t('按钮样式')} aria-haspopup="menu" aria-expanded={menuOpen && enabled && !busy}
            onClick={()=>setMenuOpen(open=>!open)} onKeyDown={event=>{if(event.key==='ArrowDown' || event.key==='ArrowUp'){event.preventDefault();setMenuOpen(true)}}}>
            <span>{t(preferences.switchStyle==='text' ? '文字样式' : '图标样式')}</span><IconChevronDownOutlineRegular size={16}/>
          </Button>}/>
      </div>
    </div>
    {preferences.switchStyle==='text' && <>
      <hr className="dsh-chat-preference-divider"/>
      <form className="dsh-chat-preference-labels" aria-busy={busy} onSubmit={event=>{event.preventDefault();void save()}}>
        {(['chatLabel','harnessLabel'] as const).map(field=><div key={field} className="dsh-chat-label-editor" data-invalid={!validSwitchLabel(draft[field])}>
          <Input className="dsh-chat-label-input" type="text" value={draft[field]} maxLength={40} style={{paddingInlineEnd:52}}
            aria-label={t(field==='chatLabel' ? 'CHAT 按钮文案' : 'HARNESS 按钮文案')} aria-invalid={!validSwitchLabel(draft[field])}
            disabled={!enabled || busy} onChange={event=>{const value=event.target.value;setDraft(current=>({...current,[field]:value}))}}
            onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}}
            onKeyDown={event=>{
              if(event.key==='Enter' && (event.nativeEvent.isComposing || composing.current))event.preventDefault()
              if(event.key==='Escape'){event.preventDefault();setDraft(current=>({...current,[field]:preferences[field]}))}
            }}/>
          <span className="dsh-chat-label-count" aria-hidden="true">{switchLabelWidth(draft[field])}/{SWITCH_LABEL_LIMIT}</span>
        </div>)}
        <Button className="dsh-chat-label-save" variant="primary" type="submit" disabled={!enabled || busy || !dirty || !valid}>{t(busy ? '正在保存…' : '保存')}</Button>
      </form>
    </>}
    {error && <p className="dsh-chat-settings-error" role="alert">{t(error)}</p>}
    {!enabled && <p className="dsh-chat-preference-note">{t('设置服务尚未就绪，请重启 DSH 后重试。')}</p>}
  </section>
}

export function DshChatChatSettings({bridge,close}: PropsRuntime<'settings.section'> & DshChatBridgeProps) {
  const state = useDshChat(bridge)
  const t = (text: string | null | undefined) => translate(state.language, text)
  const enabled = state.desktopAvailable
  useLayoutEffect(() => {
    if (!enabled) { bridge.setSettingsOpen(false); return }
    bridge.setSettingsOpen(true)
    return () => { bridge.setSettingsOpen(false) }
  }, [bridge,enabled])
  const signIn = () => {
    bridge.setSettingsOpen(false)
    close()
    bridge.beginWebsiteSignIn()
  }
  const navigation = state.websiteNavigation
  const settings = navigation.settings
  const showAccount = enabled && navigation.authenticated===true && !['signed-out','signing-in','signing-out'].includes(state.websiteAuthenticationStatus)
  const logoutError = state.websiteAuthenticationStatus==='error' && /退出/.test(state.websiteSessionError ?? '')
  const accountError = state.websiteSessionError || state.webError || state.error || (state.websiteAuthenticationStatus==='error' ? "暂时无法确认官网登录状态，请重试。" : null)
  const recognitionError = navigation.identityUnconfirmed===true ? navigation.error : null
  const accountName = navigation.accountName || 'DeepSeek Chat'
  const showSignIn = enabled && !recognitionError && ['signed-out','signing-in'].includes(state.websiteAuthenticationStatus)
  const accountBusy = enabled && !accountError && !recognitionError && ['loading','signing-out'].includes(state.websiteAuthenticationStatus)
  return <section className="dsh-chat-settings">
    <DshChatStyles/>
    <section className="dsh-chat-settings-card" aria-label={t("DeepSeek 官网账号")}>
      {showAccount ? <>
        <div className="dsh-chat-settings-account" role="group" aria-label={t("DeepSeek 官网账号")}>
          <div className="dsh-chat-settings-identity"><strong title={accountName}>{accountName}</strong><span className="dsh-chat-settings-badge">{t("已登录")}</span></div>
          <div className="dsh-chat-settings-actions">
            <a className="dsh-chat-settings-external" href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">{t('打开网页端')} <span aria-hidden="true">↗</span></a>
            <Button className="dsh-chat-settings-logout" variant="outline" disabled={!logoutError && (navigation.status!=='ready' || settings?.pending)} onClick={()=>bridge.logoutWebsite()}>{t(logoutError ? "重试退出登录" : "退出登录")}</Button>
          </div>
        </div>
      </> : showSignIn ? <Button variant="primary" onClick={signIn}>{t(state.websiteAuthenticationStatus==='signing-in' ? "继续登录" : "登录 DeepSeek")}</Button> : accountBusy ? <div className="dsh-chat-settings-loading" role="status" aria-busy="true">
        <span>{t(state.websiteAuthenticationStatus==='signing-out' ? "正在退出登录" : "加载中")}</span><IconLoadingOutlineRegular size={14} className="dsh-chat-refreshing"/>
      </div> : null}
      {accountError && <div className="dsh-chat-settings-error" role="alert"><p>{t(accountError)}</p>
        {enabled && <Button variant="outline" onClick={()=>logoutError ? bridge.logoutWebsite() : state.webError ? bridge.reloadWebsite() : bridge.refreshAuthorization()}>{t(logoutError ? "重试退出登录" : state.webError ? "重试网页" : "重试连接")}</Button>}
      </div>}
      {!accountError && recognitionError && <div className="dsh-chat-settings-error" role="alert"><p>{t(recognitionError)}</p><Button variant="outline" onClick={()=>bridge.commandWebsite({type:'snapshot',showOriginal:false})}>{t("重新识别")}</Button></div>}
      {enabled && showAccount && settings?.error && <div className="dsh-chat-settings-error" role="alert"><p>{t(settings.error)}</p><Button variant="outline" disabled={Boolean(settings.pending)} onClick={()=>bridge.commandWebsite({type:'settings-retry'})}>{t("重试同步")}</Button></div>}
    </section>
    <ChatPresentationSettings bridge={bridge} state={state}/>
  </section>
}
