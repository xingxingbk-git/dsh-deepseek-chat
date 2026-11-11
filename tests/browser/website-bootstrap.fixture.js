import React from 'react'
import { createRoot } from 'react-dom/client'
import { DshChatWebSurface } from '../../src/web-surface.tsx'
import { websiteSessionCaptureScript } from '../../src/website-session.ts'

// Production React hooks and Surface. Only Electron's webview and the host bridge
// are stand-ins. No account, website or application network request is made.
window.fixtureDone = (async () => {
  const results = [], listeners = new Set(), nodes = new Map(), loads = [], releases = [], notices = [], refreshes = []
  const check = (name, condition) => { results.push({ name, passed: !!condition }); if (!condition) throw new Error(name) }
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
  const settle = () => pause(35)
  const until = async predicate => { const start = performance.now(); while (!predicate()) { if (performance.now() - start > 8000) throw new Error('Condition timeout'); await pause(20) } }
  const fire = (node, type, props = {}) => node.dispatchEvent(Object.assign(new Event(type), props))
  const ready = { status: 'ready', authenticated: true, desktopReady: true, accountName: 'Fixture', conversations: [{ href: 'https://chat.deepseek.com/a/chat/s/fixture', title: 'Fixture', group: 'Today' }], selectedHref: 'https://chat.deepseek.com/a/chat/s/fixture', canCreate: true, error: null }
  let state = { mode: 'chat', modeEnabled: true, authorizationStatus: 'authorized', authorizationGeneration: 1, accountStorageKey: 'fixture-a', settingsOpen: false, viewport: null, language: 'en', websiteAuthenticationStatus: 'signed-in', websiteAuthenticationRevision: 1, websiteReloadRevision: 0, websiteNavigation: ready, showWebsiteNavigation: false, webLoading: false, webError: null, websiteSessionStatus: 'idle', websiteSessionError: null }
  let acquired = 0, binding = null, holdAcquire = null
  const patch = values => { state = { ...state, ...values }; for (const listener of listeners) listener() }
  const bridge = {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    reportWebsiteState: (generation, values) => { if (generation === state.authorizationGeneration) patch({ webLoading: values.loading, webError: values.error }) },
    reportWebsiteNavigation: (generation, value) => { if (generation === state.authorizationGeneration) patch({ websiteNavigation: value }) },
    reportWebsiteNavigationRefresh: (generation, value) => refreshes.push({ generation, ...value }),
    bindWebsiteNavigation: (_generation, handler) => { binding = handler; return () => { if (binding === handler) binding = null } },
    bindWindowDragSampler: () => () => {},
    commandWebsite: command => { if (binding) void binding(command) },
    loadWebsiteSession: async () => null,
    saveWebsiteSession: async () => true,
    clearWebsiteSession: async () => true,
    reportWebsiteSessionError() {},
    reportWebsiteNotice: (_generation, value) => notices.push(value),
    saveWebsiteFile: () => { throw new Error('A stale download must never be saved') },
  }
  const nativeBrowser = {
    acquire: async () => { const result = { lease: `fixture-${++acquired}`, partition: 'fixture-partition' }; if (holdAcquire) await holdAcquire; return result },
    release: async lease => { releases.push(lease) },
    onOpenRequested: () => () => {},
  }
  const surface = () => document.getElementById('dsh-chat-website-surface')
  const guest = () => surface()?.querySelector('webview')
  function stub(node) {
    if (nodes.has(node)) return nodes.get(node)
    const data = { url: node.getAttribute('src'), reloads: 0, executions: 0, proof: true, refreshReadiness: 'ready', projection: null, download: null, draft: 'fixture draft retained', scroll: 321 }
    node.getURL = () => data.url
    node.loadURL = async url => { loads.push({ node, url, minWidth: node.style.minWidth }); data.url = url; fire(node, 'did-start-navigation', { isMainFrame: true, isInPlace: false }) }
    node.reload = () => { data.reloads++; loads.push({ node, reload: true, minWidth: node.style.minWidth }); fire(node, 'did-start-navigation', { isMainFrame: true, isInPlace: false }) }
    node.executeJavaScript = async script => {
      data.executions++
      if (script === websiteSessionCaptureScript()) return null
      if (script.includes('websiteRefreshReadiness')) return data.refreshReadiness
      if (script.includes('adaptWebsiteNavigation')) {
        if (data.projection) { const pending = data.projection; data.projection = null; return pending }
        return { ...(data.navigation ?? ready), desktopReady: data.proof, needsDesktopChrome: data.needsDesktopChrome === true,
          viewportWidth: data.viewportWidthOverride ?? Math.max(Number.parseFloat(node.style.minWidth) || 0, state.viewport?.width ?? 0) }
      }
      if (script.includes('manageWebsiteDownloads')) { if (data.download) { const pending = data.download; data.download = null; data.downloadStarted = true; return pending }; return null }
      return null
    }
    nodes.set(node, data)
    return data
  }
  const observer = new MutationObserver(() => { const node = guest(); if (node) stub(node) })
  observer.observe(document.body, { childList: true, subtree: true })
  const root = createRoot(document.getElementById('fixture'))
  root.render(React.createElement(DshChatWebSurface, { bridge, nativeBrowser }))
  await until(() => guest() && nodes.has(guest()))
  const first = guest(), data = stub(first)
  check('initial guest has desktop minimum before a viewport is measured', first.style.minWidth === '1024px' && acquired === 1)
  fire(first, 'did-finish-load')
  patch({ websiteNavigation: ready })
  await settle()
  check('old ready plus about:blank finish cannot reveal or narrow a new guest', first.style.minWidth === '1024px' && first.style.opacity === '0')
  patch({ viewport: { left: 0, top: 0, width: 360, height: 700 } })
  await settle()
  check('the first real viewport measurement does not replace the lease', guest() === first && acquired === 1 && releases.length === 0)
  fire(first, 'dom-ready')
  await settle()
  check('cold narrow entry loads the website once at desktop width', loads.length === 1 && loads[0].minWidth === '1024px')
  fire(first, 'dom-ready')
  await settle()
  check('DOM ready without main-document finish is insufficient', first.style.minWidth === '1024px' && first.style.opacity === '0')
  data.proof = false
  fire(first, 'did-finish-load'); fire(first, 'did-stop-loading')
  await pause(250)
  check('generic ready without verified desktop chrome cannot finish bootstrap', first.style.minWidth === '1024px' && first.style.opacity === '0')
  data.proof = true
  data.viewportWidthOverride = 1024
  await until(() => first.style.minWidth === '')
  await pause(250)
  check('a stale desktop-sized guest reply cannot acknowledge the narrow viewport', first.style.opacity === '0')
  data.viewportWidthOverride = undefined
  await until(() => first.style.opacity === '1')
  check('fresh load and a second actual-width projection reveal the same guest', first.style.minWidth === '' && guest() === first && data.reloads === 0)
  data.proof = false; data.needsDesktopChrome = true
  await until(() => first.style.minWidth === '1024px')
  check('a first header after new-chat is measured on the same document without reload', data.reloads === 0 && loads.length === 1 && guest() === first)
  data.proof = true; data.needsDesktopChrome = false
  await until(() => first.style.opacity === '1')
  for (const width of [1400, 980, 660, 360, 240, 700, 1300]) {
    patch({ viewport: { left: width > 700 ? 280 : 0, top: 0, width, height: 700, inert: false } }); await settle()
  }
  patch({ viewport: { ...state.viewport, inert: true, borderRadius: '16px 0 0 0' } }); await settle()
  check('drawer interaction lock changes only inert/hit testing', first.inert && guest() === first)
  patch({ viewport: { ...state.viewport, inert: false } }); await settle()
  check('width storms, sidebar split and drawer close never reload or release', guest() === first && acquired === 1 && releases.length === 0 && data.reloads === 0 && loads.length === 1 && data.draft === 'fixture draft retained' && data.scroll === 321)
  // External provider redirects are a user-driven login surface, not a DeepSeek DOM to adapt.
  patch({ websiteAuthenticationStatus: 'signing-in' })
  data.url = 'https://accounts.google.com/v3/signin/identifier'
  fire(first, 'did-start-navigation', { isMainFrame: true, isInPlace: false, url: data.url })
  await settle()
  check('provider navigation has a generic sign-in loading message before the form is ready', surface().textContent.includes('Opening sign-in page') && first.style.opacity === '0')
  fire(first, 'dom-ready'); fire(first, 'did-finish-load'); fire(first, 'did-stop-loading')
  await settle()
  check('the provider sign-in page is visible and interactive without DeepSeek layout proof', first.style.opacity === '1' && !first.inert && first.style.minWidth === '')
  check('the provider form does not mark the user signed in', state.websiteAuthenticationStatus === 'signing-in' && state.websiteNavigation.authenticated === false)
  check('external sign-in has its own accessible label', first.getAttribute('aria-label') === 'External sign-in page')
  const providerExecutions = data.executions
  fire(first, 'did-start-loading')
  data.url = 'https://accounts.google.com/v3/signin/challenge/pwd'
  fire(first, 'did-navigate-in-page', { isMainFrame: true })
  await binding({ type: 'snapshot' }); await pause(1300)
  check('provider steps and background polling never run DeepSeek scripts on the provider page', data.executions === providerExecutions && first.style.opacity === '1' && !state.webLoading)
  patch({ mode: 'harness' }); await settle(); patch({ mode: 'chat', viewport: { left: 0, top: 0, width: 280, height: 700 } }); await settle()
  check('switching modes and resizing preserve the provider form and lease', guest() === first && acquired === 1 && releases.length === 0 && first.style.opacity === '1' && first.style.minWidth === '')
  data.url = 'https://accounts.google.com.example.org/'
  fire(first, 'did-start-navigation', { isMainFrame: true, isInPlace: false, url: data.url }); fire(first, 'dom-ready'); await settle()
  check('a lookalike provider URL is shown as an external page, never as a DeepSeek session', (first.style.opacity === '1' || first.style.opacity === '') && state.websiteNavigation.authenticated === false && first.getAttribute('aria-label') === 'External sign-in page')
  for (const providerUrl of ['https://appleid.apple.com/auth/authorize', 'https://open.weixin.qq.com/connect/qrconnect', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize']) {
    data.url = providerUrl
    fire(first, 'did-start-navigation', { isMainFrame: true, isInPlace: false, url: providerUrl }); fire(first, 'dom-ready'); await settle()
    check(`provider ${providerUrl} is shown as an external sign-in page`, (first.style.opacity === '1' || first.style.opacity === '') && first.getAttribute('aria-label') === 'External sign-in page' && state.websiteNavigation.authenticated === false)
  }
  data.url = 'https://chat.deepseek.com/'; data.navigation = ready
  fire(first, 'did-start-navigation', { isMainFrame: true, isInPlace: false, url: data.url }); fire(first, 'dom-ready'); await settle()
  check('returning from provider sign-in waits for normal DeepSeek load and layout proof', first.style.opacity === '0' && first.style.minWidth === '1024px')
  fire(first, 'did-finish-load'); fire(first, 'did-stop-loading'); await until(() => first.style.opacity === '1')
  patch({ websiteAuthenticationStatus: 'signed-in' })
  check('the callback restores the same DeepSeek surface without reloading or replacing it', guest() === first && acquired === 1 && data.reloads === 0 && first.getAttribute('aria-label') !== 'External sign-in page')
  data.url = 'https://chat.deepseek.com/sign_in'
  data.navigation = { status: 'sign-in', authenticated: false, conversations: [], selectedHref: null, canCreate: false, error: null }
  fire(first, 'did-navigate-in-page', { isMainFrame: true }); await settle()
  data.url = 'https://chat.deepseek.com/'; data.navigation = null
  fire(first, 'did-navigate-in-page', { isMainFrame: true })
  check('SPA return from sign-in prepares desktop layout without loading a new document', first.style.minWidth === '1024px' && data.reloads === 0 && loads.length === 1)
  await until(() => first.style.opacity === '1')
  data.url = 'https://chat.deepseek.com/a/chat/s/resume-fixture'
  fire(first, 'did-navigate-in-page', { isMainFrame: true }); await settle()
  await binding({ type: 'open', href: ready.conversations[0].href })
  check('in-page conversation commands reuse the document', guest() === first && data.reloads === 0 && loads.length === 1)
  patch({ viewport: { left: 0, top: 0, width: 320, height: 700 } }); await settle()
  await binding({ type: 'refresh', requestId: 1, authenticationRevision: 1 })
  check('real list-refresh branch reloads once on the same lease at desktop width', data.reloads === 1 && loads.at(-1).minWidth === '1024px' && guest() === first && acquired === 1)
  check('list refresh cannot finish using the old ready state', first.style.minWidth === '1024px' && !refreshes.some(item => item.requestId === 1 && !item.error))
  fire(first, 'dom-ready'); fire(first, 'did-finish-load'); fire(first, 'did-stop-loading')
  await until(() => refreshes.some(item => item.requestId === 1 && !item.error))
  check('list refresh finishes only after the fresh actual-width projection', first.style.minWidth === '' && first.style.opacity === '1' && guest() === first)
  for (const readiness of ['draft', 'busy']) {
    data.refreshReadiness = readiness
    await binding({ type: 'refresh', requestId: readiness === 'draft' ? 2 : 3, authenticationRevision: 1 })
    check(`${readiness} list refresh preserves the existing document`, data.reloads === 1 && !!refreshes.at(-1).error)
  }
  data.refreshReadiness = 'ready'
  patch({ websiteReloadRevision: 1 }); await settle()
  check('explicit retry reloads, but does not acquire a second guest', data.reloads === 2 && acquired === 1 && guest() === first && first.style.minWidth === '1024px')
  fire(first, 'dom-ready'); fire(first, 'did-finish-load'); fire(first, 'did-stop-loading')
  await until(() => first.style.opacity === '1')
  let resolveOld
  data.projection = new Promise(resolve => { resolveOld = resolve })
  const pending = binding({ type: 'snapshot', showOriginal: false })
  await settle()
  patch({ websiteReloadRevision: 2 }); await settle()
  resolveOld({ ...ready, accountName: 'Stale document' }); await pending
  check('old document projection cannot reveal or overwrite the replacement', first.style.opacity === '0' && state.websiteNavigation.accountName !== 'Stale document')
  fire(first, 'dom-ready'); fire(first, 'did-finish-load'); fire(first, 'did-stop-loading')
  await until(() => first.style.opacity === '1')
  let resolveDownload
  data.download = new Promise(resolve => { resolveDownload = resolve })
  await until(() => data.downloadStarted)
  const preference = (websiteLifetime, websiteReleaseDelay = 60) => ({ switchPreferences: {
    switchStyle: 'text', chatLabel: 'CHAT', harnessLabel: 'HARNESS', websiteLifetime, websiteReleaseDelay } })
  // Default lifetime keeps the page for instant switching.
  patch({ mode: 'harness' }); await settle()
  resolveDownload({ kind: 'file', name: 'fictional.txt', mediaType: 'text/plain', dataUrl: 'data:text/plain;base64,WA==' }); await settle()
  check('an exported-file reply from a hidden owner cannot save or report a notice', notices.length === 0)
  check('the default lifetime keeps the page while HARNESS is active', guest() === first && releases.length === 0)
  patch({ mode: 'chat' }); await settle()
  check('re-entering CHAT reuses the page without another load', guest() === first && acquired === 1 && releases.length === 0)
  // Immediate release.
  patch(preference('immediate')); await settle()
  patch({ mode: 'harness' }); await until(() => !guest() && releases.length === 1)
  check('the immediate lifetime releases the page when leaving CHAT', releases[0] === 'fixture-1')
  patch({ mode: 'chat' }); await until(() => guest() && guest() !== first && nodes.has(guest()))
  const second = guest(); fire(second, 'dom-ready'); await settle()
  check('reentry after a release resumes the last in-site route', acquired === 2 && loads.at(-1).url.endsWith('/resume-fixture'))
  // Delayed release.
  patch(preference('delayed', 5)); await settle()
  patch({ mode: 'harness' }); await settle()
  check('the delayed lifetime keeps the page inside the grace window', guest() === second)
  await pause(5300)
  await until(() => !guest() && releases.includes('fixture-2'))
  check('the delayed lifetime releases after the configured seconds', !guest())
  patch({ mode: 'chat' }); await until(() => guest() && guest() !== second && nodes.has(guest()))
  const third = guest(); fire(third, 'dom-ready'); await settle()
  check('reentry after the delayed release uses a fresh lease', acquired === 3)
  patch({ accountStorageKey: 'fixture-b', authorizationGeneration: 2 }); await until(() => guest() && guest() !== third && nodes.has(guest()))
  const fourth = guest(); fire(fourth, 'dom-ready'); await settle()
  check('a different account does not inherit the old route', loads.at(-1).url === 'https://chat.deepseek.com/' && releases.includes('fixture-3'))
  fire(fourth, 'render-process-gone'); await settle()
  check('a crashed renderer stays concealed and offers an explicit error', fourth.style.opacity === '0' && !!state.webError)
  patch({ websiteReloadRevision: 3 }); await until(() => guest() && guest() !== fourth && nodes.has(guest()))
  const recovered = guest()
  fire(recovered, 'dom-ready'); fire(recovered, 'dom-ready'); fire(recovered, 'did-finish-load'); fire(recovered, 'did-stop-loading')
  await until(() => recovered.style.opacity === '1')
  check('explicit crash recovery obtains one fresh desktop-prepared lease', acquired === 5 && releases.includes('fixture-4') && loads.at(-1).minWidth === '1024px')
  patch({ websiteAuthenticationStatus: 'signing-in' })
  const recoveredData = nodes.get(recovered)
  recoveredData.url = 'https://accounts.google.com/v3/signin/identifier'
  fire(recovered, 'did-start-navigation', { isMainFrame: true, isInPlace: false, url: recoveredData.url }); fire(recovered, 'dom-ready'); await settle()
  const beforeRelease = recoveredData.executions
  patch({ modeEnabled: false }); await until(() => !guest() && releases.includes('fixture-5'))
  check('disabling CHAT releases the retained page', !guest())
  check('releasing a provider sign-in page does not inject download cleanup scripts into it', recoveredData.executions === beforeRelease)
  let resolveAcquire
  holdAcquire = new Promise(resolve => { resolveAcquire = resolve })
  patch({ modeEnabled: true }); await until(() => acquired === 6)
  patch({ modeEnabled: false }); await settle(); resolveAcquire(); holdAcquire = null
  await until(() => releases.includes('fixture-6'))
  check('a late acquisition after CHAT stops is released without mounting', !guest() && releases.filter(value => value === 'fixture-6').length === 1)
  root.unmount(); observer.disconnect(); await settle()
  check('all live leases and bindings are cleaned up', binding === null && releases.length === 6)
  return results
})()
