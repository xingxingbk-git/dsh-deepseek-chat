import { build } from 'esbuild'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ui = await readFile(path.join(root, 'src/ui.tsx'), 'utf8')
const names = ui.match(/import \{([^}]+)\} from '@deepseek-ai\/dsh-client-ui-primitives'/)[1].split(',').map(name => name.trim())
const shim = 'import React from \'react\';\n' + names.map(name => name === 'Tooltip' ? 'export const Tooltip=({children})=>children;'
  : name === 'Button' ? 'export const Button=({children,...props})=>React.createElement(\'button\',props,children);'
  : `export const ${name}=()=>React.createElement('svg',{width:16,height:16,'aria-hidden':true});`).join('\n')
const code = (await build({ absWorkingDir: root, entryPoints: ['tests/browser/switcher-alignment.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130', plugins: [{ name: 'native-primitives-stand-in', setup(plugin) { plugin.onResolve({ filter: /^@deepseek-ai\/dsh-client-ui-primitives$/ }, () => ({ path: 'primitives', namespace: 'fixture' })); plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: shim, loader: 'js', resolveDir: root })) } }] })).outputFiles[0].text
// Geometry copied from the public 0.2.2 SidebarRoot CSS.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;font:14px Arial;--dsw-specific-sidebar-fill:#202124;--dsw-alias-label-primary:#eee;--dsw-alias-border-l2:#333}
.native-root{--dsh-sidebar-paint-inset:3px;width:280px;height:400px;padding:6px 8px;box-sizing:border-box;display:flex;flex-direction:column;background:#202124}
.native-logo-row{box-sizing:border-box;height:40px;margin:0;padding:0;display:flex;align-items:center;gap:8px;overflow:visible}
.native-brand{height:24px;flex:1 1 auto;min-width:0}
#control{height:24px}
#native-new-session{box-sizing:border-box;height:38px;margin:0 calc(var(--dsh-sidebar-paint-inset) + 1px) 10px;border:.5px solid #555;border-radius:12px;background:#2b2b2e;color:#eee}
</style></head><body><div class="native-root"><div class="native-logo-row" data-window-drag><span class="native-brand" aria-hidden="true">Synthetic brand</span><span id="control" class="dsh-chat-brand-control-host"></span></div><button id="native-new-session">Synthetic New Session</button></div><script>${code.replaceAll('</script', '<\\/script')}</script></body></html>`
const expectedCases = (await readFile(path.join(root, 'tests/browser/switcher-alignment.fixture.js'), 'utf8')).match(/\bcheck\('/g).length
const prefix = path.join(tmpdir(), 'dsh-switcher-alignment-')
const profile = await mkdtemp(prefix)
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
const timeout = setTimeout(() => { console.error('Switcher alignment fixture timed out'); child.kill('SIGKILL'); process.exitCode = 1 }, 30000)
try {
  const endpoint = await new Promise((resolve, reject) => { let stderr = ''; child.on('error', reject); child.on('exit', code => reject(new Error(`Chrome exited early: ${code}`))); child.stderr.on('data', chunk => { stderr += chunk; const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(match[1]) }) })
  socket = new WebSocket(endpoint)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  const pending = new Map(); let id = 0
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) })) })
  socket.onclose = () => { for (const entry of pending.values()) entry.reject(new Error('Chrome debugging connection closed')); pending.clear() }
  let session
  socket.onmessage = async event => {
    const message = JSON.parse(event.data)
    if (message.id) { const entry = pending.get(message.id); pending.delete(message.id); if (message.error) entry?.reject(new Error(JSON.stringify(message.error))); else entry?.resolve(message.result); return }
    if (message.method !== 'Fetch.requestPaused') return
    const paused = message.params
    if (paused.request.url === 'https://synthetic.invalid/switcher-alignment') await send('Fetch.fulfillRequest', { requestId: paused.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: Buffer.from(html).toString('base64') }, session)
    else await send('Fetch.failRequest', { requestId: paused.requestId, errorReason: 'BlockedByClient' }, session)
  }
  const target = await send('Target.createTarget', { url: 'about:blank' })
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
  await send('Page.enable', {}, session)
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, session)
  await send('Page.navigate', { url: 'https://synthetic.invalid/switcher-alignment' }, session)
  const evaluation = await send('Runtime.evaluate', { expression: 'new Promise((resolve,reject)=>{const run=()=>{if(window.fixtureDone)window.fixtureDone.then(resolve,reject);else if(document.readyState==="complete")reject(new Error("fixture did not initialize"));else setTimeout(run,10)};run()})', awaitPromise: true, returnByValue: true }, session)
  if (evaluation.exceptionDetails) throw new Error(JSON.stringify(evaluation.exceptionDetails))
  const report = evaluation.result.value
  const passed = report.results.length === expectedCases && report.results.every(item => item.passed)
  console.log(JSON.stringify({ passed, expectedCases, actualCases: report.results.length, source: 'production plugin CSS with synthetic public 0.2.2 sidebar geometry; no live DSH', ...report }, null, 2))
  if (!passed) process.exitCode = 1
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  clearTimeout(timeout); socket?.close()
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await new Promise(resolve => child.once('exit', resolve)) }
  if (!path.isAbsolute(profile) || !profile.startsWith(prefix) || path.dirname(profile) !== path.resolve(tmpdir())) throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile, { recursive: true, force: true })
}
