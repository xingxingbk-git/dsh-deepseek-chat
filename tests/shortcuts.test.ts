import test from 'node:test'
import assert from 'node:assert/strict'
import {captureShortcut, displayShortcut, matchesShortcut, normalizeShortcut, parseShortcut,
  reservedShortcut, shortcutAction, shortcutPlatform, shouldHandleShortcut, validShortcut} from '../src/shortcuts.js'

const key = (value:string, mods:Partial<{ctrl:boolean;alt:boolean;shift:boolean;meta:boolean}>={}) =>
  ({key:value,ctrlKey:mods.ctrl??false,altKey:mods.alt??false,shiftKey:mods.shift??false,metaKey:mods.meta??false})

test('normalizing a raw keydown keeps the full combination, not the last key',()=>{
  assert.equal(normalizeShortcut(key('Tab')),'Tab')
  assert.equal(normalizeShortcut(key('x',{ctrl:true,shift:true})),'Ctrl+Shift+X')
  assert.equal(normalizeShortcut(key('k',{meta:true})),'Meta+K')
  assert.equal(normalizeShortcut(key(' ',{ctrl:true})),'Ctrl+Space')
  assert.equal(normalizeShortcut(key('F5')),'F5')
  assert.equal(normalizeShortcut(key('Control',{ctrl:true})),null)
  assert.equal(normalizeShortcut(key('-',{ctrl:true})),null)
})

test('parsing accepts canonical storage strings and rejects malformed ones',()=>{
  assert.deepEqual(parseShortcut('Ctrl+Shift+X'),{ctrl:true,alt:false,shift:true,meta:false,key:'X'})
  assert.deepEqual(parseShortcut('Tab'),{ctrl:false,alt:false,shift:false,meta:false,key:'Tab'})
  for(const value of ['', 'Ctrl', 'Ctrl+', '+X', 'Ctrl+Ctrl+X', 'Foo+X', 'Ctrl+Shift+Alt+Meta+Super+X','A+B+C'])
    assert.equal(parseShortcut(value),null,value)
  assert.equal(validShortcut('Cmd+K'),false,'display names are not storage names')
})

test('display swaps Meta for the platform command key',()=>{
  assert.equal(displayShortcut('Meta+Shift+K','mac'),'Cmd+Shift+K')
  assert.equal(displayShortcut('Meta+Shift+K','other'),'Win+Shift+K')
  assert.equal(displayShortcut('Ctrl+Alt+Tab','mac'),'Ctrl+Alt+Tab')
  assert.equal(shortcutPlatform('MacIntel'),'mac')
  assert.equal(shortcutPlatform('Win32'),'other')
})

test('matching is exact on modifiers and case-insensitive on letters',()=>{
  assert.equal(matchesShortcut(key('x',{ctrl:true,shift:true}),'Ctrl+Shift+X'),true)
  assert.equal(matchesShortcut(key('X',{ctrl:true,shift:true}),'Ctrl+Shift+X'),true)
  assert.equal(matchesShortcut(key('X',{ctrl:true}),'Ctrl+Shift+X'),false)
  assert.equal(matchesShortcut(key('Tab'),'Tab'),true)
})

test('reserved host and system shortcuts are recognised, Tab is allowed',()=>{
  for(const value of ['F12','F5','Escape','Ctrl+W','Ctrl+R','Ctrl+Shift+I','Alt+F4','Alt+Tab'])
    assert.equal(reservedShortcut(value),true,value)
  for(const value of ['Tab','Ctrl+Shift+X','Ctrl+Alt+K','F6'])
    assert.equal(reservedShortcut(value),false,value)
})

test('macOS keeps system Cmd combos reserved but allows editor-style ones',()=>{
  for(const value of ['Meta+Q','Meta+W','Meta+R','Meta+M','Meta+H','Meta+Tab','Meta+Space','Meta+Shift+I'])
    assert.equal(reservedShortcut(value,'mac'),true,value)
  for(const value of ['Meta+A','Meta+C','Meta+V','Meta+X','Meta+Z','Meta+S','Meta+P','Meta+F','Meta+K','Meta+Shift+K'])
    assert.equal(reservedShortcut(value,'mac'),false,value)
})

test('Windows keeps every plain Win combo reserved',()=>{
  for(const value of ['Meta+A','Meta+C','Meta+R','Meta+E'])
    assert.equal(reservedShortcut(value,'other'),true,value)
  assert.equal(reservedShortcut('Ctrl+Shift+K','other'),false)
})

test('capture maps Escape, Backspace, modifiers and combinations to distinct outcomes',()=>{
  assert.deepEqual(captureShortcut(key('Escape')),{kind:'cancel'})
  assert.deepEqual(captureShortcut(key('Backspace')),{kind:'clear'})
  assert.deepEqual(captureShortcut(key('Delete')),{kind:'clear'})
  assert.deepEqual(captureShortcut(key('Control',{ctrl:true})),{kind:'pending'})
  assert.deepEqual(captureShortcut(key('Shift',{shift:true})),{kind:'pending'})
  assert.deepEqual(captureShortcut(key('x',{ctrl:true,shift:true})),{kind:'set',value:'Ctrl+Shift+X'})
  assert.deepEqual(captureShortcut(key('w',{ctrl:true})),{kind:'reserved',value:'Ctrl+W'})
  assert.equal(captureShortcut(key('-',{ctrl:true})).kind,'invalid')
})

test('the global listener stays out of inputs, the webview and other apps',()=>{
  const base = {enabled:true,modeEnabled:true,editable:false,inWebsite:false,composing:false,defaultPrevented:false}
  assert.equal(shouldHandleShortcut(base),true)
  for(const patch of [{enabled:false},{modeEnabled:false},{editable:true},{inWebsite:true},{composing:true},{defaultPrevented:true}])
    assert.equal(shouldHandleShortcut({...base,...patch}),false,JSON.stringify(patch))
})

test('same bindings toggle, different bindings target their own mode',()=>{
  assert.equal(shortcutAction(key('Tab'),'Tab','Tab'),'toggle')
  assert.equal(shortcutAction(key('x',{ctrl:true}),'Ctrl+X','Ctrl+Shift+Y'),'chat')
  assert.equal(shortcutAction(key('y',{ctrl:true,shift:true}),'Ctrl+X','Ctrl+Shift+Y'),'harness')
  assert.equal(shortcutAction(key('z'),'Ctrl+X','Ctrl+Shift+Y'),null)
})
