import test from 'node:test'
import assert from 'node:assert/strict'
import type { Context } from '@deepseek-ai/cordis'
import { apply } from '../src/client.js'
import { CHAT_PANEL, ModeController } from '../src/core/mode.js'
import { clientMetadataSchema, DSH_CHAT_REMOTE_CONTRIBUTION, type AuthorizationState } from '../src/protocol.js'
import type { DshChatUIBridge, DshChatViewportRect } from '../src/ui.js'
import { DshChatWebSurface } from '../src/web-surface.js'
import { DshChatWindowDragSurface } from '../src/window-drag-surface.js'
import type { WindowDragRegion } from '../src/window-drag.js'

const DRAG_KEY='shell.overlay:dsh-deepseek-chat.window-drag'
const WEBSITE_KEY='shell.overlay:dsh-deepseek-chat.website'
const authorized=(epoch='fictional-host-epoch-a'):AuthorizationState=>({status:'authorized',accountId:'fictional-profile-a',epoch,error:null})
const rect:DshChatViewportRect={left:280,top:0,width:1000,height:800}
const regions:readonly WindowDragRegion[]=[{left:100,top:0,width:800,height:40}]
const readyNavigation={status:'ready',authenticated:true,accountName:'Fictional fixture',conversations:[],selectedHref:null,canCreate:true,error:null}
const flush=async()=>{for(let i=0;i<24;i++)await Promise.resolve()}
function deferred<T>() {
  let resolve!:(value:T)=>void
  const promise=new Promise<T>(done=>{resolve=done})
  return {promise,resolve}
}

type Dispose=()=>void|Promise<void>
type SlotOptions={name:string;id?:string;key?:string;order?:number;inject?:()=>unknown}
type Registration={options:SlotOptions;component:unknown}
type Props={bridge:DshChatUIBridge;signal?:AbortSignal}

/** Actual Client/ModeController, declared slots and current remote schema; no DOM, renderer or guest is mounted. */
function harness(options:{pendingMount?:boolean;desktop?:boolean;originalPanel?:string|null;authorization?:AuthorizationState}={}) {
  const rootEffects:Dispose[]=[], setup:Promise<unknown>[]=[], order:string[]=[]
  let collector=rootEffects, panel=options.originalPanel===undefined ? 'fictional-settings-panel' : options.originalPanel
  const panelListeners=new Set<()=>void>(), slotListeners=new Map<string,Set<()=>void>>()
  const baseline=new Map<string,Registration>([
    ['shell.overlay:fictional-host-overlay',{options:{name:'shell.overlay',id:'fictional-host-overlay'},component:null}],
    ['sidebar.workspaces:fictional-host-navigation',{options:{name:'sidebar.workspaces',id:'fictional-host-navigation'},component:null}],
    ['main:fictional-host-main',{options:{name:'main',key:'fictional-host-main'},component:null}],
  ])
  const registrations=new Map(baseline), releases:{key:string;aborted:boolean|undefined}[]=[]
  const mounted=deferred<Dispose>()
  let cleaned=false, streamEnded=false, currentAuthorization=options.authorization ?? authorized(), nativeCalls=0
  let waiter:((value:IteratorResult<Item>)=>void)|undefined
  type Item={value:AuthorizationState;signal:AbortSignal;accept:()=>void}
  const queue:Item[]=[]
  const streamLifetime=new AbortController()
  const stream={
    [Symbol.asyncIterator]() { return {next():Promise<IteratorResult<Item>> {
      if(queue.length)return Promise.resolve({done:false,value:queue.shift()!})
      if(streamEnded)return Promise.resolve({done:true,value:undefined})
      return new Promise(resolve=>{waiter=resolve})
    }} },
    async dispose() { streamEnded=true;streamLifetime.abort();waiter?.({done:true,value:undefined});waiter=undefined;order.push('stream:dispose') },
  }
  const emit=(value:AuthorizationState,aborted=false)=>{
    currentAuthorization=value
    const lifetime=new AbortController()
    if(aborted)lifetime.abort()
    const item={value,signal:lifetime.signal,accept(){order.push('stream:accept')}}
    if(waiter){const consume=waiter;waiter=undefined;consume({done:false,value:item})}else queue.push(item)
  }
  const effect=(callback:()=>unknown)=>{
    const parent=collector, children:Dispose[]=[]
    let active=true, result:unknown
    collector=children
    try{result=callback()}finally{collector=parent}
    const collect=(value:unknown):void=>{
      if(typeof value==='function') {
        if(active)children.push(value as Dispose)
        else void (value as Dispose)()
      } else if(value && typeof value==='object' && Symbol.iterator in value) {
        for(const cleanup of value as Iterable<Dispose>)collect(cleanup)
      }
    }
    const completion=result && typeof result==='object' && 'then' in result
      ? Promise.resolve(result).then(collect)
      : (collect(result),Promise.resolve())
    setup.push(completion);void completion.catch(()=>{})
    const dispose=()=>{
      if(!active)return
      active=false
      const pending:Promise<void>[]=[]
      for(const cleanup of [...children].reverse()) {
        const result=cleanup()
        if(result)pending.push(result)
      }
      children.length=0
      return Promise.all(pending).then(()=>{})
    }
    parent.push(dispose)
    return Object.assign(dispose,{then:completion.then.bind(completion)})
  }
  const notify=(name:string)=>{for(const listener of slotListeners.get(name) ?? [])listener()}
  const unmount=()=>{order.push('remote:unmount')}
  // Fictional volatile preference form: models only the public ConfigForms read/write face.
  const preferenceListeners=new Set<()=>void>()
  const preferenceValue={switchStyle:'text' as 'text'|'icon',chatLabel:'CHAT',harnessLabel:'HARNESS'}
  let preferenceSnapshot={status:'ready' as const,value:{...preferenceValue},base:undefined,user:undefined,revision:1,writable:true}
  const preferenceForm={
    getSnapshot:()=>preferenceSnapshot,
    subscribe(listener:()=>void){preferenceListeners.add(listener);return ()=>{preferenceListeners.delete(listener)}},
    async set(field:string,value:unknown){
      Object.assign(preferenceValue,{[field]:value})
      preferenceSnapshot={...preferenceSnapshot,value:{...preferenceValue},revision:preferenceSnapshot.revision+1}
      for(const listener of preferenceListeners)listener()
      return true
    },
  }
  const ctx={
    effect,
    inject(dependencies:string[],callback:(ctx:unknown)=>unknown) {
      if(dependencies.length===1 && dependencies[0]==='configForms') {
        const dispose=effect(()=>callback({...ctx,configForms:{get:()=>preferenceForm}}))
        return {dispose,then:dispose.then}
      }
      assert.deepEqual(dependencies,['remote','remote.dshDeepseekChat'])
      const dispose=effect(()=>callback(ctx))
      return {dispose,then:dispose.then}
    },
    slots:{
      entries:(name:string)=>[...registrations.values()].filter(entry=>entry.options.name===name),
      subscribe(name:string,listener:()=>void) {
        let listeners=slotListeners.get(name)
        if(!listeners){listeners=new Set();slotListeners.set(name,listeners)}
        listeners.add(listener)
        return ()=>{listeners!.delete(listener)}
      },
      inject:(_name:string,callback:()=>unknown)=>effect(callback),
      register(slot:SlotOptions,component:unknown) {
        const key=`${slot.name}:${slot.key ?? slot.id ?? ''}`, entry={options:slot,component}
        assert.equal(registrations.has(key),false,`slot ${key} must have one owner`)
        registrations.set(key,entry);order.push(`register:${key}`);notify(slot.name)
        return effect(()=>()=>{
          if(registrations.get(key)!==entry)return
          const props=slot.inject?.() as Props|undefined
          releases.push({key,aborted:props?.signal?.aborted});order.push(`release:${key}`)
          registrations.delete(key);notify(slot.name)
        })
      },
    },
    layout:{
      panelInfo:{getSnapshot:()=>({activePanelId:panel}),subscribe(listener:()=>void){panelListeners.add(listener);return ()=>{panelListeners.delete(listener)}}},
      selectPanel(next:string|null){panel=next;order.push(`panel:${next}`);for(const listener of panelListeners)listener()},
      toggleSidebar(){throw new Error('drag integration must not change the host sidebar')},
    },
    remote:{
      $mount(contribution:unknown) {
        assert.strictEqual(contribution,DSH_CHAT_REMOTE_CONTRIBUTION);order.push('remote:mount')
        return options.pendingMount ? mounted.promise : Promise.resolve(unmount)
      },
      $stream(input:{name:string;open:(signal:AbortSignal)=>unknown}) {
        assert.equal(input.name,'dsh-deepseek-chat.authorization')
        input.open(streamLifetime.signal)
        emit(currentAuthorization)
        return stream
      },
      dshDeepseekChat:{
        authorization:async(metadata:unknown,signal:AbortSignal)=>{
          clientMetadataSchema.parse(metadata);assert.equal(signal.aborted,false)
          return {ok:true,value:currentAuthorization}
        },
        watchAuthorization(metadata:unknown,signal:AbortSignal) {
          clientMetadataSchema.parse(metadata);assert.equal(signal.aborted,false)
          order.push('remote:watchAuthorization');return stream
        },
      },
    },
  }
  const product=globalThis as typeof globalThis & {dshDesktop?:unknown}
  const previousDesktop=product.dshDesktop, previousAdd=globalThis.addEventListener, previousRemove=globalThis.removeEventListener
  const previousSetTimeout=globalThis.setTimeout, previousClearTimeout=globalThis.clearTimeout
  const deadlines=new Set<ReturnType<typeof setTimeout>>(), focusListeners=new Set<EventListenerOrEventListenerObject>()
  product.dshDesktop=options.desktop===false ? undefined : {protocolVersion:1,browser:{
    acquire:async()=>{nativeCalls++;throw new Error('no native guest may be acquired by a registration-only test')},
    release:async()=>{nativeCalls++},onOpenRequested:()=>{nativeCalls++;return ()=>{}},
  }}
  globalThis.addEventListener=((name:string,listener:EventListenerOrEventListenerObject|null)=>{
    assert.equal(name,'focus');if(listener)focusListeners.add(listener)
  }) as typeof globalThis.addEventListener
  globalThis.removeEventListener=((name:string,listener:EventListenerOrEventListenerObject|null)=>{
    assert.equal(name,'focus');if(listener)focusListeners.delete(listener)
  }) as typeof globalThis.removeEventListener
  globalThis.setTimeout=((callback:(...args:unknown[])=>void,delay?:number,...args:unknown[])=>{
    const handle=previousSetTimeout(callback,delay,...args)
    if(delay===35_000)deadlines.add(handle)
    return handle
  }) as typeof globalThis.setTimeout
  globalThis.clearTimeout=((handle:ReturnType<typeof setTimeout>|undefined)=>{
    if(handle!==undefined)deadlines.delete(handle)
    previousClearTimeout(handle)
  }) as typeof globalThis.clearTimeout
  const restoreGlobals=()=>{
    for(const deadline of deadlines)previousClearTimeout(deadline)
    if(previousDesktop===undefined)delete product.dshDesktop;else product.dshDesktop=previousDesktop
    globalThis.addEventListener=previousAdd;globalThis.removeEventListener=previousRemove
    globalThis.setTimeout=previousSetTimeout;globalThis.clearTimeout=previousClearTimeout
  }
  try {
    assert.equal(typeof document,'undefined','Node fixture must not attach to a real document')
    apply(ctx as unknown as Context)
  } catch(error) {restoreGlobals();throw error}
  const props=(key:string)=>registrations.get(key)?.options.inject?.() as Props|undefined
  const bridge=props(`main:${CHAT_PANEL}`)!.bridge
  return {
    bridge,order,releases,emit,props,registration:(key:string)=>registrations.get(key),panel:()=>panel,
    keys:()=>[...registrations.keys()].sort(),baseline:()=>[...baseline.keys()].sort(),nativeCalls:()=>nativeCalls,
    listenerCount:()=>panelListeners.size+focusListeners.size+[...slotListeners.values()].reduce((total,listeners)=>total+listeners.size,0),
    pendingAuthorizationTimers:()=>deadlines.size,
    navigate:(next:string|null)=>ctx.layout.selectPanel(next),
    completeMount:()=>mounted.resolve(unmount),
    async ready() {assert.equal(Boolean(options.pendingMount),false);await flush();await Promise.all([...setup]);await flush()},
    async dispose() {
      if(cleaned)return
      cleaned=true
      try {
        for(const cleanup of [...rootEffects].reverse())await cleanup()
        await flush()
        assert.equal(deadlines.size,0,'disposing the client must cancel the pending 35-second authorization deadline')
      } finally {restoreGlobals()}
    },
  }
}
function readyWebsite(h:ReturnType<typeof harness>,viewport:DshChatViewportRect=rect) {
  h.bridge.updateViewport(viewport)
  const generation=h.bridge.getSnapshot().authorizationGeneration
  h.bridge.reportWebsiteNavigation(generation,readyNavigation)
  h.bridge.reportWebsiteState(generation,{loading:false,error:null})
  return generation
}
async function readyChat(h:ReturnType<typeof harness>) {
  await h.ready();const generation=readyWebsite(h);h.bridge.selectMode('chat');return generation
}

test('actual client publishes host clip-only changes without changing viewport geometry or acquiring a guest',async()=>{
  const h=harness()
  let stop=()=>{}
  try {
    await h.ready()
    let updates=0
    stop=h.bridge.subscribe(()=>updates++)
    h.bridge.updateViewport({...rect,borderRadius:'0px'})
    const square=h.bridge.getSnapshot().viewport
    assert.equal(updates,1)
    h.bridge.updateViewport({...rect,borderRadius:'0px'})
    assert.strictEqual(h.bridge.getSnapshot().viewport,square)
    assert.equal(updates,1)
    h.bridge.updateViewport({...rect,borderRadius:'16px 0px 0px'})
    assert.equal(updates,2)
    assert.equal(h.bridge.getSnapshot().viewport?.borderRadius,'16px 0px 0px')
    for(const key of ['left','top','width','height'] as const)assert.equal(h.bridge.getSnapshot().viewport?.[key],rect[key])
    assert.equal(h.nativeCalls(),0)
    h.bridge.updateViewport({...rect,borderRadius:'0px'})
    assert.equal(updates,3)
    assert.equal(h.bridge.getSnapshot().viewport?.borderRadius,'0px')
  } finally {stop();await h.dispose()}
})

test('actual client registers drag only in CHAT, aborts before release and preserves the retained website',async()=>{
  const h=harness({pendingMount:true})
  try {
    const website=h.registration(WEBSITE_KEY)
    assert.strictEqual(website?.component,DshChatWebSurface)
    assert.equal(h.bridge.getSnapshot().mode,'harness');assert.equal(h.registration(DRAG_KEY),undefined)
    assert.equal(h.pendingAuthorizationTimers(),1)
    h.bridge.selectMode('chat')
    const first=h.props(DRAG_KEY)!.signal!
    assert.strictEqual(h.registration(DRAG_KEY)?.component,DshChatWindowDragSurface)
    assert.strictEqual(h.props(DRAG_KEY)?.bridge,h.bridge);assert.equal(first.aborted,false)
    first.addEventListener('abort',()=>h.order.push('drag:first:abort'),{once:true})
    h.bridge.selectMode('harness')
    assert.equal(first.aborted,true);assert.equal(h.registration(DRAG_KEY),undefined)
    assert.ok(h.order.indexOf('drag:first:abort')<h.order.indexOf(`release:${DRAG_KEY}`))
    assert.equal(h.releases.find(item=>item.key===DRAG_KEY)?.aborted,true)
    assert.strictEqual(h.registration(WEBSITE_KEY),website);assert.equal(h.panel(),'fictional-settings-panel')
    h.bridge.selectMode('chat')
    const second=h.props(DRAG_KEY)!.signal!
    assert.notStrictEqual(second,first);assert.equal(second.aborted,false);assert.equal(first.aborted,true)
    await h.dispose()
    assert.equal(second.aborted,true);assert.deepEqual(h.keys(),h.baseline());assert.equal(h.listenerCount(),0)
    assert.equal(h.panel(),'fictional-settings-panel');assert.equal(h.nativeCalls(),0);assert.equal(h.pendingAuthorizationTimers(),0)
    h.completeMount();await flush()
    assert.ok(h.order.includes('remote:unmount'),'a mount finishing after disposal must be released')
    assert.deepEqual(h.keys(),h.baseline())
  } finally {await h.dispose()}
})
test('actual client follows direct main-panel navigation without leaving an overlay in HARNESS',async()=>{
  const h=harness()
  try {
    await h.ready();const website=h.registration(WEBSITE_KEY)
    h.navigate(CHAT_PANEL);const first=h.props(DRAG_KEY)!.signal!
    assert.equal(first.aborted,false);assert.equal(h.bridge.getSnapshot().mode,'chat')
    h.navigate('fictional-other-panel')
    assert.equal(first.aborted,true);assert.equal(h.registration(DRAG_KEY),undefined)
    assert.equal(h.panel(),'fictional-other-panel');assert.equal(h.bridge.getSnapshot().mode,'harness')
    assert.strictEqual(h.registration(WEBSITE_KEY),website)
    h.navigate(CHAT_PANEL);assert.notStrictEqual(h.props(DRAG_KEY)!.signal,first)
    await h.dispose();assert.equal(h.panel(),'fictional-other-panel');assert.deepEqual(h.keys(),h.baseline())
  } finally {await h.dispose()}
})
test('incompatible desktop cannot register a drag occupant, even through direct main selection',async()=>{
  const h=harness({desktop:false})
  try {
    await h.ready();h.bridge.selectMode('chat');assert.equal(h.registration(DRAG_KEY),undefined)
    h.navigate(CHAT_PANEL);assert.equal(h.registration(DRAG_KEY),undefined)
    assert.equal(h.bridge.getSnapshot().mode,'harness');assert.equal(h.panel(),'fictional-settings-panel')
  } finally {await h.dispose()}
})
test('real ModeController enters CHAT without a DSH account gate and exactly restores its original panel',()=>{
  let panel:string|null='fictional-original-panel', mounts=0, releases=0
  const mode=new ModeController({readPanel:()=>panel,selectPanel:next=>{panel=next},mountChatNavigation:()=>{mounts++;return ()=>{releases++}},cancelAccount:()=>{}},true)
  assert.equal(mode.getSnapshot().mode,'harness');assert.equal(mounts,0)
  mode.updateAuthorization({status:'unauthorized',accountId:null,epoch:'fictional-empty-profile',error:null})
  assert.equal(mode.select('chat'),true);assert.equal(mounts,1);assert.equal(panel,CHAT_PANEL)
  mode.select('chat');assert.equal(mounts,1)
  mode.select('harness');assert.equal(releases,1);assert.equal(panel,'fictional-original-panel')
  mode.dispose();mode.dispose();assert.equal(releases,1)
})
test('real ModeController respects external panel selection and terminal disposal',()=>{
  let panel:string|null='fictional-original-panel', releases=0
  const mode=new ModeController({readPanel:()=>panel,selectPanel:next=>{panel=next},mountChatNavigation:()=>()=>{releases++},cancelAccount:()=>{}},true)
  mode.select('chat');panel='fictional-external-panel';mode.observePanel(panel)
  assert.equal(mode.getSnapshot().mode,'harness');assert.equal(panel,'fictional-external-panel');assert.equal(releases,1)
  mode.dispose();assert.equal(mode.select('chat'),false);assert.equal(releases,1)
})
test('registered samplers are not called in cold HARNESS or before Host authorization',async()=>{
  const h=harness({pendingMount:true})
  try {
    const generation=readyWebsite(h);let reads=0
    h.bridge.bindWindowDragSampler(generation,async()=>{reads++;return regions})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,0)
    h.bridge.selectMode('chat')
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,0)
  } finally {await h.dispose();h.completeMount();await flush()}
})
test('only the current viewport and authorized ready CHAT state can invoke a sampler',async()=>{
  const h=harness()
  try {
    await h.ready();const generation=readyWebsite(h);let reads=0
    h.bridge.bindWindowDragSampler(generation,async viewport=>{assert.strictEqual(viewport,rect);reads++;return regions})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,0)
    h.bridge.selectMode('chat');assert.deepEqual(await h.bridge.readWindowDrag(rect),regions);assert.equal(reads,1)
    assert.deepEqual(await h.bridge.readWindowDrag({...rect}),[]);assert.equal(reads,1)
    h.bridge.setSettingsOpen(true);assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,1)
    h.bridge.setSettingsOpen(false);h.bridge.reportWebsiteState(generation,{loading:true,error:null})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,1)
    h.bridge.reportWebsiteState(generation,{loading:false,error:null})
    h.bridge.reportWebsiteNavigation(generation,{status:'unsupported',conversations:[],canCreate:false,error:'fictional layout unavailable'})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,1)
    h.bridge.reportWebsiteNavigation(generation,readyNavigation)
    assert.deepEqual(await h.bridge.readWindowDrag(rect),regions);assert.equal(reads,2)
    h.bridge.reportWebsiteNavigation(generation,{status:'sign-in',conversations:[],canCreate:false})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,2)
  } finally {await h.dispose()}
})
test('an unauthorized Host cannot sample even if fictional website metadata says signed in',async()=>{
  const h=harness({authorization:{status:'unauthorized',accountId:null,epoch:'fictional-no-profile',error:null}})
  try {
    await h.ready();const generation=readyWebsite(h);let reads=0
    h.bridge.selectMode('chat');h.bridge.bindWindowDragSampler(generation,async()=>{reads++;return regions})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,0)
  } finally {await h.dispose()}
})
test('an in-flight reply cannot cross a CHAT-to-HARNESS transition',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let reads=0
    h.bridge.bindWindowDragSampler(generation,()=>{reads++;return reply.promise})
    const sample=h.bridge.readWindowDrag(rect);assert.equal(reads,1)
    h.bridge.selectMode('harness');reply.resolve(regions)
    assert.deepEqual(await sample,[])
  } finally {await h.dispose()}
})
test('rapid HARNESS-to-CHAT reentry cannot reaccept the old owner reply with the same viewport and generation',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let reads=0
    const firstSignal=h.props(DRAG_KEY)!.signal!
    h.bridge.bindWindowDragSampler(generation,()=>{reads++;return reply.promise})
    const sample=h.bridge.readWindowDrag(rect);assert.equal(reads,1)
    h.bridge.selectMode('harness');h.bridge.selectMode('chat')
    assert.equal(firstSignal.aborted,true);assert.notStrictEqual(h.props(DRAG_KEY)!.signal,firstSignal)
    assert.equal(h.bridge.getSnapshot().authorizationGeneration,generation);assert.strictEqual(h.bridge.getSnapshot().viewport,rect)
    reply.resolve(regions);assert.deepEqual(await sample,[])
  } finally {await h.dispose()}
})
test('a changed viewport rejects the pending reply and prevents calls with the stale rectangle',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let reads=0
    h.bridge.bindWindowDragSampler(generation,()=>{reads++;return reply.promise})
    const sample=h.bridge.readWindowDrag(rect), next={...rect,width:900}
    h.bridge.updateViewport(next);reply.resolve(regions)
    assert.deepEqual(await sample,[]);assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(reads,1)
    assert.strictEqual(h.bridge.getSnapshot().viewport,next)
  } finally {await h.dispose()}
})
test('Host epoch replacement rejects an old generation and its late sampler reply',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let reads=0, staleReads=0
    h.bridge.bindWindowDragSampler(generation,()=>{reads++;return reply.promise})
    const sample=h.bridge.readWindowDrag(rect);assert.equal(reads,1)
    h.emit(authorized('fictional-host-epoch-b'));await flush()
    assert.notEqual(h.bridge.getSnapshot().authorizationGeneration,generation)
    reply.resolve(regions);assert.deepEqual(await sample,[])
    const current=readyWebsite(h)
    h.bridge.bindWindowDragSampler(generation,async()=>{staleReads++;return regions})
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(staleReads,0)
    h.bridge.bindWindowDragSampler(current,async()=>regions)
    assert.deepEqual(await h.bridge.readWindowDrag(rect),regions)
  } finally {await h.dispose()}
})
test('an authentication revision fences a reply even after the website becomes ready again',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let reads=0
    h.bridge.bindWindowDragSampler(generation,()=>{reads++;return reply.promise})
    const revision=h.bridge.getSnapshot().websiteAuthenticationRevision, sample=h.bridge.readWindowDrag(rect)
    assert.equal(reads,1)
    h.bridge.beginWebsiteSignIn();h.bridge.reportWebsiteNavigation(generation,readyNavigation)
    assert.notEqual(h.bridge.getSnapshot().websiteAuthenticationRevision,revision)
    assert.equal(h.bridge.getSnapshot().websiteAuthenticationStatus,'signed-in')
    reply.resolve(regions);assert.deepEqual(await sample,[])
  } finally {await h.dispose()}
})
test('replacing a sampler discards its pending reply and late old cleanup cannot detach the new binding',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let oldReads=0, newReads=0
    const removeOld=h.bridge.bindWindowDragSampler(generation,()=>{oldReads++;return reply.promise}), sample=h.bridge.readWindowDrag(rect)
    assert.equal(oldReads,1)
    const removeNew=h.bridge.bindWindowDragSampler(generation,async()=>{newReads++;return regions})
    removeOld();reply.resolve(regions)
    assert.deepEqual(await sample,[]);assert.deepEqual(await h.bridge.readWindowDrag(rect),regions);assert.equal(newReads,1)
    removeNew();assert.deepEqual(await h.bridge.readWindowDrag(rect),[]);assert.equal(newReads,1)
  } finally {await h.dispose()}
})
test('client disposal rejects a pending sample, aborts the owner and releases every plugin seat',async()=>{
  const h=harness()
  try {
    const generation=await readyChat(h), reply=deferred<readonly WindowDragRegion[]>();let reads=0
    const signal=h.props(DRAG_KEY)!.signal!
    h.bridge.bindWindowDragSampler(generation,()=>{reads++;return reply.promise})
    const sample=h.bridge.readWindowDrag(rect);assert.equal(reads,1)
    await h.dispose();reply.resolve(regions)
    assert.deepEqual(await sample,[]);assert.equal(signal.aborted,true)
    assert.deepEqual(h.keys(),h.baseline());assert.equal(h.listenerCount(),0);assert.equal(h.pendingAuthorizationTimers(),0)
    h.bridge.bindWindowDragSampler(generation,async()=>regions)
    assert.deepEqual(await h.bridge.readWindowDrag(rect),[])
  } finally {await h.dispose()}
})
