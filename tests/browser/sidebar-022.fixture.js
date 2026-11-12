import {attachSidebarAdapter,createSidebarBinding} from '../../src/sidebar-adapter.ts'
import {acquireChatStyles} from '../../src/styles.ts'

// Synthetic DOM only, based on published 0.2.1/0.2.2 SidebarRoot. No live DSH or website.
window.fixtureDone=(async()=>{
  const results=[]
  const check=(name,passed)=>results.push({name,passed:Boolean(passed)})
  const tick=()=>new Promise(resolve=>setTimeout(resolve,0))
  const releaseStyles=acquireChatStyles(document)
  const mode='data-dsh-chat-sidebar-mode', fill='data-dsh-chat-brand-fill', panel='data-dsh-chat-panel-region', list='data-dsh-chat-panel-list', session='data-dsh-chat-new-session'
  const clean=root=>!root.hasAttribute(mode) && !root.querySelector(`[${fill}],[${panel}],[${list}],[${session}]`)
  const node=(tag,attributes={})=>{const el=document.createElement(tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,value);return el}
  function shell({brandTag='span',button=false,disabled=false,wrapped=true}={}) {
    const root=node('div'),row=node('div',{'data-window-drag':'true'}),brand=node(brandTag),identity=node('span',{'aria-hidden':'true'})
    const mark=node('span'),seat=node('span'),outlet=wrapped ? node('span',{'data-slot':'sidebar.brand.name'}) : seat,name=node('span')
    const nav=node('nav',{'aria-label':'Fictional global panels'}),workspace=node('div'),workspaceSlot=node('div',{'data-slot':'sidebar.workspaces'}),footer=node('div')
    const toggle=node('button',{'data-sidebar-toggle':'true'}),panelButton=node('button')
    mark.textContent='Fictional mark';name.textContent='Fictional plugin';panelButton.textContent='Fictional panel';toggle.textContent='Toggle'
    const state={chat:true,canCreate:true},calls={chat:0,native:0,other:0}
    const makeButton=(initiallyDisabled=false)=>{const value=node('button',{'type':'button'});value.append(node('span'));value.firstChild.textContent='Fictional new session';value.disabled=initiallyDisabled;value.addEventListener('click',()=>calls.native++);return value}
    const newButton=button ? makeButton(disabled) : null
    if(wrapped)seat.append(outlet)
    outlet.append(name);identity.append(mark,seat);brand.append(identity);row.append(brand,toggle)
    if(brand.tagName==='BUTTON'){brand.type='button';brand.addEventListener('click',()=>calls.native++)}
    toggle.addEventListener('click',()=>calls.other++);panelButton.addEventListener('click',()=>calls.other++)
    nav.append(panelButton);workspace.append(workspaceSlot);root.append(row,...(newButton ? [newButton] : []),nav,workspace,footer);document.body.append(root)
    return {root,row,brand,identity,seat,outlet,name,nav,workspace,workspaceSlot,footer,newButton,toggle,panelButton,state,calls,makeButton,
      attach:()=>attachSidebarAdapter(name,()=>state,()=>calls.chat++)}
  }
  const remove=f=>f.root.remove()
  function rc2Shell({chat=true,button=true}={}) {
    const root=node('div'),row=node('div',{'data-window-drag':'true'})
    const brand=node('span'),identity=node('span',{'aria-hidden':'true'})
    const mark=node('span'),seat=node('span'),outlet=node('span',{'data-slot':'sidebar.brand.name'}),name=node('span')
    const newButton=button ? node('button',{'type':'button'}) : null
    const scrollRegion=node('div'),scrollArea=node('div',{'data-sidebar-scrollport':''}),panelList=node('nav',{'aria-label':'Fictional global panels'}),regionArea=node('div')
    const workspaceSlot=node('div',{'data-slot':'sidebar.workspaces'}),footer=node('div')
    const plugin=node('button'),automation=node('button'),more=node('button')
    mark.textContent='Fictional mark';name.textContent='Fictional plugin';plugin.textContent='Plugins';automation.textContent='Automation';more.textContent='More'
    if(newButton){newButton.append(node('span'));newButton.firstChild.textContent='New session'}
    panelList.append(plugin,automation,more);regionArea.append(workspaceSlot);scrollArea.append(panelList,regionArea)
    scrollRegion.append(scrollArea);identity.append(mark,seat);brand.append(identity);seat.append(outlet);outlet.append(name);row.append(brand)
    root.append(row,...(newButton ? [newButton] : []),scrollRegion,footer);document.body.append(root)
    const state={chat,canCreate:true},calls={chat:0,native:0}
    newButton?.addEventListener('click',()=>calls.native++)
    return {root,row,brand,identity,seat,name,newButton,scrollRegion,scrollArea,panelList,regionArea,workspaceSlot,footer,plugin,automation,more,state,calls,
      attach:()=>attachSidebarAdapter(name,()=>state,()=>calls.chat++)}
  }

  {
    const f=shell(),adapter=f.attach()
    check('0.2.2 denied session/create matches SPAN, labelled NAV and local workspace slot',adapter?.valid())
    check('missing native new-session BUTTON is not invented',f.root.querySelectorAll(':scope > button').length===0)
    check('CHAT hides the proven native NAV without replacing its nodes',f.nav.getAttribute(panel)==='true' && getComputedStyle(f.nav).display==='none' && f.nav.firstChild===f.panelButton)
    check('brand and own name receive only scoped fill markers',f.brand.getAttribute(fill)==='brand' && f.seat.getAttribute(fill)==='name')
    f.toggle.click();f.brand.click()
    check('non-action SPAN and native sidebar toggle remain untouched',f.calls.other===1 && f.calls.chat===0 && f.calls.native===0)
    f.state.chat=false;adapter.sync()
    check('HARNESS restores the native NAV visibility in the no-button branch',getComputedStyle(f.nav).display!=='none' && f.root.getAttribute(mode)==='harness')
    adapter.dispose();adapter.dispose()
    check('no-button cleanup restores all owned attributes and original node identities',clean(f.root) && f.name.parentElement===f.outlet)
    remove(f)
  }
  {
    const f=shell({button:true,disabled:true}),original=f.newButton
    original.setAttribute(session,'native-sentinel')
    const adapter=f.attach()
    check('legacy permitted-button branch still matches and enables CHAT create independently',adapter?.valid() && !original.disabled)
    original.firstChild.click()
    check('native new-session click is routed once to CHAT, never HARNESS',f.calls.chat===1 && f.calls.native===0)
    original.remove();await tick()
    check('removing native BUTTON transitions to the strict no-button branch',adapter.valid() && f.nav.getAttribute(panel)==='true')
    check('removed BUTTON regains its exact original disabled state and marker',original.disabled && original.getAttribute(session)==='native-sentinel')
    original.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))
    check('detached old BUTTON no longer has a plugin interception path',f.calls.chat===1 && f.calls.native===1)
    const second=f.makeButton();second.setAttribute(session,'second-native');f.root.insertBefore(second,f.nav)
    f.state.canCreate=false;second.click()
    check('unavailable create blocks a replacement BUTTON before observer delivery',f.calls.chat===1 && f.calls.native===1)
    f.state.canCreate=true;second.click()
    check('replacement BUTTON is safely intercepted even before observer delivery',f.calls.chat===2 && f.calls.native===1)
    await tick()
    check('observer binds replacement BUTTON and does not retain the detached one',second.getAttribute(session)==='true' && adapter.valid())
    f.state.canCreate=false;adapter.sync()
    check('unavailable website create disables only the current native BUTTON',second.disabled && original.disabled)
    f.state.chat=false;adapter.sync();second.click()
    check('HARNESS restores replacement BUTTON original enabled state and native action',!second.disabled && f.calls.native===2 && f.calls.chat===2)
    f.state.chat=true;f.state.canCreate=true;adapter.sync()
    const third=f.makeButton(true);f.root.replaceChild(third,second);await tick()
    check('replacing a BUTTON restores the prior node without clobbering its marker',!second.disabled && second.getAttribute(session)==='second-native' && !third.disabled)
    third.click();check('third native BUTTON gets exactly one CHAT interception',f.calls.chat===3 && f.calls.native===2)
    adapter.dispose()
    check('cleanup restores every native BUTTON disabled baseline and attributes',third.disabled && !third.hasAttribute(session) && second.getAttribute(session)==='second-native' && original.getAttribute(session)==='native-sentinel')
    check('dynamic-button cleanup also restores root, brand and NAV markers',clean(f.root))
    remove(f)
  }
  {
    const f=shell({brandTag:'button',button:true}),adapter=f.attach()
    const ownHost=node('span'),ownControl=node('button');ownHost.append(ownControl);f.brand.after(ownHost)
    ownControl.addEventListener('click',()=>f.calls.other++);ownControl.click()
    check('own mode-control sibling is not intercepted by the local root delegate',f.calls.other===1 && f.calls.chat===0 && f.calls.native===0)
    f.brand.click();check('Windows/Web brand BUTTON redirects CHAT without a native session',f.calls.chat===1 && f.calls.native===0)
    f.state.canCreate=false;adapter.sync();f.brand.click()
    check('brand BUTTON cannot leak into HARNESS while website create is unavailable',f.calls.chat===1 && f.calls.native===0)
    f.state.canCreate=true;adapter.sync();f.newButton.remove();await tick()
    check('BUTTON brand with no native new-session control is rejected, not guessed as 0.2.2 denial',!adapter.valid() && clean(f.root))
    f.brand.click();check('previously proven brand action fails closed during an unknown local transition',f.calls.chat===1 && f.calls.native===0)
    f.root.insertBefore(f.newButton,f.nav);await tick();f.brand.click()
    check('recognized permitted shape safely recovers after a transient unknown branch',adapter.valid() && f.calls.chat===2 && f.calls.native===0)
    f.state.chat=false;adapter.sync();f.brand.click()
    check('HARNESS brand click regains the native action',f.calls.native===1 && f.calls.chat===2)
    adapter.dispose();f.state.chat=true;f.brand.click()
    check('disposing removes brand interception even if later state says CHAT',f.calls.native===2 && f.calls.chat===2 && clean(f.root))
    remove(f)
  }
  const rejectionCases=[
    ['missing branch with DIV brand',f=>{const div=node('div');div.append(f.identity);f.brand.replaceWith(div)}],
    ['unlabelled NAV',f=>f.nav.removeAttribute('aria-label')],
    ['empty NAV label',f=>f.nav.setAttribute('aria-label',' ')],
    ['duplicate direct NAV',f=>f.root.insertBefore(node('nav',{'aria-label':'Other'}),f.workspace)],
    ['interposed unknown sibling after logo row',f=>f.root.insertBefore(node('i'),f.nav)],
    ['missing local workspace SlotOutlet',f=>f.workspaceSlot.removeAttribute('data-slot')],
    ['wrapped rather than direct workspace SlotOutlet',f=>{const wrapper=node('div');f.workspaceSlot.replaceWith(wrapper);wrapper.append(f.workspaceSlot)}],
    ['duplicate workspace SlotOutlets in region',f=>f.workspace.append(node('div',{'data-slot':'sidebar.workspaces'}))],
    ['duplicate workspace region',f=>{const second=node('div');second.append(node('span',{'data-slot':'sidebar.workspaces'}));f.root.append(second)}],
    ['workspace region not immediately after NAV',f=>f.root.insertBefore(node('div'),f.workspace)],
    ['direct BUTTON in an unrelated position',f=>f.root.append(f.makeButton())],
    ['lost own identity proof',f=>f.identity.removeAttribute('aria-hidden')],
  ]
  for(const [label,change] of rejectionCases){const f=shell();change(f);const adapter=f.attach();check(`unknown structure rejected: ${label}`,adapter===null && clean(f.root));adapter?.dispose();remove(f)}
  {
    const f=shell({button:true}),extra=f.makeButton();f.root.append(extra)
    check('two direct BUTTONs never select an arbitrary new-session control',f.attach()===null && clean(f.root));remove(f)
    const decoy=shell(),invalid=shell();invalid.workspaceSlot.removeAttribute('data-slot')
    check('another valid root cannot supply workspace proof through global DOM search',invalid.attach()===null && clean(invalid.root) && clean(decoy.root));remove(decoy);remove(invalid)
  }
  {
    const f=shell(),adapter=f.attach()
    f.workspaceSlot.removeAttribute('data-slot');await tick()
    check('losing workspace proof withdraws markers after attribute-only mutations',!adapter.valid() && clean(f.root))
    f.workspaceSlot.setAttribute('data-slot','sidebar.workspaces');await tick()
    check('restoring the same local workspace proof recovers without reattaching',adapter.valid() && f.root.getAttribute(mode)==='chat')
    f.nav.removeAttribute('aria-label');await tick()
    check('losing the NAV label withdraws a previously active no-button branch',!adapter.valid() && clean(f.root))
    f.nav.setAttribute('aria-label','Fictional localized panels');await tick()
    check('localized nonempty NAV label recovers without reading label text',adapter.valid())
    f.name.remove();await tick()
    check('disconnecting the own brand seat invalidates and restores its old shell',!adapter.valid() && clean(f.root))
    f.outlet.append(f.name);await tick()
    check('returning the same own brand seat is safe to recognize again',adapter.valid())
    adapter.dispose();remove(f)
  }
  {
    const f=shell({brandTag:'button',button:true,disabled:true}),reports=[]
    const binding=createSidebarBinding(()=>f.state,()=>f.calls.chat++,ready=>reports.push(ready))
    binding.attach(f.name)
    const fresh=shell(),newBrand=fresh.brand,newName=fresh.name
    f.newButton.remove();f.brand.replaceWith(newBrand);fresh.root.remove()
    binding.attach(newName)
    check('native BUTTON-to-SPAN owner replacement is reattached through the existing binding',reports.at(-1)===true && f.root.getAttribute(mode)==='chat' && newBrand.getAttribute(fill)==='brand')
    check('old React owner and removed native control recover their original state',!f.brand.hasAttribute(fill) && f.newButton.disabled && !f.newButton.hasAttribute(session))
    binding.dispose();check('binding cleanup restores the replacement owner and shell',clean(f.root));remove(f)
  }
  {
    const f=shell({wrapped:false})
    f.root.setAttribute(mode,'native-mode');f.nav.setAttribute(panel,'native-panel');f.brand.setAttribute(fill,'native-brand')
    const adapter=f.attach()
    check('fallback own-seat chain still supports the strict no-button shape',adapter?.valid())
    adapter.dispose()
    check('pre-existing root, NAV and brand attributes restore exactly',f.root.getAttribute(mode)==='native-mode' && f.nav.getAttribute(panel)==='native-panel' && f.brand.getAttribute(fill)==='native-brand')
    remove(f)
  }
  {
    const f=rc2Shell(),adapter=f.attach()
    check('0.2.2-rc.2 shell is proven by the direct new-session BUTTON branch',adapter?.valid()===true)
    check('CHAT hides the rc.2 Plugins/Automation/More panel list',f.panelList.getAttribute(list)==='true' && getComputedStyle(f.panelList).display==='none')
    check('CHAT keeps the rc.2 workspace section outside the hidden list',getComputedStyle(f.workspaceSlot).display!=='none' && getComputedStyle(f.regionArea).display!=='none')
    f.plugin.click()
    check('rc.2 panel entries keep their native clicks',f.calls.chat===0 && f.calls.native===0)
    f.newButton.click()
    check('rc.2 native new-session BUTTON still redirects to CHAT once',f.calls.chat===1 && f.calls.native===0)
    f.state.chat=false;adapter.sync()
    check('HARNESS restores the rc.2 panel list',getComputedStyle(f.panelList).display!=='none' && f.root.getAttribute(mode)==='harness')
    f.state.chat=true;adapter.sync()
    check('CHAT re-hides the same rc.2 panel list',getComputedStyle(f.panelList).display==='none')
    adapter.dispose()
    check('rc.2 cleanup restores the panel list and every owned marker',clean(f.root))
    remove(f)
  }
  {
    const f=rc2Shell()
    document.documentElement.setAttribute('data-dsh-chat-mode','chat')
    check('rc.2 structural fallback hides the panel list even without an adapter',getComputedStyle(f.panelList).display==='none')
    document.documentElement.removeAttribute('data-dsh-chat-mode')
    check('rc.2 structural fallback leaves the panel list visible outside CHAT',getComputedStyle(f.panelList).display!=='none')
    remove(f)
  }
  {
    const f=rc2Shell(),extra=node('div');f.scrollArea.append(extra)
    const adapter=f.attach()
    check('rc.2-like shape with extra scroll-area children is not guessed',adapter?.valid()===true && !f.panelList.hasAttribute(list))
    adapter?.dispose();remove(f)
  }
  releaseStyles()
  return results
})()
