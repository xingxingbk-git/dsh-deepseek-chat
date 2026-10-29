import { build } from 'esbuild'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const code = (await build({ absWorkingDir: root, entryPoints: ['tests/browser/title-stability.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130' })).outputFiles[0].text
const html = (await readFile(path.join(root, 'tests/browser/title-stability.fixture.html'), 'utf8')).replace('/* FIXTURE_SCRIPT */', code.replaceAll('</script', '<\\/script'))
const tempPrefix = path.join(tmpdir(), 'dsh-title-stability-')
const profile = await mkdtemp(tempPrefix)
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
const timeout = setTimeout(() => { console.error('Title fixture timed out'); child.kill('SIGKILL'); process.exitCode = 1 }, 25000)
try {
  const endpoint = await new Promise((resolve, reject) => {
    let stderr = ''
    child.on('error', reject)
    child.on('exit', code => reject(new Error(`Chrome exited early: ${code}`)))
    child.stderr.on('data', chunk => { stderr += chunk; const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(match[1]) })
  })
  socket = new WebSocket(endpoint)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  const pending = new Map(); let id = 0
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  socket.onclose = () => { for (const entry of pending.values()) entry.reject(new Error('Chrome debugging connection closed')); pending.clear() }
  let session
  socket.onmessage = async event => {
    const message = JSON.parse(event.data)
    if (message.id) { const entry = pending.get(message.id); pending.delete(message.id); if (message.error) entry?.reject(new Error(JSON.stringify(message.error))); else entry?.resolve(message.result); return }
    if (message.method === 'Fetch.requestPaused') {
      const params = message.params
      // No request reaches the public site, DNS, or a private network. Only the
      // exact synthetic document is fulfilled; all other requests are blocked.
      if (params.request.url === 'https://chat.deepseek.com/synthetic-title-stability') {
        await send('Fetch.fulfillRequest', { requestId: params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: Buffer.from(html).toString('base64') }, session)
      } else await send('Fetch.failRequest', { requestId: params.requestId, errorReason: 'BlockedByClient' }, session)
    }
  }
  const target = await send('Target.createTarget', { url: 'about:blank' })
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
  await send('Page.enable', {}, session)
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, session)
  await send('Page.navigate', { url: 'https://chat.deepseek.com/synthetic-title-stability' }, session)
  const evaluation = await send('Runtime.evaluate', { expression: 'new Promise((resolve,reject)=>{const run=()=>{if(window.fixtureDone)window.fixtureDone.then(resolve,reject);else if(document.readyState==="complete")reject(new Error("fixture did not initialize"));else setTimeout(run,10)};run()})', awaitPromise: true, returnByValue: true }, session)
  if (evaluation.exceptionDetails) throw new Error(JSON.stringify(evaluation.exceptionDetails))
  const results = evaluation.result.value
  const passed = Array.isArray(results) && results.length === 38 && results.every(result => result.passed)
  console.log(JSON.stringify({ passed, expectedCases: 38, actualCases: results?.length, source: 'synthetic intercepted HTTPS document; no live site CSS/native desktop verification', results }, null, 2))
  if (!passed) process.exitCode = 1
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  clearTimeout(timeout)
  socket?.close()
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await new Promise(resolve => child.once('exit', resolve)) }
  // Only delete the exact mkdtemp profile owned by this invocation.
  if (!path.isAbsolute(profile) || !profile.startsWith(tempPrefix) || path.dirname(profile) !== path.resolve(tmpdir())) throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile, { recursive: true, force: true })
}
