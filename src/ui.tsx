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
import { readSurfaceBorderRadius } from './surface-clip.js'
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
  /** Host main-content clip, projected locally; never website or account data. */
  readonly borderRadius?: string
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

/** Icon-mode artwork; swap either SVG to restyle the switcher without touching layout. */
function DshChatModeChatIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M15.4517 8.08872C16.4818 8.79713 17.15 9.85628 17.15 11.0517C17.15 12.2185 16.5171 13.2571 15.5269 13.965C15.5238 13.9672 15.5108 13.979 15.4929 14.0132C15.4756 14.0462 15.458 14.0916 15.4411 14.1504C15.4074 14.2682 15.3811 14.4236 15.3614 14.6034C15.3219 14.9619 15.3108 15.3965 15.3108 15.7762C15.3117 15.8495 15.2983 15.9222 15.2714 15.9904C15.2442 16.0593 15.2038 16.1222 15.1523 16.1754C15.1008 16.2287 15.0393 16.2713 14.9713 16.3008C14.9033 16.3303 14.8302 16.3462 14.7561 16.3474L14.7519 16.3475L14.7477 16.3473C14.6313 16.3427 14.5194 16.3015 14.4279 16.2295C14.1356 16.0036 13.7822 15.7409 13.44 15.5112C13.0949 15.2796 12.7712 15.0886 12.5358 14.9992L12.5325 14.998L12.5294 14.9966C12.4617 14.9673 12.3891 14.9507 12.3154 14.948C11.0561 14.9471 9.90221 14.5545 9.03821 13.9088C9.62451 13.8917 10.1932 13.813 10.734 13.6806C11.217 13.8478 11.754 13.9415 12.3199 13.9415H12.3236C12.5158 13.9462 12.7056 13.9855 12.8839 14.0577L12.8869 14.0588L12.8898 14.0602C13.3975 14.2911 13.8797 14.5738 14.329 14.9035C14.3908 13.8318 14.5776 13.4003 14.9423 13.1481C15.7121 12.5967 16.148 11.8288 16.148 11.0517C16.148 10.4164 15.8747 9.82351 15.4026 9.33989C15.4506 9.08064 15.4754 8.81513 15.4754 8.54468C15.4754 8.39102 15.4674 8.23894 15.4517 8.08872Z" fill="currentColor"/><path d="M8.96956 3.7062C12.1861 3.7492 14.8391 5.86194 14.8391 8.50103C14.8391 11.1664 12.1328 13.295 8.87307 13.2965C8.76928 13.3003 8.6671 13.3234 8.5718 13.3647L8.56965 13.3657L8.5675 13.3665C8.26206 13.4824 7.84905 13.727 7.41575 14.0178C6.98432 14.3074 6.53936 14.6383 6.172 14.9222L6.1719 14.9221C6.07161 15.0012 5.94893 15.0466 5.82131 15.0516L5.81848 15.0517L5.81575 15.0516C5.7344 15.0502 5.65405 15.0328 5.57942 15.0004C5.50483 14.9681 5.43731 14.9213 5.38079 14.8628C5.32425 14.8044 5.27968 14.7352 5.24983 14.6595C5.22 14.5839 5.20539 14.503 5.20676 14.4217C5.20673 13.9449 5.19276 13.3967 5.1428 12.9427C5.11776 12.7152 5.08402 12.5148 5.03977 12.3602C5.01765 12.283 4.99357 12.2197 4.96819 12.1713C4.94235 12.1221 4.91824 12.0942 4.89905 12.0804C3.67527 11.2057 2.90004 9.92754 2.90002 8.4981C2.90003 5.82873 5.60825 3.70239 8.86956 3.70239H8.96956V3.7062ZM8.86956 4.78296C7.51466 4.78296 6.28916 5.20387 5.40452 5.87983C4.51998 6.55574 3.9805 7.48232 3.98049 8.4981C3.98051 9.50695 4.546 10.4945 5.52932 11.199C5.96817 11.5017 6.2027 12.0325 6.27034 13.498C6.75777 13.128 7.27777 12.8031 7.82385 12.5276C7.94507 12.4664 8.06762 12.4077 8.19133 12.3514L8.19319 12.3505L8.19524 12.3498C8.30865 12.3039 8.42596 12.269 8.54553 12.2456C8.65132 12.2248 8.75891 12.2131 8.86711 12.2104H8.86956C10.2244 12.2104 11.4499 11.7888 12.3346 11.1125C13.2192 10.4362 13.7586 9.50945 13.7586 8.49517C13.7586 8.30638 13.74 8.12083 13.704 7.9396C13.6458 7.6465 13.5422 7.36402 13.3985 7.09663C12.6732 5.74741 10.9234 4.78003 8.86956 4.78003V4.78296Z" fillRule="evenodd" fill="currentColor"/></svg>
}

function DshChatModeHarnessIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6.94081 5.95034C6.86877 5.89258 6.78602 5.84964 6.69732 5.824C6.60861 5.79836 6.51571 5.79051 6.42397 5.80092C6.33222 5.81134 6.24344 5.83979 6.16274 5.88466C6.08204 5.92953 6.01101 5.98991 5.95375 6.06235L3.15357 9.56256C3.05416 9.68673 3 9.84104 3 10.0001C3 10.1591 3.05416 10.3135 3.15357 10.4376L5.95375 13.9378C6.07185 14.0762 6.23915 14.1631 6.42022 14.1802C6.60129 14.1973 6.78192 14.1433 6.92385 14.0296C7.06579 13.9158 7.15789 13.7513 7.18065 13.5709C7.20342 13.3904 7.15506 13.2082 7.04582 13.0628L4.59566 9.99659L7.04582 6.9304C7.16107 6.7862 7.2147 6.60231 7.19503 6.41876C7.17537 6.23521 7.084 6.06685 6.94081 5.95034ZM16.8464 9.56256L14.0463 6.06235C13.9281 5.92403 13.7608 5.83711 13.5798 5.82C13.3987 5.80288 13.2181 5.8569 13.0761 5.97063C12.9342 6.08436 12.8421 6.24887 12.8193 6.42931C12.7966 6.60976 12.8449 6.79199 12.9542 6.9374L15.4043 9.99659L12.9542 13.0628C12.8449 13.2082 12.7966 13.3904 12.8193 13.5709C12.8421 13.7513 12.9342 13.9158 13.0761 14.0296C13.2181 14.1433 13.3987 14.1973 13.5798 14.1802C13.7608 14.1631 13.9281 14.0762 14.0463 13.9378L16.8464 10.4376C16.9458 10.3135 17 10.1591 17 10.0001C17 9.84104 16.9458 9.68673 16.8464 9.56256ZM11.1971 4.39624C11.107 4.37672 11.0139 4.37519 10.9232 4.39174C10.8325 4.40829 10.746 4.44259 10.6686 4.49268C10.5912 4.54276 10.5244 4.60765 10.4721 4.6836C10.4199 4.75955 10.3831 4.84508 10.364 4.93528L8.26389 14.7359C8.24014 14.8279 8.23538 14.9238 8.24991 15.0178C8.26443 15.1117 8.29793 15.2017 8.34837 15.2823C8.3988 15.3628 8.46512 15.4323 8.54327 15.4864C8.62141 15.5405 8.70976 15.5781 8.80293 15.5969H8.94993C9.11273 15.6006 9.27169 15.5473 9.39946 15.4464C9.52724 15.3454 9.61582 15.2031 9.64998 15.0439L11.7501 5.2433C11.7716 5.15123 11.7742 5.05578 11.7577 4.96269C11.7413 4.8696 11.7062 4.7808 11.6545 4.70164C11.6028 4.62249 11.5357 4.55462 11.457 4.50213C11.3784 4.44965 11.29 4.41362 11.1971 4.39624Z" fill="currentColor"/></svg>
}

/** Icon-mode control width, measured from the live buttons so CSS stays authoritative. */
const MODE_ICON_SIZE = 20

export function DshChatModeSelector({ bridge, state, compact = false }: DshChatBridgeProps & {
  readonly state: DshChatViewState
  readonly compact?: boolean
}) {
  const description = useId()
  const t = (text: string | null | undefined) => translate(state.language, text)
  const preferences = state.switchPreferences ?? DEFAULT_SWITCH_PREFERENCES
  const icon = preferences.switchStyle === 'icon'
  const wrap = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLFieldSetElement>(null)
  const firstButton = useRef<HTMLButtonElement>(null), secondButton = useRef<HTMLButtonElement>(null)
  const firstLabel = useRef<HTMLSpanElement>(null), secondLabel = useRef<HTMLSpanElement>(null)
  // Fixed-width labels only after the browser has measured real content and
  // available space; nothing here polls coordinates or touches the host shell.
  useLayoutEffect(() => {
    const host = wrap.current, fieldset = group.current
    const firstEl = firstButton.current, secondEl = secondButton.current
    if (compact || !host || !fieldset || !firstEl || !secondEl) return
    const buttons: readonly [HTMLButtonElement, HTMLButtonElement] = [firstEl, secondEl]
    let frame = 0
    const release = () => { for (const button of buttons) button.style.width = '' }
    // A text node's own layout rect reports fractional width even while the
    // label is clipped, so no temporary auto-width pass is needed.
    const textWidth = (label: HTMLElement) => {
      const range = document.createRange()
      range.selectNodeContents(label)
      const width = range.getBoundingClientRect().width
      range.detach()
      return width
    }
    const apply = () => {
      frame = 0
      if (icon) { release(); return }
      const labels = [firstLabel.current, secondLabel.current]
      if (!labels[0] || !labels[1]) { release(); return }
      const style = window.getComputedStyle(buttons[0])
      const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)
      const fieldStyle = window.getComputedStyle(fieldset)
      const inline = (parseFloat(fieldStyle.paddingLeft) || 0) + (parseFloat(fieldStyle.paddingRight) || 0)
      const gap = parseFloat(fieldStyle.columnGap) || 0
      // Fractional text metrics never round a fitting pair into an ellipsis:
      // one pixel of slack is clipped by the pill instead of cutting the label.
      const capacity = Math.floor(host.clientWidth - inline) + 1
      if (capacity <= 0) return
      const iconWidth = Math.ceil(padding + MODE_ICON_SIZE)
      const natural: [number, number] = [textWidth(labels[0]) + padding, textWidth(labels[1]) + padding]
      if (!(natural[0] > 0) || !(natural[1] > 0)) { release(); return }
      const shortIndex = natural[0] <= natural[1] ? 0 : 1
      const shortNatural = Math.max(natural[shortIndex], iconWidth)
      const longNatural = Math.max(natural[1 - shortIndex], shortNatural)
      let widths: [number, number]
      if (capacity >= 2 * longNatural + gap) widths = [longNatural, longNatural]
      else if (capacity >= longNatural + shortNatural + gap) {
        // Shrink only the shorter label; the longer one keeps the shared width.
        const short = Math.max(iconWidth, capacity - gap - longNatural)
        widths = shortIndex === 0 ? [short, longNatural] : [longNatural, short]
      } else if (capacity >= 2 * shortNatural + gap) {
        // Then truncate the longer label while the shorter keeps its own width.
        const long = Math.max(shortNatural, capacity - gap - shortNatural)
        widths = shortIndex === 0 ? [shortNatural, long] : [long, shortNatural]
      } else {
        // Last resort: both equal and both truncated, never below icon-mode width.
        const average = Math.max(iconWidth, (capacity - gap) / 2)
        widths = [average, average]
      }
      for (const [index, button] of buttons.entries()) {
        if (Math.abs(button.getBoundingClientRect().width - widths[index]!) < 0.01) continue
        button.style.width = `${Math.round(widths[index]! * 100) / 100}px`
      }
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(apply) }
    apply()
    const observer = new ResizeObserver(schedule)
    observer.observe(host)
    const fonts = document.fonts
    void fonts?.ready.then(schedule)
    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      release()
    }
  }, [bridge, compact, icon, preferences.chatLabel, preferences.harnessLabel, state.language])
  return <div ref={wrap} className={compact ? 'dsh-chat-mode-compact' : 'dsh-chat-mode-wrap'}>
    <fieldset ref={group} className="dsh-chat-modes" data-switch-style={preferences.switchStyle} data-custom-labels={preferences.chatLabel!=='CHAT' || preferences.harnessLabel!=='HARNESS'} disabled={!state.modeEnabled} aria-describedby={description}>
      <legend className="dsh-chat-sr-only">{t("工作模式")}</legend>
      <button ref={firstButton} type="button" aria-label={t("CHAT 官网聊天模式")} aria-pressed={state.mode === 'chat'} onClick={() => bridge.selectMode('chat')} title={`${preferences.chatLabel} · ${t('CHAT 官网聊天模式')}`}>
        {icon ? <DshChatModeChatIcon/> : <span ref={firstLabel} className="dsh-chat-mode-label">{preferences.chatLabel}</span>}
      </button>
      <button ref={secondButton} type="button" aria-label={t("HARNESS 工作区模式")} aria-pressed={state.mode === 'harness'} onClick={() => bridge.selectMode('harness')} title={`${preferences.harnessLabel} · ${t('HARNESS 工作区模式')}`}>
        {icon ? <DshChatModeHarnessIcon/> : <span ref={secondLabel} className="dsh-chat-mode-label">{preferences.harnessLabel}</span>}
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
      bridge.updateViewport({ left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: readSurfaceBorderRadius(element) })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    const shapeObserver = new MutationObserver(measure)
    // Watch only the main slot's own ancestor chain; never the guest subtree.
    let parent=element.parentElement
    for(let depth=0;parent && depth<12;depth++,parent=parent.parentElement) {
      observer.observe(parent)
      shapeObserver.observe(parent,{attributes:true,attributeFilter:['class','style','data-platform','data-windows-titlebar','data-fullscreen','data-sidebar-collapsed']})
    }
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      shapeObserver.disconnect()
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
      <form className="dsh-chat-preference-labels" onSubmit={event=>{event.preventDefault();void save()}}>
        {(['chatLabel','harnessLabel'] as const).map(field=><div key={field} className="dsh-chat-label-editor" data-invalid={!validSwitchLabel(draft[field])}>
          <Input className="dsh-chat-label-input" type="text" value={draft[field]} maxLength={40} style={{paddingInlineEnd:52}}
            aria-label={t(field==='chatLabel' ? 'CHAT 按钮文案' : 'HARNESS 按钮文案')} aria-invalid={!validSwitchLabel(draft[field])}
            disabled={!enabled} onChange={event=>{const value=event.target.value;setDraft(current=>({...current,[field]:value}))}}
            onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}}
            onKeyDown={event=>{
              if(event.key==='Enter' && (event.nativeEvent.isComposing || composing.current))event.preventDefault()
              if(event.key==='Escape'){event.preventDefault();setDraft(current=>({...current,[field]:preferences[field]}))}
            }}/>
          <span className="dsh-chat-label-count" aria-hidden="true">{switchLabelWidth(draft[field])}/{SWITCH_LABEL_LIMIT}</span>
        </div>)}
        <Button className="dsh-chat-label-save" variant="primary" type="submit" disabled={!enabled || busy || !dirty || !valid}>{t('保存')}</Button>
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
    <section className="dsh-chat-settings-card dsh-chat-account-settings" aria-label={t("DeepSeek 官网账号")}>
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
