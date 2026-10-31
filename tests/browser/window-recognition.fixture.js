import { adaptWebsiteNavigation, parseWebsiteNavigation } from '/navigation.js'
import { readWebsiteWindowDragGeometry, parseWindowDragGeometry, websiteWindowDragScript } from '/drag.js'
import { websiteRefreshReadiness } from '/refresh.js'
import { mountSettings, mountSurface, mountDragSurface, mountPanel } from '/settings-ui.js'
// Fictional website DOM only. No requests to DeepSeek, credentials or real conversation data.
const results=[]
const check=(name,passed)=>results.push({name,passed:Boolean(passed)})
const origin='https://chat.deepseek.com'
const page={origin,pathname:'/a/chat/s/fixture-id'}
const realNow=Date.now
let now=realNow()
Date.now=()=>now
const step=(command={type:'snapshot',showOriginal:false})=>adaptWebsiteNavigation(document,page,command)
function fixture({profile=true,avatars=1,names=1,overflow=false,top=null,host=document.body}={}){
 step({type:'restore'})
 for(const attr of [...document.documentElement.attributes])if(attr.name.startsWith('data-dsh-chat-'))document.documentElement.removeAttribute(attr.name)
 document.documentElement.setAttribute('data-dsh-chat-observing','') // explicit steps, not background observers
 document.documentElement.setAttribute('data-dsh-chat-theme-complete','dark')
 document.documentElement.setAttribute('data-dsh-chat-settings-theme-target','dark')
 now+=10000
 host.innerHTML=`<div id="layout"><aside id="sidebar"><button id="new">New chat</button><a id="history" href="/a/chat/s/fixture-id">Fictional title</a><div id="profile"></div></aside><main id="content" class="${overflow?'overflow':''}"><div class="_2be88ba"><div class="the-header"><div class="_9fcbeda"><span class="afa34042">Fictional title</span></div></div><button class="_57370c5" aria-label="Share"><svg width="16" height="16"></svg></button></div><textarea id="composer"></textarea></main></div>`
 const footer=document.getElementById('profile')
 if(profile){
  for(let i=0;i<avatars;i++){const img=document.createElement('img');img.alt='Fictional avatar';img.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"/>';footer.append(img)}
  for(let i=0;i<names;i++){const span=document.createElement('span');span.textContent=`Fixture account ${i+1}`;footer.append(span)}
 }
 if(top!==null){footer.style.bottom='auto';footer.style.top=`${top}px`}
 return footer
}
fixture()
let result=step()
check('normal strict footer proves account',result.authenticated===true)
check('normal current navigation parser publishes one fictional conversation',parseWebsiteNavigation(result).conversations.length===1)
check('normal layout hides only the original navigation',getComputedStyle(document.getElementById('sidebar')).display==='none')

fixture({profile:false})
result=step()
check('missing profile never invents authentication',result.authenticated!==true && parseWebsiteNavigation(result).conversations.length===0)
now+=4999;result=step()
check('late avatar receives a bounded grace period',result.status!=='unsupported' && result.authenticated!==true)
now+=2;result=step()
check('missing profile expires to explicit unsupported, not permanent ready/unknown',result.status==='unsupported' && result.authenticated!==true && Boolean(result.error))
check('profile timeout never reveals original navigation',getComputedStyle(document.getElementById('sidebar')).display==='none' && result.layoutReady===true)
check('a verified CHAT layout remains usable while only identity is unconfirmed',getComputedStyle(document.body).opacity==='1')
check('recovery probes preserve the warning and verified CHAT layout',step().error===result.error && getComputedStyle(document.getElementById('sidebar')).display==='none')
const preservedDraft='Fictional unsent draft';document.getElementById('composer').value=preservedDraft
step({type:'snapshot',showOriginal:true})
check('legacy showOriginal cannot expose the website sidebar in CHAT',getComputedStyle(document.getElementById('sidebar')).display==='none' && Boolean(document.getElementById('dsh-chat-website-navigation-style')))
check('failed recognition and retry never change the draft or route',document.getElementById('composer').value===preservedDraft && page.pathname==='/a/chat/s/fixture-id')
const footer=document.getElementById('profile');footer.innerHTML='<img width="32" height="32" alt="Fictional avatar"><span>Recovered fixture account</span>'
result=step()
check('a newly valid footer recovers authentication and list',result.authenticated===true && result.status==='ready' && parseWebsiteNavigation(result).conversations.length===1 && !result.error)
check('recovery removes its independent timeout marker',!document.documentElement.hasAttribute('data-dsh-chat-profile-missing-at'))
result=step({type:'snapshot',showOriginal:true})
check('legacy showOriginal also keeps a healthy CHAT sidebar adapted',result.status==='ready' && getComputedStyle(document.getElementById('sidebar')).display==='none')

for(const config of [{avatars:2},{names:2},{top:Math.floor(innerHeight*.60)}]){
 fixture(config);step();now+=5001;result=step()
 check(`strict proof stays strict for ${JSON.stringify(config)}`,result.authenticated!==true && result.status==='unsupported' && Boolean(result.error))
}
fixture({overflow:true,profile:false});step();now+=5001;result=step()
check('simultaneous main/profile failure is explicit and never grants identity',result.status==='unsupported' && result.identityUnconfirmed===true && result.authenticated!==true && Boolean(result.error))
fixture();const freshDialog=document.createElement('div');freshDialog.setAttribute('role','dialog');document.getElementById('sidebar').append(freshDialog);freshDialog.append(document.getElementById('profile'));step();now+=5001;result=step()
check('a fresh dialog avatar cannot prove the account',result.authenticated!==true && result.identityUnconfirmed===true)
fixture();step();const movedDialog=document.createElement('div');movedDialog.setAttribute('role','dialog');document.getElementById('sidebar').append(movedDialog);movedDialog.append(document.getElementById('profile'));step();now+=5001;result=step()
check('prior footer proof is rejected after its row moves into a dialog',result.authenticated!==true && result.identityUnconfirmed===true)
fixture();document.getElementById('sidebar').remove();step()
check('unknown sidebar is concealed during grace, not exposed for five seconds',getComputedStyle(document.body).opacity==='0')
now+=5001;result=step()
check('a missing sidebar ends unknown waiting without exposing the original website',result.status==='unsupported' && result.identityUnconfirmed===true && Boolean(result.error) && getComputedStyle(document.body).opacity==='0')
fixture({overflow:true})
result=step()
check('strict account proof does not depend on main fitting the viewport',result.authenticated===true && result.canCreate===false && result.conversations.length===0)
now+=5001;result=step()
check('main overflow conceals unsafe presentation but retains independently proven identity',result.status==='unsupported' && result.authenticated===true && getComputedStyle(document.body).opacity==='0')
check('unsupported mirroring never publishes guessed history',parseWebsiteNavigation(result).conversations.length===0 && parseWebsiteNavigation(result).canCreate===false)
document.getElementById('content').classList.remove('overflow');result=step()
check('main layout recovery restores mirroring normally',result.status==='ready' && result.authenticated===true && parseWebsiteNavigation(result).conversations.length===1)

let geometry=readWebsiteWindowDragGeometry(document,origin)
check('confirmed header has a usable native drag gap',geometry?.regions.some(region=>region.width>=24))
const overlaps=(r,b)=>r.left<b.right && r.left+r.width>b.left && r.top<b.bottom && r.top+r.height>b.top
const title=document.querySelector('.afa34042')
title.textContent='Hi'
let titleBox=title.getBoundingClientRect();geometry=readWebsiteWindowDragGeometry(document,origin)
check('short title reserves its actual occupied box, not a guessed editor lane',geometry.regions.every(r=>!overlaps(r,titleBox)))
check('short title leaves draggable whitespace before the old fixed 338px reservation',geometry.regions.some(r=>r.left>=titleBox.right && r.left<200 && r.width>=24))
title.textContent='Fictional longer title which is deliberately wide but leaves actual whitespace'
titleBox=title.getBoundingClientRect();geometry=readWebsiteWindowDragGeometry(document,origin)
check('a long title still leaves a measured native drag gap',geometry?.regions.some(r=>r.left>=titleBox.right && r.width>=24))
check('long title geometry never covers its real occupied box',geometry.regions.every(r=>!overlaps(r,titleBox)))
check('drag gaps never cover the website share button',geometry.regions.every(r=>!overlaps(r,document.querySelector('._57370c5').getBoundingClientRect())))
const referenceClose=document.createElement('button');referenceClose.setAttribute('aria-label','Close reference panel');referenceClose.style.cssText='position:fixed;right:180px;top:10px;width:28px;height:28px';document.getElementById('content').append(referenceClose)
check('other top-row/reference controls also get native hit-test holes',readWebsiteWindowDragGeometry(document,origin).regions.every(r=>!overlaps(r,referenceClose.getBoundingClientRect())))
referenceClose.remove()
title.textContent='Fictional title';geometry=readWebsiteWindowDragGeometry(document,origin)
const modal=document.createElement('div');modal.className='ds-modal-content';document.body.append(modal)
check('website dialogs withdraw header drag geometry',readWebsiteWindowDragGeometry(document,origin)===null)
modal.remove()
const editor=document.createElement('input');editor.style.cssText='position:fixed;top:12px;left:24px;width:320px;height:28px';document.querySelector('._9fcbeda').append(editor);editor.focus()
check('focused title editing withdraws drag geometry',readWebsiteWindowDragGeometry(document,origin)===null)
editor.remove();document.getElementById('composer').focus()
check('composer focus still allows safe header dragging',Boolean(readWebsiteWindowDragGeometry(document,origin)?.regions.length))
check('unapproved origins cannot provide native hit targets',readWebsiteWindowDragGeometry(document,'https://example.com')===null)
check('valid geometry survives bounded parsing',parseWindowDragGeometry(geometry,{width:innerWidth,height:innerHeight}).length===geometry.regions.length)
check('stale viewport geometry is discarded',parseWindowDragGeometry(geometry,{width:innerWidth-10,height:innerHeight}).length===0)
check('out-of-viewport guest numbers are rejected',parseWindowDragGeometry({...geometry,regions:[{left:-1,top:0,width:100,height:40}]},{width:innerWidth,height:innerHeight}).length===0)
check('serialized geometry helper has no storage/network/text reads',!/(?:localStorage|sessionStorage|fetch\(|textContent|\.value\b|document\.cookie)/.test(websiteWindowDragScript()))
result=adaptWebsiteNavigation(document,{origin,pathname:'/sign_in'},{type:'snapshot',showOriginal:false})
check('only a real sign-in route confirms signed-out and removes drag targets',result.status==='sign-in' && result.authenticated===false && readWebsiteWindowDragGeometry(document,origin)===null)
check('SPA sign-in transitions do not briefly reveal the old website sidebar',getComputedStyle(document.getElementById('sidebar')).display==='none')
const plaintext=document.createElement('div');plaintext.contentEditable='plaintext-only';plaintext.style.cssText='position:fixed;top:12px;left:24px;width:300px;height:28px';plaintext.textContent='Fictional unsaved title';document.body.append(plaintext)
check('plaintext-only unsaved editors block refresh without exporting text',websiteRefreshReadiness(document,origin)==='draft')
plaintext.textContent=''
check('empty plaintext-only editors do not block a safe refresh',websiteRefreshReadiness(document,origin)==='ready')
plaintext.remove()
fixture();step();document.querySelector('._2be88ba').remove()
check('new-chat empty header geometry remains usable without a mirrored title',Boolean(readWebsiteWindowDragGeometry(document,origin)?.regions.length))
step({type:'restore'});document.body.innerHTML=''
const uiHost=document.createElement('div');document.body.append(uiHost)
// Explicitly mock an absent native leading control group; do not inherit the
// real host's conservative 144px fallback in this standalone fictional page.
const hostLeading=document.createElement('div');hostLeading.className='dsh-chat-leading';hostLeading.style.cssText='position:fixed;left:0;top:0;width:0;height:0;pointer-events:none';document.body.append(hostLeading)
const settle=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
let lastCommand=null
const recognitionMessage='暂未识别官网账号区域，新的登录记忆暂无法保存；请稍后重新识别。'
async function settings(status,authenticated){
 const state={language:'en',desktopAvailable:true,websiteAuthenticationStatus:status,websiteSessionStatus:'idle',websiteSessionError:null,webError:null,error:null,websiteNavigation:{status:'unsupported',authenticated,identityUnconfirmed:true,conversations:[],canCreate:false,error:recognitionMessage}}
 const dispose=mountSettings({getSnapshot:()=>state,subscribe:()=>()=>{},setSettingsOpen(){},commandWebsite(command){lastCommand=command}},uiHost)
 await settle();return dispose
}
let dispose=await settings('loading',undefined)
check('settings recognition failure ends the indefinite loading spinner',Boolean(uiHost.querySelector('[role="alert"]')) && !uiHost.querySelector('.dsh-chat-settings-loading'))
const retry=[...uiHost.querySelectorAll('button')].find(button=>button.textContent==='Check again');retry?.click()
check('recognition retry takes only a current snapshot, not a reload/new guest',lastCommand?.type==='snapshot' && lastCommand.showOriginal===false)
dispose();dispose=await settings('signing-in',undefined)
check('settings does not keep an indefinite Continue login alongside the failure',!uiHost.textContent.includes('Continue login') && Boolean(uiHost.querySelector('[role="alert"]')))
dispose();dispose=await settings('signed-in',true)
check('a retained prior identity does not suppress the new recognition warning',Boolean(uiHost.querySelector('[role="alert"]')))
dispose()
let acquired=0,released=0,samplerBinds=0,samplerUnbinds=0,dragReads=0
let sampler=null,navigationHandler=null
const surfaceCommands=[],surfaceCalls=[],surfaceListeners=new Set()
let surfaceState={mode:'chat',modeEnabled:true,desktopAvailable:true,authorizationStatus:'authorized',authorizationGeneration:1,accountStorageKey:'fixture-profile',websiteAuthenticationStatus:'signed-in',websiteAuthenticationRevision:1,websiteReloadRevision:0,settingsOpen:false,showWebsiteNavigation:false,webLoading:false,webError:null,websiteSessionStatus:'idle',websiteSessionError:null,language:'en',viewport:{left:0,top:0,width:innerWidth,height:innerHeight},websiteNavigation:{status:'unsupported',authenticated:true,conversations:[],canCreate:false,error:'暂未识别官网界面，请稍后重新识别。'}}
const patchSurface=patch=>{surfaceState={...surfaceState,...patch};for(const listener of surfaceListeners)listener()}
const surfaceBridge=new Proxy({
 getSnapshot:()=>surfaceState,
 attachViewport(){},
 updateViewport(viewport){const before=surfaceState.viewport;if(JSON.stringify(before)!==JSON.stringify(viewport))patchSurface({viewport})},
 subscribe:listener=>{surfaceListeners.add(listener);return()=>surfaceListeners.delete(listener)},
 bindWebsiteNavigation(generation,handler){navigationHandler=handler;return()=>{if(navigationHandler===handler)navigationHandler=null}},
 bindWindowDragSampler(generation,handler){const owner={generation,handler};sampler=owner;samplerBinds++;return()=>{samplerUnbinds++;if(sampler===owner)sampler=null}},
 async readWindowDrag(viewport){dragReads++;return sampler?.generation===surfaceState.authorizationGeneration?sampler.handler(viewport):[]},
 commandWebsite:command=>surfaceCommands.push(command),
 reportWebsiteState(generation,value){if(generation===surfaceState.authorizationGeneration)patchSurface({webLoading:value.loading,webError:value.error})},
 reportWebsiteNavigation(generation,value){if(generation===surfaceState.authorizationGeneration)patchSurface({websiteNavigation:parseWebsiteNavigation(value)})},
 loadWebsiteSession:async()=>null,
},{get(target,key){return key in target?target[key]:(...args)=>{surfaceCalls.push(String(key))}}})
const nativeFixture={acquire:async()=>{acquired++;return{lease:'fixture-lease',partition:'fixture-partition'}},release:async()=>{released++},onOpenRequested:()=>()=>{}}
// Fictional native main-content clipping container. The actual main slot measures it.
const nativeFrame=document.createElement('div')
nativeFrame.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;border-radius:0px'
document.body.append(nativeFrame)
const disposePanel=mountPanel(surfaceBridge,nativeFrame)
await settle()
const disposeSurface=mountSurface(surfaceBridge,nativeFixture,uiHost)
await settle()
const surface=document.getElementById('dsh-chat-website-surface'),retainedGuest=surface.querySelector('webview')
const platformRoot=document.documentElement
const surfaceRect=()=>{const r=surface.getBoundingClientRect();return [r.left,r.top,r.width,r.height].join(',')}
const originalSurfaceRect=surfaceRect()
const squareSurface=()=>{const css=getComputedStyle(surface);return css.borderTopLeftRadius==='0px' && css.borderTopRightRadius==='0px' && css.borderBottomLeftRadius==='0px' && css.borderBottomRightRadius==='0px' && css.clipPath==='none'}
const clippedSurface=()=>{const css=getComputedStyle(surface);return css.borderTopLeftRadius==='16px' && css.borderTopRightRadius==='0px' && css.borderBottomLeftRadius==='0px' && css.borderBottomRightRadius==='0px' && css.overflow==='hidden' && css.clipPath==='inset(0px round 16px 0px 0px)'}
platformRoot.dataset.platform='darwin';platformRoot.removeAttribute('data-windows-titlebar')
check('macOS retains its original square surface without a clip path',squareSurface() && surface.style.borderRadius==='0px')
platformRoot.dataset.windowsTitlebar=''
check('a Windows titlebar marker cannot round a macOS surface',squareSurface())
platformRoot.dataset.platform='linux'
check('Linux and unknown desktop shells keep the existing square surface',squareSurface())
platformRoot.dataset.platform='win32';platformRoot.removeAttribute('data-windows-titlebar')
check('Windows without the native titlebar capability stays square',squareSurface())
platformRoot.dataset.windowsTitlebar=''
check('platform markers alone never invent a radius absent from the native frame',squareSurface())
nativeFrame.style.borderRadius='16px 0 0 0';await settle()
check('actual main-slot projection follows the native frame top-left corner and clips descendants',clippedSurface())
check('Windows corner adaptation leaves the surface position and dimensions unchanged',surfaceRect()===originalSurfaceRect)
check('Windows clipping excludes the corner from hit testing but keeps the nearby content interactive',!surface.contains(document.elementFromPoint(1,1)) && surface.contains(document.elementFromPoint(20,1)))
platformRoot.dataset.platform='darwin';platformRoot.removeAttribute('data-windows-titlebar');nativeFrame.style.borderRadius='24px 8px 0 0 / 12px 6px 0 0';await settle()
check('one shared path follows elliptical host radii without a Windows platform branch',getComputedStyle(surface).borderRadius===getComputedStyle(nativeFrame).borderRadius && surfaceState.viewport.borderRadius===getComputedStyle(nativeFrame).borderRadius && surfaceRect()===originalSurfaceRect)
nativeFrame.style.overflow='visible';await settle()
check('decorative radii on a non-clipping ancestor are not projected',squareSurface())
nativeFrame.style.overflow='hidden';nativeFrame.style.borderRadius='0px';document.body.style.borderRadius='44px';document.body.style.overflow='hidden';await settle()
check('outer document or window corners never replace the main content shape',squareSurface())
document.body.style.borderRadius='';document.body.style.overflow='';platformRoot.dataset.platform='win32';platformRoot.dataset.windowsTitlebar='';nativeFrame.style.borderRadius='16px 0 0 0';await settle()
nativeFrame.style.padding='10px';await settle()
check('a different ancestor border box is not blindly copied onto the main viewport',squareSurface())
nativeFrame.style.padding='0px';await settle()
platformRoot.dataset.fullscreen='true'
check('Windows fullscreen preserves the same radius as the native content frame',clippedSurface())
platformRoot.removeAttribute('data-fullscreen')
nativeFrame.style.left='80px';nativeFrame.style.top='40px';nativeFrame.style.width='calc(100% - 80px)';nativeFrame.style.height='calc(100% - 40px)';await settle()
const movedRect=surface.getBoundingClientRect()
check('resized and sidebar-offset Windows surface keeps its radius at the current viewport corner',clippedSurface() && movedRect.left===80 && movedRect.top===40 && movedRect.width===innerWidth-80 && !surface.contains(document.elementFromPoint(81,41)) && surface.contains(document.elementFromPoint(100,41)))
patchSurface({mode:'harness'});await settle()
check('corner styling never keeps the website visible in HARNESS',getComputedStyle(surface).display==='none')
nativeFrame.style.left='0';nativeFrame.style.top='0';nativeFrame.style.width='100%';nativeFrame.style.height='100%';patchSurface({mode:'chat'});await settle()
check('returning to CHAT reuses the same guest with the Windows corner intact',clippedSurface() && surface.querySelector('webview')===retainedGuest && acquired===1 && released===0)
platformRoot.dataset.platform='darwin';platformRoot.removeAttribute('data-windows-titlebar');nativeFrame.style.borderRadius='0px';await settle()
check('returning to macOS removes Windows clipping and restores its original rectangle',squareSurface() && surfaceRect()===originalSurfaceRect && surface.contains(document.elementFromPoint(1,1)))
check('corner adaptation never reloads, replaces or releases the retained guest',surface.querySelector('webview')===retainedGuest && acquired===1 && released===0 && !surfaceCalls.some(name=>['reloadWebsite','logoutWebsite','clearWebsiteSession'].includes(name)))
check('actual failed Surface is concealed and inert behind its native error placeholder',Boolean(retainedGuest) && retainedGuest.style.opacity==='0' && retainedGuest.style.pointerEvents==='none' && retainedGuest.inert && Boolean(surface.querySelector('[role="alert"]')))
const commandCount=surfaceCommands.length
;[...surface.querySelectorAll('button')].find(button=>button.textContent==='Check again')?.click()
await settle()
check('Surface retry retains the same guest lease and only requests recognition',surface.querySelector('webview')===retainedGuest && acquired===1 && released===0 && surfaceCommands.length===commandCount+1 && surfaceCommands.at(-1).type==='snapshot')
check('Surface failure never changes modes, reloads or clears sign-in state',!surfaceCalls.some(name=>['selectMode','reloadWebsite','logoutWebsite','clearWebsiteSession'].includes(name)))

// A real WebSurface + WindowDragSurface, with a fictional Browser/Bridge only.
// A browser DOM cannot prove Electron's cross-webview native hit testing.
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
async function until(predicate,timeout=2500){const start=performance.now();while(performance.now()-start<timeout){if(predicate())return true;await pause(20)}return false}
fixture({host:retainedGuest});step()
retainedGuest.getURL=()=>`${origin}/a/chat/s/fixture-id`
retainedGuest.loadURL=async()=>{}
retainedGuest.executeJavaScript=async script=>{
 if(script.includes('readWebsiteWindowDragGeometry')){
  // Copy only the numeric host-inset argument from our source-generated call;
  // never eval a script or consult any real website/account state in this stub.
  const inset=script.match(/\)\(document,location\.origin,(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\)$/i)?.[1]
  return readWebsiteWindowDragGeometry(document,origin,inset===undefined?undefined:Number(inset))
 }
 return script.includes('adaptWebsiteSession') ? null : step()
}
retainedGuest.reload=()=>surfaceCalls.push('fixture-reload')
retainedGuest.dispatchEvent(new Event('dom-ready'))
retainedGuest.dispatchEvent(new Event('did-stop-loading'))
await until(()=>surfaceState.websiteNavigation.status==='ready' && retainedGuest.style.opacity==='1')
check('actual ready Surface restores baseline focus attributes and binds one owned sampler',samplerBinds===1 && Boolean(sampler) && acquired===1 && !retainedGuest.inert && !retainedGuest.hasAttribute('tabindex'))
platformRoot.dataset.platform='win32';platformRoot.dataset.windowsTitlebar='';nativeFrame.style.borderRadius='16px 0 0 0';await settle()
check('visible DOM guest respects Windows clipped-corner hit testing without changing its bounds',retainedGuest.style.opacity==='1' && !retainedGuest.inert && clippedSurface() && !surface.contains(document.elementFromPoint(1,1)) && surface.contains(document.elementFromPoint(20,1)) && surfaceRect()===originalSurfaceRect)
platformRoot.dataset.platform='darwin';platformRoot.removeAttribute('data-windows-titlebar');nativeFrame.style.borderRadius='0px';await settle()
check('visible DOM guest on macOS stays square and retains the same lease and sampler',squareSurface() && surface.contains(document.elementFromPoint(1,1)) && surface.querySelector('webview')===retainedGuest && acquired===1 && released===0 && samplerBinds===1)
const dragMount=document.createElement('div');document.body.append(dragMount)
const hostSentinel=document.createElement('div');hostSentinel.setAttribute('data-window-drag','fixture-host-owned');hostSentinel.style.display='block';document.body.append(hostSentinel)
document.documentElement.dataset.platform='darwin'
const controller=new AbortController()
let disposeDrag=mountDragSurface(surfaceBridge,controller.signal,dragMount)
const dragRow=()=>surface.querySelector('.dsh-chat-window-drag-row')
const rowMarkers=()=>surface.querySelectorAll('.dsh-chat-window-drag-row[data-window-drag]')
const dragNodes=()=>surface.querySelectorAll('.dsh-chat-window-drag-row,.dsh-chat-window-drag-hole')
const appRegion=node=>node?getComputedStyle(node).getPropertyValue('-webkit-app-region'):''
const holes=()=>[...surface.querySelectorAll('.dsh-chat-window-drag-hole')]
const holeCovers=rect=>holes().some(hole=>{const r=hole.getBoundingClientRect();return r.left<=rect.left && r.right>=rect.right && r.top<=Math.max(0,rect.top) && r.bottom>=Math.min(40,rect.bottom)})
await until(()=>rowMarkers().length===1)
let row=dragRow()
check('actual drag component portals exactly one positive row into the existing Surface',rowMarkers().length===1 && row?.parentElement===surface)
check('positive row keeps the existing viewport width and 40px native height',row?.getBoundingClientRect().width===innerWidth && row?.getBoundingClientRect().height===40 && row?.getBoundingClientRect().top===0)
check('positive row and all exclusion children are mouse-transparent',row?.style.pointerEvents==='none' && holes().length>0 && holes().every(hole=>getComputedStyle(hole).pointerEvents==='none'))
check('Mac actual positive row declares official native drag',appRegion(row)==='drag')
check('the complement holes all declare native no-drag',holes().length>0 && holes().every(hole=>appRegion(hole)==='no-drag'))
const realTitle=retainedGuest.querySelector('.afa34042'),realShare=retainedGuest.querySelector('._57370c5')
check('real title and Share controls are fully inside geometric no-drag holes',holeCovers(realTitle.getBoundingClientRect()) && holeCovers(realShare.getBoundingClientRect()))
realTitle.textContent='Hi'
await pause(250)
let blankX=realTitle.getBoundingClientRect().right+24
check('actual short-title whitespace is draggable before the former reserved edit lane',blankX<200 && !holes().some(hole=>{const r=hole.getBoundingClientRect();return blankX>=r.left && blankX<r.right}))
const leadingRow=dragRow(),leadingBounds=new DOMRect(0,0,160,40)
hostLeading.style.width='144px'
await until(()=>rowMarkers().length===1 && holeCovers(leadingBounds))
check('host leading is excluded immediately even while guest title CSS still uses 24px',document.documentElement.style.getPropertyValue('--dsh-chat-title-inset')==='24px' && dragRow()===leadingRow && holeCovers(leadingBounds))
hostLeading.style.width='0px'
await until(()=>rowMarkers().length===1 && !holes().some(hole=>{const r=hole.getBoundingClientRect();return blankX>=r.left && blankX<r.right}))
check('clearing the mock leading restores short-title whitespace without guest readaptation',document.documentElement.style.getPropertyValue('--dsh-chat-title-inset')==='24px' && dragRow()===leadingRow && !holes().some(hole=>{const r=hole.getBoundingClientRect();return blankX>=r.left && blankX<r.right}))
check('drag sampling retains the real website title node and text',retainedGuest.querySelector('.afa34042')===realTitle && realTitle.textContent==='Hi')
let clicked=0;realShare.onclick=()=>clicked++
const shareBox=realShare.getBoundingClientRect(),shareTarget=document.elementFromPoint(shareBox.left+14,shareBox.top+14)
shareTarget?.closest('button')?.click()
check('Share remains its real DOM hit target and keeps its click handler',shareTarget?.closest('button')===realShare && clicked===1)
const blankTarget=document.elementFromPoint(blankX,20)
check('blank drag geometry does not intercept DOM pointer events',Boolean(blankTarget) && !blankTarget.closest('.dsh-chat-window-drag-row,.dsh-chat-window-drag-hole'))
const contentBefore=document.getElementById('content').getBoundingClientRect().toJSON()
realTitle.textContent='A fictional longer title for stable measured whitespace'
await pause(250)
check('actual drag overlays never move the website content',JSON.stringify(contentBefore)===JSON.stringify(document.getElementById('content').getBoundingClientRect().toJSON()))
const longBlankX=realTitle.getBoundingClientRect().right+24
check('actual long-title whitespace stays draggable immediately after its measured end',longBlankX<realShare.getBoundingClientRect().left-8 && !holes().some(hole=>{const r=hole.getBoundingClientRect();return longBlankX>=r.left && longBlankX<r.right}))
row=dragRow();const positiveRect=row?JSON.stringify(row.getBoundingClientRect().toJSON()):null
let positiveChanges=0
const stability=new MutationObserver(records=>{positiveChanges+=records.filter(record=>record.target===row && record.type==='attributes' || record.type==='childList' && [...record.removedNodes,...record.addedNodes].some(node=>node===row)).length})
stability.observe(surface,{childList:true,subtree:true,attributes:true,attributeFilter:['style','data-window-drag']})
const readCount=dragReads
await pause(750);stability.disconnect()
check('successful sampling keeps one unchanged native row beyond the old 500ms lease',Boolean(row) && dragRow()===row && rowMarkers().length===1 && positiveRect===JSON.stringify(row.getBoundingClientRect().toJSON()) && positiveChanges===0 && dragReads>=readCount+2)
document.documentElement.dataset.platform='win32'
check('Windows actual positive row declares native drag without a Mac selector',appRegion(dragRow())==='drag' && holes().every(hole=>appRegion(hole)==='no-drag'))
realTitle.textContent='Hi'
const field=document.createElement('input');field.setAttribute('aria-label','Fictional header field');field.style.cssText='position:fixed;left:360px;top:10px;width:120px;height:28px';document.getElementById('content').append(field)
await pause(250)
check('a real unfocused field receives a geometric no-drag hole',Boolean(dragRow()) && holeCovers(field.getBoundingClientRect()))
const fieldBox=field.getBoundingClientRect()
check('the website field remains the real DOM hit target',document.elementFromPoint(fieldBox.left+20,fieldBox.top+14)===field)
field.focus()
await until(()=>rowMarkers().length===0)
check('focused header editing pauses the actual native row',rowMarkers().length===0 && dragNodes().length===0 && document.activeElement===field)
field.blur()
await until(()=>rowMarkers().length===1)
check('ending active editing resumes one row with the real field still excluded',rowMarkers().length===1 && holeCovers(field.getBoundingClientRect()))
field.remove();realTitle.textContent='Hi'
await pause(250)
check('removing an editor restores short-title whitespace without a guessed fixed lane',rowMarkers().length===1 && !holes().some(hole=>{const r=hole.getBoundingClientRect();return r.left<=160 && r.right>160}))
const dragModal=document.createElement('div');dragModal.className='ds-modal-content';retainedGuest.append(dragModal)
await until(()=>rowMarkers().length===0);const pausedForModal=rowMarkers().length===0
dragModal.remove();await until(()=>rowMarkers().length===1)
check('visible website dialogs pause native drag and closing them restores one row',pausedForModal && rowMarkers().length===1)
const readyNavigation=surfaceState.websiteNavigation
patchSurface({websiteNavigation:{...readyNavigation,status:'loading'}});await settle()
check('uncertain website recognition removes all component drag nodes',dragNodes().length===0)
patchSurface({websiteNavigation:readyNavigation});await until(()=>rowMarkers().length===1)
check('confirmed recognition resumes the same guest without acquiring another lease',rowMarkers().length===1 && surface.querySelector('webview')===retainedGuest && acquired===1)
patchSurface({settingsOpen:true});await settle()
check('opening native settings removes every drag node',dragNodes().length===0)
patchSurface({settingsOpen:false});await until(()=>rowMarkers().length===1)
check('closing settings resumes one mode-owned row',rowMarkers().length===1)
document.documentElement.dataset.fullscreen='true'
check('fullscreen CSS immediately disables an already painted native row',!dragRow() || getComputedStyle(dragRow()).display==='none')
await settle()
check('fullscreen also pauses the tracker and removes its native markers',rowMarkers().length===0 && dragNodes().length===0)
delete document.documentElement.dataset.fullscreen;await until(()=>rowMarkers().length===1)
check('leaving fullscreen restores a single verified drag row',rowMarkers().length===1)
const validViewport=surfaceState.viewport
patchSurface({viewport:{...validViewport,width:validViewport.width-40}});await until(()=>dragNodes().length===0)
check('a changed viewport discards old guest geometry rather than stretching native targets',dragNodes().length===0)
patchSurface({viewport:validViewport});await until(()=>rowMarkers().length===1)
check('a newly matching viewport safely reacquires geometry',rowMarkers().length===1)
document.documentElement.setAttribute('data-windows-titlebar','');document.documentElement.style.setProperty('--dsh-windows-titlebar-height','24px');await settle()
check('native caption avoidance uses an explicit smaller rectangle, not CSS clip-path',dragRow()?.getBoundingClientRect().top===24 && dragRow()?.getBoundingClientRect().height===16 && !dragRow()?.style.clipPath && holes().every(hole=>hole.getBoundingClientRect().height===16))
document.documentElement.style.setProperty('--dsh-windows-titlebar-height','36px');await settle()
check('less than eight pixels below the native caption renders no drag targets',dragNodes().length===0)
document.documentElement.removeAttribute('data-windows-titlebar');document.documentElement.style.removeProperty('--dsh-windows-titlebar-height');await until(()=>rowMarkers().length===1)
check('removing a native caption returns to the same 40px host row',dragRow()?.getBoundingClientRect().height===40 && rowMarkers().length===1)
const abortedRow=dragRow();controller.abort()
check('AbortSignal synchronously hides and removes only its own drag marker before React commit',Boolean(abortedRow) && abortedRow.style.display==='none' && !abortedRow.hasAttribute('data-window-drag') && rowMarkers().length===0)
const readsAfterAbort=dragReads;await settle();await pause(250)
check('aborted drag components remove every child and cannot resume sampling later',dragNodes().length===0 && dragReads===readsAfterAbort)
patchSurface({mode:'harness'});await settle()
check('HARNESS mode contains zero plugin native drag nodes',dragNodes().length===0)
disposeDrag()
patchSurface({mode:'chat'});const nextController=new AbortController();disposeDrag=mountDragSurface(surfaceBridge,nextController.signal,dragMount)
await until(()=>rowMarkers().length===1)
check('re-entering CHAT uses a fresh signal and creates only one verified row',rowMarkers().length===1 && acquired===1 && surface.querySelector('webview')===retainedGuest)
nextController.abort();patchSurface({mode:'harness'});await settle()
check('a second CHAT to HARNESS transition leaves zero native markers or hole nodes',rowMarkers().length===0 && dragNodes().length===0)
check('abort and mode cleanup never modify another host-owned drag element',hostSentinel.getAttribute('data-window-drag')==='fixture-host-owned' && hostSentinel.style.display==='block')
disposeDrag();disposeSurface();await settle()
check('Surface destruction unbinds exactly its own sampler and releases the fictional guest',sampler===null && samplerBinds===1 && samplerUnbinds===1 && released===1)
disposePanel();nativeFrame.style.borderRadius='30px';await settle()
check('main slot disposal clears viewport and stops shape observation',surfaceState.viewport===null)
nativeFrame.remove();hostSentinel.remove();dragMount.remove();hostLeading.remove()
Date.now=realNow
window.fixtureResults=results
console.log(JSON.stringify({fixture:'fictional-only',cases:results.length,failures:results.filter(r=>!r.passed)}))
await fetch('/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(results)})
