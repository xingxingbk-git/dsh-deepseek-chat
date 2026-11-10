/** Keyboard shortcuts for Chat/Harness switching. Pure, DOM-free and testable. */
export type ShortcutPlatform = 'mac' | 'other'

export interface ShortcutEventLike {
  readonly key: string
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly shiftKey: boolean
  readonly metaKey: boolean
}

export interface ShortcutBinding {
  readonly ctrl: boolean
  readonly alt: boolean
  readonly shift: boolean
  readonly meta: boolean
  readonly key: string
}

export const DEFAULT_SHORTCUT = 'Tab'
/** Placeholder while the field is capturing a key. */
export const SHORTCUT_CAPTURE_HINT = '按下快捷键'
export const SHORTCUT_PENDING_HINT = '请再按一个主键'
export const SHORTCUT_RESERVED_HINT = '该组合与系统或浏览器快捷键冲突'
export const SHORTCUT_INVALID_HINT = '无法识别该按键，请重试'

const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'OS', 'AltGraph', 'CapsLock', 'Fn', 'Hyper', 'Super'])
const NAMED_KEYS = new Set(['Tab', 'Enter', 'Escape', 'Space', 'Backspace', 'Delete', 'Insert', 'Home', 'End',
  'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'])

export function shortcutPlatform(platform?: string | null): ShortcutPlatform {
  return /mac/i.test(platform ?? '') ? 'mac' : 'other'
}

/** Physical modifier names stored on disk; they render platform-specifically. */
export function modifierDisplay(name: 'Ctrl' | 'Alt' | 'Shift' | 'Meta', platform: ShortcutPlatform): string {
  if (name === 'Meta') return platform === 'mac' ? 'Cmd' : 'Win'
  return name
}

function canonicalKey(key: string): string | null {
  if (key === ' ' || key === 'Spacebar') return 'Space'
  if (key.length === 1) {
    const upper = key.toUpperCase()
    return /^[A-Z0-9]$/.test(upper) ? upper : null
  }
  return NAMED_KEYS.has(key) ? key : null
}

/** Normalize a raw keydown into `Ctrl+Alt+Shift+Meta+KEY`, or null when unusable. */
export function normalizeShortcut(event: ShortcutEventLike, platform: ShortcutPlatform = 'other'): string | null {
  if (MODIFIERS.has(event.key)) return null
  const key = canonicalKey(event.key)
  if (!key) return null
  const parts: string[] = []
  if (event.metaKey) parts.push('Meta')
  if (event.ctrlKey) parts.push('Ctrl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')
  parts.push(key)
  // `platform` is accepted for symmetry with displayShortcut; storage stays physical.
  void platform
  return parts.join('+')
}

export function parseShortcut(value: unknown): ShortcutBinding | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 64) return null
  const parts = value.split('+')
  if (parts.length === 0 || parts.length > 5) return null
  const rawKey = parts[parts.length - 1]!
  const key = canonicalKey(rawKey)
  if (!key) return null
  let ctrl = false, alt = false, shift = false, meta = false
  const seen = new Set<string>()
  for (const part of parts.slice(0, -1)) {
    const name = part.toLowerCase()
    if (seen.has(name)) return null
    seen.add(name)
    if (name === 'ctrl' || name === 'control') ctrl = true
    else if (name === 'alt') alt = true
    else if (name === 'shift') shift = true
    else if (name === 'meta') meta = true
    else return null
  }
  return { ctrl, alt, shift, meta, key }
}

export function validShortcut(value: unknown): boolean {
  return parseShortcut(value) !== null
}

/** Stored names are physical; display swaps Meta to Cmd/Win per platform. */
export function displayShortcut(value: string, platform: ShortcutPlatform = 'other'): string {
  const binding = parseShortcut(value)
  if (!binding) return value
  const parts: string[] = []
  if (binding.meta) parts.push(modifierDisplay('Meta', platform))
  if (binding.ctrl) parts.push('Ctrl')
  if (binding.alt) parts.push('Alt')
  if (binding.shift) parts.push('Shift')
  parts.push(binding.key)
  return parts.join('+')
}

export function matchesShortcut(event: ShortcutEventLike, value: string): boolean {
  const binding = parseShortcut(value)
  const key = canonicalKey(event.key)
  if (!binding || !key) return false
  return binding.key === key && binding.ctrl === event.ctrlKey && binding.alt === event.altKey
    && binding.shift === event.shiftKey && binding.meta === event.metaKey
}

/**
 * Modifiers the host, Chromium or the OS already own. Tab itself is allowed.
 * On macOS only the system-level Cmd shortcuts are kept reserved; editor-style
 * combos such as Cmd+A/C/V/X/Z/S stay available. On Windows every Win combo is
 * system-level, so plain Meta bindings remain reserved there.
 */
export function reservedShortcut(value: string, platform: ShortcutPlatform = 'other'): boolean {
  const binding = parseShortcut(value)
  if (!binding) return false
  const { ctrl, alt, shift, meta, key } = binding
  if (key === 'Escape' || key === 'F12' || key === 'F5') return true
  if (alt && (key === 'F4' || key === 'Tab')) return true
  if (meta && !ctrl && !alt) {
    if (platform !== 'mac') return true
    if (!shift && ['Q', 'W', 'R', 'M', 'H', 'Tab', 'Space', 'N', 'T'].includes(key)) return true
    if (shift && ['I', 'J', 'C', 'V'].includes(key)) return true
    return false
  }
  if (ctrl && !alt && !shift && !meta && ['W', 'R', 'Q', 'P', 'N', 'T', 'F', 'L', 'D', 'H'].includes(key)) return true
  if (ctrl && shift && !alt && !meta && ['I', 'J', 'C', 'V', 'N', 'P', 'T', 'W', 'R'].includes(key)) return true
  return false
}

export type ShortcutCapture =
  | { readonly kind: 'cancel' }
  | { readonly kind: 'clear' }
  | { readonly kind: 'pending' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'reserved'; readonly value: string }
  | { readonly kind: 'set'; readonly value: string }

/** One keydown inside a capturing field. Esc/Backspace exit or clear; modifiers wait. */
export function captureShortcut(event: ShortcutEventLike, platform: ShortcutPlatform = 'other'): ShortcutCapture {
  if (event.key === 'Escape') return { kind: 'cancel' }
  if (event.key === 'Backspace' || event.key === 'Delete') return { kind: 'clear' }
  if (MODIFIERS.has(event.key)) return { kind: 'pending' }
  const value = normalizeShortcut(event, platform)
  if (!value) return { kind: 'invalid' }
  if (reservedShortcut(value, platform)) return { kind: 'reserved', value }
  return { kind: 'set', value }
}

export interface ShortcutContext {
  readonly enabled: boolean
  readonly modeEnabled: boolean
  readonly editable: boolean
  readonly inWebsite: boolean
  readonly composing: boolean
  readonly defaultPrevented: boolean
}

/** The global listener must stay out of text fields and the CHAT webview. */
export function shouldHandleShortcut(context: ShortcutContext): boolean {
  return context.enabled && context.modeEnabled && !context.editable && !context.inWebsite
    && !context.composing && !context.defaultPrevented
}

export type ShortcutAction = 'chat' | 'harness' | 'toggle'

/** Same binding for both directions is a deliberate toggle, not a conflict. */
export function shortcutAction(event: ShortcutEventLike, chat: string, harness: string): ShortcutAction | null {
  if (matchesShortcut(event, chat) && matchesShortcut(event, harness)) return 'toggle'
  if (matchesShortcut(event, chat)) return 'chat'
  if (matchesShortcut(event, harness)) return 'harness'
  return null
}

export function shortcutActionLabel(action: ShortcutAction): 'chat' | 'harness' | 'toggle' {
  return action
}
