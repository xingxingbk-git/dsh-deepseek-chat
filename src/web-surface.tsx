import { createPortal } from 'react-dom'
import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DesktopBrowserBridge, DesktopBrowserReservation } from '@deepseek-ai/dsh-client-ui-sidebar-browser/types'
import { DshChatStyles, useDshChat, type DshChatBridgeProps, type WebsiteNotice } from './ui.js'
import { translate } from './i18n.js'
import { parseWindowDragGeometry, websiteWindowDragScript } from './window-drag.js'
import { emptyNavigation, parseWebsiteNavigation, websiteCommandScript, type WebsiteCommand } from './website-navigation.js'
import { parseWebsiteSession, websiteSessionCaptureScript, websiteSessionRestoreScript } from './website-session.js'
import { handleWebsiteLink, isGeneratedResourceUrl } from './website-links.js'
import { parseWebsiteDownload, websiteDownloadScript } from './website-downloads.js'
import type { WebsiteFile } from './website-downloads.js'
import { holdsWebsiteGuest, resumeWebsiteUrl } from './website-guest.js'
import { DEFAULT_SWITCH_PREFERENCES } from './preferences.js'
import { createWebsiteBootstrap, isExternalAuthUrl, WEBSITE_DESKTOP_WIDTH } from './website-bootstrap.js'

const WEBSITE_URL = 'https://chat.deepseek.com/'

/** Fixed codes only; the page never supplies these strings. */
function noticeText(notice: WebsiteNotice | null | undefined, t: (text: string) => string): string | null {
  switch (notice) {
    case 'link-unavailable': return t('无法打开该链接，请使用浏览器访问')
    case 'download-failed': return t('附件保存失败，请重试')
    case 'download-too-large': return t('附件超过 16 MB，无法保存')
    case 'download-saved': return t('附件已保存')
    case 'download-requested': return t('附件已开始下载')
    default: return null
  }
}

/** Runs entirely in our guest. Only an enum crosses back; no draft text is exported or stored. */
function websiteRefreshReadiness(doc: Document, origin: string): 'ready' | 'draft' | 'busy' | 'unavailable' {
  if (origin!=='https://chat.deepseek.com') return 'unavailable'
  const visible = (node: Element) => {
    const rect=node.getBoundingClientRect()
    const style=doc.defaultView?.getComputedStyle(node)
    return rect.width>0 && rect.height>0 && style?.display!=='none' && style?.visibility!=='hidden'
  }
  for (const field of doc.querySelectorAll('textarea,input[type="text"],input:not([type]),[contenteditable="true"],[contenteditable="plaintext-only"]')) {
    if (!visible(field)) continue
    if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
      if (field.value.trim().length>0) return 'draft'
      if (field.disabled || field.readOnly) return 'busy'
    } else if ((field.textContent ?? '').trim().length>0) return 'draft'
  }
  for (const field of doc.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
    if (field.files?.length) return 'draft'
  }
  const stopping=/^(停止|停止生成|停止回答|停止响应|取消生成|Stop|Stop generating|Stop generation|Stop response|Cancel generation)$/i
  for (const button of doc.querySelectorAll('button,[role="button"]')) {
    if (visible(button) && [button.getAttribute('aria-label'),button.getAttribute('title'),button.textContent?.trim()]
      .some(label=>label && stopping.test(label))) return 'busy'
  }
  if ([...doc.querySelectorAll('[aria-busy="true"]')].some(visible)) return 'busy'
  return 'ready'
}

/** Public Electron methods on our approved, isolated DSH Browser guest. */
interface WebsiteWebview extends HTMLElement {
  loadURL(url: string): Promise<void>
  getURL(): string
  reload(): void
  executeJavaScript(code: string): Promise<unknown>
}

interface ReservationState {
  readonly native: DesktopBrowserReservation
  readonly generation: number
  readonly storageKey: string
}

function headerInset(viewport: {readonly left:number} | null): number {
  return viewport?.left===0 ? Math.max(24,Math.ceil(document.querySelector('.dsh-chat-leading')?.getBoundingClientRect().right ?? 144)+16) : 24
}

/** Read only the product's documented origin-scoped Browser capability. */
export function getDesktopBrowserBridge(): DesktopBrowserBridge | undefined {
  const carrier = (globalThis as typeof globalThis & {
    readonly dshDesktop?: { readonly protocolVersion?: number; readonly browser?: DesktopBrowserBridge }
  }).dshDesktop
  const browser = carrier?.protocolVersion === 1 ? carrier.browser : undefined
  return browser !== undefined && typeof browser.acquire === 'function' && typeof browser.release === 'function'
    && typeof browser.onOpenRequested === 'function' ? browser : undefined
}

/** Stable overlay owner: layout changes reuse the guest; leaving CHAT releases it for DevTools. */
export function DshChatWebSurface({ bridge, nativeBrowser }: PropsRuntime<'shell.overlay'> & DshChatBridgeProps & {
  readonly nativeBrowser?: DesktopBrowserBridge
}) {
  const state = useDshChat(bridge)
  const t = (text: string | null | undefined) => translate(state.language, text)
  const [requestedGeneration, setRequestedGeneration] = useState<number | null>(null)
  const [reservation, setReservation] = useState<ReservationState | null>(null)
  const [recoveryRevision, setRecoveryRevision] = useState(0)
  const [presentationReady, setPresentationReady] = useState(false)
  const [externalSignIn, setExternalSignIn] = useState(false)
  const needsRecovery = useRef(false)
  const previousMode = useRef(state.mode)
  const guest = useRef<WebsiteWebview | null>(null)
  const guestEvents = useRef<AbortController | null>(null)
  const reloadGuest = useRef<(() => void) | null>(null)
  const lastReload = useRef(state.websiteReloadRevision)
  // Released with the guest when CHAT closes; reused to reopen the same conversation.
  const lastWebsiteUrl = useRef<string | null>(null)
  const lastAccountKey = useRef<string | null>(null)
  // Guest ownership depends on account/mode only. Desktop bootstrap belongs to
  // each attached document below, never to viewport-dependent effect callbacks.

  const websiteLifetime = state.switchPreferences?.websiteLifetime ?? 'retain'
  const releaseDelaySeconds = state.switchPreferences?.websiteReleaseDelay ?? DEFAULT_SWITCH_PREFERENCES.websiteReleaseDelay
  const [lifetimeReleased, setLifetimeReleased] = useState(() =>
    websiteLifetime === 'immediate' && state.mode !== 'chat' && !state.settingsOpen)
  useEffect(() => {
    const showing = state.mode === 'chat' || state.settingsOpen
    if (showing || websiteLifetime === 'retain') { setLifetimeReleased(false); return }
    if (websiteLifetime === 'immediate') { setLifetimeReleased(true); return }
    // Delayed: keep the page while the user is likely to come back soon.
    setLifetimeReleased(false)
    const timer = setTimeout(() => setLifetimeReleased(true), Math.max(1, releaseDelaySeconds) * 1000)
    return () => clearTimeout(timer)
  }, [state.mode, state.settingsOpen, websiteLifetime, releaseDelaySeconds])
  const guestWanted = holdsWebsiteGuest({
    mode: state.mode, modeEnabled: state.modeEnabled, settingsOpen: state.settingsOpen,
    authorizationStatus: state.authorizationStatus, accountStorageKey: state.accountStorageKey,
  }, lifetimeReleased)

  useEffect(() => {
    if ((state.mode === 'chat' && state.modeEnabled || state.settingsOpen) && state.authorizationStatus === 'authorized') {
      setRequestedGeneration(state.authorizationGeneration)
      if (previousMode.current === 'harness' && needsRecovery.current) setRecoveryRevision(value => value + 1)
    }
    previousMode.current = state.mode
  }, [state.mode, state.modeEnabled, state.authorizationStatus, state.authorizationGeneration, state.settingsOpen])

  useEffect(() => {
    let stopped = false
    let held: DesktopBrowserReservation | undefined
    setReservation(null)
    setPresentationReady(false)
    setExternalSignIn(false)
    if (nativeBrowser === undefined || state.accountStorageKey === null || !guestWanted
      || requestedGeneration !== state.authorizationGeneration) return
    const generation = state.authorizationGeneration
    const storageKey = state.accountStorageKey
    if (lastAccountKey.current !== storageKey) {
      lastAccountKey.current = storageKey
      lastWebsiteUrl.current = null
    }
    needsRecovery.current = false
    bridge.reportWebsiteState(generation, { loading: true, error: null })
    const release = (value: DesktopBrowserReservation) => {
      void nativeBrowser.release(value.lease).catch(() => { console.warn('dsh-deepseek-chat: website guest release failed') })
    }
    void nativeBrowser.acquire(storageKey).then(value => {
      if (stopped) { release(value); return }
      held = value
      setReservation({ native: value, generation, storageKey })
    }).catch(() => {
      if (!stopped) {
        needsRecovery.current = true
        bridge.reportWebsiteState(generation, { loading: false, error: '无法创建 DSH 内嵌网页，请点击「重试网页」。' })
      }
    })
    return () => {
      stopped = true
      guestEvents.current?.abort()
      guestEvents.current = null
      guest.current = null
      reloadGuest.current = null
      if (held !== undefined) release(held)
    }
  }, [bridge, nativeBrowser, requestedGeneration, state.authorizationGeneration, state.accountStorageKey, recoveryRevision, guestWanted])

  const attachGuest = useCallback((element: HTMLElement | null) => {
    guestEvents.current?.abort()
    guestEvents.current = null
    guest.current = null
    reloadGuest.current = null
    if (element === null || reservation === null || nativeBrowser === undefined) return
    const current = element as WebsiteWebview
    const events = new AbortController()
    guestEvents.current = events
    guest.current = current
    // Remember the last in-site page so releasing the guest on leaving CHAT can reopen it.
    const rememberWebsiteUrl = () => {
      try {
        const url = current.getURL()
        if (resumeWebsiteUrl(url, '') !== '') lastWebsiteUrl.current = url
      } catch { /* the guest is already gone */ }
    }
    current.addEventListener('did-navigate', rememberWebsiteUrl, { signal: events.signal })
    current.addEventListener('did-navigate-in-page', rememberWebsiteUrl, { signal: events.signal })
    const generation = reservation.generation
    let bootstrapped = false
    let lastError: string | null = null
    let navigationRevision = 0
    let documentRevision = 0
    let documentPresented = false
    let restorationAttempted = false
    let restoredFromVault = false
    let restoreDeadline = 0
    let websiteHadSession = false
    let savedSessionFingerprint: string | null = null
    let pendingSessionCapture: Promise<void> | null = null
    let navigationRefresh: { requestId:number; authenticationRevision:number; documentRevision:number } | null = null
    let navigationRefreshTimer: ReturnType<typeof setTimeout> | undefined
    let fastPollingUntil = Date.now()+8000
    let lastPolled = 0
    let lastNavigationStatus: string | null = null
    const finishNavigationRefresh = (error: string | null, request=navigationRefresh) => {
      if (!request || navigationRefresh!==request) return
      navigationRefresh=null;clearTimeout(navigationRefreshTimer);navigationRefreshTimer=undefined
      bridge.reportWebsiteNavigationRefresh(generation,{requestId:request.requestId,refreshing:false,error})
    }
    const report = (loading: boolean, error: string | null = null) => {
      if (loading) lastError = null
      else if (error !== null) lastError = error
      if (!events.signal.aborted) bridge.reportWebsiteState(generation, { loading, error: lastError })
      if (error) finishNavigationRefresh('官网对话列表刷新失败，请检查网络后重试。')
    }
    let documentReady = false
    let websiteWasSignIn = false
    let bootstrapTimedOut = false
    let externalSignInLoading = false
    // Bounded same-document desktop measurements for the first conversation that
    // appears after a headerless start. Only a real start consumes a chance.
    let desktopChromeTries = 0
    const DESKTOP_CHROME_LIMIT = 2
    const bootstrap = createWebsiteBootstrap({
      desktop: enabled => {
        if (enabled) { current.style.opacity = '0'; current.style.pointerEvents = 'none' }
        current.style.minWidth = enabled ? `${WEBSITE_DESKTOP_WIDTH}px` : ''
      },
      timeout: () => {
        if (events.signal.aborted) return
        bootstrapTimedOut = true
        setPresentationReady(false)
        report(false, externalSignInLoading ? '登录页面加载超时，请点击「重试网页」。' : 'CHAT 界面适配超时，请点击「重试网页」。')
      },
    })
    events.signal.addEventListener('abort', () => bootstrap.dispose(), { once: true })
    const resetDocumentPresentation = () => {
      documentRevision = bootstrap.begin()
      documentReady = false
      desktopChromeTries = 0
      bootstrapTimedOut = false
      documentPresented = false
      setPresentationReady(false)
      externalSignInLoading = false
      setExternalSignIn(false)
      bridge.reportWebsiteNavigation(generation, emptyNavigation(), true)
    }
    // about:blank is only the lease attachment. Its events/old bridge snapshots
    // can never count as the new website document being ready.
    resetDocumentPresentation()
    let reading = false
    let queued = Promise.resolve()
    const executeScript = async (script: string) => {
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        return await Promise.race([current.executeJavaScript(script), new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('Website navigation deadline exceeded')), 8000)
        })])
      } finally { clearTimeout(timer) }
    }
    // ThemePresenter writes the resolved scheme, including System, to this public DOM field.
    const hostTheme = (): 'light' | 'dark' => {
      const scheme = document.documentElement.style.colorScheme
      return scheme === 'dark' || (scheme !== 'light' && document.body.hasAttribute('data-ds-dark-theme')) ? 'dark' : 'light'
    }
    const execute = (command: WebsiteCommand) => {
      // Read only the public host font token; keep live changes in DSH settings in sync.
      const value = getComputedStyle(document.body).getPropertyValue('--dsh-content-font-size')
      const size = Number.parseFloat(value)
      return executeScript(websiteCommandScript(command, Number.isFinite(size) ? size : 14, hostTheme(), bridge.getSnapshot().language))
    }
    const active = () => {
      const snapshot=bridge.getSnapshot()
      return !events.signal.aborted && snapshot.authorizationGeneration===generation && snapshot.authorizationStatus==='authorized'
    }
    const approvedOrigin = () => {
      try { return new URL(current.getURL()).origin==='https://chat.deepseek.com' } catch { return false }
    }
    const prepareSession = async (): Promise<boolean> => {
      if(restorationAttempted) return true
      restorationAttempted=true
      const authenticationRevision=bridge.getSnapshot().websiteAuthenticationRevision
      const recoveryDocument = documentRevision
      const sameRecovery=()=>active() && recoveryDocument === documentRevision
        && bridge.getSnapshot().websiteAuthenticationRevision===authenticationRevision
        && !['signing-in','signing-out'].includes(bridge.getSnapshot().websiteAuthenticationStatus)
      try {
        const present=parseWebsiteSession(await executeScript(websiteSessionCaptureScript()))
        if(!active()) return false
        if(present || !sameRecovery()) return true
        const saved=await bridge.loadWebsiteSession(generation)
        if(!active() || !approvedOrigin()) return false
        if(!saved || !sameRecovery()) return true
        const result=await executeScript(websiteSessionRestoreScript(saved))
        if(!active()) return false
        if(!sameRecovery()) return true
        if(result==='restored') {
          restoredFromVault=true;restoreDeadline=Date.now()+15_000
          reloadDocument();return false
        }
        if(result!=='present') bridge.reportWebsiteSessionError(generation,'当前官网未能恢复已保存的登录，请在网页中重新登录。')
        return true
      } catch {
        if(sameRecovery()) bridge.reportWebsiteSessionError(generation,'网页登录恢复暂时不可用，请重试网页；也可以直接登录。')
        return active()
      }
    }
    const captureSession = (requestDocumentRevision: number) => {
      if (pendingSessionCapture) return
      const authenticationRevision=bridge.getSnapshot().websiteAuthenticationRevision
      const sameLogin=()=>active() && requestDocumentRevision===documentRevision
        && bridge.getSnapshot().websiteAuthenticationRevision===authenticationRevision
        && bridge.getSnapshot().websiteAuthenticationStatus==='signed-in'
      pendingSessionCapture=(async()=>{
        try {
          const session=parseWebsiteSession(await executeScript(websiteSessionCaptureScript()))
          if (!sameLogin()) return
          if (!session) {bridge.reportWebsiteSessionError(generation,'当前官网的登录格式尚无法保存；重启后可能需要重新登录。');return}
          // This comparison stays private in the guest owner and never enters UI state.
          const fingerprint=JSON.stringify(session)
          if (fingerprint!==savedSessionFingerprint && await bridge.saveWebsiteSession(generation,session) && sameLogin()) savedSessionFingerprint=fingerprint
        } catch { if(sameLogin()) bridge.reportWebsiteSessionError(generation,'网页登录保存暂时不可用。当前网页可继续使用，请稍后重试。') }
      })().finally(()=>{pendingSessionCapture=null})
    }
    // This persistent owner only provides fenced, read-only geometry. Native
    // drag DOM and sampling lifetime belong to the CHAT-only overlay occupant.
    const stopDragSampler = bridge.bindWindowDragSampler(generation, async viewport => {
      const snapshot=bridge.getSnapshot(), revision=documentRevision
      const authenticationRevision=snapshot.websiteAuthenticationRevision
      if (!documentPresented || !active() || !approvedOrigin() || snapshot.viewport!==viewport || snapshot.mode!=='chat' || snapshot.settingsOpen
        || snapshot.webLoading || snapshot.websiteNavigation.status!=='ready' || snapshot.websiteNavigation.authenticated!==true) return []
      const leading=document.querySelector('.dsh-chat-leading')?.getBoundingClientRect()
      const nativeInset=Math.max(headerInset(viewport),leading && leading.width>0 ? Math.ceil(leading.right-viewport.left)+16 : 0)
      const geometry=await executeScript(websiteWindowDragScript(nativeInset))
      const latest=bridge.getSnapshot()
      if (!active() || !approvedOrigin() || revision!==documentRevision || latest.viewport!==viewport || latest.mode!=='chat' || latest.settingsOpen
        || latest.webLoading || latest.websiteNavigation.status!=='ready' || latest.websiteNavigation.authenticated!==true
        || latest.websiteAuthenticationRevision!==authenticationRevision) return []
      return parseWindowDragGeometry(geometry,viewport)
    })
    events.signal.addEventListener('abort', stopDragSampler, {once:true})
    const adapt = async (command: WebsiteCommand) => {
      const snapshot = bridge.getSnapshot()
      const requestDocumentRevision=documentRevision
      const requestAuthenticationRevision=snapshot.websiteAuthenticationRevision
      const currentDocument=()=>active() && requestDocumentRevision===documentRevision
      const currentProjection=()=>currentDocument() && bridge.getSnapshot().websiteAuthenticationRevision===requestAuthenticationRevision
      if(command.type==='snapshot') command={...command,headerInset:headerInset(snapshot.viewport)}
      if (!documentReady || events.signal.aborted || snapshot.authorizationGeneration !== generation || snapshot.authorizationStatus !== 'authorized') return
      if (snapshot.websiteAuthenticationStatus==='signing-out' && command.type!=='logout' && command.type!=='snapshot') return
      try {
        if(!approvedOrigin() || !await prepareSession() || !currentProjection()) return
        const result = parseWebsiteNavigation(await execute(command))
        if(!currentProjection()) return
        // Keep this document's first usable presentation through transient DOM
        // loading. Only a real document replacement clears navigation and paint.
        if(documentPresented && result.status==='loading' && result.authenticated!==true) return
        if (result.status!==lastNavigationStatus) { lastNavigationStatus=result.status;fastPollingUntil=Date.now()+8000 }
        if(result.status==='sign-in' && restoredFromVault && Date.now()<restoreDeadline) return
        if (currentDocument()) {
          if (result.needsDesktopChrome && desktopChromeTries < DESKTOP_CHROME_LIMIT
            && bootstrap.recheck(requestDocumentRevision)) {
            desktopChromeTries++
            documentPresented = false
            setPresentationReady(false)
          }
          const expectedWidth = current.closest('.dsh-chat-web-surface')?.getBoundingClientRect().width ?? 0
          const presentation = bootstrap.project(requestDocumentRevision, result, expectedWidth)
          // Releasing the desktop minimum width makes the site rebuild its
          // responsive top row. Re-adapt immediately so the website's own menu,
          // new-chat and Share chrome never flash before the next poll.
          if (presentation === 'resized') {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              if (!events.signal.aborted && requestDocumentRevision === documentRevision) syncNavigation()
            }))
          }
          // Publish identity before vault I/O, but never paint a freshly loaded
          // desktop document until a second projection confirms the actual width.
          bridge.reportWebsiteNavigation(generation, result)
          if (presentation === 'ready') {
            documentPresented = true
            if (bootstrapTimedOut) { bootstrapTimedOut = false; lastError = null; report(false) }
            setPresentationReady(true)
          } else if (!documentPresented) setPresentationReady(false)
          else if (result.status === 'unsupported' && !result.layoutReady) setPresentationReady(false)
          if (navigationRefresh && requestDocumentRevision > navigationRefresh.documentRevision && presentation === 'ready') {
            if (result.status === 'ready' && result.authenticated === true) finishNavigationRefresh(null)
            else if (result.status === 'sign-in') finishNavigationRefresh('官网登录已失效，请重新登录后刷新列表。')
          }
        }
        if(result.authenticated===true) {
          websiteHadSession=true;restoredFromVault=false
          captureSession(requestDocumentRevision)
        } else if(result.status==='sign-in' && (websiteHadSession || restoredFromVault)) {
          websiteHadSession=false;restoredFromVault=false;savedSessionFingerprint=null
          // The public sign-in state is already visible. Clear only this plugin's
          // saved authorization; a failed clear remains explicit and retryable.
          if(snapshot.websiteAuthenticationStatus!=='signing-out') void bridge.clearWebsiteSession(generation)
        }
      } catch {
        if (currentProjection()) {
          documentPresented=true
          // A failed DOM projection cannot prove that the website signed out.
          // Keep the CHAT shell and conceal an unrecognized guest. Never clear
          // its adapter styles to expose the website's original sidebar.
          bridge.reportWebsiteNavigation(generation, { status: 'unsupported', conversations: [], selectedHref: null, canCreate: false, error: '暂未识别官网界面，请稍后重新识别。' })
          setPresentationReady(false)
        }
      }
    }
    const snapshotCommand = (): WebsiteCommand => {const snapshot=bridge.getSnapshot();return {type:'snapshot',showOriginal:snapshot.showWebsiteNavigation, headerInset:headerInset(snapshot.viewport)}}
    const syncNavigation = () => {
      if (reading || events.signal.aborted) return
      lastPolled=Date.now();reading = true
      queued = queued.then(() => adapt(snapshotCommand())).finally(() => { reading = false })
    }
    let lastHostTheme = hostTheme()
    const themeObserver = new MutationObserver(() => {
      const next = hostTheme()
      if (next === lastHostTheme) return
      lastHostTheme = next
      fastPollingUntil = Date.now() + 8000
      if (active() && approvedOrigin()) syncNavigation()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
    events.signal.addEventListener('abort', () => themeObserver.disconnect(), { once: true })
    const stopCommands = bridge.bindWebsiteNavigation(generation, command => {
      if(command.type!=='snapshot') fastPollingUntil=Date.now()+8000
      if (command.type==='refresh') {
        queued=queued.then(async()=>{
          clearTimeout(navigationRefreshTimer);navigationRefreshTimer=undefined
          const refreshRequest={requestId:command.requestId,authenticationRevision:command.authenticationRevision,documentRevision}
          navigationRefresh=refreshRequest
          const sameRequest=()=>navigationRefresh===refreshRequest && active() && bridge.getSnapshot().websiteAuthenticationRevision===command.authenticationRevision
          if (!sameRequest() || !approvedOrigin()) {finishNavigationRefresh('官网页面状态已变化，请稍后重试刷新。',refreshRequest);return}
          try {
            const readiness=await executeScript(`(${websiteRefreshReadiness.toString()})(document,location.origin)`)
            if (!sameRequest() || documentRevision!==refreshRequest.documentRevision) {finishNavigationRefresh('官网页面状态已变化，请稍后刷新。',refreshRequest);return}
            if (readiness!=='ready') {
              finishNavigationRefresh(readiness==='draft' ? '请先发送或清空未发送内容，再刷新对话列表。'
                : readiness==='busy' ? '请等当前回复或网页操作完成，再刷新对话列表。' : '当前官网页面暂时无法刷新，请稍后重试。',refreshRequest)
              return
            }
            // Reload the same guest at its current URL. Keep its lease/session,
            // and finish only after a new document yields a confirmed list.
            navigationRefreshTimer=setTimeout(()=>{
              if (navigationRefresh!==refreshRequest) return
              if (!sameRequest()) {finishNavigationRefresh('官网登录状态已变化，请稍后刷新。',refreshRequest);return}
              // A navigation projection timeout is not a failed HTTP load.
              // Keep the real conversation usable and offer recovery in the list.
              finishNavigationRefresh('官网对话列表同步超时，请点击「重新加载」。',refreshRequest)
              report(false)
            },30_000)
            reloadDocument()
          } catch {
            if (!sameRequest()) return
            report(false)
            finishNavigationRefresh('无法刷新官网对话列表，请重试。',refreshRequest)
          }
        })
      } else queued = queued.then(() => adapt(command)).then(() => adapt(snapshotCommand()))
      return queued
    })
    const timer = setInterval(()=>{if(Date.now()-lastPolled>=(Date.now()<fastPollingUntil ? 200 : 1200)) syncNavigation()},200)
    events.signal.addEventListener('abort', () => { clearInterval(timer); finishNavigationRefresh('网页已关闭，刷新未完成。'); stopCommands() }, { once: true })
    const navigate = (url: string) => {
      const revision = ++navigationRevision
      resetDocumentPresentation()
      report(true)
      void current.loadURL(url).catch((error: unknown) => {
        if (revision !== navigationRevision || events.signal.aborted) return
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_ABORTED') return
        report(false, 'DeepSeek 网页加载失败。请检查网络后重试。')
      })
    }
    // All actual loads share the same document transaction. Geometry, snapshots,
    // theme updates, SPA conversation selection and drawer locks never call this.
    const reloadDocument = () => {
      if (events.signal.aborted) return
      resetDocumentPresentation()
      report(true)
      if (current.getURL().startsWith('about:blank')) navigate(resumeWebsiteUrl(lastWebsiteUrl.current, WEBSITE_URL))
      else current.reload()
    }
    reloadGuest.current = () => {
      finishNavigationRefresh(null)
      restorationAttempted = false; restoredFromVault = false; restoreDeadline = 0
      try { reloadDocument() } catch {
        needsRecovery.current = true
        report(false, '无法刷新当前网页，请点击「重试网页」。')
      }
    }
    current.addEventListener('dom-ready', () => {
      if (!bootstrapped) { bootstrapped = true; navigate(resumeWebsiteUrl(lastWebsiteUrl.current, WEBSITE_URL)) }
      else if (active() && bridge.getSnapshot().websiteAuthenticationStatus === 'signing-in'
        && bootstrap.authentication(documentRevision, current.getURL())) {
        // Show the provider unchanged. Keep documentReady false so DeepSeek's
        // DOM, session, download and preference scripts never run on the provider page.
        documentPresented = true
        bootstrapTimedOut = false
        lastError = null
        setExternalSignIn(true)
        current.style.opacity = ''
        current.style.pointerEvents = ''
        bridge.reportWebsiteNavigation(generation, { ...emptyNavigation(), status: 'sign-in' })
        setPresentationReady(true)
        report(false)
      }
      else if (approvedOrigin()) {
        websiteWasSignIn = /^\/sign_in\/?$/.test(new URL(current.getURL()).pathname)
        documentReady = true
        bootstrap.domReady(documentRevision)
        syncNavigation()
      }
    }, { signal: events.signal })
    current.addEventListener('did-finish-load', () => {
      if (!documentReady || !approvedOrigin()) return
      bootstrap.loaded(documentRevision)
      syncNavigation()
    }, { signal: events.signal })
    current.addEventListener('did-start-navigation', event => {
      const navigation = event as Event & { readonly isMainFrame?: boolean; readonly isInPlace?: boolean; readonly url?: string }
      // Only a new main document loses its adapter/preference markers. Loading
      // activity in other frames must not hide or clear an already ready page.
      if (navigation.isMainFrame !== true || navigation.isInPlace !== false) return
      navigationRevision++
      resetDocumentPresentation(); report(true)
      externalSignInLoading = bridge.getSnapshot().websiteAuthenticationStatus === 'signing-in'
        && isExternalAuthUrl(navigation.url ?? current.getURL())
      setExternalSignIn(externalSignInLoading)
    }, { signal: events.signal })
    current.addEventListener('did-start-loading', () => {
      // This event also includes subframes/resource activity. It is not proof of
      // a new document and must not erase a failed bootstrap's retryable error.
      if (!documentPresented && !bootstrapTimedOut) report(true)
    }, { signal: events.signal })
    current.addEventListener('did-navigate-in-page', event => {
      if ((event as Event & { readonly isMainFrame?: boolean }).isMainFrame !== true || !approvedOrigin()) return
      const isSignIn = /^\/sign_in\/?$/.test(new URL(current.getURL()).pathname)
      // Login may return to the app through SPA routing. Prepare its desktop DOM
      // once, without reloading the new conversation or losing a composer draft.
      if (websiteWasSignIn && !isSignIn && bootstrap.recheck(documentRevision)) {
        documentPresented = false
        setPresentationReady(false)
      }
      websiteWasSignIn = isSignIn
      // A new in-site conversation may introduce the Share control that a
      // headerless start could not measure. Allow a fresh bounded attempt.
      desktopChromeTries = 0
      fastPollingUntil=Date.now()+8000;syncNavigation()
    }, { signal: events.signal })
    current.addEventListener('did-stop-loading', () => { if (bootstrapped && approvedOrigin()) { report(false); syncNavigation() } }, { signal: events.signal })
    current.addEventListener('did-fail-load', event => {
      const failure = event as Event & { readonly isMainFrame?: boolean; readonly errorCode?: number }
      if (failure.isMainFrame === true && failure.errorCode !== -3) report(false, externalSignInLoading ? '登录页面加载失败。请检查网络后重试。' : 'DeepSeek 网页加载失败。请检查网络后重试。')
    }, { signal: events.signal })
    current.addEventListener('render-process-gone', () => {
      needsRecovery.current = true
      setPresentationReady(false)
      bridge.reportWebsiteNavigation(generation, { status: 'unsupported', conversations: [], selectedHref: null, canCreate: false, error: null })
      report(false, '网页进程已退出，请点击「重试网页」。')
    }, { signal: events.signal })
    const offOpen = nativeBrowser.onOpenRequested(reservation.native.lease, url => {
      if (events.signal.aborted) return
      // Generated blob/data resources are not navigable links; reporting them as a
      // broken external link only confuses users who clicked a download control.
      if (isGeneratedResourceUrl(url)) return
      const route = handleWebsiteLink(url, (target, name, features) => window.open(target, name, features))
      if (route.kind === 'same-site') { navigate(route.url); return }
      // External pages go to the system browser: the right-Sidebar browser belongs to
      // HARNESS and would change this view. A failed dispatch is never a page-load error.
      if (route.kind === 'failed' || route.kind === 'rejected') bridge.reportWebsiteNotice(generation, 'link-unavailable')
    })
    events.signal.addEventListener('abort', offOpen, { once: true })
    // Generated attachments: the guest's own blob is read on the user's explicit export
    // action, then saved through the public file-actions service. Downloads stay blocked.
    let downloadPolling = false
    const pollDownloads = async () => {
      if (downloadPolling) return
      const snapshot = bridge.getSnapshot()
      const enabled = snapshot.mode === 'chat' && !snapshot.settingsOpen
      if (!active() || !approvedOrigin()) return
      downloadPolling = true
      const requestDocument = documentRevision, requestAuthentication = snapshot.websiteAuthenticationRevision
      try {
        const value = parseWebsiteDownload(await executeScript(websiteDownloadScript('poll', enabled)))
        const latest = bridge.getSnapshot()
        if (!active() || !approvedOrigin() || requestDocument !== documentRevision || requestAuthentication !== latest.websiteAuthenticationRevision
          || latest.mode !== 'chat' || latest.settingsOpen || value === null) return
        if (value.kind === 'file') bridge.saveWebsiteFile(value)
        else if (value.kind !== 'busy') bridge.reportWebsiteNotice(generation, value.kind === 'too-large' ? 'download-too-large' : 'download-failed')
      } catch {
        // Polling is best-effort; a closed guest simply stops exporting until remount.
      } finally { downloadPolling = false }
    }
    const downloadTimer = setInterval(() => { void pollDownloads() }, 500)
    events.signal.addEventListener('abort', () => {
      clearInterval(downloadTimer)
      try { if (approvedOrigin()) void Promise.resolve(current.executeJavaScript(websiteDownloadScript('dispose'))).catch(() => {}) } catch { /* the guest is already gone */ }
    }, { once: true })
  }, [bridge, nativeBrowser, reservation])

  useEffect(() => {
    if (lastReload.current === state.websiteReloadRevision) return
    lastReload.current = state.websiteReloadRevision
    const current = guest.current
    if (current === null || reservation === null || needsRecovery.current) {
      if (nativeBrowser !== undefined && state.modeEnabled && state.authorizationStatus === 'authorized') {
        setRecoveryRevision(value => value + 1)
      }
      return
    }
    reloadGuest.current?.()
  }, [bridge, nativeBrowser, reservation, state.websiteReloadRevision, state.modeEnabled, state.authorizationStatus])

  useEffect(() => {
    if((state.mode==='chat' || state.settingsOpen) && state.authorizationStatus==='authorized') bridge.commandWebsite({type:'snapshot',showOriginal:state.showWebsiteNavigation,headerInset:headerInset(state.viewport)})
  }, [bridge,state.mode,state.settingsOpen,state.viewport?.left,state.viewport?.width,state.language,state.authorizationStatus])

  useEffect(() => () => { guestEvents.current?.abort() }, [])

  const inSettings = state.settingsOpen
  // Settings is a native status page. Its shared guest stays hidden at desktop
  // size for account observation and DSH preference sync; login uses the main CHAT panel.
  const rect = inSettings
    ? state.viewport ?? {left:0,top:0,width:globalThis.innerWidth,height:globalThis.innerHeight}
    : state.viewport

  const visible = !inSettings && state.mode === 'chat' && state.modeEnabled
    && rect !== null && rect.width > 0 && rect.height > 0
  const activeReservation = guestWanted && reservation !== null && reservation.generation === state.authorizationGeneration
    && reservation.storageKey === state.accountStorageKey ? reservation : null
  const clearance = 0
  const borderRadius = rect?.borderRadius ?? '0px'
  const logoutError=state.websiteAuthenticationStatus==='error' && /退出/.test(state.websiteSessionError ?? '')
  const projectionError=state.websiteNavigation.status==='unsupported' && state.websiteNavigation.layoutReady!==true ? state.websiteNavigation.error || '暂未识别官网界面，请稍后重新识别。' : null
  const guestUsable=presentationReady && !projectionError && state.websiteAuthenticationStatus!=='signed-out' && state.websiteAuthenticationStatus!=='signing-out' && !logoutError
  const websiteStatusMessage=state.webError || (logoutError ? state.websiteSessionError : projectionError)
    || (nativeBrowser===undefined ? '需要提供官方浏览器能力的 DSH 桌面版。' : state.websiteAuthenticationStatus==='signing-out' ? '正在清除登录记忆并退出官网。' : externalSignIn ? '请在登录页面完成登录，完成后会自动返回 DeepSeek。' : 'CHAT 使用独立的官网登录，登录后自动同步账号和官网对话。')
  return createPortal(<section id="dsh-chat-website-surface" className="dsh-chat-web-surface" aria-label={t("DeepSeek 官网网页")} aria-hidden={!visible || rect?.inert} {...(rect?.inert ? { inert: '' } : {})} style={{
    zIndex: inSettings ? 0 : 14,
    visibility: visible ? 'visible' : 'hidden',
    display: (inSettings || state.mode==='chat') && rect ? 'flex' : 'none',
    opacity: visible ? 1 : 0,
    pointerEvents: visible && !rect?.inert ? 'auto' : 'none',
    left: rect?.left ?? 0,
    top: (rect?.top ?? 0) + clearance,
    width: rect?.width ?? 0,
    height: Math.max(0,(rect?.height ?? 0) - clearance),
    borderRadius, overflow: 'hidden',
    clipPath: borderRadius==='0px' ? undefined : `inset(0 round ${borderRadius})`,
  }}>
    <DshChatStyles />
    {state.websiteSessionStatus==='saved' && <span className="dsh-chat-sr-only" role="status" aria-label={t("CHAT 网页登录状态已保存")}>{t("CHAT 网页登录状态已保存")}</span>}
    {state.websiteSessionError && <p className="dsh-chat-session-error" role="alert">{t(state.websiteSessionError)}</p>}
    <div className="dsh-chat-web-content">
      {activeReservation !== null && createElement('webview', {
        key: activeReservation.native.lease,
        ref: attachGuest,
        className: 'dsh-chat-webview',
        // Keep the normal 0.2.7 focus attributes; only concealed, unsafe content
        // is inert, so it cannot retain keyboard/Tab interaction behind an error.
        inert: guestUsable && !rect?.inert ? undefined : '',
        style: { opacity: guestUsable ? 1 : 0, pointerEvents: guestUsable ? undefined : 'none' },
        name: activeReservation.native.lease,
        partition: activeReservation.native.partition,
        src: `about:blank#${activeReservation.native.lease}`,
        allowpopups: '',
        'data-sidebar-browser-frame': 'webview',
        'aria-label': t(externalSignIn ? '外部登录页面' : 'DeepSeek 官网，登录、聊天和历史由网页提供'),
      })}
      {(nativeBrowser === undefined || state.webError !== null || activeReservation === null || !presentationReady || projectionError || state.websiteAuthenticationStatus==='signed-out' || state.websiteAuthenticationStatus==='signing-out' || logoutError) && <div className={`dsh-chat-web-status${state.webError !== null || projectionError ? ' dsh-chat-web-status-error' : ''}`} role={state.webError !== null || projectionError ? 'alert' : 'status'}>
        <strong>{t(nativeBrowser === undefined ? '当前环境无法内嵌网页' : state.webError !== null ? '网页暂时无法使用' : logoutError ? '退出登录未完成' : projectionError ? 'CHAT 界面识别失败' : state.websiteAuthenticationStatus==='signed-out' ? '登录 DeepSeek Chat' : state.websiteAuthenticationStatus==='signing-out' ? '正在退出登录' : externalSignIn ? '正在打开登录页面' : '正在打开 DeepSeek 官网')}</strong>
        <p>{t(websiteStatusMessage)}</p>
        {projectionError && !logoutError && !state.webError && <button type="button" className="dsh-chat-text-button" onClick={()=>bridge.commandWebsite({type:'snapshot',showOriginal:false})} disabled={!state.modeEnabled}>{t("重新识别")}</button>}
        {logoutError && <button type="button" className="dsh-chat-text-button" onClick={()=>bridge.logoutWebsite()}>{t("重试退出登录")}</button>}
        {state.websiteAuthenticationStatus==='signed-out' && <button type="button" className="dsh-chat-primary-button" onClick={()=>bridge.beginWebsiteSignIn()}>{t("登录 DeepSeek")}</button>}
        {state.authorizationStatus!=='authorized' && nativeBrowser!==undefined && <button type="button" className="dsh-chat-text-button" onClick={()=>bridge.refreshAuthorization()}>{t("重试连接")}</button>}
        {(state.webError !== null) && <button type="button" className="dsh-chat-text-button" onClick={() => bridge.reloadWebsite()} disabled={nativeBrowser === undefined || !state.modeEnabled}>{t("重试网页")}</button>}
      </div>}
    </div>
    {visible && noticeText(state.websiteNotice, t) && <p className={`dsh-chat-web-toast${state.websiteNotice === 'link-unavailable' || state.websiteNotice === 'download-failed' || state.websiteNotice === 'download-too-large' ? ' dsh-chat-web-toast-error' : ''}`} role="status">{noticeText(state.websiteNotice, t)}</p>}
  </section>, document.body)
}
