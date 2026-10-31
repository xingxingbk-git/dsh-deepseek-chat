import { mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { startWindowRecognitionFixture, WINDOW_RECOGNITION_CASES } from './check-window-recognition-browser.mjs'

// Real React Surface/drag lifecycle and production CSS, with a DOM webview stub.
// This does NOT claim to exercise Electron guest compositing or native OS dragging.
const prefix=path.join(tmpdir(),'dsh-window-corners-')
const profile=await mkdtemp(prefix)
const chrome=process.env.CHROME_PATH || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'google-chrome')
const child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']})
let socket,fixture
const timeout=setTimeout(()=>{console.error('Window corner regression timed out');child.kill('SIGKILL');process.exitCode=1},150000)
try {
  const endpoint=await new Promise((resolve,reject)=>{let stderr='';child.on('error',reject);child.on('exit',code=>reject(new Error(`Chrome exited: ${code}`)));child.stderr.on('data',chunk=>{stderr+=chunk;const match=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)resolve(match[1])})})
  socket=new WebSocket(endpoint)
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  let id=0
  const pending=new Map()
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params,...(sessionId?{sessionId}:{})}))})
  socket.onclose=()=>{for(const p of pending.values())p.reject(new Error('Browser connection closed'));pending.clear()}
  socket.onmessage=async event=>{
    const msg=JSON.parse(event.data)
    if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);if(msg.error)p?.reject(new Error(JSON.stringify(msg.error)));else p?.resolve(msg.result);return}
    if(msg.method==='Fetch.requestPaused') {
      const allowed=fixture && msg.params.request.url.startsWith(fixture.url)
      await send(allowed?'Fetch.continueRequest':'Fetch.failRequest',{requestId:msg.params.requestId,...(allowed?{}:{errorReason:'BlockedByClient'})},msg.sessionId)
    }
  }
  const runs=[]
  const profiles=process.argv.includes('--quick')?[[1280,800,1]]:[[1280,800,1],[1280,800,2],[960,720,1.25],[800,600,1.5],[1440,900,2]]
  for(const [width,height,deviceScaleFactor] of profiles) {
    console.error(`Checking ${width}x${height} @${deviceScaleFactor}`)
    fixture=await startWindowRecognitionFixture({quiet:true})
    const target=await send('Target.createTarget',{url:'about:blank'})
    const session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId
    await send('Page.enable',{},session)
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor,mobile:false},session)
    await send('Fetch.enable',{patterns:[{urlPattern:'*'}]},session)
    await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.addEventListener('error',e=>window.fixtureError=String(e.error?.stack||e.message));window.addEventListener('unhandledrejection',e=>window.fixtureError=String(e.reason?.stack||e.reason));`},session)
    await send('Page.navigate',{url:fixture.url},session)
    const result=await send('Runtime.evaluate',{expression:`new Promise((resolve,reject)=>{const start=performance.now();const check=()=>{if(window.fixtureError)reject(new Error(window.fixtureError));else if(window.fixtureResults)resolve(window.fixtureResults);else if(performance.now()-start>15000)reject(new Error('Fixture did not finish'));else setTimeout(check,25)};check()})`,awaitPromise:true,returnByValue:true,timeout:20000},session)
    if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails))
    const cases=result.result.value
    const passed=Array.isArray(cases) && cases.length===WINDOW_RECOGNITION_CASES && cases.every(r=>r.passed)
    runs.push({width,height,deviceScaleFactor,passed,actualCases:cases?.length,failures:cases?.filter(r=>!r.passed)})
    console.error(`Completed ${cases?.length} checks; passed=${passed}`)
    await send('Target.closeTarget',{targetId:target.targetId})
    await fixture.close();fixture=undefined
    if(!passed)throw new Error(JSON.stringify(runs.at(-1)))
  }
  console.log(JSON.stringify({passed:true,source:'production React/CSS; synthetic desktop markers and DOM webview, not native Windows/Electron',runs},null,2))
} catch(error) {console.error(error);process.exitCode=1}
finally {
  clearTimeout(timeout)
  socket?.close()
  if(fixture)await fixture.close()
  if(child.exitCode===null && child.signalCode===null){child.kill('SIGKILL');await new Promise(resolve=>child.once('exit',resolve))}
  if(!path.isAbsolute(profile) || !profile.startsWith(prefix) || path.dirname(profile)!==path.resolve(tmpdir()))throw new Error('Unexpected temporary browser profile')
  await rm(profile,{recursive:true,force:true})
}
