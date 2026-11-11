import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ReactNode } from 'react'

export const CHAT_SETTINGS_SECTION_ID = 'dsh-deepseek-chat.chat-settings'

/** Prefer the 0.2.2 public icon seat. Keep the approved decoration only while
 * that declaration is absent on older shells; never rewrite the new nav DOM. */
export function bindChatSettingsIconSlot(
  slots: Context['slots'],
  component: (props: { size: number; active: boolean }) => ReactNode,
  doc?: Document,
): () => void {
  let disposed = false
  let releaseLegacy = () => {}
  // The icon seat only exists on newer shells (0.2.2+). Older 0.2.0/0.2.1
  // shells use the approved DOM fallback; an unknown slot must never break
  // the client startup if inject() rejects it.
  type CompatSlots = {
    spec(name: string): unknown
    inject(name: string, callback: () => () => void): () => void
    register(options: { name: string; id: string }, component: unknown): () => void
  }
  const compat = slots as unknown as CompatSlots
  const seat = 'settings.section.icon'
  const legacy = () => {
    if (!disposed && doc && !compat.spec(seat)) releaseLegacy = bindChatSettingsIcon(doc)
  }
  let releaseSlot = () => {}
  try {
    releaseSlot = compat.inject(seat, () => {
      releaseLegacy(); releaseLegacy = () => {}
      const unregister = compat.register({ name: seat, id: CHAT_SETTINGS_SECTION_ID }, component)
      return () => { unregister(); legacy() }
    })
  } catch { releaseSlot = () => {} }
  legacy()
  return () => {
    if (disposed) return
    disposed = true
    releaseSlot(); releaseLegacy()
  }
}

/** User-approved fallback for our one settings row on shells without an icon
 * seat. Leave its label, SVG, event handlers and every other row untouched. */
export function bindChatSettingsIcon(doc: Document): () => void {
  const Observer = doc.defaultView?.MutationObserver
  if (!doc.body || !Observer) return () => {}
  const marker = 'data-dsh-chat-settings-icon'
  const labels = new Set(['Chat 设置', 'Chat settings'])
  let panel: Element | null = null
  const marked = new Map<Element, string | null>()
  const restore = (row: Element, previous: string | null) => {
    if (previous === null) row.removeAttribute(marker)
    else row.setAttribute(marker, previous)
  }
  const reconcile = () => {
    const candidates: Element[] = []
    const navs = panel ? [...panel.children].filter(node => node.tagName === 'NAV') : []
    if (navs.length === 1 && panel?.getAttribute('role') === 'dialog'
      && panel.getAttribute('aria-modal') === 'true'
      && panel.getAttribute('data-shortcut-modal') === 'settings') {
      for (const row of navs[0]!.querySelectorAll('button[type="button"]')) {
        const [icon, label] = [...row.children]
        if (row.parentElement?.parentElement !== navs[0] || row.children.length !== 2
          || icon?.tagName.toLowerCase() !== 'svg' || icon.getAttribute('aria-hidden') !== 'true'
          || label?.tagName !== 'SPAN' || label.childElementCount !== 0
          || !labels.has(label.textContent?.trim() ?? '')) continue
        candidates.push(row)
      }
    }
    // Ambiguous or changed structure is not permission to decorate another row.
    const next = candidates.length === 1 ? candidates[0] : null
    for (const [row, previous] of marked) if (row !== next) { restore(row, previous); marked.delete(row) }
    if (next && !marked.has(next)) {
      marked.set(next, next.getAttribute(marker))
      next.setAttribute(marker, 'chat')
    }
  }
  let roots = new Set<Element>()
  const settingsObserver = new Observer(() => discover())
  const discover = () => {
    const panels = doc.body.querySelectorAll(':scope > [role="presentation"] > [data-shortcut-modal="settings"]')
    panel = panels.length === 1 ? panels[0]! : null
    // Retain known portal observers through transient/ambiguous shapes, so a
    // second dialog inside the same overlay is detected and recovery is safe.
    const nextRoots = new Set([...roots].filter(root => root.parentElement === doc.body))
    for (const candidate of panels) nextRoots.add(candidate.parentElement!)
    if (nextRoots.size !== roots.size || [...nextRoots].some(root => !roots.has(root))) {
      settingsObserver.disconnect()
      roots = nextRoots
      for (const root of roots) settingsObserver.observe(root, { childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ['role', 'aria-modal', 'data-shortcut-modal', 'type', 'aria-hidden'] })
    }
    reconcile()
  }
  // Watch only direct body portal additions and recognized settings overlays,
  // never the entire app subtree or a polling timer.
  const portalObserver = new Observer(discover)
  portalObserver.observe(doc.body, { childList: true })
  discover()
  return () => {
    portalObserver.disconnect()
    settingsObserver.disconnect()
    for (const [row, previous] of marked) restore(row, previous)
    marked.clear()
  }
}
