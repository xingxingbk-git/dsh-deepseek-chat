import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runHeadlessFixture } from './run-headless-fixture.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = await build({ absWorkingDir: root, entryPoints: ['src/website-bootstrap.ts'], bundle: true, write: false, platform: 'node', format: 'esm', target: 'node22' })
const { createWebsiteBootstrap, WEBSITE_BOOTSTRAP_TIMEOUT } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`)
const results = []
const check = (name, callback) => { callback(); results.push({ name, passed: true }) }
const changes = [], timers = new Map()
let nextTimer = 0, failures = 0
const controller = createWebsiteBootstrap({ desktop: value => changes.push(value), timeout: () => failures++, schedule: (callback, delay) => { assert.equal(delay, WEBSITE_BOOTSTRAP_TIMEOUT); timers.set(++nextTimer, callback); return nextTimer }, cancel: timer => timers.delete(timer) })
const ready = { status: 'ready', authenticated: true, desktopReady: true, viewportWidth: 1024 }
const narrowReady = { ...ready, viewportWidth: 320 }
const project = (revision, value) => controller.project(revision, value, 320)
const first = controller.begin()
check('bootstrap begins wide without relying on a measured host viewport', () => assert.deepEqual(changes, [true]))
check('about:blank/old ready and finish without DOM proof cannot release width', () => { controller.loaded(first); assert.equal(project(first, ready), 'waiting') })
controller.domReady(first)
check('DOM readiness alone cannot release width', () => assert.equal(project(first, ready), 'waiting'))
controller.loaded(first)
check('generic ready without identity or chrome proof cannot release width', () => { assert.equal(project(first, { status: 'ready' }), 'waiting'); assert.equal(project(first, { status: 'ready', authenticated: true }), 'waiting') })
check('fresh desktop proof restores width but does not reveal yet', () => { assert.equal(project(first, ready), 'resized'); assert.deepEqual(changes, [true, false]) })
check('a second projection at the old desktop width cannot acknowledge resize', () => assert.equal(project(first, ready), 'waiting'))
check('actual-width confirmation completes the same document', () => { assert.equal(project(first, narrowReady), 'ready'); assert.equal(timers.size, 0) })
check('repeated projections/layout updates do not start another load', () => { for (let i = 0; i < 30; i++) assert.equal(project(first, ready), 'ready'); assert.deepEqual(changes, [true, false]) })
const second = controller.begin()
check('a replacement document rejects all old projections and load signals', () => { controller.domReady(first); controller.loaded(first); assert.equal(project(first, ready), 'waiting'); assert.equal(project(second, ready), 'waiting') })
check('deadline reports failure without revealing/restoring unadapted content', () => { for (const callback of [...timers.values()]) callback(); assert.equal(failures, 1); assert.equal(changes.at(-1), true) })
controller.domReady(second); controller.loaded(second)
check('late correct proof can recover without an automatic reload', () => { assert.equal(project(second, ready), 'resized'); assert.equal(project(second, narrowReady), 'ready') })
const third = controller.begin(); controller.domReady(third); controller.loaded(third)
check('the real sign-in route has a separate non-account presentation policy', () => { assert.equal(project(third, { status: 'sign-in', viewportWidth: 1024 }), 'resized'); assert.equal(project(third, { status: 'sign-in', viewportWidth: 320 }), 'ready') })
check('the first late conversation header can learn desktop metrics without a new document', () => { assert.equal(controller.recheck(third), true); assert.equal(controller.recheck(third), false); assert.equal(project(third, ready), 'resized'); assert.equal(project(third, narrowReady), 'ready') })
controller.dispose()
check('disposed owners cannot accept late proof', () => assert.equal(project(third, ready), 'waiting'))


const authChanges = [], authTimers = new Map()
let authTimer = 0, authFailures = 0
const auth = createWebsiteBootstrap({ desktop: value => authChanges.push(value), timeout: () => authFailures++, schedule: callback => { authTimers.set(++authTimer, callback); return authTimer }, cancel: timer => authTimers.delete(timer) })
const oldAuth = auth.begin(), currentAuth = auth.begin()
check('stale documents and non-auth URLs cannot expose an authentication surface', () => {
  assert.equal(auth.authentication(oldAuth, 'https://accounts.google.com/'), false)
  for (const url of ['about:blank', 'http://accounts.google.com/', 'https://chat.deepseek.com/', 'https://deepseek.com/', 'https://sub.deepseek.com/', 'https://accounts.google.com:444/', 'https://user@accounts.google.com/', 'not a URL']) assert.equal(auth.authentication(currentAuth, url), false, url)
  assert.equal(authChanges.at(-1), true)
  assert.equal(authTimers.size, 1)
})
const oldDeadline = [...authTimers.values()][0]
check('external provider sign-in cancels the adaptation deadline without claiming a DeepSeek session', () => {
  for (const url of ['https://accounts.google.com/v3/signin/identifier', 'https://appleid.apple.com/auth/authorize', 'https://open.weixin.qq.com/connect/qrconnect', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', 'https://sso.example.com/login']) assert.equal(auth.authentication(currentAuth, url), true, url)
  assert.equal(authChanges.at(-1), false)
  assert.equal(authTimers.size, 0)
  oldDeadline()
  assert.equal(authFailures, 0)
  assert.equal(auth.recheck(currentAuth), false)
  auth.domReady(currentAuth); auth.loaded(currentAuth)
  assert.equal(auth.project(currentAuth, ready, 320), 'waiting')
})
const callback = auth.begin()
check('a callback restores the normal desktop proof and deadline', () => {
  assert.equal(authChanges.at(-1), true)
  assert.equal(authTimers.size, 1)
  auth.domReady(callback); auth.loaded(callback)
  assert.equal(auth.project(callback, ready, 320), 'resized')
  assert.equal(auth.project(callback, narrowReady, 320), 'ready')
})
auth.dispose()
check('a disposed owner cannot reveal a late provider document', () => assert.equal(auth.authentication(callback, 'https://appleid.apple.com/'), false))

const primitives = ['BrandWordmark', 'IconSearchOutlineRegular', 'IconCloseFillRegular', 'IconNewChatOutlineRegular', 'IconPanelLeftOutlineRegular', 'IconRefreshOutlineRegular', 'IconLoadingOutlineRegular', 'IconEllipsisOutlineRegular', 'IconEditOutlineRegular', 'IconPinOutlineRegular', 'IconShareOutlineRegular', 'IconTrashOutlineRegular', 'IconChevronDownOutlineRegular', 'Menu', 'Modal', 'Tooltip', 'Button', 'Input', 'Switch']
const surfaceSource = await readFile(path.join(root, 'src/web-surface.tsx'), 'utf8')
check('a failed start does not consume the one-shot desktop recovery', () => {
  assert.match(surfaceSource, /desktopChromeTries < DESKTOP_CHROME_LIMIT\n\s*&& bootstrap\.recheck\(requestDocumentRevision\)\) \{\n\s*desktopChromeTries\+\+/)
})
check('each in-site conversation change opens a fresh bounded attempt', () => {
  assert.match(surfaceSource, /desktopChromeTries = 0\n\s*fastPollingUntil/)
})
check('a new document resets the attempt budget', () => {
  assert.match(surfaceSource, /const resetDocumentPresentation = \(\) => \{\n\s*documentRevision = bootstrap\.begin\(\)\n\s*documentReady = false\n\s*desktopChromeTries = 0/)
})

const negative = process.argv.includes('--negative-control')
const regression = { name: 'reintroduce-old-width-dependency-in-memory', setup(plugin) {
  plugin.onLoad({ filter: /src[\\/]web-surface\.tsx$/ }, async args => {
    const text = await readFile(args.path, 'utf8')
    const original = 'recoveryRevision, guestWanted])'
    assert.ok(text.includes(original))
    return { contents: text.replace(original, 'recoveryRevision, guestWanted, state.viewport?.width])'), loader: 'tsx' }
  })
} }
const fixture = await build({ absWorkingDir: root, entryPoints: ['tests/browser/website-bootstrap.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [...(negative ? [regression] : []), { name: 'fixture-visual-sdk', setup(plugin) {
  plugin.onResolve({ filter: /^@deepseek-ai\/dsh-client-ui-primitives$/ }, () => ({ path: 'primitives', namespace: 'fixture' }))
  plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: "import {createElement} from 'react';" + primitives.map(name => `export const ${name}=({children,...props})=>createElement('span',props,children);`).join(''), loader: 'js', resolveDir: root }))
} }] })
const code = fixture.outputFiles[0].text.replaceAll('</script', '<\\/script')
let browser
try {
  browser = await runHeadlessFixture(`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px Arial}</style></head><body><div id="fixture"></div><script>${code}</script></body></html>`)
} catch (error) {
  if (!negative || !String(error).includes('first real viewport measurement does not replace the lease')) throw error
  console.log(JSON.stringify({ passed: true, negativeControlCaught: true, source: 'old width-dependent lease bug reintroduced only in the in-memory test bundle' }))
  process.exit(0)
}
assert.equal(negative, false, 'The fixture must reject the reintroduced resize bug')
assert.ok(Array.isArray(browser) && browser.length >= 20 && browser.every(result => result.passed), JSON.stringify(browser))
console.log(JSON.stringify({ passed: true, cases: results.length + browser.length, controller: results, surface: browser, source: 'executed document controller plus production React Surface with unique fake Electron leases/events; no live site or native Electron acceptance' }, null, 2))
