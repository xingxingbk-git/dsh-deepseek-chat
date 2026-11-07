import {build} from 'esbuild'
import {mkdtemp,rm} from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const code=(await build({absWorkingDir:root,entryPoints:['tests/browser/sidebar-022.fixture.js'],bundle:true,write:false,format:'iife',platform:'browser',target:'chrome130'})).outputFiles[0].text
const html=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'"></head><body><script>${code.replaceAll('</script','<\\/script')}</script></body></html>`
const prefix=path.join(tmpdir(),'dsh-sidebar-022-'),profile=await mkdtemp(prefix)
const chrome=process.env.CHROME_PATH || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']})
let socket
const timeout=setTimeout(()=>{console.error('Sidebar 0.2.2 fixture timed out');child.kill('SIGKILL');process.exitCode=1},25000)
try {
  const endpoint=await new Promise((resolve,reject)=>{
    let stderr=''
    child.on('error',reject);child.on('exit',code=>reject(new Error(`Chrome exited early: ${code}`)))
    child.stderr.on('data',chunk=>{stderr+=chunk;const match=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)resolve(match[1])})
  })
  socket=new WebSocket(endpoint)
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  const pending=new Map(),pageErrors=[];let id=0
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{
    const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params,...(sessionId ? {sessionId} : {})}))
  })
  socket.onclose=()=>{for(const entry of pending.values())entry.reject(new Error('Chrome debugging connection closed'));pending.clear()}
  socket.onmessage=event=>{
    const message=JSON.parse(event.data)
    if(message.id){const entry=pending.get(message.id);pending.delete(message.id);if(message.error)entry?.reject(new Error(JSON.stringify(message.error)));else entry?.resolve(message.result);return}
    if(message.method==='Runtime.exceptionThrown')pageErrors.push(message.params.exceptionDetails.text)
    // No public URL, website, local server, account or network resource is loaded.
    if(message.method==='Fetch.requestPaused')void send('Fetch.failRequest',{requestId:message.params.requestId,errorReason:'BlockedByClient'},message.sessionId).catch(()=>{})
  }
  const target=await send('Target.createTarget',{url:'about:blank'})
  const session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId
  await send('Page.enable',{},session);await send('Runtime.enable',{},session)
  await send('Fetch.enable',{patterns:[{urlPattern:'*'}]},session)
  const frame=(await send('Page.getFrameTree',{},session)).frameTree.frame.id
  await send('Page.setDocumentContent',{frameId:frame,html},session)
  const evaluation=await send('Runtime.evaluate',{expression:'window.fixtureDone',awaitPromise:true,returnByValue:true},session)
  if(evaluation.exceptionDetails)throw new Error(JSON.stringify(evaluation.exceptionDetails))
  const results=evaluation.result.value,expectedCases=54
  const passed=Array.isArray(results) && results.length===expectedCases && results.every(result=>result.passed===true) && pageErrors.length===0
  console.log(JSON.stringify({passed,expectedCases,actualCases:results?.length,pageErrors,source:'synthetic published-shell shapes; actual adapter and CSS; no DSH/account/network',results},null,2))
  if(!passed)process.exitCode=1
} catch(error){console.error(error);process.exitCode=1}
finally {
  clearTimeout(timeout);socket?.close()
  if(child.exitCode===null && child.signalCode===null){child.kill('SIGKILL');await new Promise(resolve=>child.once('exit',resolve))}
  // Check the exact temporary directory owned by this invocation before deleting it.
  if(!path.isAbsolute(profile) || path.resolve(profile)!==profile || !profile.startsWith(prefix) || path.dirname(profile)!==path.resolve(tmpdir()))throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile,{recursive:true,force:true})
}
