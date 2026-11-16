import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { DshChatChatSettings } from '../../src/ui.tsx'
import { shortcutPlatform } from '../../src/shortcuts.ts'

// Production React/CSS with public primitive stand-ins; no DSH and no real keys.
window.fixtureDone = (async () => {
  const results = []
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) })
  const tick = () => new Promise(resolve => setTimeout(resolve, 0))
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
  const listeners = new Set()
  const writes = []
  let state = {
    mode: 'harness', modeEnabled: true, desktopAvailable: true, authorizationStatus: 'authorized',
    language: 'zh-CN', sidebarAdapted: true, switchPreferencesStatus: 'ready', switchPreferencesPending: false,
    switchPreferencesError: null,
    switchPreferences: {
      switchStyle: 'text', chatLabel: 'CHAT', harnessLabel: 'HARNESS',
      websiteLifetime: 'retain', websiteReleaseDelay: 60,
      shortcutEnabled: true, shortcutChat: 'Tab', shortcutHarness: 'Tab',
    },
    websiteAuthenticationStatus: 'signed-in', websiteSessionStatus: 'saved', websiteSessionError: null,
    websiteNavigation: { status: 'ready', authenticated: true, accountName: 'Fixture account', conversations: [], canCreate: true },
    websiteNavigationRefreshing: false, websiteNavigationRefreshError: null, showWebsiteNavigation: false,
  }
  const update = patch => { state = { ...state, ...patch }; flushSync(() => listeners.forEach(fn => fn())) }
  const bridge = {
    getSnapshot: () => state,
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) },
    setSettingsOpen: () => {}, selectMode: () => {}, commandWebsite: () => {},
    refreshAuthorization: () => {}, beginWebsiteSignIn: () => {}, logoutWebsite: () => {},
    setSwitchPreference: async (field, value) => {
      writes.push({ field, value })
      update({ switchPreferences: { ...state.switchPreferences, [field]: value } })
      return true
    },
  }
  const root = createRoot(document.querySelector('#settings'))
  flushSync(() => root.render(React.createElement(DshChatChatSettings, { bridge, close: () => {} })))
  await frame(); await frame()

  const section = () => document.querySelector('.dsh-chat-shortcut-settings')
  const fieldFor = label => document.querySelector(`button[aria-label="${label}"]`)?.closest('.dsh-chat-shortcut-field')
  const display = label => fieldFor(label)?.querySelector('.dsh-chat-shortcut-display')
  const recorder = label => fieldFor(label)?.querySelector('.dsh-chat-shortcut-recorder')
  const editing = label => fieldFor(label)?.hasAttribute('data-editing') === true
  const keycaps = target => [...(target?.querySelectorAll('kbd') ?? [])].map(key => key.textContent).join('+')
  const modKeycaps = shortcutPlatform(navigator.platform) === 'mac'
    ? { Ctrl: '⌃', Shift: '⇧', Alt: '⌥', Meta: '⌘' } : { Ctrl: 'Ctrl', Shift: 'Shift', Alt: 'Alt', Meta: 'Win' }
  const caps = (...parts) => parts.map(part => modKeycaps[part] ?? part).join('+')
  const guidance = () => section()?.querySelector('.dsh-chat-shortcut-guidance')
  const inlineActions = () => [...(section()?.querySelectorAll('.dsh-chat-shortcut-inline-action') ?? [])].map(button => button.textContent)
  const switchControl = () => section()?.querySelector('button[role="switch"]')
  const save = () => Array.from(section()?.querySelectorAll('button') ?? []).find(button => button.textContent === '保存')
  const press = (target, init) => target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
  const enter = async label => { flushSync(() => display(label).click()); await frame(); await frame(); return recorder(label) }
  const chatField = () => fieldFor('切换到 CHAT 的快捷键')
  const harnessField = () => fieldFor('切换到 HARNESS 的快捷键')

  check('the shortcut section renders a switch and two boxed fields',
    Boolean(section()) && Boolean(switchControl()) && switchControl().getAttribute('aria-checked') === 'true'
    && Boolean(chatField()) && Boolean(harnessField())
    && keycaps(display('切换到 CHAT 的快捷键')) === 'Tab' && keycaps(display('切换到 HARNESS 的快捷键')) === 'Tab')
  const prefixLabels = [...document.querySelectorAll('.dsh-chat-shortcut-prefix')].map(node => node.textContent)
  check('each boxed field keeps a left/right prefix', prefixLabels.join('|') === '左侧|右侧')
  const prefixStyle = getComputedStyle(document.querySelector('.dsh-chat-shortcut-prefix'))
  check('the prefix is divided from the value by a line',
    parseFloat(prefixStyle.borderRightWidth) > 0 && prefixStyle.borderRightStyle !== 'none')
  check('inline reset/remove actions stay hidden until editing starts', inlineActions().length === 0 && !editing('切换到 CHAT 的快捷键'))
  const shortcutTitle = section().querySelector('h4')
  check('the section is titled shortcuts', Boolean(shortcutTitle) && shortcutTitle.textContent.startsWith('快捷键') && !shortcutTitle.textContent.includes('模式切换快捷键'))
  const headerRow = document.querySelector('.dsh-chat-preference-row:has(button[role="switch"])')
  const hintButton = section()?.querySelector('.dsh-chat-preference-hint')
  const row = document.querySelector('.dsh-chat-shortcut-row')
  const rowSave = row?.querySelector('.dsh-chat-shortcut-save')
  check('both fields and save share one row', Boolean(row) && Boolean(rowSave)
    && Math.abs(chatField().getBoundingClientRect().top - harnessField().getBoundingClientRect().top) <= 2)
  check('the toggle note is collapsed into the question hint, not shown inline',
    !section().textContent.includes('当两个快捷键相同时') && Boolean(hintButton))
  flushSync(() => hintButton.click()); await frame()
  check('the question hint explains the same-binding toggle rule',
    document.querySelector('.dsh-chat-preference-hint-popover')?.textContent.includes('当两个快捷键相同时'))
  flushSync(() => hintButton.click()); await frame()
  check('the hint closes again on a second click', !document.querySelector('.dsh-chat-preference-hint-popover'))

  await enter('切换到 CHAT 的快捷键')
  check('clicking a field opens the inline editor inside the same frame',
    editing('切换到 CHAT 的快捷键') && Boolean(recorder('切换到 CHAT 的快捷键')) && inlineActions().includes('恢复默认') && inlineActions().includes('移除'))
  const prefixDuringEdit = getComputedStyle(document.querySelector('.dsh-chat-shortcut-prefix')).display
  check('the prefix and divider step aside while editing so the frame does not widen', prefixDuringEdit === 'none')
  const editedField = chatField()
  check('the editing frame keeps its column width without clipping the actions', editedField.scrollWidth <= editedField.clientWidth + 1)
  press(recorder('切换到 CHAT 的快捷键'), { key: 'x', ctrlKey: true, shiftKey: true }); await tick(); await frame()
  check('a combination is captured whole and shown as keycaps', keycaps(display('切换到 CHAT 的快捷键')) === caps('Ctrl', 'Shift', 'X') && !editing('切换到 CHAT 的快捷键'))
  check('a captured change enables the save action', save().disabled === false)
  check('the prefix returns once editing ends', getComputedStyle(document.querySelector('.dsh-chat-shortcut-prefix')).display !== 'none')

  await enter('切换到 HARNESS 的快捷键')
  press(recorder('切换到 HARNESS 的快捷键'), { key: 'Backspace' }); await tick(); await frame()
  check('Backspace removes the binding instead of writing the key itself',
    keycaps(display('切换到 HARNESS 的快捷键')) === '' && display('切换到 HARNESS 的快捷键').textContent.includes('请设置快捷键'))
  check('an empty binding blocks saving', save().disabled === true)

  await enter('切换到 HARNESS 的快捷键')
  const harnessReset = [...harnessField().querySelectorAll('.dsh-chat-shortcut-inline-action')].find(button => button.textContent === '恢复默认')
  flushSync(() => harnessReset.click()); await tick(); await frame()
  check('the reset action restores the default binding', keycaps(display('切换到 HARNESS 的快捷键')) === 'Tab')

  await enter('切换到 CHAT 的快捷键')
  const chatRemove = [...chatField().querySelectorAll('.dsh-chat-shortcut-inline-action')].find(button => button.textContent === '移除')
  flushSync(() => chatRemove.click()); await tick(); await frame()
  check('the remove action clears the binding', keycaps(display('切换到 CHAT 的快捷键')) === '' && display('切换到 CHAT 的快捷键').textContent.includes('请设置快捷键'))
  await enter('切换到 CHAT 的快捷键')
  const chatReset = [...chatField().querySelectorAll('.dsh-chat-shortcut-inline-action')].find(button => button.textContent === '恢复默认')
  flushSync(() => chatReset.click()); await tick(); await frame()
  check('reset after removal restores the default again', keycaps(display('切换到 CHAT 的快捷键')) === 'Tab')

  await enter('切换到 CHAT 的快捷键')
  press(recorder('切换到 CHAT 的快捷键'), { key: 'x', ctrlKey: true, shiftKey: true }); await tick(); await frame()
  await enter('切换到 CHAT 的快捷键')
  press(recorder('切换到 CHAT 的快捷键'), { key: 'Escape' }); await frame(); await frame()
  check('Escape cancels capture and keeps the previous value',
    keycaps(display('切换到 CHAT 的快捷键')) === caps('Ctrl', 'Shift', 'X') && !editing('切换到 CHAT 的快捷键'))

  await enter('切换到 HARNESS 的快捷键')
  press(recorder('切换到 HARNESS 的快捷键'), { key: 'Control', ctrlKey: true }); await tick()
  check('a lone modifier never becomes a shortcut and shows its hint inside the recorder',
    editing('切换到 HARNESS 的快捷键') && recorder('切换到 HARNESS 的快捷键').textContent === '请再按一个主键' && !guidance())
  press(recorder('切换到 HARNESS 的快捷键'), { key: 'w', ctrlKey: true }); await tick()
  check('reserved host shortcuts are refused and explained inside the recorder',
    recorder('切换到 HARNESS 的快捷键').textContent.includes('该组合与系统或浏览器快捷键冲突') && !guidance())
  press(recorder('切换到 HARNESS 的快捷键'), { key: 'Escape' }); await frame(); await frame()
  await enter('切换到 HARNESS 的快捷键')
  press(recorder('切换到 HARNESS 的快捷键'), { key: 'a', metaKey: true }); await tick(); await frame()
  const macPlatform = shortcutPlatform(navigator.platform) === 'mac'
  check('Cmd/Win bindings follow the platform reserved list',
    macPlatform ? keycaps(display('切换到 HARNESS 的快捷键')) === caps('Meta', 'A') && !guidance()
      : keycaps(display('切换到 HARNESS 的快捷键')) === 'Tab' && Boolean(guidance()))

  await enter('切换到 HARNESS 的快捷键')
  press(recorder('切换到 HARNESS 的快捷键'), { key: 'x', ctrlKey: true }); await tick(); await frame()
  check('the second field accepts its own combination', keycaps(display('切换到 HARNESS 的快捷键')) === caps('Ctrl', 'X'))
  flushSync(() => save().click())
  await frame(); await frame()
  check('save writes the two bindings through the official preference channel',
    writes.some(entry => entry.field === 'shortcutChat' && entry.value === 'Ctrl+Shift+X')
    && writes.some(entry => entry.field === 'shortcutHarness' && entry.value === 'Ctrl+X'))

  flushSync(() => switchControl().click()); await frame(); await frame()
  check('turning the feature off hides the editing block', !chatField() && !harnessField() && !save())
  check('the switch persists immediately without the save button', writes.some(entry => entry.field === 'shortcutEnabled' && entry.value === false))
  check('the title, hint and switch stay visible while the feature is off',
    Boolean(switchControl()) && Boolean(section()?.querySelector('.dsh-chat-preference-hint')))

  flushSync(() => switchControl().click()); await frame(); await frame()
  check('turning the feature back on restores the editing row',
    writes.some(entry => entry.field === 'shortcutEnabled' && entry.value === true)
    && Boolean(chatField()) && Boolean(harnessField()) && switchControl().getAttribute('aria-checked') === 'true')

  update({ switchPreferences: { ...state.switchPreferences, shortcutEnabled: false, shortcutChat: 'Tab', shortcutHarness: 'Tab' } })
  await frame()
  check('a disabled feature shows the switch without capture rows', Boolean(switchControl()) && !chatField())

  flushSync(() => root.unmount())
  check('cleanup releases every fixture subscription', listeners.size === 0)
  window.__results = results
  return results
})()
