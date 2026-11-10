import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { DshChatBrandControl, DshChatChatSettings } from '../../src/ui.tsx'

// Production React/CSS with fictional state and native primitive API stand-ins.
window.fixtureDone = (async () => {
  const results = [], measurements = []
  const check = (name, passed) => results.push({name, passed:!!passed})
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
  const listeners = new Set()
  let retries = 0
  let state = {
    mode:'harness', modeEnabled:true, desktopAvailable:true, authorizationStatus:'authorized', availabilityMessage:'', error:null,
    language:'zh-CN', sidebarAdapted:true, switchPreferencesStatus:'ready', websiteAuthenticationStatus:'signed-in', websiteSessionStatus:'saved',
    websiteNavigation:{status:'ready', authenticated:true, accountName:'Fictional account', conversations:[]},
    switchPreferences:{switchStyle:'icon', chatLabel:'CHAT', harnessLabel:'HARNESS', brandNoticeDismissed:false},
  }
  const bridge = {
    getSnapshot:()=>state,
    subscribe:listener=>{listeners.add(listener);return ()=>listeners.delete(listener)},
    selectMode:()=>{}, refreshAuthorization:()=>{retries++}, setSettingsOpen:()=>{},
    setSwitchPreference: async (field,value) => {
      if(field!=='brandNoticeDismissed') return false
      preferenceWrites.push(value)
      update({switchPreferences:{...state.switchPreferences, brandNoticeDismissed:value}})
      return true
    },
  }
  const preferenceWrites=[]
  const update = patch => {state={...state,...patch};flushSync(()=>listeners.forEach(fn=>fn()))}
  const root = createRoot(document.querySelector('#control'))
  flushSync(()=>root.render(React.createElement(DshChatBrandControl,{bridge})))
  await frame();await frame()
  const rect = el => {const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}}
  const row=document.querySelector('.native-logo-row')
  const control=document.querySelector('#control .dsh-chat-brand-control')
  const notices=()=>[...document.querySelectorAll('.dsh-chat-authorization-notice')]
  const serviceError='无法连接 CHAT 登录保存服务，请重试连接。'
  check('HARNESS default icon mode creates no notice or tooltip DOM',notices().length===0 && !document.querySelector('[role="tooltip"]'))
  check('mode buttons use native title attributes, not primitive Tooltip',document.querySelectorAll('.dsh-chat-modes button[title]').length===2 && (window.nativeTooltipCalls??0)===0)
  check('synthetic logo row retains its original clipped seat',rect(row).height===60 && getComputedStyle(row).overflow==='hidden')
  check('mode control stays inside the clipped logo row',row.contains(control))

  update({error:serviceError});await frame();await frame()
  check('session-service connection failure creates no brand notice',notices().length===0)
  check('brand contains neither service error text nor retry button',!control.textContent.includes(serviceError) && !control.querySelector('.dsh-chat-text-button'))
  check('service failure does not disable mode controls',Array.from(control.querySelectorAll('.dsh-chat-modes button')).every(button=>!button.disabled))
  update({mode:'chat'});await frame()
  check('CHAT mode also suppresses the service-error popup',notices().length===0)
  update({error:'CHAT 登录保存服务连接超时，请检查网络后重试。'});await frame()
  check('timeout errors also stay out of the brand area',notices().length===0)

  update({error:serviceError})
  const settingsHost=document.createElement('div');document.body.append(settingsHost)
  const settings=createRoot(settingsHost)
  flushSync(()=>settings.render(React.createElement(DshChatChatSettings,{bridge,close:()=>{}})))
  check('Chat settings still displays the session-service error',settingsHost.querySelector('.dsh-chat-settings-error')?.textContent.includes(serviceError))
  const retry=Array.from(settingsHost.querySelectorAll('button')).find(button=>button.textContent==='重试连接')
  check('Chat settings retains the enabled retry action',retry && !retry.disabled)
  flushSync(()=>retry?.click())
  check('settings retry still calls the existing authorization method',retries===1)
  check('settings keeps showing the independent signed-in website account',settingsHost.querySelector('.dsh-chat-settings-account')?.textContent.includes('Fictional account'))
  flushSync(()=>settings.unmount());settingsHost.remove()
  check('closing settings does not create a brand popup',notices().length===0)

  update({sidebarAdapted:false});await frame();await frame()
  const notice=notices()[0],box=rect(notice),style=getComputedStyle(notice)
  measurements.push({box,clip:rect(row),position:style.position,background:style.backgroundColor})
  check('independent sidebar incompatibility still produces one notice',notices().length===1 && notice.getAttribute('role')==='status')
  check('compatibility notice is dismissible and free of service-error actions',notice.querySelectorAll('p').length===1 && !notice.textContent.includes(serviceError) && notice.querySelectorAll('button').length===1 && notice.querySelector('button').getAttribute('aria-label')==='不再提示')
  check('compatibility notice escapes the clipped logo row',notice.parentElement===document.body && !row.contains(notice))
  check('compatibility notice retains width and radius',Math.abs(box.width-230)<.1 && style.borderRadius==='8px')
  check('compatibility notice is fixed below its anchor',style.position==='fixed' && Math.abs(box.top-(rect(control).bottom+6))<=1)
  check('compatibility text is not clipped to a black strip',box.height>60 && box.bottom>rect(row).bottom && rect(notice.querySelector('p')).bottom<=box.bottom)
  check('notice is hit-testable outside the logo row',document.elementFromPoint(box.left+10,box.bottom-8)?.closest('.dsh-chat-authorization-notice')===notice)
  check('dark compatibility notice follows theme tokens',style.backgroundColor==='rgb(32, 33, 36)')
  document.body.classList.add('light')
  check('compatibility notice follows light theme tokens',getComputedStyle(notice).backgroundColor==='rgb(244, 245, 248)')
  document.body.classList.remove('light')
  update({error:null});await frame()
  check('clearing service error leaves the independent compatibility warning',notices().length===1)
  // Dismissal persists through the preference channel and hides it for good.
  flushSync(()=>notice.querySelector('button').click())
  await frame();await frame()
  check('closing the compatibility notice records the dismissal',preferenceWrites.includes(true) && notices().length===0)
  update({sidebarAdapted:true});await frame()
  update({sidebarAdapted:false});await frame();await frame()
  check('a dismissed notice does not reappear on the next failure',notices().length===0)
  const settingsHost2=document.createElement('div');document.body.append(settingsHost2)
  const settings2=createRoot(settingsHost2)
  flushSync(()=>settings2.render(React.createElement(DshChatChatSettings,{bridge,close:()=>{}})))
  await frame()
  const restore=Array.from(settingsHost2.querySelectorAll('button')).find(button=>button.textContent==='重新显示提示')
  check('Chat settings offers to restore the dismissed notice',Boolean(restore))
  flushSync(()=>restore?.click())
  await frame();await frame()
  check('restoring re-enables the compatibility notice',preferenceWrites.includes(false) && notices().length===1)
  flushSync(()=>settings2.unmount());settingsHost2.remove()
  update({sidebarAdapted:true,error:serviceError});await frame();await frame()
  check('restored compatibility removes popup even while service error persists',notices().length===0)
  check('native new-session button and mode controls stay mounted',document.querySelector('#native-new-session') && document.querySelectorAll('.dsh-chat-modes button').length===2)
  flushSync(()=>root.unmount());await frame()
  check('cleanup releases all subscriptions and portal nodes',listeners.size===0 && notices().length===0)
  return {results,measurements,limits:'Production React/CSS with synthetic state and public primitive API stand-ins; no native DSH window or live login service.'}
})()
