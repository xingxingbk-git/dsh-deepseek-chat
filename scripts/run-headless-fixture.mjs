import { mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'

/** Execute a self-contained synthetic document, with every network request intercepted. */
export async function runHeadlessFixture(html, { width = 1280, height = 800, timeout = 30_000 } = {}) {
  const prefix = path.join(tmpdir(), 'dsh-chat-fixture-')
  const profile = await mkdtemp(prefix)
  const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
  const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
  let socket, deadline
  try {
    const endpoint = await new Promise((resolve, reject) => {
      let output = ''
      child.on('error', reject)
      child.on('exit', code => reject(new Error(`Chrome exited early: ${code}`)))
      child.stderr.on('data', chunk => { output += chunk; const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(match[1]) })
    })
    socket = new WebSocket(endpoint)
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
    let id = 0
    const pending = new Map()
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const requestId = ++id; pending.set(requestId, { resolve, reject })
      socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) }))
    })
    socket.onclose = () => { for (const request of pending.values()) request.reject(new Error('Browser connection closed')); pending.clear() }
    const url = 'https://chat.deepseek.com/synthetic-bootstrap-test'
    socket.onmessage = async event => {
      const message = JSON.parse(event.data)
      if (message.id) {
        const request = pending.get(message.id); pending.delete(message.id)
        if (message.error) request?.reject(new Error(JSON.stringify(message.error))); else request?.resolve(message.result)
      } else if (message.method === 'Fetch.requestPaused') {
        const requestId = message.params.requestId
        if (message.params.request.url === url) await send('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: Buffer.from(html).toString('base64') }, message.sessionId)
        else await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }, message.sessionId)
      }
    }
    const target = await send('Target.createTarget', { url: 'about:blank' })
    const session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
    await send('Page.enable', {}, session)
    // Never let a fixture write into the user's Downloads folder.
    await send('Browser.setDownloadBehavior',{behavior:'deny'}).catch(()=>{})
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, session)
    await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, session)
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "window.addEventListener('error',e=>window.fixtureError=String(e.error?.stack||e.message));window.addEventListener('unhandledrejection',e=>window.fixtureError=String(e.reason?.stack||e.reason));" }, session)
    await send('Page.navigate', { url }, session)
    const evaluation = send('Runtime.evaluate', { expression: `new Promise((resolve,reject)=>{const started=performance.now();const poll=()=>{if(window.fixtureError)reject(new Error(window.fixtureError));else if(window.fixtureDone)window.fixtureDone.then(resolve,reject);else if(performance.now()-started>${timeout - 1000})reject(new Error('Fixture did not initialize'));else setTimeout(poll,10)};poll()})`, awaitPromise: true, returnByValue: true, timeout }, session)
    const result = await Promise.race([evaluation, new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Fixture deadline exceeded')), timeout) })])
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  } finally {
    clearTimeout(deadline)
    socket?.close()
    if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await new Promise(resolve => child.once('exit', resolve)) }
    // Delete only this invocation's exact, verified temporary profile.
    if (!path.isAbsolute(profile) || !profile.startsWith(prefix) || path.dirname(profile) !== path.resolve(tmpdir())) throw new Error('Unexpected browser profile path')
    await rm(profile, { recursive: true, force: true })
  }
}
