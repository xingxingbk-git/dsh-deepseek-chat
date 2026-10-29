import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_SWITCH_PREFERENCES, SWITCH_LABEL_PATTERN, parseSwitchPreferences, switchLabelWidth, validSwitchLabel } from '../src/preferences.js'
import { SwitchPreferencesConfig } from '../src/preferences-schema.js'

const accepted = ['ABCDEFGHIJ', '一二三四五', 'AB中文CD', 'AB😀中CD', '😀😀😀😀😀', 'ééééé', ' A ']
const rejected = ['', '   ', 'ABCDEFGHIJK', '一二三四五六', 'ABCDE中文中', '😀😀😀😀😀A', 'A\nB', 'A\tB', 'A\u0000B', 'A\u200dB', 'A\u202eB', 'A\u2028B', 'A\u2029B']

test('known width boundaries include ASCII, Chinese, mixed, accented and astral points', () => {
  for (const value of accepted) assert.equal(validSwitchLabel(value), true, JSON.stringify(value))
  for (const value of rejected) assert.equal(validSwitchLabel(value), false, JSON.stringify(value))
  assert.equal(switchLabelWidth('ABCDEFGHIJ'), 10)
  assert.equal(switchLabelWidth('一二三四五'), 10)
  assert.equal(switchLabelWidth('AB😀中CD'), 8)
  assert.equal(switchLabelWidth('😀😀😀😀😀'), 10)
})

test('regex independently agrees with known-cost exhaustive mixed and non-ASCII strings', () => {
  // Generate expected cost from token metadata, not the production width
  // function or code-point classification. Includes all placements of spaces,
  // ASCII, BMP Chinese and surrogate-pair emoji through seven tokens.
  const tokens = [{ text: 'A', cost: 1, visible: true }, { text: ' ', cost: 1, visible: false }, { text: '中', cost: 2, visible: true }, { text: '😀', cost: 2, visible: true }]
  let checked = 0
  const visit = (value: string, cost: number, visible: boolean, remaining: number) => {
    const expected = visible && cost <= 10
    assert.equal(SWITCH_LABEL_PATTERN.test(value), expected, `regex ${JSON.stringify(value)} expected cost ${cost}`)
    assert.equal(validSwitchLabel(value), expected, `helper ${JSON.stringify(value)}`)
    checked++
    if (remaining) for (const token of tokens) visit(value + token.text, cost + token.cost, visible || token.visible, remaining - 1)
  }
  visit('', 0, false, 7)
  assert.equal(checked, 21845)
  // Longer ASCII-heavy mixtures exercise every alternation boundary beyond
  // the seven-token exhaustive set, with non-ASCII placed at both ends.
  for (let ascii = 0; ascii <= 12; ascii++) for (let wide = 0; wide <= 6; wide++) {
    const expected = ascii + wide > 0 && ascii + 2 * wide <= 10
    for (const value of ['é'.repeat(wide) + 'X'.repeat(ascii), 'X'.repeat(ascii) + '😀'.repeat(wide)]) {
      assert.equal(SWITCH_LABEL_PATTERN.test(value), expected, `boundary ${JSON.stringify(value)}`)
    }
  }
})

test('parse defaults malformed preferences without losing valid independent fields', () => {
  assert.deepEqual(parseSwitchPreferences(null), DEFAULT_SWITCH_PREFERENCES)
  assert.deepEqual(parseSwitchPreferences({ switchStyle: 'icon', chatLabel: '中文AB', harnessLabel: 'x'.repeat(11) }), { switchStyle: 'icon', chatLabel: '中文AB', harnessLabel: 'HARNESS' })
  assert.deepEqual(parseSwitchPreferences({ switchStyle: 'other', chatLabel: 42, harnessLabel: '工作区' }), { switchStyle: 'text', chatLabel: 'CHAT', harnessLabel: '工作区' })
  assert.equal(Object.isFrozen(DEFAULT_SWITCH_PREFERENCES), true)
})

test('actual Host schema exposes all three settings as volatile with defaults', () => {
  const config = SwitchPreferencesConfig({})
  assert.equal(config.switchStyle.get(), 'text')
  assert.equal(config.chatLabel.get(), 'CHAT')
  assert.equal(config.harnessLabel.get(), 'HARNESS')
  for (const name of ['switchStyle', 'chatLabel', 'harnessLabel'] as const) assert.equal(SwitchPreferencesConfig.dict![name].meta.volatile, true)
  const value = SwitchPreferencesConfig({ switchStyle: 'icon', chatLabel: '聊天', harnessLabel: '工作区' })
  assert.equal(value.switchStyle.get(), 'icon')
  assert.equal(value.chatLabel.get(), '聊天')
  assert.equal(value.harnessLabel.get(), '工作区')
})

test('actual Host schema accepts width-valid labels and rejects controls/overflow', () => {
  for (const value of accepted) for (const field of ['chatLabel', 'harnessLabel']) assert.doesNotThrow(() => SwitchPreferencesConfig({ [field]: value }))
  for (const value of rejected) for (const field of ['chatLabel', 'harnessLabel']) assert.throws(() => SwitchPreferencesConfig({ [field]: value }), undefined, `${field}: ${JSON.stringify(value)}`)
  assert.throws(() => SwitchPreferencesConfig({ switchStyle: 'other' }))
})
