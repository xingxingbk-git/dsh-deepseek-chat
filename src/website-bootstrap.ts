import type { WebsiteNavigation } from './website-navigation.js'

/** A fresh document must be adapted at desktop width before its first visible paint. */
export const WEBSITE_DESKTOP_WIDTH = 1024
export const WEBSITE_BOOTSTRAP_TIMEOUT = 30_000

type Projection = Pick<WebsiteNavigation, 'status' | 'authenticated' | 'desktopReady' | 'viewportWidth'>
type Phase = 'loading' | 'checking-layout' | 'authenticating' | 'ready'

/**
 * Any external HTTPS sign-in provider (Google, Apple, WeChat, enterprise SSO,
 * ...) may be shown as-is while a DeepSeek sign-in is in progress. DeepSeek
 * itself, non-HTTPS pages, non-default ports and credential-bearing URLs never
 * qualify.
 */
export function isExternalAuthUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    return !(url.hostname === 'deepseek.com' || url.hostname.endsWith('.deepseek.com'))
  } catch { return false }
}

/**
 * Per-guest, per-document state, deliberately independent of React layout props.
 * A resize never starts a document, and a timeout never exposes an unadapted page.
 */
export function createWebsiteBootstrap(options: {
  readonly desktop: (enabled: boolean) => void
  readonly timeout: () => void
  readonly schedule?: (callback: () => void, delay: number) => unknown
  readonly cancel?: (timer: unknown) => void
}) {
  const schedule = options.schedule ?? ((callback, delay) => setTimeout(callback, delay))
  const cancel = options.cancel ?? (timer => clearTimeout(timer as ReturnType<typeof setTimeout>))
  let revision = 0, deadline = 0
  let live = true, domReady = false, loaded = false
  let phase: Phase = 'loading'
  let timer: unknown
  const clear = () => { deadline++; if (timer !== undefined) cancel(timer); timer = undefined }
  const prepare = () => {
    clear()
    phase = 'loading'
    options.desktop(true)
    const expected = revision, expectedDeadline = deadline
    timer = schedule(() => {
      if (!live || expected !== revision || expectedDeadline !== deadline) return
      timer = undefined
      if (phase !== 'ready') options.timeout()
    }, WEBSITE_BOOTSTRAP_TIMEOUT)
  }
  return {
    begin(): number {
      revision++
      domReady = false
      loaded = false
      prepare()
      return revision
    },
    domReady(expected: number) { if (live && expected === revision) domReady = true },
    loaded(expected: number) { if (live && expected === revision && domReady) loaded = true },
    /** A provider form awaits the user; it cannot supply DeepSeek layout/account proof. */
    authentication(expected: number, url: string): boolean {
      if (!live || expected !== revision || !isExternalAuthUrl(url)) return false
      phase = 'authenticating'
      clear()
      options.desktop(false)
      return true
    },
    /** The first conversation may introduce Share after a headerless new-chat page. */
    recheck(expected: number): boolean {
      if (!live || expected !== revision || phase !== 'ready') return false
      prepare() // Same document and draft; no loadURL/reload or new lease.
      return true
    },
    /** Expected width is the real host content box; observed width comes from the guest DOM. */
    project(expected: number, navigation: Projection, expectedWidth: number): 'waiting' | 'resized' | 'ready' {
      if (!live || expected !== revision || !domReady || !loaded || phase === 'authenticating') return 'waiting'
      const usable = navigation.status === 'sign-in' || (navigation.status === 'ready' && navigation.authenticated === true && navigation.desktopReady === true)
      if (!usable) return 'waiting'
      if (phase === 'ready') return 'ready' // Ordinary layout changes keep the already-presented document.
      if (!(expectedWidth > 0) || !Number.isFinite(expectedWidth)) return 'waiting'
      const observedWidth = navigation.viewportWidth
      if (typeof observedWidth !== 'number' || !Number.isFinite(observedWidth) || observedWidth <= 0) return 'waiting'
      if (phase === 'loading') {
        if (observedWidth < WEBSITE_DESKTOP_WIDTH) return 'waiting'
        phase = 'checking-layout'
        options.desktop(false)
        return 'resized'
      }
      // A second executeJavaScript can race Electron's guest resize delivery.
      // Do not mistake another 1024px projection for actual-width acknowledgement.
      if (Math.abs(observedWidth - expectedWidth) > 1) return 'waiting'
      phase = 'ready'
      clear()
      return 'ready'
    },
    dispose() { live = false; clear() },
  }
}
