import {build} from 'esbuild'
import {readFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
// Dependency-free pure suite; no DSH, website or browser.
const result=await build({absWorkingDir:root,entryPoints:['tests/shortcuts.test.ts'],bundle:true,write:false,format:'esm',platform:'node',target:'node22'})
await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)

// The client must wire the listener with capture, filtering and cleanup.
const client=await readFile(path.join(root,'src/client.ts'),'utf8')
assert.match(client,/globalThis\.addEventListener\('keydown', handler as unknown as EventListener, true\)/)
assert.match(client,/globalThis\.removeEventListener\('keydown', handler as unknown as EventListener, true\)/)
assert.match(client,/shouldHandleShortcut\(\{ enabled: true, modeEnabled: true/)
assert.match(client,/shortcutAction\(event, switchPreferences\.shortcutChat, switchPreferences\.shortcutHarness\)/)
assert.match(client,/selectMode: selected => \{ mode\.select\(selected\) \}/)
assert.match(client,/event\.preventDefault\(\)/)
assert.match(client,/event\.stopImmediatePropagation\(\)/)
// Long capture guidance must scroll inside the field instead of being clipped.
const ui=await readFile(path.join(root,'src/ui.tsx'),'utf8')
const styles=await readFile(path.join(root,'src/styles.ts'),'utf8')
assert.match(ui,/text\.scrollWidth/)
assert.match(ui,/text\.animate\(/)
assert.match(ui,/iterations:Infinity/)
assert.match(ui,/'模式切换快捷键'/)
assert.match(styles,/\.dsh-chat-shortcut-guidance\{/)
console.log(JSON.stringify({passed:true,source:'pure shortcut contract plus production client wiring; no DSH or live window',cases:'suite above'},null,2))
