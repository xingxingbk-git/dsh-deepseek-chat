import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = await build({ absWorkingDir: root, entryPoints: ['tests/website-composer-focus.test.ts'],
  bundle: true, write: false, platform: 'node', format: 'esm', target: 'node22' })
await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`)
const surface = await readFile(path.join(root, 'src/web-surface.tsx'), 'utf8')
assert.match(surface, /websiteComposerFocusScript\(\)/)
assert.match(surface, /command\.type === 'open' \|\| command\.type === 'new'/)
assert.match(surface, /enteredChat\.current !== 'chat'/)
assert.match(surface, /COMPOSER_FOCUS_WINDOW = 30_000/)
assert.match(surface, /snapshot\.mode !== 'chat' \|\| !snapshot\.modeEnabled \|\| snapshot\.settingsOpen/)
assert.match(surface, /!presentationReady \|\| state\.mode !== 'chat'/)
assert.match(surface, /waitFocusFrame\(900\)/)
assert.match(surface, /parseComposerFocusResult/)
console.log('Composer focus checks passed: unit behavior + web-surface wiring.')
