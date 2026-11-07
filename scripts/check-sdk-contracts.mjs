import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import path from 'node:path'
import { build } from 'esbuild'
import { Context } from '@deepseek-ai/cordis'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const sdk = '0.2.2-rc.1'
for (const [name, version] of Object.entries(pkg.devDependencies)) {
  if (!name.startsWith('@deepseek-ai/dsh-')) continue
  assert.equal(version, sdk, `${name} must use the audited SDK`)
  assert.equal(JSON.parse(await readFile(require.resolve(`${name}/package.json`), 'utf8')).version, sdk)
}

// Execute the actual official Client factory, with the same shared identities
// used by the shell, rather than a hand-written SlotRegistry stand-in.
const moduleKeys = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime',
  '@deepseek-ai/dsh-client-ui-slots', '@deepseek-ai/cordis']
const modules = new Map(await Promise.all(moduleKeys.map(async name => [name, await import(name)])))
let registration
vm.runInNewContext(await readFile(require.resolve('@deepseek-ai/dsh-client-ui-renderer/client'), 'utf8'), {
  window: { __ModuleLoader__: { load: value => { registration = value } } },
})
assert.equal(registration.id, '@deepseek-ai/dsh-client-ui-renderer')
const { SlotRegistry } = registration.factory(name => {
  assert(modules.has(name), `Unexpected shared-module request: ${name}`)
  return modules.get(name)
})
const output = await build({ absWorkingDir: root, entryPoints: ['src/settings-icon.ts'],
  bundle: true, write: false, platform: 'node', format: 'esm', target: 'node22' })
const { bindChatSettingsIconSlot, CHAT_SETTINGS_SECTION_ID } = await import(
  `data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`)

let cases = 0
const check = (name, callback) => { callback(); cases++; console.log(`PASS ${name}`) }
const observers = new Set()
class Observer {
  observe() { observers.add(this) }
  disconnect() { observers.delete(this) }
}
// Only counts the legacy fallback's observers: no personal DOM or account data.
const doc = { body: { querySelectorAll: () => [] }, defaultView: { MutationObserver: Observer } }
const ctx = new Context()
const slots = new SlotRegistry(ctx)
const icon = () => null
let declare
const declareSeat = () => {
  declare = slots.register({ name: 'root', children: {
    'settings.section.icon': { kind: 'list', scope: 'root', inline: true },
  } }, () => null)
}
try {
  const stop = bindChatSettingsIconSlot(slots, icon, doc)
  check('older shell with no declared icon seat retains the bounded DOM fallback', () => {
    assert.equal(slots.entries('settings.section.icon').length, 0)
    assert.equal(observers.size, 1)
  })
  declareSeat()
  check('late 0.2.2 declaration synchronously replaces legacy observers with the public icon', () => {
    const entries = slots.entries('settings.section.icon')
    assert.equal(entries.length, 1)
    assert.equal(entries[0].options.id, CHAT_SETTINGS_SECTION_ID)
    assert.equal(entries[0].component, icon)
    assert.equal(observers.size, 0)
  })
  const releaseOther = slots.register({ name: 'settings.section.icon', id: 'fictional-other-section' }, () => null)
  check('an unrelated section icon remains separate', () => assert.equal(slots.entries('settings.section.icon').length, 2))
  declare()
  check('declaration collapse removes registrations and safely restores the older-shell fallback', () => {
    assert.equal(slots.entries('settings.section.icon').length, 0)
    assert.equal(observers.size, 1)
  })
  releaseOther()
  declareSeat()
  check('redeclaring the icon seat installs exactly one replacement', () => {
    assert.equal(slots.entries('settings.section.icon').length, 1)
    assert.equal(observers.size, 0)
  })
  stop(); stop()
  check('plugin cleanup is idempotent and does not restart DOM decoration', () => {
    assert.equal(slots.entries('settings.section.icon').length, 0)
    assert.equal(observers.size, 0)
  })
  declare(); declareSeat()
  check('a stopped waiter never re-registers after a shell reload', () => assert.equal(slots.entries('settings.section.icon').length, 0))
  const stopReady = bindChatSettingsIconSlot(slots, icon, doc)
  check('an already-declared 0.2.2 seat never starts the legacy DOM observer', () => {
    assert.equal(slots.entries('settings.section.icon').length, 1)
    assert.equal(observers.size, 0)
  })
  stopReady(); declare()
} finally {
  await ctx.fiber.dispose()
}

const read = async (name, relative) => {
  const dir = path.dirname(require.resolve(`${name}/package.json`))
  return readFile(path.join(dir, relative), 'utf8')
}
const browserTypes = await read('@deepseek-ai/dsh-client-ui-sidebar-browser', 'lib/types/types.d.ts')
const layout = await read('@deepseek-ai/dsh-client-ui-layout', 'lib/types/client/index.d.ts')
const settings = await read('@deepseek-ai/dsh-client-ui-settings', 'lib/types/client/contract/slots.d.ts')
check('official browser bridge keeps acquire/release/onOpenRequested', () => {
  for (const name of ['acquire', 'release', 'onOpenRequested']) assert(browserTypes.includes(`${name}(`), name)
})
check('official main and shell slots remain declared', () => {
  for (const name of ['main', 'shell.leading', 'shell.overlay']) assert(layout.includes(`'${name}'`), name)
})
check('settings icon owner contract supplies size and active', () => {
  assert(settings.includes("'settings.section.icon'"))
  assert.match(settings, /interface SettingsSectionIconOwnerProps\s*\{[\s\S]*?size: number;[\s\S]*?active: boolean;/)
})
console.log(`SDK ${sdk}: ${cases} contract checks passed (official SlotRegistry; no native guest or live account).`)
