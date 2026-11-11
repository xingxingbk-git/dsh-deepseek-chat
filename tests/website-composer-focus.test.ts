import test from 'node:test'
import assert from 'node:assert/strict'
import { focusWebsiteComposer, parseComposerFocusResult, websiteComposerFocusScript } from '../src/website-composer-focus.js'

interface FakeEditor {
  tagName: string
  value: string
  rect: { width: number; height: number; bottom: number }
  attributes: Record<string, string>
  focused: number
  selection: number | null
  getBoundingClientRect(): { top: number; left: number; right: number; width: number; height: number; bottom: number }
  getAttribute(name: string): string | null
  matches(selector: string): boolean
  focus(): void
  setSelectionRange(start: number, end: number): void
}

function editor(overrides: Partial<FakeEditor> = {}): FakeEditor {
  const value: FakeEditor = {
    tagName: 'TEXTAREA', value: '', rect: { width: 600, height: 80, bottom: 820 }, attributes: {}, focused: 0, selection: null,
    getBoundingClientRect() { return { top: 0, left: 0, right: this.rect.width, ...this.rect } },
    getAttribute(name) { return this.attributes[name] ?? null },
    matches() { return false },
    focus() { this.focused++ },
    setSelectionRange(start) { this.selection = start },
    ...overrides,
  }
  return value
}

function documentWith(editors: FakeEditor[], active: FakeEditor | null = null) {
  const doc = {
    activeElement: active as unknown,
    defaultView: {
      innerHeight: 900,
      getComputedStyle: () => ({ display: 'block', visibility: 'visible' }),
      getSelection: () => null,
    },
    querySelectorAll: () => editors as unknown[],
    createRange: () => ({ selectNodeContents() {}, collapse() {} }),
  }
  const focus = (target: FakeEditor) => {
    target.focused++
    doc.activeElement = target as unknown
  }
  for (const item of editors) item.focus = () => focus(item)
  return doc
}

test('only the approved origin can be focused', () => {
  const target = editor()
  assert.equal(focusWebsiteComposer(documentWith([target]) as never, 'https://example.org/'), false)
  assert.equal(target.focused, 0)
})

test('the largest bottom editor receives focus with the caret at the end', () => {
  const small = editor({ rect: { width: 300, height: 30, bottom: 200 } })
  const composer = editor({ rect: { width: 700, height: 90, bottom: 860 } })
  const doc = documentWith([small, composer])
  assert.equal(focusWebsiteComposer(doc as never, 'https://chat.deepseek.com/'), true)
  assert.equal(composer.focused, 1)
  assert.equal(composer.selection, 0)
  assert.equal(doc.activeElement, composer as never)
})

test('an already focused composer is left untouched', () => {
  const composer = editor()
  const doc = documentWith([composer], composer)
  assert.equal(focusWebsiteComposer(doc as never, 'https://chat.deepseek.com/'), true)
  assert.equal(composer.focused, 0)
})

test('search fields and pages without an editor are not focused', () => {
  const search = editor({ attributes: { placeholder: '搜索会话' } })
  assert.equal(focusWebsiteComposer(documentWith([search]) as never, 'https://chat.deepseek.com/'), false)
  assert.equal(search.focused, 0)
  assert.equal(focusWebsiteComposer(documentWith([]) as never, 'https://chat.deepseek.com/'), false)
})

test('the serialized script only reports a boolean', () => {
  const script = websiteComposerFocusScript()
  assert.match(script, /focusWebsiteComposer/)
  assert.equal(parseComposerFocusResult(true), true)
  assert.equal(parseComposerFocusResult(false), false)
  assert.equal(parseComposerFocusResult('focused'), false)
})
