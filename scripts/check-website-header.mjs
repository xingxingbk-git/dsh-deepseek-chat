import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runHeadlessFixture } from './run-headless-fixture.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const negative = process.argv.includes('--negative-control')
const bundle = await build({ absWorkingDir: root, entryPoints: ['tests/browser/website-header.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130', plugins: negative ? [{ name: 'remove-responsive-size-guard-in-memory', setup(plugin) {
  plugin.onLoad({ filter: /src[\\/]website-header\.ts$/ }, async args => ({ contents: (await readFile(args.path, 'utf8')).replace('const shareSize = measured ?', 'const shareSize = false && measured ?'), loader: 'ts' }))
} }] : [] })
const code = bundle.outputFiles[0].text.replaceAll('</script', '<\\/script')
let results
try {
  results = await runHeadlessFixture(`<!doctype html><html><head><meta charset="utf-8"></head><body><script>${code}</script></body></html>`)
} catch (error) {
  if (!negative || !String(error).includes('767px responsive replacement keeps desktop glyph')) throw error
  console.log(JSON.stringify({ passed: true, negativeControlCaught: true, source: 'responsive Share metrics fix removed only from the in-memory test bundle' }))
  process.exit(0)
}
assert.equal(negative, false, 'The fixture must reject the original responsive glyph-size bug')
assert.ok(Array.isArray(results) && results.length >= 25 && results.every(result => result.passed), JSON.stringify(results))
console.log(JSON.stringify({ passed: true, cases: results.length, source: 'production header plus serialized navigation; realistic public DOM with synthetic responsive CSS, not live website acceptance', results }, null, 2))
