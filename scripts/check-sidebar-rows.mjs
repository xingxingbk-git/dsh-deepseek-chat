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
  : name === 'Menu' ? `export const Menu=({anchor,open,items,onSelect})=>React.createElement(React.Fragment,null,anchor,open&&React.createElement('div',{role:'menu'},items.map(i=>React.createElement('button',{key:i.id,'data-menu-id':i.id,onClick:()=>onSelect(i.id)},i.label))));`
  : name === 'Button' ? 'export const Button=({children,...props})=>React.createElement(\'button\',props,children);'
  : `export const ${name}=()=>React.createElement('svg',{width:16,height:16,'aria-hidden':true});`).join('\n')
const code = (await build({ absWorkingDir: root, entryPoints: ['tests/browser/sidebar-rows.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130', plugins: [{ name: 'native-primitives-stand-in', setup(plugin) { plugin.onResolve({ filter: /^@deepseek-ai\/dsh-client-ui-primitives$/ }, () => ({ path: 'primitives', namespace: 'fixture' })); plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: shim, loader: 'js', resolveDir: root })) } }] })).outputFiles[0].text
// Frozen, minimal public 0.2.2-rc.2 SidebarRoot/WorkspaceBrowser/SessionRow CSS.
// No native private components are imported; only the plugin React is exercised.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
:root{--dsw-radius-sm:8px;--dsw-radius-md:12px;--dsw-radius-xs:4px;--dsw-alias-label-primary:rgb(240,240,240);--dsw-alias-label-tertiary:rgb(140,140,140);--dsw-alias-label-secondary:rgb(170,170,170);--dsw-alias-interactive-bg-hover:rgb(50,50,50)}
html[data-theme=light]{--dsw-alias-label-primary:rgb(25,25,25);--dsw-alias-interactive-bg-hover:rgb(235,235,235)}
body{margin:0;display:flex;font:14px Arial;color:var(--dsw-alias-label-primary)}*{box-sizing:border-box}::-webkit-scrollbar{width:5px;height:5px}
.shell{--dsh-sidebar-inline-padding:8px;--dsh-sidebar-row-padding:12px;--dsh-sidebar-paint-inset:3px;--dsh-sidebar-label-gap:6px;width:280px;height:280px;flex-shrink:0;padding:6px var(--dsh-sidebar-inline-padding);display:flex;flex-direction:column}
.region{min-height:0;margin-left:-4px;margin-right:calc(-1 * var(--dsh-sidebar-inline-padding));flex-direction:column;flex:1;padding-left:4px;display:flex;overflow:hidden}
#chat{display:contents}
#native-root{--native-edge:var(--dsh-sidebar-inline-padding);min-height:0;display:flex;flex-direction:column;flex:1;position:relative}
#native-header{height:36px;flex:none;margin-bottom:4px}
#native-list-area{min-height:0;margin-left:-4px;margin-right:calc(2px - var(--native-edge));padding-left:4px;padding-right:calc(var(--native-edge) - 5px - 2px);scrollbar-gutter:stable;display:block;overflow:hidden auto;flex:1}
#native-tree-body{flex-direction:column;flex:1;min-height:0;display:flex;position:relative}
#native-list{min-height:0;flex:1;padding-bottom:16px;overflow:visible}
#native-row,#native-row2{display:flex;align-items:center;border-radius:var(--dsw-radius-md);border-inline:var(--dsh-sidebar-paint-inset) solid transparent;background-clip:padding-box;background-color:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);padding:0 8px;padding-inline-start:calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset));height:32px}
#native-list>*+*{margin-top:2px}
#native-more{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin:-4px;padding:0;border:0;border-radius:var(--dsw-radius-xs);background:transparent;color:var(--dsw-alias-label-tertiary)}
#native-more:hover{color:var(--dsw-alias-label-primary)}
</style></head><body><div id="chat-shell" class="shell"><div class="region"><div id="chat"></div></div></div><div id="native-shell" class="shell"><div class="region"><div id="native-root"><header id="native-header"></header><div id="native-list-area"><div id="native-tree-body"><div id="native-list"><div id="native-row"><span style="flex:1">Synthetic native row</span><button id="native-more">...</button></div><div id="native-row2"><span style="flex:1">Second synthetic native row</span></div></div></div></div></div></div></div><script>${code.replaceAll('</script', '<\\/script')}</script></body></html>`
// Includes width/inset loops, explicit scrollbar bounds, overflow and scrolling checks.
const expectedCases = 51
const prefix = path.join(tmpdir(), 'dsh-sidebar-rows-')
const profile = await mkdtemp(prefix)
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
const timeout = setTimeout(() => { console.error('Sidebar rows fixture timed out'); child.kill('SIGKILL'); process.exitCode = 1 }, 30000)
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
    if (paused.request.url === 'https://synthetic.invalid/sidebar-rows') await send('Fetch.fulfillRequest', { requestId: paused.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: Buffer.from(html).toString('base64') }, session)
    else await send('Fetch.failRequest', { requestId: paused.requestId, errorReason: 'BlockedByClient' }, session)
  }
  const target = await send('Target.createTarget', { url: 'about:blank' })
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
  await send('Page.enable', {}, session)
  // Never let a fixture write into the user's Downloads folder.
  await send('Browser.setDownloadBehavior',{behavior:'deny'}).catch(()=>{})
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, session)
  await send('Page.navigate', { url: 'https://synthetic.invalid/sidebar-rows' }, session)
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', {expression,awaitPromise:true,returnByValue:true}, session)
    if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  await evaluate('new Promise((resolve,reject)=>{const run=()=>{if(window.fixtureReady)window.fixtureReady.then(resolve,reject);else if(document.readyState==="complete")reject(new Error("fixture did not initialize"));else setTimeout(run,10)};run()})')
  await evaluate('window.testBaseline()')
  await send('DOM.enable',{},session)
  await send('CSS.enable',{},session)
  const {root:doc}=await send('DOM.getDocument',{},session)
  const force = async (selector,pseudoClasses) => {
    const {nodeId}=await send('DOM.querySelector',{nodeId:doc.nodeId,selector},session)
    if(!nodeId)throw Error(`Missing target ${selector}`)
    await send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:pseudoClasses},session)
  }
  await force('.dsh-chat-conversation-more',['hover'])
  await force('#native-more',['hover'])
  await force('.dsh-chat-conversation-item',['hover'])
  await evaluate('window.testHover()')
  await force('.dsh-chat-conversation-more',['focus-visible'])
  await force('.dsh-chat-conversation-item',[])
  await evaluate('window.testFocusAndMenu()')
  // The header refresh button must keep its normal filled hover.
  await force('.dsh-chat-search-actions .dsh-chat-icon-button',['hover'])
  const headerHover=await evaluate('getComputedStyle(document.querySelector(".dsh-chat-search-actions .dsh-chat-icon-button")).backgroundColor')
  if(headerHover==='rgba(0, 0, 0, 0)')throw Error('Header hover was accidentally removed')
  const report = await evaluate('window.testOtherStates()')
  const passed = report.results.length === expectedCases && report.results.every(item => item.passed)
  console.log(JSON.stringify({ passed, expectedCases, actualCases: report.results.length, source: 'production React/CSS, native 0.2.2-rc.1 CSS reference, CDP forced hover/focus; no live DSH', ...report }, null, 2))
  if (!passed) process.exitCode = 1
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  clearTimeout(timeout); socket?.close()
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await new Promise(resolve => child.once('exit', resolve)) }
  if (!path.isAbsolute(profile) || !profile.startsWith(prefix) || path.dirname(profile) !== path.resolve(tmpdir())) throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile, { recursive: true, force: true })
}
