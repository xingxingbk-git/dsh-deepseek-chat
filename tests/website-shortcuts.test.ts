import test from 'node:test'
import assert from 'node:assert/strict'
import { parseWebsiteShortcutMessage, websiteShortcutScript, WEBSITE_SHORTCUT_MARKER } from '../src/website-shortcuts.js'

test('only marker-tagged guest actions cross the console channel', () => {
  assert.equal(parseWebsiteShortcutMessage(WEBSITE_SHORTCUT_MARKER + 'chat'), 'chat')
  assert.equal(parseWebsiteShortcutMessage('  ' + WEBSITE_SHORTCUT_MARKER + 'harness  '), 'harness')
  assert.equal(parseWebsiteShortcutMessage(WEBSITE_SHORTCUT_MARKER + 'toggle'), 'toggle')
  assert.equal(parseWebsiteShortcutMessage(WEBSITE_SHORTCUT_MARKER + 'new'), 'new')
  assert.equal(parseWebsiteShortcutMessage(WEBSITE_SHORTCUT_MARKER + 'other'), null)
  assert.equal(parseWebsiteShortcutMessage('hello'), null)
  assert.equal(parseWebsiteShortcutMessage(undefined), null)
  assert.equal(parseWebsiteShortcutMessage(42), null)
})

test('the injected script carries the binding configuration', () => {
  const script = websiteShortcutScript({ enabled: true, chat: 'Tab', harness: 'Ctrl+Shift+X', primary: 'control' })
  assert.match(script, /__dshChatShortcut/)
  assert.match(script, new RegExp(WEBSITE_SHORTCUT_MARKER))
  assert.match(script, /"key":"Tab"/)
  assert.match(script, /"key":"X"/)
  assert.match(script, /"ctrl":true/)
  assert.match(script, /"shift":true/)
  assert.match(script, /event\.preventDefault\(\)/)
  assert.match(script, /event\.repeat/)
  assert.match(script, /KeyN/)
  assert.match(script, /primary:"control"/)
  assert.match(script, /'new'/)
  assert.equal(websiteShortcutScript({ enabled: false, chat: 'Tab', harness: 'Tab' }).includes('enabled:false'), true)
})
