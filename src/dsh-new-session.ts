import type { ShortcutPlatform } from './shortcuts.js'

/** The subset of a DSH shortcut gesture we must recognize. */
export interface DshShortcutGesture {
  readonly code?: unknown
  readonly meta?: unknown
  readonly control?: unknown
  readonly alt?: unknown
  readonly shift?: unknown
}

/** A keydown that DSH binds to its New Session command (primary+N). */
export function isDshNewSessionGesture(gesture: DshShortcutGesture | null | undefined, platform: ShortcutPlatform): boolean {
  if (!gesture || gesture.code !== 'KeyN' || gesture.shift === true) return false
  return platform === 'mac' ? gesture.meta === true : gesture.control === true
}

export interface DshShortcutRegistry {
  dispatch?: (gesture: unknown, context: unknown, consume?: unknown) => unknown
}

export interface DshWebviewShortcutOptions {
  readonly platform: ShortcutPlatform
  readonly isChat: () => boolean
  readonly openChatNewConversation: () => void
}

/**
 * DSH forwards keys from the CHAT webview to its shortcut registry. While CHAT
 * is active, redirect its New Session binding to a website conversation and
 * keep the remaining DSH desktop shortcuts out of the website. Every other
 * input path (and HARNESS mode) is left untouched.
 * @returns disposer restoring the registry, or null when the surface is absent.
 */
export function takeOverDshWebviewShortcuts(registry: DshShortcutRegistry | undefined, options: DshWebviewShortcutOptions): (() => void) | null {
  if (!registry || typeof registry.dispatch !== 'function') return null
  const original = registry.dispatch
  const wrapped = function (this: unknown, gesture: unknown, context: unknown, consume?: unknown) {
    const source = (context as { readonly source?: unknown } | null | undefined)?.source
    if (source !== 'webview' || !options.isChat()) return original.call(this, gesture, context, consume)
    if (isDshNewSessionGesture(gesture as DshShortcutGesture, options.platform)) {
      try { (consume as (() => void) | undefined)?.() } catch { /* consume is best effort */ }
      options.openChatNewConversation()
      return { status: 'handled' }
    }
    // Keep HARNESS desktop commands from acting behind the CHAT website.
    return { status: 'pass' }
  }
  registry.dispatch = wrapped
  return () => { if (registry.dispatch === wrapped) registry.dispatch = original }
}
