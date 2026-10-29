import type { ChatLanguage } from './website-settings.js'
import { configureWebsiteShareCopy } from './website-share-copy.js'
import { applyWebsiteTypography } from './website-typography.js'
import { collapseWebsiteSidebar } from './website-sidebar-collapse.js'
import { performWebsiteConversationAction } from './website-conversation-actions.js'
import { adaptWebsiteHeader } from './website-header.js'
import { adaptWebsiteSettings } from './website-settings.js'
import { dismissWebsiteEnvironmentNotice } from './website-notice.js'
/** Visible website navigation/account/settings only; no credentials, storage or request APIs. */
export interface WebsiteConversation {
  readonly href: string
  readonly title: string
  readonly group: string
}
export interface WebsiteNavigation {
  readonly status: 'loading' | 'ready' | 'sign-in' | 'unsupported'
  /** Public profile presence only; independent of layout/settings readiness. */
  readonly authenticated?: boolean
  /** Current public account proof is unavailable; never means signed-out. */
  readonly identityUnconfirmed?: boolean
  /** A currently verified CHAT layout still hides the original website sidebar. */
  readonly layoutReady?: boolean
  readonly conversations: readonly WebsiteConversation[]
  readonly selectedHref: string | null
  readonly canCreate: boolean
  readonly error: string | null
  readonly accountName?: string | null
  readonly settings?: {language: string | null; theme: string | null; error: string | null; pending?: boolean }
}
export type WebsiteCommand = { readonly type: 'snapshot'; readonly showOriginal: boolean; readonly headerInset?: number }
  | { readonly type: 'open'; readonly href: string }
  | { readonly type: 'conversation-action'; readonly href: string; readonly action: 'rename' | 'pin' | 'unpin' | 'share' | 'delete'; readonly title?: string }
  | { readonly type: 'settings-retry' }
  | { readonly type: 'logout' }
  /** Handled by the guest owner; never a DOM-only snapshot. */
  | { readonly type: 'refresh'; readonly requestId: number; readonly authenticationRevision: number }
  | { readonly type: 'new' } | { readonly type: 'more' } | { readonly type: 'restore' }

export const emptyNavigation = (): WebsiteNavigation => ({ status: 'loading', authenticated: false, conversations: [], selectedHref: null, canCreate: false, error: null })

/** This function is serialized into our isolated guest. Keep all helpers inside it. */
export function adaptWebsiteNavigation(doc: Document, page: Pick<Location, 'origin' | 'pathname'>, command: WebsiteCommand): WebsiteNavigation {
  const origin = 'https://chat.deepseek.com'
  // CHAT never exposes the website's original sidebar. Keep this legacy wire
  // field compatible, but only an explicit hidden-guest cleanup may restore it.
  if (command.type === 'snapshot' && command.showOriginal) command = { ...command, showOriginal: false }
  const marker = 'data-dsh-chat-navigation'
  const presentedMarker = 'data-dsh-chat-presented'
  const missingSidebarMarker = 'data-dsh-chat-sidebar-missing-at'
  const fallbackMarker = 'data-dsh-chat-fallback'
  const fallbackErrorMarker = 'data-dsh-chat-fallback-error'
  const profileMarker = 'data-dsh-chat-profile'
  const profileProofMarker = 'data-dsh-chat-profile-confirmed'
  const profileAvatarMarker = 'data-dsh-chat-profile-avatar'
  const missingProfileMarker = 'data-dsh-chat-profile-missing-at'
  const profileError = '暂未识别官网账号区域，新的登录记忆暂无法保存；请稍后重新识别。'
  const navigationWidthMarker = 'data-dsh-chat-navigation-width'
  const expandingMarker = 'data-dsh-chat-expanding'
  const compactToggleMarker = 'data-dsh-chat-compact-toggle'
  const conversationError = '该对话不在当前官网列表，请刷新列表。'
  const styleId = 'dsh-chat-website-navigation-style'
  const preparingStyleId = 'dsh-chat-website-preparing-style'
  const owned = [marker, presentedMarker, missingSidebarMarker, fallbackMarker, fallbackErrorMarker, profileMarker, profileProofMarker, profileAvatarMarker, missingProfileMarker, navigationWidthMarker, expandingMarker, compactToggleMarker, 'data-dsh-chat-native-collapse-attempt', 'data-dsh-chat-action-menu', 'data-dsh-chat-conversation-error', 'data-dsh-chat-layout', 'data-dsh-chat-content', 'data-dsh-chat-web-chrome', 'data-dsh-chat-settings-dialog', 'data-dsh-chat-settings-host', 'data-dsh-chat-settings-tabs', 'data-dsh-chat-settings-pane', 'data-dsh-chat-settings-layout', 'data-dsh-chat-settings-chrome', 'data-dsh-chat-settings-appearance', 'data-dsh-chat-header-row', 'data-dsh-chat-header-title', 'data-dsh-chat-header-share', 'data-dsh-chat-header-title-host', 'data-dsh-chat-header-editor', 'data-dsh-chat-header-native-depth', 'data-dsh-chat-header-motion-until', 'data-dsh-chat-header-motion-complete']
  const empty = (status: WebsiteNavigation['status']): WebsiteNavigation => ({ status, ...(status === 'sign-in' ? { authenticated: false } : {}), conversations: [], selectedHref: null, canCreate: false, error: null })
  const clearSettings = (preserveConfirmedSettings = false) => {
    const confirmed = ['data-dsh-chat-language', 'data-dsh-chat-language-complete', 'data-dsh-chat-settings-language-target', 'data-dsh-chat-theme', 'data-dsh-chat-theme-complete', 'data-dsh-chat-settings-theme-target']
    for (const attr of [...doc.documentElement.attributes]) if (/^data-dsh-chat-(settings-|language$|language-complete$|theme$|theme-complete$|dark-complete$)/.test(attr.name)
      && !(preserveConfirmedSettings && confirmed.includes(attr.name))) doc.documentElement.removeAttribute(attr.name)
  }
  const restore = (preserveConfirmedSettings = false, preserveCompactAttempt = false) => {
    clearSettings(preserveConfirmedSettings)
    if (!preserveConfirmedSettings) {doc.documentElement.removeAttribute('data-dsh-chat-host-theme');doc.documentElement.removeAttribute('data-dsh-chat-host-language')}
    doc.getElementById(styleId)?.remove()
    doc.getElementById('dsh-chat-header-style')?.remove()
    doc.getElementById('dsh-chat-website-typography')?.remove()
    doc.documentElement.style.removeProperty('--dsh-chat-title-inset')
    doc.getElementById(preparingStyleId)?.remove()
    doc.getElementById('dsh-chat-settings-view-style')?.remove()
    doc.documentElement.removeAttribute('data-dsh-chat-preparing')
    owned.forEach(attr => {
      if (preserveCompactAttempt && (attr === expandingMarker || attr === compactToggleMarker)) return
      doc.querySelectorAll(`[${attr}]`).forEach(node => node.removeAttribute(attr))
    })
  }
  const concealUnidentifiedPage = () => {
    // Preserve the CHAT layout and hidden-sidebar markers. Never reveal the
    // original website as an automatic fallback, even for a single paint.
    doc.documentElement.setAttribute('data-dsh-chat-preparing', '')
    if (!doc.getElementById(preparingStyleId)) {
      const style = doc.createElement('style'); style.id = preparingStyleId
      style.textContent = 'html[data-dsh-chat-preparing] body{opacity:0!important}'
      doc.head.append(style)
    }
  }
  const signInNavigation = (): WebsiteNavigation => {
    clearSettings()
    for (const attribute of [profileMarker, profileProofMarker, profileAvatarMarker]) {
      doc.querySelectorAll(`[${attribute}]`).forEach(node => node.removeAttribute(attribute))
    }
    for (const attribute of [presentedMarker, missingProfileMarker, missingSidebarMarker, expandingMarker, fallbackErrorMarker, 'data-dsh-chat-host-theme', 'data-dsh-chat-host-language', 'data-dsh-chat-preparing']) doc.documentElement.removeAttribute(attribute)
    // Keep visual sidebar suppression through SPA sign-in transitions too.
    doc.documentElement.setAttribute(fallbackMarker, '')
    return empty('sign-in')
  }
  const fallbackMessage = (error: string | null) => error === 'open' ? conversationError : error === 'profile' ? profileError : '暂未识别官网界面，请稍后重新识别。'
  const fallback = (error: 'open' | 'profile' | null = null, confirmedName: string | null = null, layoutReady = false): WebsiteNavigation => {
    if (command.type === 'restore') { restore(); return empty('unsupported') }
    if (page.origin === origin && /^\/sign_in\/?$/.test(page.pathname)) return signInNavigation()
    if (page.origin === origin) {
      doc.documentElement.setAttribute(fallbackMarker, '')
      if (error) doc.documentElement.setAttribute(fallbackErrorMarker, error)
      else doc.documentElement.removeAttribute(fallbackErrorMarker)
      if (layoutReady) doc.documentElement.removeAttribute('data-dsh-chat-preparing')
      else concealUnidentifiedPage()
    }
    return { ...empty('unsupported'), ...(confirmedName === null ? {} : { authenticated: true, accountName: confirmedName }), ...(error === 'profile' ? { identityUnconfirmed: true, layoutReady } : {}), error: fallbackMessage(error) }
  }
  const fallbackNavigation = (): WebsiteNavigation => {
    concealUnidentifiedPage()
    return { ...empty('unsupported'), ...(doc.documentElement.getAttribute(fallbackErrorMarker) === 'profile' ? { identityUnconfirmed: true } : {}), error: fallbackMessage(doc.documentElement.getAttribute(fallbackErrorMarker)) }
  }
  const isOriginalSnapshot = command.type === 'snapshot' && command.showOriginal
  if (page.origin !== origin) return fallback()
  if (command.type !== 'restore') dismissWebsiteEnvironmentNotice(doc)
  if (command.type === 'restore' || (command.type === 'snapshot' && command.showOriginal)) {
    doc.dispatchEvent(new Event('dsh-chat-stop-adapting'))
    if (command.type === 'restore') return fallback()
    restore()
  }
  // React can briefly remove navigation while a login/route commit is pending.
  // Keep probing a blocked document without exposing its sidebar. Only a confirmed compact
  // navigation row may open its own sidebar once while waiting for that layout.
  const recovering = doc.documentElement.hasAttribute(fallbackMarker)
  // Own observer runs in the same DOM microtask checkpoint as the site's React
  // commit, before paint. No app globals or data stores cross the guest boundary.
  if (!(command.type === 'snapshot' && command.showOriginal) && !doc.documentElement.hasAttribute('data-dsh-chat-observing') && doc.defaultView) {
    doc.documentElement.setAttribute('data-dsh-chat-observing', '')
    let queued = false
    const observer = new MutationObserver(() => {
      if (queued) return
      queued = true
      queueMicrotask(() => {
        queued = false
        if (!doc.documentElement.hasAttribute('data-dsh-chat-observing')) return
        adaptWebsiteNavigation(doc, doc.defaultView!.location, { type: 'snapshot', showOriginal: false, headerInset: Number.parseInt(doc.documentElement.style.getPropertyValue('--dsh-chat-title-inset')) || 24 })
      })
    })
    // Observe site edit-mode switches, but exclude our data/style attributes
    // so setting layout markers cannot recursively trigger the adapter.
    observer.observe(doc.body, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','type','contenteditable','role']})
    doc.addEventListener('dsh-chat-stop-adapting', () => {
      observer.disconnect(); doc.documentElement.removeAttribute('data-dsh-chat-observing')
    }, {once:true})
  }
  if (/^\/sign_in\/?$/.test(page.pathname)) return signInNavigation()
  // Gate only the document's first adapted paint. Later appearance checks must
  // leave the presented website and its environment/security notices visible.
  if (!isOriginalSnapshot && !recovering && !doc.documentElement.hasAttribute(presentedMarker)
    && (doc.documentElement.getAttribute('data-dsh-chat-theme-complete') !== (doc.documentElement.getAttribute('data-dsh-chat-host-theme') === 'light' ? 'light' : 'dark')
      || (doc.documentElement.hasAttribute('data-dsh-chat-host-language') && doc.documentElement.getAttribute('data-dsh-chat-language-complete') !== doc.documentElement.getAttribute('data-dsh-chat-host-language')))) {
    doc.documentElement.setAttribute('data-dsh-chat-preparing','')
    if (!doc.getElementById(preparingStyleId)) {
      const style=doc.createElement('style'); style.id=preparingStyleId
      style.textContent='html[data-dsh-chat-preparing] body{opacity:0!important}'
      doc.head.append(style)
    }
  }
  const safeHref = (value: string | null) => {
    try {
      const url = new URL(value ?? '', origin)
      return url.origin === origin && /^\/a\/chat\/s\/[a-zA-Z0-9-]+$/.test(url.pathname)
        && !url.search && !url.hash && !url.username && !url.password ? url.href : null
    } catch { return null }
  }
  const labels = /^(开启新对话|新对话|New chat|New Chat)$/
  const groups = /^(置顶|今天|昨天|前天|\d+\s*天内|\d+\s*天前|\d{4}-\d{2}|Pinned|Today|Yesterday|Previous \d+ Days)$/i
  const findNew = (root: Element) => {
    const walker = doc.createTreeWalker(root, 4)
    let node: Node | null
    while ((node = walker.nextNode())) {
      if (labels.test((node.textContent ?? '').trim()) && node.parentElement instanceof HTMLElement) return node.parentElement
    }
    return null
  }
  const isNavigationColumn = (candidate: HTMLElement) => {
    const rect = candidate.getBoundingClientRect()
    const viewportHeight = doc.defaultView?.innerHeight ?? 600
    return rect.left >= -1 && rect.left <= 16 && rect.top >= -1 && rect.top <= 32
      && rect.width >= 160 && rect.width <= 480 && rect.height >= Math.max(200, viewportHeight * .75)
      && !candidate.querySelector('textarea,[contenteditable="true"]')
  }
  const allLinks = [...doc.querySelectorAll<HTMLAnchorElement>('a[href]')].filter(link => safeHref(link.getAttribute('href')))
  let sidebar: HTMLElement | null = doc.querySelector<HTMLElement>(`[${marker}]`)
  if (sidebar && (!sidebar.isConnected || !findNew(sidebar))) sidebar = null
  if (!sidebar) {
    // Choose the narrow navigation column containing both history and New Chat,
    // never the root/main/body (which could include chat message links).
    for (const link of allLinks) {
      let candidate = link.parentElement
      for (let depth = 0; candidate && candidate !== doc.body && depth < 12; depth++, candidate = candidate.parentElement) {
        if (isNavigationColumn(candidate) && findNew(candidate)) { sidebar = candidate; break }
      }
      if (sidebar) break
    }
  }
  // An empty-history account still has a navigation column with New Chat.
  if (!sidebar) {
    for (const candidate of doc.querySelectorAll<HTMLElement>('aside,nav,[role="navigation"],div')) {
      if (isNavigationColumn(candidate) && findNew(candidate)) { sidebar = candidate; break }
    }
  }
  const newChat = sidebar ? findNew(sidebar) : null
  const structureExpired = (timer = missingSidebarMarker) => {
    const now = Date.now()
    const previous = Number(doc.documentElement.getAttribute(timer))
    const started = Number.isFinite(previous) && previous > 0 ? previous : now
    if (started !== previous) doc.documentElement.setAttribute(timer, String(started))
    return now - started >= 5000
  }
  const iconButtonSelector = 'button,[role="button"],.ds-icon-button'
  const compactNavigation = () => {
    const toggleLabels = /^(展开侧边栏|打开侧边栏|侧边栏|切换侧边栏|Open sidebar|Expand sidebar|Toggle sidebar|Sidebar)$/i
    const openingLabels = /^(展开侧边栏|打开侧边栏|Open sidebar|Expand sidebar)$/i
    const searchLabels = /^(搜索|搜索对话|Search|Search chats|Search conversations)$/i
    const newLabels = /^(开启新对话|新对话|新建对话|New chat|New Chat)$/i
    const namedAs = (button: HTMLElement, expected: RegExp) => {
      const names = ['aria-label', 'title'].map(attr => (button.getAttribute(attr) ?? '').trim()).filter(Boolean)
      return names.length === 0 || names.every(name => expected.test(name))
    }
    for (const row of doc.querySelectorAll<HTMLElement>('div,header,nav')) {
      const bounds = row.getBoundingClientRect()
      if (bounds.top < -1 || bounds.top > 72 || bounds.left < -1 || bounds.left > 160
        || bounds.width < 72 || bounds.width > 360 || bounds.height < 24 || bounds.height > 80
        || row.textContent?.trim() || row.closest('[role="dialog"],[role="menu"],[data-dsh-chat-settings-dialog],.ds-modal-content,.ds-dropdown-menu')
        || row.querySelector('a[href],input,textarea,[contenteditable="true"]')) continue
      const rowButtons = [...row.querySelectorAll<HTMLElement>(iconButtonSelector)].filter(button => {
        const parentButton = button.parentElement?.closest(iconButtonSelector)
        return !parentButton || !row.contains(parentButton)
      })
      if (rowButtons.length !== 3) continue
      const buttons = rowButtons.filter(button => {
        const rect = button.getBoundingClientRect()
        return rect.width >= 20 && rect.width <= 64 && rect.height >= 20 && rect.height <= 64
          && rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1
          && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1
          && !button.textContent?.trim() && !!button.querySelector('svg')
          && !button.closest('[hidden],[aria-hidden="true"]') && getComputedStyle(button).visibility !== 'hidden'
          && button.getAttribute('aria-disabled') !== 'true' && !button.matches(':disabled')
      }).sort((left, right) => left.getBoundingClientRect().left - right.getBoundingClientRect().left)
      // Anonymous SVG controls are accepted only as the entire compact
      // sidebar/search/new row, never an arbitrary upper-left icon.
      if (buttons.length !== 3 || buttons[0].getAttribute('aria-expanded') === 'true' || !namedAs(buttons[0], toggleLabels)
        || !namedAs(buttons[1], searchLabels) || !namedAs(buttons[2], newLabels)) continue
      const rects = buttons.map(button => button.getBoundingClientRect())
      if (rects.some(rect => Math.abs(rect.top - rects[0].top) > 8)
        || rects[1].left < rects[0].right - 1 || rects[2].left < rects[1].right - 1) continue
      return { row, toggle: buttons[0] }
    }
    // Smaller layouts can omit search. A single/mobile control must name its
    // sidebar purpose publicly; geometry plus a generic SVG is insufficient.
    for (const toggle of doc.querySelectorAll<HTMLElement>(iconButtonSelector)) {
      const bounds = toggle.getBoundingClientRect()
      const name = (toggle.getAttribute('aria-label') || toggle.getAttribute('title') || '').trim()
      const expanded = toggle.getAttribute('aria-expanded')
      if (!toggleLabels.test(name) || expanded === 'true' || (!openingLabels.test(name) && expanded !== 'false')
        || bounds.left < 0 || bounds.left > 160 || bounds.top < 0 || bounds.top > 72
        || bounds.width < 20 || bounds.width > 64 || bounds.height < 20 || bounds.height > 64
        || toggle.textContent?.trim() || !toggle.querySelector('svg') || toggle.getAttribute('aria-disabled') === 'true'
        || toggle.matches(':disabled') || getComputedStyle(toggle).visibility === 'hidden'
        || toggle.closest('[hidden],[aria-hidden="true"],a[href],[role="dialog"],[role="menu"],[data-dsh-chat-settings-dialog],.ds-modal-content,.ds-dropdown-menu')) continue
      return { row: toggle.parentElement, toggle }
    }
    return null
  }
  if (!sidebar || !newChat) {
    concealUnidentifiedPage()
    // Login can return to the site's retained compact layout. The sidebar must
    // be opened before its full navigation/footer proof can become available,
    // including after fallback; do not let fallback prevent that one action.
    const compact = !isOriginalSnapshot && command.type === 'snapshot' ? compactNavigation() : null
    if (compact && !doc.documentElement.hasAttribute(expandingMarker)) {
      const started = String(Date.now())
      compact.toggle.setAttribute(compactToggleMarker, started)
      doc.documentElement.setAttribute(expandingMarker, started)
      doc.documentElement.setAttribute(missingSidebarMarker, started)
      compact.toggle.click()
      return empty('loading')
    }
    // The document guard survives fallback and a React replacement of the same
    // control. Neither a disappearing compact row nor a new node repeats clicks.
    const expandedAt = Number(doc.documentElement.getAttribute(expandingMarker))
    if (!isOriginalSnapshot && Number.isFinite(expandedAt) && expandedAt > 0 && Date.now() - expandedAt < 5000) return empty('loading')
    if (recovering) return fallbackNavigation()
    if (isOriginalSnapshot) return fallback()
    if (structureExpired()) return fallback('profile')
    // Login can enter the home route before either sidebar or compact controls
    // are mounted. Use the same fixed grace period as later route replacement.
    return empty('loading')
  }
  // The navigation's outer track can outlive an inner sidebar hidden with
  // display:none. Hide the whole bounded track and let its sibling fill it.
  let track = sidebar
  for (let depth = 0; depth < 5 && track.parentElement && track.parentElement !== doc.body; depth++) {
    const parent = track.parentElement
    const r = parent.getBoundingClientRect()
    if (parent.querySelector('textarea,[contenteditable="true"]') || r.width > 480 || r.width < 160 || r.left > 16) break
    track = parent
  }
  const layout = track.parentElement
  // A new route can mount its main track before its composer. The confirmed
  // sidebar/layout boundary identifies that sibling without reading messages.
  const siblings = layout ? [...layout.children].filter(el => el !== track
    && !el.matches('script,style,[role="dialog"],.ds-modal-content')) as HTMLElement[] : []
  const content = siblings.find(el => el.hasAttribute('data-dsh-chat-content'))
    ?? siblings.find(el => el.querySelector('textarea,[contenteditable="true"]'))
    ?? siblings.find(el => el.querySelector('._2be88ba > .the-header > ._9fcbeda'))
    ?? (siblings.length === 1 ? siblings[0] : undefined)
  // Recovery needs the full, bounded sidebar/content boundary, not only a
  // matching label. Do not hide an arbitrary ancestor during a partial commit.
  const trackRect = track.getBoundingClientRect()
  const contentRect = content?.getBoundingClientRect()
  const viewportWidth = doc.defaultView?.innerWidth ?? 0
  // Our confirmed track has display:none while adapted, so its measured width
  // is zero. Its owned layout boundary can validate a replacement main sibling
  // without briefly revealing the already hidden sidebar.
  const confirmedBoundary = track.hasAttribute(marker) && layout?.hasAttribute('data-dsh-chat-layout')
  // Identity uses the unchanged strict footer proof; a main-layout failure must
  // not prevent an independently confirmed account from saving its own grant.
  const viewportHeight = doc.defaultView?.innerHeight ?? 0
  const nicknameLeaf = (row: HTMLElement) => {
    const texts = doc.createTreeWalker(row, 4)
    let found: { element: HTMLElement; name: string } | null = null
    let text: Node | null
    while ((text = texts.nextNode())) {
      const parent = text.parentElement
      const excluded = parent?.closest('svg,script,style,[hidden],[aria-hidden="true"]')
      if (!parent || (excluded && row.contains(excluded))) continue
      const name = (text.textContent ?? '').trim()
      if (!name) continue
      // Read one bounded nickname leaf, never the sidebar's aggregate text.
      if (found || parent.childElementCount !== 0 || name.length > 100 || /[\r\n]/.test(name)) return null
      found = { element: parent, name }
    }
    return found
  }
  const checkProfile = (row: HTMLElement, image: HTMLImageElement, geometry: boolean) => {
    if (!row.isConnected || !track.contains(row) || row === sidebar || row === track || row === layout
      || row.contains(newChat) || row.matches('a[href]') || image.closest('a[href]')
      || row.closest('[role="dialog"],[role="menu"],[role="listbox"],.ds-modal-content,.ds-dropdown-menu,.ds-select-dropdown,.ds-popover')
      || row.querySelector('a[href],textarea,input,[contenteditable="true"],[role="menu"],[role="dialog"],.ds-dropdown-menu,.ds-modal-content')
      || row.querySelectorAll('img').length !== 1 || !row.contains(image)) return null
    if (geometry) {
      const bounds = row.getBoundingClientRect(), avatarBounds = image.getBoundingClientRect(), column = track.getBoundingClientRect()
      if (column.width < 160 || column.width > 480 || column.left < -1 || column.left > 16
        || bounds.top < viewportHeight * .75 || bounds.bottom > viewportHeight + 1 || bounds.height < 24 || bounds.height > 100
        || bounds.width < 80 || bounds.width > column.width + 1 || bounds.left < column.left - 1 || bounds.right > column.right + 1
        || avatarBounds.width < 8 || avatarBounds.width > 80 || avatarBounds.height < 8 || avatarBounds.height > 80
        || avatarBounds.left < bounds.left - 1 || avatarBounds.right > bounds.right + 1
        || avatarBounds.top < bounds.top - 1 || avatarBounds.bottom > bounds.bottom + 1) return null
    }
    const nickname = nicknameLeaf(row)
    return nickname ? { row, image, name: nickname.name } : null
  }
  type PublicProfile = NonNullable<ReturnType<typeof checkProfile>>
  let identifiedProfile: PublicProfile | null = null
  // Reuse only a row and avatar previously proven in a visible footer. Legacy
  // markers placed on whole columns carry no such proof and are removed.
  for (const candidate of doc.querySelectorAll<HTMLElement>(`[${profileMarker}]`)) {
    const image = candidate.querySelector<HTMLImageElement>(`img[${profileAvatarMarker}]`)
    const valid = candidate.getAttribute(profileProofMarker) === 'footer-v1' && image ? checkProfile(candidate, image, false) : null
    if (!identifiedProfile && valid) identifiedProfile = valid
    else { candidate.removeAttribute(profileMarker); candidate.removeAttribute(profileProofMarker) }
  }
  const findVisibleProfile = (): PublicProfile | null => {
    for (const image of track.querySelectorAll<HTMLImageElement>('img')) {
      if (image.closest('a[href]')) continue
      const bounds = image.getBoundingClientRect()
      if (bounds.top < viewportHeight * .75 || bounds.height < 8 || bounds.height > 80 || bounds.width < 8 || bounds.width > 80) continue
      for (let row = image.parentElement, depth = 0; row && row !== track && depth < 5; row = row.parentElement, depth++) {
        const valid = checkProfile(row, image, true)
        if (valid) return valid
      }
    }
    return null
  }
  if (!identifiedProfile) identifiedProfile = findVisibleProfile()
  if (!identifiedProfile && confirmedBoundary && trackRect.width === 0 && viewportHeight > 0) {
    // A late avatar can mount after we hid the confirmed column. Measure the
    // site's natural layout invisibly within this synchronous call. Forcing a
    // fixed track changes responsive footer geometry and can reject a real
    // profile forever after reload. Restore the sheet/style before any paint.
    const sheet = (doc.getElementById(styleId) as HTMLStyleElement | null)?.sheet
    if (sheet) {
      const inlineStyle = track.getAttribute('style'), disabled = sheet.disabled
      try {
        track.style.setProperty('visibility', 'hidden', 'important')
        track.style.setProperty('pointer-events', 'none', 'important')
        sheet.disabled = true
        identifiedProfile = findVisibleProfile()
      } finally {
        sheet.disabled = disabled
        if (inlineStyle === null) track.removeAttribute('style')
        else track.setAttribute('style', inlineStyle)
      }
    }
  }
  const profile = identifiedProfile?.row ?? null
  if (identifiedProfile) {
    profile!.setAttribute(profileMarker, '')
    profile!.setAttribute(profileProofMarker, 'footer-v1')
    identifiedProfile.image.setAttribute(profileAvatarMarker, '')
  }
  const accountName = identifiedProfile?.name ?? null
  const authenticated = identifiedProfile ? true : undefined
  const boundedContent = layout && content && content !== doc.body && content.isConnected
    && content.parentElement === layout && contentRect && contentRect.width > 0 && contentRect.height > 0
    && contentRect.right <= viewportWidth + 1
    && (confirmedBoundary || (trackRect.left >= -1 && trackRect.left <= 16
      && trackRect.width >= 160 && trackRect.width <= 480 && contentRect.left >= trackRect.right - 16))
  // Identity and layout deadlines advance independently, even if both fail.
  const profileExpired = authenticated !== true && !isOriginalSnapshot && (recovering || structureExpired(missingProfileMarker))
  if (authenticated === true) doc.documentElement.removeAttribute(missingProfileMarker)
  if (!boundedContent) {
    concealUnidentifiedPage()
    if (recovering || isOriginalSnapshot || structureExpired()) return fallback(profileExpired ? 'profile' : null, accountName)
    return { ...empty('loading'), ...(authenticated === true ? { authenticated, accountName } : {}) }
  }
  // A missing/changed avatar must not leave an empty mirrored list forever.
  // Keep probing the original page, without inventing a signed-out or signed-in state.
  if (profileExpired) {
    const keepChatLayout = track.hasAttribute(marker) && layout.hasAttribute('data-dsh-chat-layout')
      && content.hasAttribute('data-dsh-chat-content') && doc.documentElement.hasAttribute(presentedMarker)
      && Boolean(doc.getElementById(styleId)) && doc.defaultView?.getComputedStyle(track).display === 'none'
    return fallback('profile', null, keepChatLayout)
  }
  doc.documentElement.removeAttribute(missingSidebarMarker)
  doc.documentElement.removeAttribute(expandingMarker)
  doc.querySelectorAll(`[${compactToggleMarker}]`).forEach(button => button.removeAttribute(compactToggleMarker))
  if (recovering) {
    doc.documentElement.removeAttribute(fallbackMarker)
    doc.documentElement.removeAttribute(fallbackErrorMarker)
    // Resume the same document after its structural proof recovers. Keep its
    // presentation concealed until the adapted layout/settings are ready.
    doc.documentElement.setAttribute(presentedMarker, '')
  }
  // The sidebar and avatar may mount in separate React commits. Starting a
  // profile-menu request before its trigger exists would leave its phase stuck.
  // Wait for public profile evidence before performing any settings interaction.
  const settings = authenticated === true ? adaptWebsiteSettings(doc, profile, command) : undefined
  const settingsRoot = doc.documentElement
  const conversations: WebsiteConversation[] = []
  let group = '对话'
  const walker = doc.createTreeWalker(sidebar, 1 | 4, {
    acceptNode(node) {
      if (node instanceof Element && (node.matches('script,style,svg,input') || (node.parentElement?.closest('a[href]')))) return 2
      return 1
    },
  })
  let node: Node | null
  while ((node = walker.nextNode()) && conversations.length < 1000) {
    if (node instanceof HTMLAnchorElement) {
      const href = safeHref(node.getAttribute('href'))
      const title = (node.getAttribute('title') || node.textContent || '').trim().slice(0, 300)
      if (href && title && !conversations.some(item => item.href === href)) conversations.push({ href, title, group })
    } else if (node.nodeType === 3 && groups.test((node.textContent ?? '').trim())) group = (node.textContent ?? '').trim()
  }
  if (command.type === 'open') {
    const target = safeHref(command.href)
    const link = [...sidebar.querySelectorAll<HTMLAnchorElement>('a[href]')].find(item => safeHref(item.getAttribute('href')) === target)
    if (!target || !link) return fallback('open')
    link.click()
  } else if (command.type === 'new') {
    if (!newChat) return empty('unsupported')
    newChat.click()
  } else if (command.type === 'more') {
    doc.getElementById(styleId)?.remove()
    const scrollable = [...sidebar.querySelectorAll<HTMLElement>('*')].find(element => element.scrollHeight > element.clientHeight + 20
      && /auto|scroll/.test(getComputedStyle(element).overflowY))
    scrollable?.scrollTo({ top: scrollable.scrollHeight, behavior: 'instant' })
  }
  const selected = conversations.find(item => item.href === safeHref(page.pathname))
  if (command.type === 'snapshot' && command.showOriginal) restore()
  else {
    if (trackRect.width >= 160 && trackRect.width <= 480) track.setAttribute(navigationWidthMarker, String(trackRect.width))
    track.setAttribute(marker, '')
    // Keep the inner navigation addressable after the track is hidden.
    sidebar.setAttribute(marker, '')
    if (content && layout) {
      layout.setAttribute('data-dsh-chat-layout', '')
      content.setAttribute('data-dsh-chat-content', '')
      for (const candidate of content.querySelectorAll<HTMLElement>('div,header')) {
        const r = candidate.getBoundingClientRect()
        if (r.top >= -1 && r.top <= 72 && r.height > 0 && r.height <= 80 && r.width <= 400
          && candidate.querySelectorAll(iconButtonSelector).length >= 2 && candidate.querySelectorAll(iconButtonSelector).length <= 3 && candidate.querySelector('svg,img')
          && !candidate.querySelector('textarea,[contenteditable="true"]') && !candidate.textContent?.trim()) candidate.setAttribute('data-dsh-chat-web-chrome', '')
      }
    }
    // Native settings shares this desktop guest; public settings requests must
    // not reveal its sidebar while the content still fills the entire layout.
    // That conflicting geometry prevents subsequent probes from advancing the
    // settings request, including its deadline, and leaves refresh waiting.
    const styleText=`[data-dsh-chat-action-menu]{visibility:hidden!important;pointer-events:none!important}
        [${marker}],[data-dsh-chat-web-chrome]{display:none!important}
        [data-dsh-chat-layout]{grid-template-columns:minmax(0,1fr)!important}
        [data-dsh-chat-content]{margin-left:0!important;min-width:0!important;width:100%!important;max-width:none!important;flex:1 1 0%!important}`
    let style=doc.getElementById(styleId)
    if(!style){style=doc.createElement('style');style.id=styleId;doc.head.append(style)}
    if(style.textContent!==styleText) style.textContent=styleText
    // Lock the verified title host before the site's first native collapse can start a positional transition.
    adaptWebsiteHeader(doc, content, selected?.title ?? null, command.type === 'snapshot' ? command.headerInset ?? (Number.parseInt(settingsRoot.style.getPropertyValue('--dsh-chat-title-inset')) || 24) : Number.parseInt(settingsRoot.style.getPropertyValue('--dsh-chat-title-inset')) || 24)
    if(authenticated===true && command.type==='snapshot' && !command.showOriginal) collapseWebsiteSidebar(doc,track)

  }
  // A failed appearance sync must reveal the legitimate website and its own
  // environment/security notices. Keep the error retryable; do not claim an unverified theme.
  const ready = authenticated !== true || (settingsRoot.getAttribute('data-dsh-chat-theme-complete') === (settingsRoot.getAttribute('data-dsh-chat-host-theme') === 'light' ? 'light' : 'dark') && (!settingsRoot.hasAttribute('data-dsh-chat-host-language') || settingsRoot.getAttribute('data-dsh-chat-language-complete') === settingsRoot.getAttribute('data-dsh-chat-host-language'))) || Boolean(settings?.error) || (command.type==='snapshot' && command.showOriginal)
  if (ready) {
    settingsRoot.removeAttribute('data-dsh-chat-preparing')
    if (!(command.type === 'snapshot' && command.showOriginal)) settingsRoot.setAttribute(presentedMarker, '')
  }
  return { status: ready ? 'ready' : 'loading', ...(authenticated === undefined ? {} : { authenticated }), conversations, selectedHref: safeHref(page.pathname), canCreate: newChat !== null, error: doc.documentElement.getAttribute('data-dsh-chat-conversation-error'), accountName, settings }
}

export function websiteCommandScript(command: WebsiteCommand, contentFontSize = 14, colorScheme: 'light' | 'dark' = 'dark', language: ChatLanguage | null = null): string {
  const shareCopy = `(${configureWebsiteShareCopy.toString()})(document,${command.type !== 'restore' && !(command.type === 'snapshot' && command.showOriginal)});`
  const typography = `(${applyWebsiteTypography.toString()})(document,${command.type === 'restore' || (command.type === 'snapshot' && command.showOriginal) ? 'null' : JSON.stringify(Number.isFinite(contentFontSize) ? contentFontSize : 14)});`
  const theme = command.type === 'restore' || (command.type === 'snapshot' && command.showOriginal)
    ? "document.documentElement.removeAttribute('data-dsh-chat-host-theme');"
    : `document.documentElement.setAttribute('data-dsh-chat-host-theme',${JSON.stringify(colorScheme === 'light' ? 'light' : 'dark')});`
  const locale = command.type === 'restore' || (command.type === 'snapshot' && command.showOriginal) || (language !== 'en' && language !== 'zh-CN')
    ? "document.documentElement.removeAttribute('data-dsh-chat-host-language');"
    : `document.documentElement.setAttribute('data-dsh-chat-host-language',${JSON.stringify(language)});`
  if (command.type==='refresh') throw new Error('Website refresh must be handled by the guest owner')
  if (command.type === 'conversation-action') return `(async () => { ${shareCopy} ${typography} ${theme} ${locale} const collapseWebsiteSidebar = ${collapseWebsiteSidebar.toString()}; const adaptWebsiteSettings = ${adaptWebsiteSettings.toString()}; const adaptWebsiteHeader = ${adaptWebsiteHeader.toString()}; const dismissWebsiteEnvironmentNotice = ${dismissWebsiteEnvironmentNotice.toString()}; const adapt = ${adaptWebsiteNavigation.toString()}; const command = ${JSON.stringify(command)}; const before = adapt(document,location,{type:'snapshot',showOriginal:false}); if (before.authenticated !== true || !before.conversations.some(item=>item.href===command.href)) return before; const error = await (${performWebsiteConversationAction.toString()})(document,command); if(error) document.documentElement.setAttribute('data-dsh-chat-conversation-error',error); else document.documentElement.removeAttribute('data-dsh-chat-conversation-error'); return adapt(document,location,{type:'snapshot',showOriginal:false}); })()`
  return `(() => { ${shareCopy} ${typography} ${theme} ${locale} const collapseWebsiteSidebar = ${collapseWebsiteSidebar.toString()}; const adaptWebsiteSettings = ${adaptWebsiteSettings.toString()}; const adaptWebsiteHeader = ${adaptWebsiteHeader.toString()}; const dismissWebsiteEnvironmentNotice = ${dismissWebsiteEnvironmentNotice.toString()}; return (${adaptWebsiteNavigation.toString()})(document,location,${JSON.stringify(command)}); })()`
}

/** Treat the guest response as untrusted; keep only bounded, origin-scoped list data. */
export function parseWebsiteNavigation(value: unknown): WebsiteNavigation {
  if (!value || typeof value !== 'object') throw new Error('Invalid navigation response')
  const source = value as WebsiteNavigation
  if (!['loading', 'ready', 'sign-in', 'unsupported'].includes(source.status) || !Array.isArray(source.conversations)) throw new Error('Invalid navigation response')
  const validHref = (href: unknown): href is string => typeof href === 'string' && /^https:\/\/chat\.deepseek\.com\/a\/chat\/s\/[a-zA-Z0-9-]+$/.test(href)
  const conversations = source.conversations.slice(0, 1000).filter(item => item && validHref(item.href) && typeof item.title === 'string' && typeof item.group === 'string')
    .map(item => ({ href: item.href, title: item.title.slice(0, 300), group: item.group.slice(0, 80) }))
  const authenticated = source.status === 'sign-in' ? false : source.authenticated === true ? true
    : source.authenticated === false ? false : undefined
  const navigationReady = authenticated === true && source.status === 'ready'
  return { status: source.status, ...(authenticated === undefined ? {} : { authenticated }), ...(source.status === 'unsupported' && source.identityUnconfirmed === true ? { identityUnconfirmed: true, layoutReady: source.layoutReady === true } : {}), conversations: navigationReady ? conversations : [], selectedHref: validHref(source.selectedHref) ? source.selectedHref : null,
    accountName: authenticated === true && typeof source.accountName === 'string' ? source.accountName.slice(0,100) : null,
    settings: source.settings ? {language:typeof source.settings.language === 'string' ? source.settings.language.slice(0,80) : null,theme:typeof source.settings.theme === 'string' ? source.settings.theme.slice(0,80) : null,error:typeof source.settings.error === 'string' ? source.settings.error.slice(0,200) : null,pending:source.settings.pending===true} : undefined,
    canCreate: navigationReady && source.canCreate === true, error: typeof source.error === 'string' ? source.error.slice(0, 300) : null }
}
