import test from 'node:test'
import assert from 'node:assert/strict'
import {handleWebsiteLink,isGeneratedResourceUrl,routeWebsiteLink,type WebsiteLinkOpener} from '../src/website-links.js'

// All destinations and credentials below are fictional. The opener is always a local stub.
const routes:[string,string,'same-site'|'external',string][]=[
  ['website root','https://chat.deepseek.com','same-site','https://chat.deepseek.com/'],
  ['explicit default TLS port','https://chat.deepseek.com:443/','same-site','https://chat.deepseek.com/'],
  ['case-normalized exact origin','HTTPS://CHAT.DEEPSEEK.COM/a/chat/s/fixture','same-site','https://chat.deepseek.com/a/chat/s/fixture'],
  ['same-site path, repeated query and fragment','https://chat.deepseek.com/a/chat/s/fixture?x=%2f+y&x=two#part%2Fone','same-site','https://chat.deepseek.com/a/chat/s/fixture?x=%2f+y&x=two#part%2Fone'],
  ['external HTTPS root','https://references.invalid','external','https://references.invalid/'],
  ['external HTTP root','http://references.invalid','external','http://references.invalid/'],
  ['same hostname on HTTP','http://chat.deepseek.com:80/','external','http://chat.deepseek.com/'],
  ['same hostname on another TLS port','https://chat.deepseek.com:8443/','external','https://chat.deepseek.com:8443/'],
  ['same hostname on port zero','https://chat.deepseek.com:0/','external','https://chat.deepseek.com:0/'],
  ['trailing-dot hostname','https://chat.deepseek.com./','external','https://chat.deepseek.com./'],
  ['subdomain is a different origin','https://docs.chat.deepseek.com/','external','https://docs.chat.deepseek.com/'],
  ['hostname suffix lookalike','https://chat.deepseek.com.references.invalid/','external','https://chat.deepseek.com.references.invalid/'],
  ['external encoded query and hash','https://references.invalid/paper?contact=fixture@example.invalid&x=%2F+a#section@one','external','https://references.invalid/paper?contact=fixture@example.invalid&x=%2F+a#section@one'],
  ['literal path space is safely URL-encoded','https://references.invalid/a path','external','https://references.invalid/a%20path'],
]
for(const [label,input,kind,url] of routes)test(`route: ${label}`,()=>{
  assert.deepEqual(routeWebsiteLink(input),{kind,url})
})

for(const [scheme,input] of [
  ['file','file:///fictional/document.txt'],['blob','blob:https://chat.deepseek.com/fictional'],
  ['data','data:text/plain,fictional'],['javascript','javascript:void(0)'],['mailto','mailto:fictional@example.invalid'],
  ['dsh','dsh://open/fictional'],['ftp','ftp://references.invalid/'],['about','about:blank'],['tel','tel:0000000000'],
])test(`unsupported ${scheme} scheme is rejected without dispatch`,()=>{
  let calls=0
  assert.equal(routeWebsiteLink(input),null)
  assert.deepEqual(handleWebsiteLink(input,()=>{calls++}),{kind:'rejected'})
  assert.equal(calls,0)
})

test('credential and userinfo hostname confusion are rejected rather than routed',()=>{
  for(const input of [
    'https://fictional-user@chat.deepseek.com/','https://fictional-user:fictional-password@references.invalid/',
    'https://:fictional-password@chat.deepseek.com/','http://fictional-user:@references.invalid/',
    'https://chat.deepseek.com@references.invalid/','https://references.invalid@chat.deepseek.com/',
    'https://%66ictional-user@chat.deepseek.com/','https://fictional-user%00@references.invalid/',
  ]) {
    assert.equal(routeWebsiteLink(input),null)
    assert.deepEqual(handleWebsiteLink(input,()=>{throw new Error('rejected links must never dispatch')}),{kind:'rejected'})
  }
})
test('relative roots, malformed authorities, controls and parser-repaired scheme syntax fail closed',()=>{
  for(const input of [
    '', '/', '/a/chat/s/fixture', '#fragment', '?q=fixture', '//chat.deepseek.com/', 'chat.deepseek.com',
    'not a URL','https:references.invalid/','https:/references.invalid/','https:////references.invalid/',
    'https://','https://?q=fixture','https://#fragment','https://[broken/','https://references.invalid:99999/',
    'https://references.invalid:wrong/','https://%invalid.example/',' https://references.invalid/',
    'https://references.invalid/ ','https://references.invalid/\n','ht\ttps://references.invalid/',
    'https://references.invalid/a\rb','https://references.invalid/a\u0000b','https://references.invalid/a\u007fb',
    'https:\\references.invalid/','https://chat.deepseek.com\\@references.invalid/',
  ])assert.equal(routeWebsiteLink(input),null)
})
test('non-string inputs are never coerced or read through user-defined getters',()=>{
  let coercions=0
  const hostile={toString(){coercions++;throw new Error('must not stringify arbitrary values')}}
  for(const input of [null,undefined,0,false,{},[],hostile,new URL('https://references.invalid/')])assert.equal(routeWebsiteLink(input),null)
  assert.equal(coercions,0)
})
test('maximum original and normalized URL lengths are inclusive at 8192',()=>{
  for(const prefix of ['https://chat.deepseek.com/','https://references.invalid/']) {
    const value=prefix+'x'.repeat(8192-prefix.length)
    assert.equal(value.length,8192);assert.equal(routeWebsiteLink(value)?.url.length,8192)
    assert.equal(routeWebsiteLink(value+'x'),null)
  }
})
test('normalization cannot expand a short input past the outgoing URL limit',()=>{
  const value='https://references.invalid/'+'字'.repeat(2000)
  assert.ok(value.length<8192);assert.ok(new URL(value).href.length>8192)
  assert.equal(routeWebsiteLink(value),null)
})
test('ordinary Unicode URLs remain external and retain encoded path, query and fragment',()=>{
  const value='https://例子.invalid/路径?q=值#段',route=routeWebsiteLink(value)
  assert.equal(route?.kind,'external');assert.equal(route?.url,new URL(value).href)
})
test('external dispatch uses only the public blank-window contract and the full canonical URL',()=>{
  const calls:unknown[][]=[],input='https://references.invalid/paper?q=%2F+a&x=two#section%2Fone'
  const open:WebsiteLinkOpener=(...args)=>{calls.push(args);return null}
  assert.deepEqual(handleWebsiteLink(input,open),{kind:'external'})
  assert.deepEqual(calls,[[input,'_blank','noopener,noreferrer']])
})
test('the public opener null result is not a failure or a reason for a second call',()=>{
  for(const reply of [null,undefined,false,0,{closed:true}]) {
    let calls=0
    assert.deepEqual(handleWebsiteLink('https://references.invalid/',()=>{calls++;return reply}),{kind:'external'})
    assert.equal(calls,1)
  }
})
test('same-site results return to the existing guest and never call the external opener',()=>{
  let calls=0
  const open=()=>{calls++;throw new Error('same-site must not dispatch')}
  assert.deepEqual(handleWebsiteLink('https://chat.deepseek.com/a/chat/s/fixture?q=one#part',open),{
    kind:'same-site',url:'https://chat.deepseek.com/a/chat/s/fixture?q=one#part',
  })
  assert.deepEqual(handleWebsiteLink('https://chat.deepseek.com/',open),{kind:'same-site',url:'https://chat.deepseek.com/'})
  assert.equal(calls,0)
})
test('page-generated blob and data resources never count as external links',()=>{
  for(const value of ['blob:https://chat.deepseek.com/fictional','data:image/png;base64,fictional','  BLOB:https://chat.deepseek.com/fictional','DATA:text/plain,fictional'])
    assert.equal(isGeneratedResourceUrl(value),true)
  for(const value of ['https://chat.deepseek.com/',' file:///fictional','javascript:void(0)','',null,42])
    assert.equal(isGeneratedResourceUrl(value),false)
})

test('a synchronous public opener exception returns a fixed nonfatal failed result',()=>{
  const result=handleWebsiteLink('https://references.invalid/private-looking-fixture?q=not-real',()=>{throw new Error('fictional secret-looking error detail')})
  assert.deepEqual(result,{kind:'failed'})
  assert.deepEqual(Object.keys(result),['kind'])
  assert.deepEqual(handleWebsiteLink('https://references.invalid/',()=>null),{kind:'external'},'a failure leaves no sticky state')
})
test('thrown non-Error values are equally contained without exposing their payload',()=>{
  assert.deepEqual(handleWebsiteLink('http://references.invalid/',()=>{throw 'fictional thrown detail'}),{kind:'failed'})
})
test('dispatch failure and rejected links never log a URL, input or exception',()=>{
  const previous=[console.log,console.warn,console.error],messages:unknown[][]=[]
  try {
    console.log=console.warn=console.error=(...args:unknown[])=>{messages.push(args)}
    handleWebsiteLink('https://references.invalid/fictional',()=>{throw new Error('fictional')})
    handleWebsiteLink('javascript:void(0)',()=>null)
    routeWebsiteLink('https://fictional-user:fictional-password@references.invalid/')
  } finally {[console.log,console.warn,console.error]=previous}
  assert.deepEqual(messages,[])
})
