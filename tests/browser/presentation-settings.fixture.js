import React from 'react'
import {createRoot} from 'react-dom/client'
import {flushSync} from 'react-dom'
import {DshChatChatSettings,DshChatModeSelector,useDshChat} from '../../src/ui.tsx'
import {validSwitchLabel} from '../../src/preferences.ts'

// Production React/CSS with public primitive API stand-ins; no DSH, site or credentials.
window.fixtureDone=(async()=>{
 const results=[],writes=[],commands=[],listeners=new Set()
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
 const h=React.createElement
 function App(){const snapshot=useDshChat(bridge);return h(React.Fragment,null,h('div',{id:'settings'},h(DshChatChatSettings,{bridge,close:()=>{}})),h(DshChatModeSelector,{bridge,state:snapshot}))}
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
  const external=document.querySelector('.dsh-chat-settings-external')
  check('website link precedes logout and carries no private or conversation data',external?.getAttribute('href')==='https://chat.deepseek.com/' && external.target==='_blank' && external.rel==='noopener noreferrer' && external.nextElementSibling?.classList.contains('dsh-chat-settings-logout'))
  check('card spacing and stroke use the official account-page values',getComputedStyle(document.querySelector('.dsh-chat-settings')).paddingTop==='8px' && Array.from(document.querySelectorAll('.dsh-chat-settings-card')).every(el=>{const css=getComputedStyle(el);return css.paddingTop==='12px' && css.paddingLeft==='16px' && css.marginBottom==='16px' && css.borderTopColor==='rgb(153, 153, 153)'}))
  check('both settings cards are transparent and retain their borders',Array.from(document.querySelectorAll('.dsh-chat-settings-card')).length===2 && Array.from(document.querySelectorAll('.dsh-chat-settings-card')).every(el=>{const css=getComputedStyle(el);return css.backgroundColor==='rgba(0, 0, 0, 0)' && css.borderTopWidth==='1px' && css.borderTopStyle==='solid'}))
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
  check('pending save disables inputs and duplicate submission',save().disabled && input('chatLabel').disabled && writes.length===count)
  release();hold=null;await tick();await tick()
  check('pending save settles to clean disabled state',state.switchPreferences.chatLabel==='WAIT' && save().disabled)
  update({language:'en'});await tick()
  check('English accessible names and save label use locale',input('chatLabel').getAttribute('aria-label')==='CHAT button label' && save().textContent==='Save')
  document.querySelector('#settings').style.width='240px';await tick()
  check('narrow layout keeps inputs and save within card',Array.from(card().querySelectorAll('input,.dsh-chat-label-save,.dsh-chat-style-trigger')).every(el=>el.getBoundingClientRect().right<=card().getBoundingClientRect().right+1))
  check('UI editing never changes website or canonical mode',commands.length===0 && state.mode==='harness')
  flushSync(()=>root.unmount());check('cleanup removes subscriptions',listeners.size===0)
 }catch(error){results.push({name:String(error.stack??error),passed:false})}
 document.querySelector('#results').textContent=JSON.stringify(results,null,2);return results
})()
