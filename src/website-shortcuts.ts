/**
 * Guest-side shortcut interceptor. Electron's webview tag does not forward a
 * cancellable `before-input-event`, so the plugin injects a small capture-phase
 * keydown listener into the approved guest. It consumes the configured
 * mode-switch shortcut before the page does and reports the action through the
 * console channel, which the host listens to via the webview `console-message`
 * event. No page data, text or credentials cross this bridge.
 */
import { parseShortcut, type ShortcutBinding } from './shortcuts.js'

export const WEBSITE_SHORTCUT_MARKER = 'dsh-chat-shortcut:'

export interface WebsiteShortcutConfig {
  readonly enabled: boolean
  readonly chat: string
  readonly harness: string
}

export type WebsiteShortcutAction = 'chat' | 'harness' | 'toggle'

const NAMED_KEYS = ['Tab', 'Enter', 'Escape', 'Space', 'Backspace', 'Delete', 'Insert', 'Home', 'End',
  'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']

function bindingSource(binding: ShortcutBinding | null): string {
  return binding === null ? 'null' : JSON.stringify({ ctrl: binding.ctrl, alt: binding.alt, shift: binding.shift, meta: binding.meta, key: binding.key })
}

/** Serialized into the approved guest. Keep all helpers inside the IIFE. */
export function websiteShortcutScript(config: WebsiteShortcutConfig): string {
  const payload = `{enabled:${JSON.stringify(config.enabled)},chat:${bindingSource(parseShortcut(config.chat))},harness:${bindingSource(parseShortcut(config.harness))}}`
  return `(() => {
  const marker = ${JSON.stringify(WEBSITE_SHORTCUT_MARKER)};
  const config = ${payload};
  if (window.__dshChatShortcut) { window.__dshChatShortcut.config = config; return true; }
  if (!config.enabled) return false;
  const named = new Set(${JSON.stringify(NAMED_KEYS)});
  const canonical = key => {
    if (key === ' ' || key === 'Spacebar') return 'Space';
    if (typeof key !== 'string') return null;
    if (key.length === 1) { const upper = key.toUpperCase(); return /^[A-Z0-9]$/.test(upper) ? upper : null; }
    return named.has(key) ? key : null;
  };
  const same = (binding, key, event) => Boolean(binding) && binding.key === key
    && binding.ctrl === event.ctrlKey && binding.alt === event.altKey
    && binding.shift === event.shiftKey && binding.meta === event.metaKey;
  const action = event => {
    const current = window.__dshChatShortcut.config;
    if (!current) return null;
    const key = canonical(event.key);
    if (!key) return null;
    const chat = same(current.chat, key, event), harness = same(current.harness, key, event);
    if (chat && harness) return 'toggle';
    if (chat) return 'chat';
    if (harness) return 'harness';
    return null;
  };
  const handler = event => {
    if (!window.__dshChatShortcut || event.isComposing || event.repeat || event.defaultPrevented) return;
    const next = action(event);
    if (!next) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try { console.log(marker + next); } catch {}
  };
  window.__dshChatShortcut = { config, handler };
  window.addEventListener('keydown', handler, true);
  return true;
})()`
}

/** Parse one guest console line without trusting anything else on the channel. */
export function parseWebsiteShortcutMessage(value: unknown): WebsiteShortcutAction | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith(WEBSITE_SHORTCUT_MARKER)) return null
  const action = trimmed.slice(WEBSITE_SHORTCUT_MARKER.length)
  return action === 'chat' || action === 'harness' || action === 'toggle' ? action : null
}
