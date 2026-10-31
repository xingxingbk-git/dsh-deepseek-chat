import React from 'react'
import {createRoot} from 'react-dom/client'
import {flushSync} from 'react-dom'
import {DshChatChatSettings,DshChatModeSelector,DshChatBrandName,useDshChat} from '../../src/ui.tsx'
import {validSwitchLabel} from '../../src/preferences.ts'
import {attachSidebarAdapter} from '../../src/sidebar-adapter.ts'

// Production React/CSS with public primitive API stand-ins; no DSH, site or credentials.
window.fixtureDone=(async()=>{
 const results=[],writes=[],commands=[],listeners=new Set(),adapters=new Map()
 const check=(name,passed)=>results.push({name,passed:!!passed})
 const tick=()=>new Promise(resolve=>setTimeout(resolve,0))
 let failNext=false,hold=null
 let state={mode:'harness',modeEnabled:true,authorizationStatus:'authorized',availabilityMessage:'',accountLabel:null,error:null,desktopAvailable:true,webLoading:false,webError:null,accountStorageKey:null,authorizationGeneration:1,websiteReloadRevision:0,settingsOpen:false,language:'zh-CN',websiteAuthenticationStatus:'signed-in',websiteAuthenticationRevision:0,websiteSessionStatus:'saved',websiteSessionError:null,viewport:null,brandAnchor:null,sidebarAdapted:true,websiteNavigation:{status:'ready',authenticated:true,accountName:'Fixture account',conversations:[],canCreate:true},websiteNavigationRefreshing:false,websiteNavigationRefreshError:null,showWebsiteNavigation:false,switchPreferences:{switchStyle:'text',chatLabel:'CHAT',harnessLabel:'HARNESS'},switchPreferencesStatus:'ready',switchPreferencesPending:false,switchPreferencesError:null}
 const update=patch=>{state={...state,...patch};flushSync(()=>listeners.forEach(fn=>fn()))}
 const bridge={getSnapshot:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},setSettingsOpen:()=>{},selectMode:mode=>update({mode}),commandWebsite:cmd=>commands.push(cmd),logoutWebsite:()=>{},refreshAuthorization:()=>{},beginWebsiteSignIn:()=>{},setSwitchPreference:async(field,value)=>{
  if(field!=='switchStyle' && !validSwitchLabel(value))throw Error('Invalid persistence attempt')
  writes.push({field,value})
  if(hold)await hold
  if(failNext){failNext=false;return false}
  update({switchPreferences:{...state.switchPreferences,[field]:value}});return true
 }}
 bridge.attachSidebar=name=>{let adapter=adapters.get(name);if(!adapter){adapter=attachSidebarAdapter(name,()=>({chat:state.mode==='chat',canCreate:true}),()=>{});if(!adapter)throw Error('invalid synthetic native sidebar');adapters.set(name,adapter)}adapter.sync()}
 const h=React.createElement
 function SidebarFixture({id,width,button=false}){return h('div',{id,className:'fixture-sidebar',style:{width}},
  h('div',{className:'fixture-logo-row','data-window-drag':true},h(button?'button':'div',{className:'fixture-brand'},h('div',{className:'fixture-brand-identity','aria-hidden':true},h('span',{className:'fixture-brand-icon'},h('svg',{width:24,height:24})),h('span',{className:'fixture-brand-name'},h('span',{'data-slot':'sidebar.brand.name',style:{display:'contents'}},h(DshChatBrandName,{bridge})))))),h('button',null,'Native new session'))}
 function App(){const snapshot=useDshChat(bridge);return h(React.Fragment,null,h('div',{id:'settings'},h(DshChatChatSettings,{bridge,close:()=>{}})),h(DshChatModeSelector,{bridge,state:snapshot}),h(SidebarFixture,{id:'sidebar-wide',width:420}),h(SidebarFixture,{id:'sidebar-narrow',width:192}),h(SidebarFixture,{id:'sidebar-windows',width:420,button:true}))}
 const root=createRoot(document.querySelector('#fixtures'));flushSync(()=>root.render(h(App)));await tick()
 const card=()=>document.querySelector('.dsh-chat-presentation-settings')
 const input=field=>card().querySelectorAll('input')[field==='chatLabel'?0:1]
 const save=()=>card().querySelector('.dsh-chat-label-save')
 const setInput=async(field,value)=>{const el=input(field);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));await tick();return el}
 const choose=async id=>{card().querySelector('.dsh-chat-style-trigger').click();await tick();document.querySelector(`[data-menu-id="${id}"]`).click();await tick()}
 try{
  check('boxed page title and subtitle are absent',!document.querySelector('.dsh-chat-settings-heading') && !document.querySelector('#settings h2'))
  check('boxed account heading and login explanation are absent',!document.querySelector('.dsh-chat-settings-card-heading') && !document.querySelector('#settings').textContent.includes('独立的'))
  check('saved-login explanatory block is absent without changing account display',!document.querySelector('.dsh-chat-settings-saved') && document.querySelector('#settings').textContent.includes('Fixture account'))
  const logout=document.querySelector('.dsh-chat-settings-logout'),logoutStyle=getComputedStyle(logout)
  check('logout has transparent fill and matching red text and outline in light theme',logoutStyle.backgroundColor==='rgba(0, 0, 0, 0)' && logoutStyle.color==='rgb(220, 38, 38)' && logoutStyle.borderTopColor===logoutStyle.color && logoutStyle.borderTopStyle==='solid')
  check('logout hover uses the native danger fill only when enabled',[...document.querySelectorAll('style')].some(style=>style.textContent.includes('.dsh-chat-settings-logout:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,#ef535014)}')))
  const headingStyle=getComputedStyle(card().querySelector('h3')),triggerStyle=getComputedStyle(card().querySelector('.dsh-chat-style-trigger'))
  check('switch heading matches native dropdown font size and retains semibold weight',headingStyle.fontSize===triggerStyle.fontSize && headingStyle.fontSize==='14px' && headingStyle.fontWeight==='600')
  const external=document.querySelector('.dsh-chat-settings-external')
  check('website link precedes logout and carries no private or conversation data',external?.getAttribute('href')==='https://chat.deepseek.com/' && external.target==='_blank' && external.rel==='noopener noreferrer' && external.nextElementSibling?.classList.contains('dsh-chat-settings-logout'))
  const actionGroup=document.querySelector('.dsh-chat-settings-actions'),styleSelect=card().querySelector('.dsh-chat-preference-select'),settingsHost=document.querySelector('#settings'),styleTrigger=card().querySelector('.dsh-chat-style-trigger')
  const actionsAligned=()=>{const a=actionGroup.getBoundingClientRect(),s=styleSelect.getBoundingClientRect(),link=external.getBoundingClientRect(),button=logout.getBoundingClientRect();return Math.abs(a.width-s.width)<0.6 && Math.abs(a.left-s.left)<0.6 && Math.abs(a.right-s.right)<0.6 && Math.abs(link.left-a.left)<0.6 && Math.abs(button.right-a.right)<0.6 && button.left>=link.right-0.6 && Math.abs(link.top-button.top)<6}
  check('account actions share the dropdown width and stay edge-aligned without overlap',actionsAligned() && getComputedStyle(actionGroup).justifyContent==='space-between' && Math.abs(actionGroup.getBoundingClientRect().width-200)<0.6)
  const insetOf=node=>node.getBoundingClientRect().left+parseFloat(getComputedStyle(node).paddingLeft)
  check('website link insets its text like the native dropdown so both text starts align',getComputedStyle(external).paddingLeft==='14px' && getComputedStyle(styleTrigger).paddingLeft==='14px' && Math.abs(insetOf(external)-insetOf(styleTrigger))<0.6)
  const triggerCss=getComputedStyle(styleTrigger)
  check('dropdown uses the native selector fill without an outline stroke',triggerCss.backgroundColor==='rgb(249, 250, 251)' && triggerCss.borderTopStyle==='none' && triggerCss.borderLeftStyle==='none')
  check('dropdown fill follows the native selector token rather than a hardcoded colour',[...document.querySelectorAll('style')].some(style=>style.textContent.includes('background:var(--dsw-specific-selector)') && style.textContent.includes('.dsh-chat-style-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid,var(--dsw-specific-selector))}')))
  settingsHost.style.width='280px';await tick()
  check('narrow settings keep the single-line actions row aligned instead of wrapping',actionsAligned() && styleSelect.getBoundingClientRect().right<=settingsHost.getBoundingClientRect().right)
  settingsHost.style.width='600px';update({language:'en'});await tick()
  check('English account actions keep the padded link and logout on one aligned row',actionsAligned() && getComputedStyle(external).paddingLeft==='14px')
  update({language:'zh-CN'});await tick()
  check('card spacing and stroke use the official account-page values',getComputedStyle(document.querySelector('.dsh-chat-settings')).paddingTop==='8px' && Array.from(document.querySelectorAll('.dsh-chat-settings-card')).every(el=>{const css=getComputedStyle(el);return css.paddingTop==='12px' && css.paddingLeft==='16px' && css.marginBottom==='16px' && css.borderTopColor==='rgb(153, 153, 153)'}))
  check('both settings cards keep transparent fill and their border',Array.from(document.querySelectorAll('.dsh-chat-settings-card')).length===2 && Array.from(document.querySelectorAll('.dsh-chat-settings-card')).every(el=>{const css=getComputedStyle(el);return css.backgroundColor==='rgba(0, 0, 0, 0)' && css.borderTopStyle==='solid'}))
  check('both label input wrappers and inputs remain transparent',Array.from(card().querySelectorAll('.dsh-chat-label-input,input')).every(el=>getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)'))
  check('no visible field labels or validation prose',!card().querySelector('label,small') && !card().textContent.includes('失焦') && !card().textContent.includes('请输入'))
  check('native public Button and Menu compose the style control',!!card().querySelector('.dsh-chat-style-trigger[data-native-button="outline"]') && !card().querySelector('select'))
  check('native Input and Button render label editors and save',card().querySelectorAll('[data-native-input]').length===2 && save().dataset.nativeButton==='primary')
  check('title and style control are vertically centered',Math.abs((card().querySelector('h3').getBoundingClientRect().top+card().querySelector('h3').getBoundingClientRect().height/2)-(card().querySelector('.dsh-chat-style-trigger').getBoundingClientRect().top+18))<1)
  check('separator divides style row and label editors',!!card().querySelector('hr') && card().querySelector('hr').getBoundingClientRect().top>card().querySelector('.dsh-chat-preference-row').getBoundingClientRect().bottom)
  check('one shared save button is initially disabled',card().querySelectorAll('.dsh-chat-label-save').length===1 && save().disabled)
  check('initial counters use original width limit',Array.from(card().querySelectorAll('.dsh-chat-label-count')).map(el=>el.textContent).join('|')==='4/10|7/10')
  const editor=await setInput('chatLabel','HELLO');editor.focus();editor.blur();await tick()
  check('typing and blur never persist',writes.length===0 && state.switchPreferences.chatLabel==='CHAT')
  check('dirty valid draft enables save and updates counter',!save().disabled && card().querySelector('.dsh-chat-label-count').textContent==='5/10')
  save().click();await tick()
  check('explicit save persists changed label only',writes.length===1 && state.switchPreferences.chatLabel==='HELLO')
  check('successful save returns to disabled',save().disabled)
  await setInput('chatLabel','中文');await setInput('harnessLabel','工作台')
  check('Unicode counters count two per Chinese character',Array.from(card().querySelectorAll('.dsh-chat-label-count')).map(el=>el.textContent).join('|')==='4/10|6/10')
  const before=writes.length;save().click();await tick();await tick()
  check('shared save commits both edited labels',writes.length===before+2 && state.switchPreferences.chatLabel==='中文' && state.switchPreferences.harnessLabel==='工作台')
  await setInput('chatLabel','12345678901')
  check('overflow retains validation and disables save',save().disabled && input('chatLabel').getAttribute('aria-invalid')==='true' && card().querySelector('.dsh-chat-label-count').textContent==='11/10')
  check('invalid draft adds no explanatory prose',!card().querySelector('[role="alert"]') && !card().textContent.includes('请输入'))
  await setInput('chatLabel','   ');check('blank draft cannot save',save().disabled)
  await setInput('chatLabel','中文');check('reverting to saved labels disables save',save().disabled)
  await setInput('chatLabel','DRAFT');const beforeStyle=writes.length
  await choose('icon');check('icon style hides editing without persisting label draft',!card().querySelector('input') && writes.length===beforeStyle+1 && state.switchPreferences.chatLabel==='中文')
  await choose('text');check('unsaved draft survives text-icon-text changes',input('chatLabel').value==='DRAFT' && !save().disabled)
  const ime=input('chatLabel');ime.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));ime.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}));card().querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await tick()
  check('IME confirmation cannot implicitly save',state.switchPreferences.chatLabel==='中文')
  ime.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));await tick();save().click();await tick()
  check('completed draft saves only after explicit submit',state.switchPreferences.chatLabel==='DRAFT' && save().disabled)
  await setInput('chatLabel','RETRY');failNext=true;save().click();await tick()
  check('write failure preserves editable draft and retry',input('chatLabel').value==='RETRY' && !save().disabled && !!card().querySelector('[role="alert"]'))
  save().click();await tick();check('retry saves retained draft',state.switchPreferences.chatLabel==='RETRY' && save().disabled)
  await setInput('chatLabel','WAIT');let release;hold=new Promise(resolve=>{release=resolve});save().click();await tick();const count=writes.length;save().click();await tick()
  check('pending save is visually silent and blocks duplicate submission',save().textContent==='保存' && !input('chatLabel').disabled && !card().querySelector('[aria-busy="true"]') && writes.length===count)
  release();hold=null;await tick();await tick()
  check('pending save settles to clean disabled state',state.switchPreferences.chatLabel==='WAIT' && save().disabled)
  update({language:'en'});await tick()
  check('English accessible names and save label use locale',input('chatLabel').getAttribute('aria-label')==='CHAT button label' && save().textContent==='Save')
  document.querySelector('#settings').style.width='240px';await tick()
  check('narrow layout keeps inputs and save within card',Array.from(card().querySelectorAll('input,.dsh-chat-label-save,.dsh-chat-style-trigger')).every(el=>el.getBoundingClientRect().right<=card().getBoundingClientRect().right+1))
  check('UI editing never changes website or canonical mode',commands.length===0 && state.mode==='harness')
  const wide=document.querySelector('#sidebar-wide'),narrow=document.querySelector('#sidebar-narrow'),windows=document.querySelector('#sidebar-windows')
  const host=el=>el.querySelector('.dsh-chat-brand-control-host'),buttons=el=>Array.from(el.querySelectorAll('.dsh-chat-brand-control .dsh-chat-modes button'))
  const widthOf=el=>el.getBoundingClientRect().width
  const textWidth=(button,text)=>{const css=getComputedStyle(button),probe=document.createElement('span');Object.assign(probe.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:css.font,fontSize:css.fontSize,fontFamily:css.fontFamily,fontWeight:css.fontWeight,letterSpacing:css.letterSpacing,lineHeight:css.lineHeight});probe.textContent=text;document.body.appendChild(probe);const got=probe.getBoundingClientRect().width;probe.remove();return Math.ceil(got)}
  const padOf=el=>Math.ceil(parseFloat(getComputedStyle(buttons(el)[0]).paddingLeft)+parseFloat(getComputedStyle(buttons(el)[0]).paddingRight))
  const natural=async(el,index)=>{const labels=['CHAT','HARNESS'];return padOf(el)+textWidth(buttons(el)[index],labels[index])}
  const setHostWidth=async target=>{let lo=60,hi=1000;for(let step=0;step<46;step++){const mid=(lo+hi)/2;narrow.style.width=mid+'px';await tick();const got=widthOf(host(narrow));if(got<target-0.4)lo=mid;else hi=mid}narrow.style.width=hi+'px';await tick();return widthOf(host(narrow))}
  update({switchPreferences:{...state.switchPreferences,switchStyle:'text',chatLabel:'CHAT',harnessLabel:'HARNESS'}});await tick()
  wide.style.width='900px';await tick()
  const wideButtons=buttons(wide),padText=parseFloat(getComputedStyle(wideButtons[0]).paddingLeft)
  check('increased horizontal padding applies to text buttons',padText===8 && parseFloat(getComputedStyle(wideButtons[1]).paddingRight)===8)
  const chatNatural=await natural(wide,0),harnessNatural=await natural(wide,1)
  check('ample space gives both buttons the longer label width',Math.abs(widthOf(wideButtons[0])-widthOf(wideButtons[1]))<=0.5 && Math.abs(widthOf(wideButtons[0])-Math.max(chatNatural,harnessNatural))<=1)
  check('ample-space buttons fully show both texts',wideButtons.every(button=>button.querySelector('.dsh-chat-mode-label').scrollWidth<=button.querySelector('.dsh-chat-mode-label').clientWidth+1))
  await choose('icon');const iconWidth=widthOf(buttons(document.querySelector('#sidebar-wide'))[0]),padIcon=parseFloat(getComputedStyle(buttons(wide)[0]).paddingLeft),iconArtwork=widthOf(wide.querySelector('.dsh-chat-modes svg'))
  check('icon buttons keep the same padding and equal widths',padIcon===padText && Math.abs(widthOf(buttons(wide)[0])-widthOf(buttons(wide)[1]))<=0.5)
  await choose('text');await tick()
  const gap=Math.ceil(parseFloat(getComputedStyle(document.querySelector('#sidebar-narrow .dsh-chat-modes')).columnGap)||0)
  const equal=Math.max(chatNatural,harnessNatural,iconWidth),shortNat=Math.min(chatNatural,harnessNatural),longNat=equal
  check('icon-mode width sets the absolute minimum for every stage',iconWidth>=padText*2+20-0.5 && equal>=iconWidth && Math.abs(iconArtwork-20)<=0.5)
  const fieldset=narrow.querySelector('.dsh-chat-modes')
  const inlinePad=Math.ceil((parseFloat(getComputedStyle(fieldset).paddingLeft)||0)+(parseFloat(getComputedStyle(fieldset).paddingRight)||0))
  const textRect=el=>{const range=document.createRange();range.selectNodeContents(el);const got=range.getBoundingClientRect().width;range.detach();return got}
  const fullyShown=el=>textRect(el)<=el.getBoundingClientRect().width+0.05
  const toHost=available=>Math.max(1,available+inlinePad)
  let got=await setHostWidth(toHost(equal+shortNat+2))
  let current=buttons(narrow)
  const shortLabel0=current[0].querySelector('.dsh-chat-mode-label'),longLabel0=current[1].querySelector('.dsh-chat-mode-label')
  check('stage two shrinks only the shorter button while both texts stay complete',widthOf(current[0])>=shortNat-1 && widthOf(current[0])<widthOf(current[1]) && Math.abs(widthOf(current[1])-equal)<=1.5 && fullyShown(shortLabel0) && fullyShown(longLabel0))
  got=await setHostWidth(toHost(equal+shortNat-10));current=buttons(narrow)
  const longLabel=current[1].querySelector('.dsh-chat-mode-label'),shortLabel=current[0].querySelector('.dsh-chat-mode-label')
  check('stage three truncates only the longer label and keeps the shorter at its own width',Math.abs(widthOf(current[0])-shortNat)<=1.5 && longLabel.scrollWidth>longLabel.clientWidth+1 && shortLabel.scrollWidth<=shortLabel.clientWidth+1)
  got=await setHostWidth(toHost(2*shortNat-14));current=buttons(narrow)
  check('stage four makes both buttons equal, truncated and never below icon width',Math.abs(widthOf(current[0])-widthOf(current[1]))<=1 && current.every(button=>{const label=button.querySelector('.dsh-chat-mode-label');return label.scrollWidth>label.clientWidth+1 && widthOf(button)>=iconWidth-0.5}))
  got=await setHostWidth(toHost(16));current=buttons(narrow)
  check('extreme narrowing still clamps buttons to the icon-mode minimum',current.every(button=>widthOf(button)>=iconWidth-0.5))
  wide.style.width='900px';await tick()
  update({switchPreferences:{...state.switchPreferences,chatLabel:'代码',harnessLabel:'HARNESS'}});await tick()
  wide.style.width='900px';await tick()
  const codeNatural=await natural(wide,0),harnessNatural2=await natural(wide,1)
  got=await setHostWidth(toHost(Math.max(codeNatural,harnessNatural2)+Math.min(codeNatural,harnessNatural2)+2))
  current=buttons(narrow)
  check('short-side staging follows actual text widths, not a fixed column',widthOf(current[0])>=Math.min(codeNatural,harnessNatural2)-1 && widthOf(current[1])>widthOf(current[0]) && Math.abs(widthOf(current[1])-Math.max(codeNatural,harnessNatural2))<=1.5)
  wide.style.width='420px';narrow.style.width='192px';await tick()
  check('wide and Windows rows keep the native mark and wordmark sizes',[wide,windows].every(el=>widthOf(el.querySelector('.fixture-brand-icon'))===24 && widthOf(el.querySelector('.dsh-chat-brand-wordmark'))===102))
  check('narrow sidebar preserves brand sizes and keeps switcher inside the row',widthOf(narrow.querySelector('.fixture-brand-icon'))===24 && widthOf(narrow.querySelector('.dsh-chat-brand-wordmark'))===102 && host(narrow).getBoundingClientRect().right<=narrow.getBoundingClientRect().right+1)
  check('narrow label keeps complete tooltip for truncation',buttons(narrow)[0].title.includes('代码') || buttons(narrow)[0].title.includes('CHAT'))
  await setHostWidth(96)
  update({switchPreferences:{...state.switchPreferences,chatLabel:'CHAT',harnessLabel:'HARNESS'}});await tick()
  const wasTruncated=buttons(narrow).map(button=>!fullyShown(button.querySelector('.dsh-chat-mode-label')))
  update({switchPreferences:{...state.switchPreferences,chatLabel:'CHAT',harnessLabel:'CODE'}});await tick()
  const relabelled=buttons(narrow)
  check('relabelling a truncated longer label to an equally short one re-measures and clears truncation',wasTruncated[1]===true && Math.abs(widthOf(relabelled[0])-widthOf(relabelled[1]))<=0.6 && relabelled.every(button=>fullyShown(button.querySelector('.dsh-chat-mode-label'))))
  await setHostWidth(90);await tick()
  const tight=buttons(narrow)
  const tightNatural=Math.max(textRect(tight[0].querySelector('.dsh-chat-mode-label')),textRect(tight[1].querySelector('.dsh-chat-mode-label')))+padOf(narrow)
  check('marginal width still fits an equal pair without any ellipsis',Math.abs(widthOf(tight[0])-widthOf(tight[1]))<=0.6 && tight.every(button=>fullyShown(button.querySelector('.dsh-chat-mode-label'))) && widthOf(tight[0])>=tightNatural-1)
  await setHostWidth(70);await tick()
  const squeezed=buttons(narrow)
  check('a genuinely too-narrow switcher truncates both labels symmetrically',Math.abs(widthOf(squeezed[0])-widthOf(squeezed[1]))<=0.6 && squeezed.every(button=>!fullyShown(button.querySelector('.dsh-chat-mode-label'))))
  document.body.classList.add('dark');await tick()
  const darkLogout=getComputedStyle(logout)
  check('logout follows the dark danger token for both text and outline',darkLogout.color==='rgb(242, 90, 90)' && darkLogout.borderTopColor===darkLogout.color && darkLogout.backgroundColor==='rgba(0, 0, 0, 0)')
  update({websiteNavigation:{...state.websiteNavigation,status:'loading'}});await tick()
  const disabledLogout=getComputedStyle(logout)
  check('disabled logout keeps a transparent fill and subdued red outline',logout.disabled && disabledLogout.backgroundColor==='rgba(0, 0, 0, 0)' && disabledLogout.color==='rgb(242, 90, 90)' && disabledLogout.borderTopColor===disabledLogout.color && disabledLogout.opacity==='0.5')
  update({websiteNavigation:{...state.websiteNavigation,status:'ready'}});await tick()
  check('transparent cards and inputs also stay transparent in dark theme',Array.from(document.querySelectorAll('.dsh-chat-settings-card')).every(el=>getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)') && Array.from(card().querySelectorAll('.dsh-chat-label-input,input')).every(el=>getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)'))
  check('dark theme dropdown keeps the native selector fill',getComputedStyle(styleTrigger).backgroundColor==='rgb(53, 54, 56)' && getComputedStyle(styleTrigger).borderTopStyle==='none')
  document.body.classList.remove('dark')
  const originalNavigation=state.websiteNavigation
  update({websiteNavigation:{...originalNavigation,authenticated:null,identityUnconfirmed:true,error:'暂未识别官网账号区域'}});await tick()
  const recognitionAlert=document.querySelector('.dsh-chat-account-settings>.dsh-chat-settings-error'),recognitionStyle=getComputedStyle(recognitionAlert)
  check('standalone unrecognized-account alert has no top divider or empty spacing',recognitionStyle.borderTopWidth==='0px' && recognitionStyle.paddingTop==='0px' && recognitionStyle.marginTop==='0px' && Boolean(recognitionAlert.querySelector('button')))
  recognitionAlert.querySelector('button').click()
  check('recognition retry keeps the existing snapshot command',commands.at(-1)?.type==='snapshot' && commands.at(-1)?.showOriginal===false)
  update({websiteNavigation:originalNavigation,websiteSessionError:'连接失败'});await tick()
  check('error below a visible account row retains its existing separator',parseFloat(getComputedStyle(document.querySelector('.dsh-chat-account-settings>.dsh-chat-settings-error')).borderTopWidth)>0)
  update({websiteSessionError:null});await tick()
  const nativeBrands=Array.from(document.querySelectorAll('[data-dsh-chat-brand-fill="brand"]'))
  flushSync(()=>root.unmount());for(const adapter of adapters.values())adapter.dispose()
  check('disposing layout restores native brand attributes',nativeBrands.length===3 && nativeBrands.every(el=>!el.hasAttribute('data-dsh-chat-brand-fill')))
  check('cleanup removes subscriptions',listeners.size===0)
 }catch(error){results.push({name:String(error.stack??error),passed:false})}
 document.querySelector('#results').textContent=JSON.stringify(results,null,2);return results
})()
