import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { guardHarnessSearchReplay } from '../src/search-replay-guard.js'

function original(props: Record<string, unknown>) {
  const hook = props.useWorkspaceShortcuts as (selector: (state: { searchRequest: number }) => number) => number
  return createElement('span', null, String(hook(state => state.searchRequest)))
}

function entry(children: Record<string, unknown>, locale = 'workspace') {
  return { locale, component: original, children, inject: () => ({}) } as unknown as Parameters<typeof guardHarnessSearchReplay>[0]
}

function renderGuard(input: Parameters<typeof guardHarnessSearchReplay>[0], request: number) {
  const cleanup = guardHarnessSearchReplay(input)
  const guarded = input.component as (props: Record<string, unknown>) => unknown
  const hook = <T,>(selector: (state: { searchRequest: number }) => T): T => selector({ searchRequest: request })
  const html = renderToStaticMarkup(createElement(guarded as never, { useWorkspaceShortcuts: hook as never }) as never)
  return { cleanup, html }
}

test('the workspace browser installs the replay guard without depending on slot children', () => {
  const { cleanup, html } = renderGuard(entry({}), 3)
  assert.ok(cleanup)
  assert.equal(html, '<span>0</span>')
})

test('the current workspace slot shape also installs the replay guard', () => {
  const { cleanup, html } = renderGuard(entry({ 'sidebar.workspaces.session.row.action': {} }), 3)
  assert.ok(cleanup)
  assert.equal(html, '<span>0</span>')
})

test('the directory-flow shape and the older menu shape also install', () => {
  for (const shape of [{ 'sidebar.workspaces.directoryFlow': {} }, { 'sidebar.workspaces.session.menu.item': {} }]) {
    const { cleanup, html } = renderGuard(entry(shape), 5)
    assert.ok(cleanup, JSON.stringify(shape))
    assert.equal(html, '<span>0</span>')
  }
})

test('guard cleanup restores the original component', () => {
  const input = entry({ 'sidebar.workspaces.session.row.action': {} })
  const cleanup = guardHarnessSearchReplay(input)
  assert.ok(cleanup)
  assert.notEqual(input.component, original)
  cleanup()
  assert.equal(input.component, original)
})

test('unrelated or unprovable entries are left untouched', () => {
  assert.equal(guardHarnessSearchReplay(entry({ 'sidebar.workspaces.session.row.action': {} }, 'sidebar')), null)
  const withoutInject = { ...entry({}), inject: undefined } as unknown as Parameters<typeof guardHarnessSearchReplay>[0]
  assert.equal(guardHarnessSearchReplay(withoutInject), null)
  const withoutComponent = { ...entry({}), component: 'not-a-component' } as unknown as Parameters<typeof guardHarnessSearchReplay>[0]
  assert.equal(guardHarnessSearchReplay(withoutComponent), null)
})
