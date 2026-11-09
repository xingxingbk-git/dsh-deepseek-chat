import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

// Pure guest-lifetime rules plus source wiring guards. No Electron or live host needed.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = await build({ absWorkingDir: root, entryPoints: ['src/website-guest.ts'], bundle: true, write: false, platform: 'node', format: 'esm', target: 'node22' })
const { holdsWebsiteGuest, resumeWebsiteUrl, WEBSITE_ORIGIN } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`)

let cases = 0
const check = (name, callback) => { callback(); cases++; console.log(`PASS ${name}`) }
const state = (patch = {}) => ({ mode: 'chat', modeEnabled: true, settingsOpen: false, authorizationStatus: 'authorized', accountStorageKey: 'account-1', ...patch })
const root_url = 'https://chat.deepseek.com/'

check('CHAT keeps its guest while enabled and authorized', () => {
  assert.equal(holdsWebsiteGuest(state()), true)
  assert.equal(holdsWebsiteGuest(state({ mode: 'chat', settingsOpen: false })), true)
})
check('leaving CHAT retains the page by default for instant switching', () => {
  assert.equal(holdsWebsiteGuest(state({ mode: 'harness' })), true)
})
check('immediate or elapsed-delayed release frees the guest', () => {
  assert.equal(holdsWebsiteGuest(state({ mode: 'harness' }), true), false)
  assert.equal(holdsWebsiteGuest(state({ mode: 'chat' }), true), true)
})
check('settings still gets the shared guest for account observation', () => {
  assert.equal(holdsWebsiteGuest(state({ mode: 'harness', settingsOpen: true })), true)
})
check('disabled CHAT never acquires a guest from the mode switch', () => {
  assert.equal(holdsWebsiteGuest(state({ modeEnabled: false })), false)
})
check('an open settings page may still observe the account when CHAT is disabled', () => {
  assert.equal(holdsWebsiteGuest(state({ modeEnabled: false, settingsOpen: true })), true)
})
check('unauthorized or accountless states hold no guest', () => {
  assert.equal(holdsWebsiteGuest(state({ authorizationStatus: 'pending' })), false)
  assert.equal(holdsWebsiteGuest(state({ accountStorageKey: null })), false)
})
check('the official site origin is stable', () => {
  assert.equal(WEBSITE_ORIGIN, 'https://chat.deepseek.com')
})
check('conversation URLs resume after a release', () => {
  const url = 'https://chat.deepseek.com/a/chat/s/fictional-conversation'
  assert.equal(resumeWebsiteUrl(url, root_url), url)
})
check('non-site, blank and malformed URLs fall back to the site root', () => {
  assert.equal(resumeWebsiteUrl('https://example.invalid/chat', root_url), root_url)
  assert.equal(resumeWebsiteUrl('about:blank', root_url), root_url)
  assert.equal(resumeWebsiteUrl('', root_url), root_url)
  assert.equal(resumeWebsiteUrl(null, root_url), root_url)
  assert.equal(resumeWebsiteUrl('not a url', root_url), root_url)
})

const surface = await readFile(path.join(root, 'src/web-surface.tsx'), 'utf8')
check('production surface imports the shared guest rules', () => {
  assert.match(surface, /import \{ holdsWebsiteGuest, resumeWebsiteUrl \} from '\.\/website-guest\.js'/)
})
check('acquisition is gated by guest lifetime and re-runs when CHAT closes', () => {
  assert.match(surface, /!guestWanted\s*\n?\s*\|\| requestedGeneration !== state\.authorizationGeneration/)
  assert.match(surface, /recoveryRevision, guestWanted\]\)/)
  assert.doesNotMatch(surface, /armWideBootstrap|wideBootstrapLoaded/)
})
check('the released page URL is captured and restored on the next acquisition', () => {
  assert.match(surface, /addEventListener\('did-navigate', rememberWebsiteUrl/)
  assert.match(surface, /addEventListener\('did-navigate-in-page', rememberWebsiteUrl/)
  assert.match(surface, /navigate\(resumeWebsiteUrl\(lastWebsiteUrl\.current, WEBSITE_URL\)\)/)
})
check('a different account cannot resume the previous account page', () => {
  assert.match(surface, /if \(lastAccountKey\.current !== storageKey\) \{/)
  assert.match(surface, /lastWebsiteUrl\.current = null/)
})

console.log(JSON.stringify({ passed: true, cases, source: 'pure guest-lifetime rules plus production source wiring; no Electron or live DSH', limits: 'Source-level guard only; the DevTools recovery itself still needs a real packaged Electron window to observe.' }, null, 2))
