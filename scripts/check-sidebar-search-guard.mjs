import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundle = await build({ absWorkingDir: root, entryPoints: ['tests/sidebar-search-guard.test.ts'],
  bundle: true, write: false, format: 'esm', platform: 'node', target: 'node22',
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" } })
const dir = await mkdtemp(path.join(tmpdir(), 'dsh-search-guard-'))
const file = path.join(dir, 'bundle.mjs')
await writeFile(file, bundle.outputFiles[0].text)
try {
  await import(pathToFileURL(file).href)
} finally {
  await rm(dir, { recursive: true, force: true })
}
const source = await readFile(path.join(root, 'src/search-replay-guard.ts'), 'utf8')
assert.match(source, /entry\.locale !== 'workspace'/)
assert.match(source, /typeof entry\.component !== 'function'/)
assert.match(source, /typeof props\.useWorkspaceShortcuts === 'function'/)
assert.match(source, /searchRequest === mountedRequest\.current/)
const client = await readFile(path.join(root, 'src/client.ts'), 'utf8')
assert.match(client, /guardHarnessSearchReplay/)
console.log('Sidebar search replay guard checks passed: slot shapes, remount mapping, cleanup.')
