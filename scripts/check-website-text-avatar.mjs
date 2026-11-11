import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runHeadlessFixture } from './run-headless-fixture.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const negative = process.argv.includes('--negative-control')
const bundle = await build({absWorkingDir:root,entryPoints:['tests/browser/website-text-avatar.fixture.js'],bundle:true,write:false,format:'iife',platform:'browser',target:'chrome130',plugins:negative?[{name:'remove-text-avatar-support',setup(plugin){
  plugin.onLoad({filter:/src[\\/]website-navigation\.ts$/},async args=>({contents:(await readFile(args.path,'utf8')).replace('const textProfileRows = track.querySelectorAll<HTMLElement>(\'div[tabindex="0"]\')','const textProfileRows: HTMLElement[] = []'),loader:'ts'}))
}}]:[]})
let results
try {
  results = await runHeadlessFixture(`<!doctype html><meta charset="utf-8"><body><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body>`)
} catch (error) {
  if (!negative || !String(error).includes('text avatar password-login footer authenticates')) throw error
  console.log(JSON.stringify({passed:true,negativeControlCaught:true,source:'text-avatar recognition removed in memory'}))
  process.exit(0)
}
assert.equal(negative,false,'The fixture must reject the original text-avatar failure')
assert.ok(results.length >= 25 && results.every(r=>r.passed),JSON.stringify(results))
console.log(JSON.stringify({passed:true,cases:results.length,source:'redacted real footer structure; synthetic checks, not real login acceptance',results},null,2))
