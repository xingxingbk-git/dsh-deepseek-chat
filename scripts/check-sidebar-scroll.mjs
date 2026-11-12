import {build} from 'esbuild'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {spawn} from 'node:child_process'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const ui=await (await import('node:fs/promises')).readFile(path.join(root,'src/ui.tsx'),'utf8')
const names=ui.match(/import \{([^}]+)\} from '@deepseek-ai\/dsh-client-ui-primitives'/)[1].split(',').map(name=>name.trim())
const shim='import React from \'react\';\n'+names.map(name=>name==='Tooltip'?'export const Tooltip=({children})=>children;'
  : name==='Menu'?`export const Menu=({anchor,open,items,onSelect})=>React.createElement(React.Fragment,null,anchor,open&&React.createElement('div',{role:'menu'},items.map(i=>React.createElement('button',{key:i.id,'data-menu-id':i.id,onClick:()=>onSelect(i.id)},i.label))));`
  : name==='Button'?'export const Button=({children,...props})=>React.createElement(\'button\',props,children);'
  : `export const ${name}=()=>React.createElement('svg',{width:16,height:16,'aria-hidden':true});`).join('\n')
const code=(await build({absWorkingDir:root,entryPoints:['tests/browser/sidebar-scroll.fixture.js'],bundle:true,write:false,format:'iife',platform:'browser',target:'chrome130',plugins:[{name:'native-primitives-stand-in',setup(plugin){plugin.onResolve({filter:/^@deepseek-ai\/dsh-client-ui-primitives$/},()=>({path:'primitives',namespace:'fixture'}));plugin.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:shim,loader:'js',resolveDir:root}))}}]})).outputFiles[0].text
const html=`<!doctype html><html><head><meta charset="utf-8"><style>:root{--dsw-radius-sm:8px;--dsw-radius-md:12px;--dsw-radius-xs:4px;--dsw-alias-label-primary:rgb(240,240,240);--dsw-alias-label-tertiary:rgb(140,140,140);--dsw-alias-label-secondary:rgb(170,170,170);--dsw-alias-interactive-bg-hover:rgb(50,50,50)}body{margin:0;font:14px Arial}::-webkit-scrollbar{width:5px;height:5px}*{box-sizing:border-box}</style></head><body><script>${code.replaceAll('</script','<\\/script')}</script></body></html>`
const prefix=path.join(tmpdir(),'dsh-sidebar-scroll-'),profile=await mkdtemp(prefix)
const chrome=process.env.CHROME_PATH || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome')
const child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']})
let socket
const timeout=setTimeout(()=>{console.error('Sidebar scroll fixture timed out');child.kill('SIGKILL');process.exitCode=1},25000)
try{
  const endpoint=await new Promise((resolve,reject)=>{let stderr='';child.on('error',reject);child.on('exit',code=>reject(new Error(`Chrome exited early: ${code}`)));child.stderr.on('data',chunk=>{stderr+=chunk;const match=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)resolve(match[1])})})
  socket=new WebSocket(endpoint)
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  const pending=new Map();let id=0
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params,...(sessionId?{sessionId}:{})}))})
  socket.onclose=()=>{for(const entry of pending.values())entry.reject(new Error('Chrome debugging connection closed'));pending.clear()}
  socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const entry=pending.get(message.id);pending.delete(message.id);if(message.error)entry?.reject(new Error(JSON.stringify(message.error)));else entry?.resolve(message.result)}}
  const target=await send('Target.createTarget',{url:'about:blank'})
  const session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId
  await send('Page.enable',{},session);await send('Runtime.enable',{},session)
  await send('Browser.setDownloadBehavior',{behavior:'deny'}).catch(()=>{})
  const frame=(await send('Page.getFrameTree',{},session)).frameTree.frame.id
  await send('Page.setDocumentContent',{frameId:frame,html},session)
  const evaluation=await send('Runtime.evaluate',{expression:'window.fixtureDone',awaitPromise:true,returnByValue:true},session)
  if(evaluation.exceptionDetails)throw new Error(JSON.stringify(evaluation.exceptionDetails))
  const results=evaluation.result.value,expectedCases=5
  const passed=Array.isArray(results)&&results.length===expectedCases&&results.every(r=>r.passed===true)
  console.log(JSON.stringify({passed,expectedCases,actualCases:results?.length,source:'synthetic DSH 0.2.2-rc.2 sidebar grid + production plugin CSS; no live DSH',results},null,2))
  if(!passed)process.exitCode=1
}catch(error){console.error(error);process.exitCode=1}
finally{clearTimeout(timeout);socket?.close();if(child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await new Promise(resolve=>child.once('exit',resolve))}await rm(profile,{recursive:true,force:true})}
