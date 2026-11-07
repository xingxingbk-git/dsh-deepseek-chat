import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Real production download gate with synthetic public DOM shapes. CDP mouse
// input yields trusted clicks; this is not an Electron or live-site acceptance.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const code = (await build({ absWorkingDir: root, entryPoints: ['tests/browser/website-downloads.fixture.js'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome130' })).outputFiles[0].text
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}</style></head><body><script>${code.replaceAll('</script', '<\\/script')}</script></body></html>`
const expected = 9
const prefix = path.join(tmpdir(), 'dsh-website-downloads-')
const profile = await mkdtemp(prefix)
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome')
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
const timeout = setTimeout(() => { console.error('Website download fixture timed out'); child.kill('SIGKILL'); process.exitCode = 1 }, 40000)
try {
  const endpoint = await new Promise((resolve, reject) => { let stderr = ''; child.on('error', reject); child.on('exit', why => reject(new Error(`Chrome exited early: ${why}`))); child.stderr.on('data', chunk => { stderr += chunk; const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(match[1]) }) })
  socket = new WebSocket(endpoint)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  const pending = new Map(); let id = 0
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) })) })
  socket.onclose = () => { for (const entry of pending.values()) entry.reject(new Error('Chrome debugging connection closed')); pending.clear() }
  let session
  socket.onmessage = async event => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const entry = pending.get(message.id); pending.delete(message.id)
      if (message.error) entry?.reject(new Error(JSON.stringify(message.error))); else entry?.resolve(message.result)
      return
    }
    if (message.method !== 'Fetch.requestPaused') return
    const paused = message.params
    // Only the exact synthetic document is fulfilled; every other request is blocked.
    if (paused.request.url === 'https://chat.deepseek.com/synthetic-downloads') {
      await send('Fetch.fulfillRequest', { requestId: paused.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: Buffer.from(html).toString('base64') }, session)
    } else await send('Fetch.failRequest', { requestId: paused.requestId, errorReason: 'BlockedByClient' }, session)
  }
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, session)
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const click = async point => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none', clickCount: 0 }, session)
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 }, session)
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 }, session)
  }
  const settle = async (read = 'window.fixture.poll()', tries = 40) => {
    for (let attempt = 0; attempt < tries; attempt++) {
      const value = await evaluate(read)
      if (value && value.raw !== null) return value
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    return evaluate(read)
  }
  const target = await send('Target.createTarget', { url: 'about:blank' })
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
  await send('Page.enable', {}, session)
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, session)
  await send('Page.navigate', { url: 'https://chat.deepseek.com/synthetic-downloads' }, session)
  await evaluate('new Promise(resolve => { const run = () => window.fixtureDone ? resolve(true) : setTimeout(run, 10); run() })')
  const points = await evaluate('window.fixture.triggerPoint()')

  // Synthetic (untrusted) programmatic clicks must never export.
  await evaluate('window.fixture.reset(); window.fixture.block(); window.fixture.install()')
  await evaluate('window.fixture.untrusted(0)')
  const synthetic = await evaluate('window.fixture.poll()')
  await evaluate("window.fixture.check('synthetic untrusted clicks never arm an export', " + `${JSON.stringify(synthetic.raw === null)})`)

  // A trusted trigger click plus a trusted third-party menu click does export.
  const run = async (index, expect) => {
    await evaluate('window.fixture.reset(); window.fixture.block(); window.fixture.install()')
    await click(points)
    await click(await evaluate(`window.fixture.optionPoint(${index})`))
    return { result: await settle(), outcome: await evaluate('window.fixture.outcome()'), expect }
  }

  const svg = await run(0, { name: 'diagram.svg', mediaType: 'image/svg+xml' })
  await evaluate(`window.fixture.check('trusted SVG export is captured as one bounded file', ${JSON.stringify(Boolean(svg.result.raw && svg.result.raw.kind === 'file'))})`)
  await evaluate(`window.fixture.check('SVG name and MIME survive the host parser', ${JSON.stringify(Boolean(svg.result.valid && svg.result.valid.name === 'diagram.svg' && svg.result.valid.mediaType === 'image/svg+xml' && svg.result.valid.size > 0))})`)

  const png = await run(1, { name: 'diagram.png', mediaType: 'image/png' })
  await evaluate(`window.fixture.check('trusted PNG export keeps its real PNG bytes', ${JSON.stringify(Boolean(png.result.valid && png.result.valid.name === 'diagram.png' && png.result.valid.size === 16 && png.result.valid.type === 'image/png'))})`)

  const codeExport = await run(2, { name: 'diagram.mermaid', mediaType: 'text/plain' })
  await evaluate(`window.fixture.check('trusted source export is captured as plain text', ${JSON.stringify(Boolean(codeExport.result.valid && codeExport.result.valid.mediaType === 'text/plain' && codeExport.result.valid.size > 0))})`)

  // A menu that is not the verified three-choice export must not arm anything.
  await evaluate("window.fixture.reset(); window.fixture.block({ labels: ['下载 SVG', '下载 PNG', '下载代码', '复制'] }); window.fixture.install()")
  await click(points)
  await click(await evaluate('window.fixture.optionPoint(0)'))
  const rejectedMenu = await evaluate('window.fixture.poll()')
  await evaluate(`window.fixture.check('an unrecognised four-choice menu never arms an export', ${JSON.stringify(rejectedMenu.raw === null)})`)

  // The trigger must belong to a rendered Mermaid block, not any code toolbar.
  await evaluate("window.fixture.reset(); window.fixture.block({ tabs: ['预览'] }); window.fixture.install()")
  await click(points)
  await click(await evaluate('window.fixture.optionPoint(0)'))
  const rejectedBlock = await evaluate('window.fixture.poll()')
  await evaluate(`window.fixture.check('a code block without the Mermaid tab switch never arms an export', ${JSON.stringify(rejectedBlock.raw === null)})`)

  // A download helper call with no user gesture stays untouched.
  await evaluate('window.fixture.reset(); window.fixture.block(); window.fixture.install()')
  await evaluate('window.fixture.stray()')
  const stray = await evaluate('window.fixture.poll()')
  await evaluate(`window.fixture.check('a download without an export gesture is left to the browser policy', ${JSON.stringify(stray.raw === null)})`)

  // Disabling CHAT polling clears pending state and stops capture.
  await evaluate('window.fixture.reset(); window.fixture.block(); window.fixture.install(); window.fixture.poll()')
  const disabled = await evaluate('window.fixture.poll()')
  await evaluate(`window.fixture.check('polling keeps returning only one consumed result', ${JSON.stringify(disabled.raw === null)})`)

  const results = await evaluate('window.fixture.results')
  const passed = results.length === expected && results.every(item => item.passed)
  console.log(JSON.stringify({ passed, expectedCases: expected, actualCases: results.length, results,
    source: 'production download gate with synthetic public DOM; CDP trusted clicks, no DSH, website or real attachment' }, null, 2))
  if (!passed) process.exitCode = 1
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  clearTimeout(timeout); socket?.close()
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await new Promise(resolve => child.once('exit', resolve)) }
  if (!path.isAbsolute(profile) || !profile.startsWith(prefix) || path.dirname(profile) !== path.resolve(tmpdir())) throw new Error('Unexpected temporary Chrome profile path')
  await rm(profile, { recursive: true, force: true })
}
