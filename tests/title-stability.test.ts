import test from 'node:test'
import assert from 'node:assert/strict'
import { adaptWebsiteHeader } from '../src/website-header.js'
import { collapseWebsiteSidebar } from '../src/website-sidebar-collapse.js'

// Unit checks complement browser geometry; this tiny document only observes
// stylesheet installation and does not pretend to implement browser layout.
function styleFixture(depth = '1') {
  const attributes = new Map([['data-dsh-chat-header-native-depth', depth]])
  const properties = new Map<string, string>()
  const style = { textContent: '', id: '' }
  let installed = false
  const doc = {
    documentElement: { getAttribute: (name: string) => attributes.get(name) ?? null, style: { setProperty: (name: string, value: string) => properties.set(name, value) } },
    querySelectorAll: () => [],
    getElementById: () => installed ? style : null,
    createElement: () => style,
    head: { append: () => { installed = true } },
  } as unknown as Document
  const content = { querySelectorAll: () => [] } as unknown as HTMLElement
  return { doc, content, style, properties, attributes }
}

test('position-transition reset is restricted to title host, not universal descendants', () => {
  const f = styleFixture()
  adaptWebsiteHeader(f.doc, f.content, null, 24)
  const rules = f.style.textContent.split('}')
  const transitionRules = rules.filter(rule => rule.includes('transition:'))
  assert.equal(transitionRules.length, 1)
  assert.match(transitionRules[0]!, /data-dsh-chat-header-title-host/)
  assert.match(transitionRules[0]!, /transition:none!important/)
  assert.match(transitionRules[0]!, /html:not\(\[data-dsh-chat-settings-view\]\)/)
  assert.doesNotMatch(transitionRules[0]!, /\*\s*\{/)
  assert.doesNotMatch(f.style.textContent, /animation(?:-name)?:/)
})

test('verified native depth retains pre-observer replacement host CSS during loading', () => {
  const f = styleFixture('2')
  adaptWebsiteHeader(f.doc, f.content, null, 24)
  assert.match(f.style.textContent, /\[data-dsh-chat-content\] > \* > \._2be88ba/)
  assert.match(f.style.textContent, /> \.the-header:has\(> \._9fcbeda\)/)
  assert.match(f.style.textContent, /\.ds-skeleton/)
  assert.equal(f.attributes.get('data-dsh-chat-header-native-depth'), '2')
})

test('invalid native depth does not widen title transition selector and inset stays bounded', () => {
  const f = styleFixture('99')
  adaptWebsiteHeader(f.doc, f.content, null, 900)
  assert.doesNotMatch(f.style.textContent, /\[data-dsh-chat-content\]/)
  assert.equal(f.properties.get('--dsh-chat-title-inset'), '320px')
  adaptWebsiteHeader(f.doc, f.content, null, -100)
  assert.equal(f.properties.get('--dsh-chat-title-inset'), '24px')
})

test('native collapse rejects untrusted origin before touching sidebar or styles', () => {
  const doc = { defaultView: { location: { origin: 'http://localhost' } } } as unknown as Document
  const track = new Proxy({}, { get: () => { throw new Error('untrusted sidebar accessed') } }) as HTMLElement
  assert.equal(collapseWebsiteSidebar(doc, track), false)
})
