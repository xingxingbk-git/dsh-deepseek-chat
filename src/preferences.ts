/** Non-secret, profile-owned mode-switch UI preferences. */
export interface SwitchPreferences {
  readonly switchStyle: 'text' | 'icon'
  readonly chatLabel: string
  readonly harnessLabel: string
}
export const DEFAULT_SWITCH_PREFERENCES: SwitchPreferences = Object.freeze({switchStyle:'text',chatLabel:'CHAT',harnessLabel:'HARNESS'})
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
  }
}
