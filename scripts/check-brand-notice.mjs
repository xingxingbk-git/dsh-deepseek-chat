import { build } from 'esbuild'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ui = await readFile(path.join(root, 'src/ui.tsx'), 'utf8')
const names = ui.match(/import \{([^}]+)\} from '@deepseek-ai\/dsh-client-ui-primitives'/)[1].split(',').map(name => name.trim())
const shim = `import React from 'react';\n` + names.map(name => name === 'Tooltip'
  ? `export const Tooltip=({children})=>{window.nativeTooltipCalls=(window.nativeTooltipCalls??0)+1;return children};`
  : name === 'Button' ? `export const Button=({children,...props})=>React.createElement('button',props,children);`
  : `export const ${name}=()=>React.createElement('svg',{width:16,height:16,'aria-hidden':true});`).join('\n')
const code = (await build({ absWorkingDir: root, entryPoints: ['tests/browser/brand-notice.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130', plugins: [{name:'native-primitives-stand-in',setup(plugin){plugin.onResolve({filter:/^@deepseek-ai\/dsh-client-ui-primitives$/},()=>({path:'primitives',namespace:'fixture'}));plugin.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:shim,loader:'js',resolveDir:root}))}}] })).outputFiles[0].text
// Geometry copied from the public 0.2.2 SidebarRoot CSS. Native shell and
// primitive controls here are structural stand-ins, not an installed DSH.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;font:14px Arial;--dsw-specific-sidebar-fill:#202124;--dsw-alias-label-primary:#eee;--dsw-alias-border-l2:#333;--dsw-alias-interactive-bg-hover:#36383c}
body.light{--dsw-specific-sidebar-fill:#f4f5f8;--dsw-alias-label-primary:#222}
.native-root{--dsh-sidebar-inline-padding:8px;width:280px;height:500px;padding:6px var(--dsh-sidebar-inline-padding);box-sizing:border-box;display:flex;flex-direction:column}
.native-top-strip{box-sizing:border-box;height:52px;margin:-6px calc(-1 * var(--dsh-sidebar-inline-padding)) 0;flex:none;padding:0 12px 2px;display:flex}
.native-top-strip+.native-logo-row{margin-top:-12px}
.native-logo-row{box-sizing:border-box;flex:none;justify-content:flex-end;align-items:center;gap:8px;height:60px;margin-bottom:0;padding:8px 0 8px 8px;display:flex;overflow:hidden}
.native-brand{width:130px;height:24px;flex:0 0 130px}
#native-new-session{height:38px;flex:none;border:1px solid #888;border-radius:8px;background:transparent}
</style></head><body><div class="native-root"><div class="native-top-strip"></div><div class="native-logo-row" data-window-drag><span class="native-brand" aria-hidden="true">Synthetic brand</span><span id="control" class="dsh-chat-brand-control-host"></span></div><button id="native-new-session">Synthetic New Session</button></div><script>${code.replaceAll('</script', '<\\/script')}</script></body></html>`
const expectedCases = 31
const prefix = path.join(tmpdir(), 'dsh-brand-notice-')
const profile = await mkdtemp(prefix)
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], {stdio:['ignore','ignore','pipe']})
let socket
const timeout = setTimeout(() => { console.error('Brand notice fixture timed out'); child.kill('SIGKILL'); process.exitCode=1 },25000)
try {
  const endpoint = await new Promise((resolve,reject) => { let stderr=''; child.on('error',reject);child.on('exit',code=>reject(new Error(`Chrome exited early: ${code}`)));child.stderr.on('data',chunk=>{stderr+=chunk;const match=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)resolve(match[1])}) })
  socket=new WebSocket(endpoint)
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  const pending=new Map();let id=0
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params,...sessionId?{sessionId}:{}}))})
  socket.onclose=()=>{for(const entry of pending.values())entry.reject(new Error('Chrome debugging connection closed'));pending.clear()}
  let session
  socket.onmessage=async event=>{
    const message=JSON.parse(event.data)
    if(message.id){const entry=pending.get(message.id);pending.delete(message.id);if(message.error)entry?.reject(new Error(JSON.stringify(message.error)));else entry?.resolve(message.result);return}
    if(message.method==='Fetch.requestPaused'){
      const p=message.params
      if(p.request.url==='https://synthetic.invalid/brand-notice')await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(html).toString('base64')},session)
      else await send('Fetch.failRequest',{requestId:p.requestId,errorReason:'BlockedByClient'},session)
    }
  }
  const target=await send('Target.createTarget',{url:'about:blank'})
  session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId
  await send('Page.enable',{},session)
  // Never let a fixture write into the user's Downloads folder.
  await send('Browser.setDownloadBehavior',{behavior:'deny'}).catch(()=>{})
  await send('Fetch.enable',{patterns:[{urlPattern:'*'}]},session)
  await send('Page.navigate',{url:'https://synthetic.invalid/brand-notice'},session)
  const evaluation=await send('Runtime.evaluate',{expression:'new Promise((resolve,reject)=>{const run=()=>{if(window.fixtureDone)window.fixtureDone.then(resolve,reject);else if(document.readyState==="complete")reject(new Error("fixture did not initialize"));else setTimeout(run,10)};run()})',awaitPromise:true,returnByValue:true},session)
  if(evaluation.exceptionDetails)throw new Error(JSON.stringify(evaluation.exceptionDetails))
  const report=evaluation.result.value
  const passed=report.results.length===expectedCases&&report.results.every(item=>item.passed)
  console.log(JSON.stringify({passed,expectedCases,actualCases:report.results.length,source:'Actual production React/CSS; synthetic native shell/primitive stand-ins; page requests intercepted, no live DSH or website',...report},null,2))
  if(!passed)process.exitCode=1
} catch(error){console.error(error);process.exitCode=1}
finally{
  clearTimeout(timeout);socket?.close()
  if(child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await new Promise(resolve=>child.once('exit',resolve))}
  if(!path.isAbsolute(profile)||!profile.startsWith(prefix)||path.dirname(profile)!==path.resolve(tmpdir()))throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile,{recursive:true,force:true})
}
