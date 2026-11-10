import { build } from 'esbuild'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Production settings UI with synthetic primitives and synthetic state. No DSH,
// no live site and no real keyboard shortcuts are registered here.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixtureSource = await readFile(path.join(root, 'tests/browser/shortcut-capture.fixture.js'), 'utf8')
const expectedCases = [...fixtureSource.matchAll(/\bcheck\('/g)].length
const primitiveShim = `import React from 'react';
export const Button=({children,disabled,...props})=>React.createElement('button',{...props,disabled},children);
export const Input=({className,...props})=>React.createElement('span',{className,'data-native-input':true},React.createElement('input',props));
export const Switch=({checked,onChange,label,disabled,className})=>React.createElement('button',{type:'button',role:'switch','aria-checked':checked,className,disabled,'aria-label':label,onClick:()=>{if(!disabled)onChange(!checked)}},checked?'on':'off');
export const Menu=({anchor})=>anchor;
export const Tooltip=({children})=>children;
export const Modal=()=>null;
export const BrandWordmark=()=>React.createElement('svg',{width:16,height:16});
export const IconSearchOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconCloseFillRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconNewChatOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconPanelLeftOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconRefreshOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconLoadingOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconEllipsisOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconEditOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconPinOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconShareOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconTrashOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
export const IconChevronDownOutlineRegular=()=>React.createElement('svg',{width:16,height:16});
`
const code = (await build({
  absWorkingDir: root,
  entryPoints: ['tests/browser/shortcut-capture.fixture.js'],
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130',
  plugins: [{
    name: 'native-primitives-stand-in',
    setup(plugin) {
      plugin.onResolve({ filter: /^@deepseek-ai\/dsh-client-ui-primitives$/ }, () => ({ path: 'primitives', namespace: 'fixture' }))
      plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: primitiveShim, loader: 'js', resolveDir: root }))
    },
  }],
})).outputFiles[0].text
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff;font:14px Arial}</style></head><body><div id="settings"></div><script>${code.replaceAll('</script', '<\\/script')}</script></body></html>`
const prefix = path.join(tmpdir(), 'dsh-shortcut-capture-')
const profile = await mkdtemp(prefix)
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
const timeout = setTimeout(() => { console.error('Shortcut capture fixture timed out'); child.kill('SIGKILL'); process.exitCode = 1 }, 30000)
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
    if (message.method !== 'Fetch.requestPaused') return
    const paused = message.params
    if (paused.request.url === 'https://chat.deepseek.com/synthetic-shortcut-capture') {
      await send('Fetch.fulfillRequest', { requestId: paused.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: Buffer.from(html).toString('base64') }, session)
    } else await send('Fetch.failRequest', { requestId: paused.requestId, errorReason: 'BlockedByClient' }, session)
  }
  const target = await send('Target.createTarget', { url: 'about:blank' })
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
  await send('Page.enable', {}, session)
  // Never let a fixture write into the user's Downloads folder.
  await send('Browser.setDownloadBehavior', { behavior: 'deny' }).catch(() => {})
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, session)
  await send('Page.navigate', { url: 'https://chat.deepseek.com/synthetic-shortcut-capture' }, session)
  const evaluation = await send('Runtime.evaluate', {
    expression: 'new Promise((resolve,reject)=>{const run=()=>{if(window.fixtureDone)window.fixtureDone.then(resolve,reject);else if(document.readyState==="complete")reject(new Error("fixture did not initialize"));else setTimeout(run,10)};run()})',
    awaitPromise: true, returnByValue: true,
  }, session)
  if (evaluation.exceptionDetails) throw new Error(JSON.stringify(evaluation.exceptionDetails))
  const results = evaluation.result.value
  const passed = Array.isArray(results) && results.length === expectedCases && results.every(result => result.passed)
  console.log(JSON.stringify({ passed, expectedCases, actualCases: results?.length, source: 'production React/CSS with synthetic primitives and state; no DSH, live site or registered shortcuts', results }, null, 2))
  if (!passed) process.exitCode = 1
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  clearTimeout(timeout)
  socket?.close()
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await new Promise(resolve => child.once('exit', resolve)) }
  if (!path.isAbsolute(profile) || !profile.startsWith(prefix) || path.dirname(profile) !== path.resolve(tmpdir())) throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile, { recursive: true, force: true })
}
