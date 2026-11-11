import test from 'node:test'
import assert from 'node:assert/strict'
import { isDshNewSessionGesture, takeOverDshWebviewShortcuts } from '../src/dsh-new-session.js'

test('recognizes the DSH new-session gesture on macOS and Windows', () => {
  assert.equal(isDshNewSessionGesture({ code: 'KeyN', meta: true }, 'mac'), true)
  assert.equal(isDshNewSessionGesture({ code: 'KeyN', control: true }, 'other'), true)
  assert.equal(isDshNewSessionGesture({ code: 'KeyN', control: true }, 'mac'), false)
  assert.equal(isDshNewSessionGesture({ code: 'KeyN', meta: true, shift: true }, 'mac'), false)
  assert.equal(isDshNewSessionGesture({ code: 'KeyM', meta: true }, 'mac'), false)
  assert.equal(isDshNewSessionGesture(null, 'mac'), false)
})

function fakeRegistry() {
  const calls: Array<{ gesture: unknown; context: unknown }> = []
  const registry = {
    dispatch(gesture: unknown, context: unknown) {
      calls.push({ gesture, context })
      return { status: 'pass' }
    },
  }
  return { registry, calls }
}

test('redirects the webview new-session input to a CHAT conversation', () => {
  const { registry, calls } = fakeRegistry()
  let opened = 0
  let consumed = 0
  const cleanup = takeOverDshWebviewShortcuts(registry, {
    platform: 'mac', isChat: () => true, openChatNewConversation: () => { opened++ },
  })
  assert.ok(cleanup)
  const result = registry.dispatch({ code: 'KeyN', meta: true }, { source: 'webview' }, () => { consumed++ })
  assert.deepEqual(result, { status: 'handled' })
  assert.equal(opened, 1)
  assert.equal(consumed, 1)
  assert.equal(calls.length, 0)
  cleanup?.()
})

test('keeps other DSH desktop shortcuts out of the CHAT website', () => {
  const { registry, calls } = fakeRegistry()
  const cleanup = takeOverDshWebviewShortcuts(registry, {
    platform: 'other', isChat: () => true, openChatNewConversation: () => {},
  })
  assert.ok(cleanup)
  assert.deepEqual(registry.dispatch({ code: 'KeyK', control: true }, { source: 'webview' }), { status: 'pass' })
  assert.equal(calls.length, 0)
  cleanup?.()
})

test('leaves other input paths and HARNESS mode untouched', () => {
  const { registry, calls } = fakeRegistry()
  const cleanup = takeOverDshWebviewShortcuts(registry, {
    platform: 'other', isChat: () => true, openChatNewConversation: () => {},
  })
  assert.ok(cleanup)
  registry.dispatch({ code: 'KeyN', control: true }, { source: 'page' })
  assert.equal(calls.length, 1)
  cleanup?.()
  const harness = fakeRegistry()
  const cleanupHarness = takeOverDshWebviewShortcuts(harness.registry, {
    platform: 'mac', isChat: () => false, openChatNewConversation: () => { throw new Error('must not open') },
  })
  assert.ok(cleanupHarness)
  harness.registry.dispatch({ code: 'KeyN', meta: true }, { source: 'webview' })
  assert.equal(harness.calls.length, 1)
  cleanupHarness?.()
})

test('restores the original dispatch on cleanup', () => {
  const { registry } = fakeRegistry()
  const original = registry.dispatch
  const cleanup = takeOverDshWebviewShortcuts(registry, {
    platform: 'mac', isChat: () => true, openChatNewConversation: () => {},
  })
  assert.notEqual(registry.dispatch, original)
  cleanup?.()
  assert.equal(registry.dispatch, original)
  assert.equal(takeOverDshWebviewShortcuts(undefined, { platform: 'mac', isChat: () => true, openChatNewConversation: () => {} }), null)
})
