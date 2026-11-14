import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { DshChatBrandControl, DshChatChatSettings, DshChatCompatibilityToast } from '../../src/ui.tsx'

// Production React/CSS with fictional state and native primitive API stand-ins.
window.fixtureDone = (async () => {
  const results = []
  const check = (name, passed) => results.push({name, passed:!!passed})
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
  const listeners = new Set()
  let retries = 0
  let state = {
    mode:'harness', modeEnabled:true, desktopAvailable:true, authorizationStatus:'authorized', availabilityMessage:'', error:null,
    language:'zh-CN', sidebarAdapted:true, switchPreferencesStatus:'ready', websiteAuthenticationStatus:'signed-in', websiteSessionStatus:'saved',
    websiteNavigation:{status:'ready', authenticated:true, accountName:'Fictional account', conversations:[]},
    switchPreferences:{switchStyle:'icon', chatLabel:'CHAT', harnessLabel:'HARNESS'},
  }
  const bridge = {
    getSnapshot:()=>state,
    subscribe:listener=>{listeners.add(listener);return ()=>listeners.delete(listener)},
    selectMode:()=>{}, refreshAuthorization:()=>{retries++}, setSettingsOpen:()=>{},
    setSwitchPreference: async () => false,
  }
  const update = patch => {state={...state,...patch};flushSync(()=>listeners.forEach(fn=>fn()))}
  const root = createRoot(document.querySelector('#control'))
  flushSync(()=>root.render(React.createElement(DshChatBrandControl,{bridge})))
  await frame();await frame()
  const control=document.querySelector('#control .dsh-chat-brand-control')
  const notices=()=>[...document.querySelectorAll('.dsh-chat-authorization-notice,.dsh-chat-brand-notice')]
  const serviceError='无法连接 CHAT 登录保存服务，请重试连接。'
  check('HARNESS default icon mode creates no brand notice DOM',notices().length===0 && !document.querySelector('[role="tooltip"]'))
  check('mode buttons use native title attributes, not primitive Tooltip',document.querySelectorAll('.dsh-chat-modes button[title]').length===2 && (window.nativeTooltipCalls??0)===0)
  check('synthetic logo row retains its original clipped seat',getComputedStyle(document.querySelector('.native-logo-row')).overflow==='hidden')
  check('mode control stays inside the clipped logo row',document.querySelector('.native-logo-row').contains(control))
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

  // System-level compatibility banner (DSH Toast), one per load.
  const toastHost=document.createElement('div');document.body.append(toastHost)
  let toastRoot=null
  const mountToast=()=>{toastRoot=createRoot(toastHost);flushSync(()=>toastRoot.render(React.createElement(DshChatCompatibilityToast,{bridge})));return toastRoot}
  const banners=()=>[...document.querySelectorAll('[data-toast]')]
  update({sidebarAdapted:true});mountToast();await frame();await frame()
  check('compatible sidebar renders no system banner',banners().length===0)
  update({sidebarAdapted:false});await frame();await frame()
  check('incompatible sidebar renders exactly one system banner',banners().length===1)
  check('the banner carries the unified compatibility copy',banners()[0].textContent.includes('「DeepSeek Chat」插件与当前DSH版本不兼容，建议更新插件或DSH版本'))
  check('the banner uses the warning icon, not the success check',Boolean(banners()[0].querySelector('[data-icon="IconWarningOutlineRegular"]')))
  check('the banner holds six seconds and offers no close/action control',banners()[0].getAttribute('data-hold')==='6000' && banners()[0].querySelectorAll('button').length===0)
  update({mode:'chat'});await frame();await frame()
  check('the banner does not repeat while the sidebar stays incompatible',banners().length===1)
  flushSync(()=>window.__dshToastOnDone?.())
  await frame();await frame()
  check('the banner unmounts when its hold completes',banners().length===0)
  update({sidebarAdapted:true});await frame()
  update({sidebarAdapted:false});await frame();await frame()
  check('a later incompatibility in the same load does not prompt again',banners().length===0)
  flushSync(()=>toastRoot?.unmount())
  update({sidebarAdapted:false});mountToast();await frame();await frame()
  check('a fresh plugin load prompts again',banners().length===1)
  flushSync(()=>toastRoot?.unmount());toastHost.remove()
  flushSync(()=>root.unmount());await frame()
  check('cleanup releases all subscriptions and portal nodes',listeners.size===0 && banners().length===0 && notices().length===0 && Boolean(document.querySelector('#native-new-session')))
  return {results,limits:'Production React/CSS with synthetic state and primitive API stand-ins; no native DSH window or live login service.'}
})()
