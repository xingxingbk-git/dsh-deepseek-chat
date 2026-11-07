import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { DshChatBrandControl } from '../../src/ui.tsx'

// Production component/CSS with the public 0.2.2 sidebar geometry; fictional state.
window.fixtureDone = (async () => {
  const results = []
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) })
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
  const listeners = new Set()
  const state = {
    mode: 'harness', modeEnabled: true, authorizationStatus: 'authorized', availabilityMessage: '', error: null,
    language: 'zh-CN', sidebarAdapted: true,
    switchPreferences: { switchStyle: 'icon', chatLabel: 'CHAT', harnessLabel: 'HARNESS' },
  }
  const bridge = {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    selectMode: () => {}, refreshAuthorization: () => {},
  }
  const root = createRoot(document.querySelector('#control'))
  flushSync(() => root.render(React.createElement(DshChatBrandControl, { bridge })))
  await frame(); await frame()
  const rect = el => el.getBoundingClientRect()
  const modes = () => document.querySelector('#control .dsh-chat-modes')
  const newSession = () => document.querySelector('#native-new-session')
  const right = el => Math.round(rect(el).right * 2) / 2
  const left = el => Math.round(rect(el).left * 2) / 2
  check('the switcher renders inside the native brand row', Boolean(modes()) && document.querySelector('.native-logo-row').contains(modes()))
  check('switcher right edge matches the native new-session button', Math.abs(right(modes()) - right(newSession())) <= 0.5)
  check('matching right edge does not move the switcher over the brand area', left(modes()) > rect(document.querySelector('.native-brand')).right)
  check('native new-session button keeps its own width and padding', Math.abs(rect(newSession()).width - (280 - 16 - 4 * 2)) <= 1)
  document.documentElement.setAttribute('data-windows-titlebar', '')
  await frame()
  check('Windows titlebar geometry keeps the same right alignment', Math.abs(right(modes()) - right(newSession())) <= 0.5)
  document.documentElement.removeAttribute('data-windows-titlebar')
  document.querySelector('.native-root').style.width = '360px'
  await frame(); await frame()
  check('a widened sidebar still aligns both right edges', Math.abs(right(modes()) - right(newSession())) <= 0.5)
  flushSync(() => root.unmount())
  check('cleanup releases every fixture subscription', listeners.size === 0)
  return { results, limits: 'Synthetic public 0.2.2 sidebar geometry and production plugin CSS; not a live DSH window.' }
})()
