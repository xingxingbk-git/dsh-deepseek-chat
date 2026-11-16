/** Non-secret, profile-owned mode-switch UI preferences. */
import { DEFAULT_SHORTCUT, validShortcut } from './shortcuts.js'
export type WebsiteLifetime = 'retain' | 'immediate' | 'delayed'
export const WEBSITE_RELEASE_DELAY_MIN = 5
export const WEBSITE_RELEASE_DELAY_MAX = 3600
export const DEFAULT_WEBSITE_RELEASE_DELAY = 60
export interface SwitchPreferences {
  readonly switchStyle: 'text' | 'icon'
  readonly chatLabel: string
  readonly harnessLabel: string
  readonly websiteLifetime: WebsiteLifetime
  readonly websiteReleaseDelay: number
  readonly shortcutEnabled: boolean
  readonly shortcutChat: string
  readonly shortcutHarness: string
}
export const DEFAULT_SWITCH_PREFERENCES: SwitchPreferences = Object.freeze({switchStyle:'text',chatLabel:'CHAT',harnessLabel:'HARNESS',websiteLifetime:'retain',websiteReleaseDelay:DEFAULT_WEBSITE_RELEASE_DELAY,shortcutEnabled:true,shortcutChat:DEFAULT_SHORTCUT,shortcutHarness:DEFAULT_SHORTCUT})
/** One write to the switch preferences: labels keep their width limit, while
 * shortcut fields must be keyboard bindings (modifiers + one key), never label
 * text — their stored form is longer than a switch label by design. */
export function validSwitchPreference(field: keyof SwitchPreferences, value: unknown): boolean {
  switch (field) {
    case 'switchStyle': return value === 'text' || value === 'icon'
    case 'websiteLifetime': return value === 'retain' || value === 'immediate' || value === 'delayed'
    case 'websiteReleaseDelay': return typeof value === 'number' && Number.isInteger(value)
      && value >= WEBSITE_RELEASE_DELAY_MIN && value <= WEBSITE_RELEASE_DELAY_MAX
    case 'shortcutEnabled': return typeof value === 'boolean'
    case 'shortcutChat':
    case 'shortcutHarness': return typeof value === 'string' && validShortcut(value)
    case 'chatLabel':
    case 'harnessLabel': return validSwitchLabel(value)
    default: return false
  }
}
export const SWITCH_LABEL_LIMIT = 10
/** Printable ASCII costs one; all other Unicode code points cost two. Never split surrogates. */
export function switchLabelWidth(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + (char.codePointAt(0)! <= 0x7f ? 1 : 2), 0)
}
// Each branch counts k non-ASCII points and at most 10-k total points: total width <=10.
// Explicitly exclude controls/bidi formatting/line separators; labels must contain visible text.
export const SWITCH_LABEL_PATTERN = new RegExp('^(?![\\s\\S]*[\\p{Cc}\\p{Cf}\\p{Zl}\\p{Zp}])(?=.*\\S)(?:' +
  Array.from({length:6},(_,wide) => `(?=.{1,${SWITCH_LABEL_LIMIT-wide}}$)[\\x20-\\x7e]*(?:[^\\x00-\\x7f][\\x20-\\x7e]*){${wide}}`).join('|') + ')$', 'u')
export function validSwitchLabel(value: unknown): value is string {
  return typeof value === 'string' && SWITCH_LABEL_PATTERN.test(value) && switchLabelWidth(value) <= SWITCH_LABEL_LIMIT
}
export function parseSwitchPreferences(value: unknown): SwitchPreferences {
  const v = value && typeof value === 'object' ? value as Partial<SwitchPreferences> : {}
  return {
    switchStyle: v.switchStyle === 'icon' ? 'icon' : 'text',
    chatLabel: validSwitchLabel(v.chatLabel) ? v.chatLabel : DEFAULT_SWITCH_PREFERENCES.chatLabel,
    harnessLabel: validSwitchLabel(v.harnessLabel) ? v.harnessLabel : DEFAULT_SWITCH_PREFERENCES.harnessLabel,
    websiteLifetime: v.websiteLifetime === 'immediate' || v.websiteLifetime === 'delayed' ? v.websiteLifetime : 'retain',
    websiteReleaseDelay: typeof v.websiteReleaseDelay === 'number' && Number.isInteger(v.websiteReleaseDelay)
      && v.websiteReleaseDelay >= WEBSITE_RELEASE_DELAY_MIN && v.websiteReleaseDelay <= WEBSITE_RELEASE_DELAY_MAX
      ? v.websiteReleaseDelay : DEFAULT_WEBSITE_RELEASE_DELAY,
    shortcutEnabled: v.shortcutEnabled !== false,
    shortcutChat: typeof v.shortcutChat === 'string' && validShortcut(v.shortcutChat) ? v.shortcutChat : DEFAULT_SHORTCUT,
    shortcutHarness: typeof v.shortcutHarness === 'string' && validShortcut(v.shortcutHarness) ? v.shortcutHarness : DEFAULT_SHORTCUT,
  }
}
