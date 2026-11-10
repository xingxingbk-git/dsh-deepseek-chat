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
      switchStyle: 'text', chatLabel: 'CHAT', harnessLabel: 'HARNESS', brandNoticeDismissed: false,
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
  const field = label => document.querySelector(`input[aria-label="${label}"]`)
  const chat = () => field('切换到 CHAT 的快捷键')
  const harness = () => field('切换到 HARNESS 的快捷键')
  const switchControl = () => section()?.querySelector('button[role="switch"]')
  const save = () => Array.from(section()?.querySelectorAll('button') ?? []).find(button => button.textContent === '保存')
  const press = (target, init) => target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
  const isCapturing = input => input.getAttribute('placeholder') === '按下快捷键'

  check('shortcut section renders with a switch and two capture fields',
    Boolean(section()) && Boolean(switchControl()) && switchControl().getAttribute('aria-checked') === 'true'
    && Boolean(chat()) && Boolean(harness()) && chat().value === 'Tab' && harness().value === 'Tab')
  check('the switch stays on by default and one editing row is visible', section().querySelectorAll('.dsh-chat-shortcut-row').length === 1)
  const headerRow = document.querySelector('.dsh-chat-preference-row:has(button[role="switch"])')
  const hintButton = section()?.querySelector('.dsh-chat-preference-hint')
  const prefixLabels = [...document.querySelectorAll('.dsh-chat-shortcut-prefix')].map(node => node.textContent)
  check('each capture field carries a left/right prefix inside its box', prefixLabels.join('|') === '左侧|右侧')
  const prefixStyle = getComputedStyle(document.querySelector('.dsh-chat-shortcut-prefix'))
  check('the prefix is divided from the capture area by a line',
    parseFloat(prefixStyle.borderRightWidth) > 0 && prefixStyle.borderRightStyle !== 'none')
  check('the section is titled mode switch shortcuts', section().textContent.includes('模式切换快捷键') && !section().textContent.includes('快捷键切换模式'))
  check('the switch sits on the right side of the title row and restore is gone',
    Boolean(headerRow?.querySelector('button[role="switch"]')) && Boolean(headerRow?.querySelector('.dsh-chat-preference-hint'))
    && !headerRow.textContent.includes('恢复默认') && !section().textContent.includes('恢复默认'))
  check('the toggle note is collapsed into the question hint, not shown inline',
    !section().textContent.includes('两个快捷键相同时') && Boolean(hintButton))
  flushSync(() => hintButton.click()); await frame()
  check('the question hint explains the same-binding toggle rule',
    document.querySelector('.dsh-chat-preference-hint-popover')?.textContent.includes('两个快捷键相同时'))
  flushSync(() => hintButton.click()); await frame()
  check('the hint closes again on a second click', !document.querySelector('.dsh-chat-preference-hint-popover'))
  const aboveInputs = [...document.querySelectorAll('.dsh-chat-label-input')]
  const [chatAbove, harnessAbove] = aboveInputs
  const aboveSave = document.querySelector('.dsh-chat-label-save')
  const fieldRow = document.querySelector('.dsh-chat-shortcut-row')
  const fields = [...document.querySelectorAll('.dsh-chat-shortcut-field')]
  const rowSave = fieldRow?.querySelector('.dsh-chat-shortcut-save')
  check('both capture fields and save share one row', Boolean(fieldRow) && fields.length === 2 && Boolean(rowSave))
  check('the left field matches the CHAT input above',
    Boolean(chatAbove) && Math.abs(fields[0].getBoundingClientRect().width - chatAbove.getBoundingClientRect().width) <= 2)
  check('the right field ends where the HARNESS input above ends',
    Boolean(harnessAbove) && Math.abs(fields[1].getBoundingClientRect().right - harnessAbove.getBoundingClientRect().right) <= 2)
  check('save sits under the labels save button on the same right edge',
    Boolean(aboveSave) && Math.abs(rowSave.getBoundingClientRect().right - aboveSave.getBoundingClientRect().right) <= 2)

  chat().focus(); await frame()
  check('focus enters capture mode and shows the placeholder', isCapturing(chat()))
  press(chat(), { key: 'x', ctrlKey: true, shiftKey: true }); await tick()
  check('a combination is captured whole instead of a single character', chat().value === 'Ctrl+Shift+X' && !isCapturing(chat()))
  check('a captured change enables the save action', save().disabled === false)

  harness().focus(); await frame()
  press(harness(), { key: 'Backspace' }); await tick()
  check('Backspace clears the field instead of writing the key itself', harness().value === '' && isCapturing(harness()))
  harness().blur(); await frame()
  check('an empty binding blocks saving and explains itself inside the field',
    save().disabled === true && harness().placeholder === '请设置快捷键'
    && !section().textContent.includes('请为两个方向都设置快捷键'))

  chat().focus(); await frame()
  press(chat(), { key: 'Escape' }); await frame()
  check('Escape cancels capture and restores the previous value', chat().value === 'Ctrl+Shift+X' && document.activeElement !== chat())

  harness().focus(); await frame()
  press(harness(), { key: 'Control', ctrlKey: true }); await tick()
  const guidance = () => section().querySelector('.dsh-chat-shortcut-guidance')
  check('a lone modifier never becomes a shortcut and shows its guidance inside the field',
    harness().value === '' && guidance()?.textContent === '请再按一个主键' && harness().placeholder === '')
  press(harness(), { key: 'w', ctrlKey: true }); await tick()
  check('reserved host shortcuts are refused and explained inside the field',
    harness().value === '' && guidance()?.textContent.includes('该组合与系统或浏览器快捷键冲突'))
  // macOS keeps only system Cmd combos reserved; editor-style Cmd+A is accepted.
  press(harness(), { key: 'Escape' }); await frame()
  harness().focus(); await frame()
  press(harness(), { key: 'a', metaKey: true }); await tick()
  const macPlatform = shortcutPlatform(navigator.platform) === 'mac'
  check('Cmd/Win bindings follow the platform reserved list',
    macPlatform
      ? harness().value === 'Cmd+A' && !section().querySelector('.dsh-chat-shortcut-guidance')
      : harness().value === '' && Boolean(section().querySelector('.dsh-chat-shortcut-guidance')))
  press(harness(), { key: 'Escape' }); await frame()

  // A deliberately narrow field must scroll the full guidance in one paced pass.
  const wrap = harness().closest('.dsh-chat-shortcut-input-wrap')
  wrap.style.flex = '0 0 60px'
  wrap.style.width = '60px'
  press(harness(), { key: 'Escape' }); await frame()
  harness().focus(); await frame()
  press(harness(), { key: 'Control', ctrlKey: true }); await tick(); await frame()
  const scrollingGuidance = section().querySelector('.dsh-chat-shortcut-guidance')
  const scrollingText = scrollingGuidance?.querySelector('.dsh-chat-shortcut-guidance-text')
  const scrollAnimation = scrollingText?.getAnimations()[0]
  const scrollFrames = scrollAnimation?.effect?.getKeyframes?.() ?? []
  const scrollShift = Number((scrollFrames.at(-1)?.transform ?? '').match(/translateX\((-?[\d.]+)px\)/)?.[1] ?? 0)
  check('an overflowing guidance scrolls continuously without pauses',
    scrollingGuidance?.getAttribute('data-scrolling') === 'true' && scrollFrames.length === 2 && scrollShift < 0)
  check('the scroll pass ends with the last character fully visible',
    Math.abs(-scrollShift - (scrollingText.scrollWidth - (wrap.clientWidth - 20))) <= 1)
  wrap.style.flex = ''
  wrap.style.width = ''
  press(harness(), { key: 'Escape' }); await frame()

  harness().focus(); await frame()
  press(harness(), { key: 'x', ctrlKey: true }); await tick()
  await tick()
  check('the second field accepts its own combination', harness().value === 'Ctrl+X')
  flushSync(() => save().click())
  await frame(); await frame()
  check('save writes the two bindings through the official preference channel',
    writes.some(entry => entry.field === 'shortcutChat' && entry.value === 'Ctrl+Shift+X')
    && writes.some(entry => entry.field === 'shortcutHarness' && entry.value === 'Ctrl+X'))

  flushSync(() => switchControl().click()); await frame(); await frame()
  check('turning the feature off hides the editing block', !chat() && !harness() && !save())
  check('the switch persists immediately without the save button', writes.some(entry => entry.field === 'shortcutEnabled' && entry.value === false))
  check('the title, hint and switch stay visible while the feature is off',
    Boolean(switchControl()) && Boolean(section()?.querySelector('.dsh-chat-preference-hint')))

  flushSync(() => switchControl().click()); await frame(); await frame()
  check('turning the feature back on restores the editing row',
    writes.some(entry => entry.field === 'shortcutEnabled' && entry.value === true)
    && Boolean(chat()) && Boolean(harness()) && switchControl().getAttribute('aria-checked') === 'true')

  update({ switchPreferences: { ...state.switchPreferences, shortcutEnabled: false, shortcutChat: 'Tab', shortcutHarness: 'Tab' } })
  await frame()
  check('a disabled feature shows the switch without capture rows', Boolean(switchControl()) && !chat())

  flushSync(() => root.unmount())
  check('cleanup releases every fixture subscription', listeners.size === 0)
  window.__results = results
  return results
})()
