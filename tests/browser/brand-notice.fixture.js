import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { DshChatBrandControl } from '../../src/ui.tsx'

// Production component/CSS; fictional state. The runner supplies only native
// primitive stand-ins and the public 0.2.2 SidebarRoot logo-row geometry.
window.fixtureDone = (async () => {
  const results = [], measurements = []
  const check = (name, passed) => results.push({ name, passed: !!passed })
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
  const listeners = new Set()
  let state = {
    mode: 'harness', modeEnabled: true, authorizationStatus: 'authorized', availabilityMessage: '', error: null,
    language: 'zh-CN', sidebarAdapted: true,
    switchPreferences: { switchStyle: 'icon', chatLabel: 'CHAT', harnessLabel: 'HARNESS' },
  }
  const bridge = {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    selectMode: () => {}, refreshAuthorization: () => {},
  }
  const update = patch => { state = { ...state, ...patch }; flushSync(() => { for (const listener of listeners) listener() }) }
  const root = createRoot(document.querySelector('#control'))
  flushSync(() => root.render(React.createElement(DshChatBrandControl, { bridge })))
  await frame(); await frame()
  const rect = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
  const row = document.querySelector('.native-logo-row')
  const control = document.querySelector('#control .dsh-chat-brand-control')
  const notices = () => [...document.querySelectorAll('.dsh-chat-authorization-notice')]
  const measure = name => {
    const notice = notices()[0]
    const box = rect(notice), clip = rect(row)
    const style = getComputedStyle(notice)
    const measurement = { name, box, clip, position: style.position, background: style.backgroundColor, radius: style.borderRadius,
      role: notice.getAttribute('role'), parent: notice.parentElement.tagName, insideRow: row.contains(notice),
      tooltipNodes: document.querySelectorAll('[role="tooltip"]').length, nativeTooltipCalls: window.nativeTooltipCalls ?? 0 }
    measurements.push(measurement)
    return measurement
  }
  check('HARNESS default icon mode creates no notice or tooltip DOM', notices().length === 0 && !document.querySelector('[role="tooltip"]'))
  check('mode buttons use native title attributes, not primitive Tooltip', document.querySelectorAll('.dsh-chat-modes button[title]').length === 2 && (window.nativeTooltipCalls ?? 0) === 0)
  check('synthetic public logo row is still the original clipped sixty-pixel seat', rect(row).height === 60 && getComputedStyle(row).overflow === 'hidden')
  check('mode control stays inside the clipped logo row', row.contains(control))

  update({ error: '连接暂时不可用。' })
  await frame(); await frame()
  const error = measure('fictional state.error, HARNESS, dark tokens')
  check('fictional error mounts exactly one production status notice', notices().length === 1 && error.role === 'status')
  check('notice escapes the clipped logo row into the document body', error.parent === 'BODY' && !error.insideRow && !row.contains(notices()[0]))
  check('notice keeps its 230 CSS pixel width and native radius', Math.abs(error.box.width - 230) < .1 && error.radius === '8px')
  check('notice is portalled as a fixed layer below its own anchor', error.position === 'fixed' && Math.abs(error.box.top - (rect(control).bottom + 6)) <= 1)
  check('notice keeps its full height and is not a clipped strip', error.box.height > 60 && error.box.bottom > error.clip.bottom && !notices()[0].matches('.native-logo-row *'))
  check('notice renders above the neighbouring native control without clipping', rect(notices()[0]).height > 60 && document.elementFromPoint(error.box.left + 10, error.box.top + 10)?.closest('.dsh-chat-authorization-notice') === notices()[0])
  check('error text and its retry action are fully visible', rect(notices()[0].querySelector('p')).bottom <= error.box.bottom + .5 && Boolean(notices()[0].querySelector('button.dsh-chat-text-button')))
  check('dark tokens are preserved on the escaped notice', error.background === 'rgb(32, 33, 36)' && error.tooltipNodes === 0 && error.nativeTooltipCalls === 0)

  update({ error: null, sidebarAdapted: false })
  await frame(); await frame()
  const unsupported = measure('sidebarAdapted:false, HARNESS, dark tokens')
  check('incompatible sidebar still produces one alert notice', notices().length === 1 && unsupported.role === 'alert')
  check('sidebar alert is also outside the clipped row and fully readable', unsupported.parent === 'BODY' && unsupported.box.height > 60
    && document.elementFromPoint(unsupported.box.left + 10, unsupported.box.bottom - 8)?.closest('.dsh-chat-authorization-notice') === notices()[0])

  update({ error: '连接暂时不可用。' })
  await frame()
  check('both conditions share one notice instead of stacked copies', notices().length === 1 && notices()[0].querySelectorAll('p').length === 2 && notices()[0].querySelectorAll('button.dsh-chat-text-button').length === 1)
  check('combined notice keeps one anchor position below the control', Math.abs(rect(notices()[0]).top - (rect(control).bottom + 6)) <= 1)

  update({ sidebarAdapted: true })
  document.body.classList.add('light')
  const light = measure('fictional state.error, HARNESS, light tokens')
  check('same fixed notice follows theme tokens rather than a hardcoded layer', light.background === 'rgb(244, 245, 248)' && light.position === 'fixed')
  document.body.classList.remove('light')

  update({ error: null })
  await frame(); await frame()
  check('clearing fictional error removes the portal node entirely', notices().length === 0 && !document.querySelector('[role="tooltip"]'))
  check('native new-session button and production mode controls stay mounted', document.querySelector('#native-new-session') && document.querySelectorAll('.dsh-chat-modes button').length === 2)
  flushSync(() => root.unmount())
  await frame()
  check('production control cleanup releases all fixture subscriptions and portal nodes', listeners.size === 0 && notices().length === 0)
  return { results, measurements, limits: 'Synthetic production React/CSS with the public 0.2.2 logo-row geometry; verifies the escaped fixed layer, not a live DSH window or OS compositing.' }
})()
