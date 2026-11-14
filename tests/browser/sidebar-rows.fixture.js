import React from 'react'
import {createRoot} from 'react-dom/client'
import {flushSync} from 'react-dom'
import {DshChatChatNavigation,DshChatNewSessionAction} from '../../src/ui.tsx'

// Production React/CSS, synthetic navigation, and API-only Menu stand-in.
// Native reference geometry is frozen from DSH Desktop 0.2.2-rc.1 WorkspaceBrowser/SessionRow.
const results = [], listeners = new Set(), commands = []
const check = (name, passed) => results.push({name, passed: Boolean(passed)})
const tick = () => new Promise(resolve => requestAnimationFrame(resolve))
const $ = selector => document.querySelector(selector)
const css = element => getComputedStyle(element)
const rect = element => element.getBoundingClientRect()
const near = (a, b) => Math.abs(a - b) < 0.6
const transparent = value => value === 'rgba(0, 0, 0, 0)'
const rows = [{href:'https://chat.deepseek.com/a/chat/synthetic', title:'Synthetic conversation '.repeat(30), group:'今天'},{href:'https://chat.deepseek.com/a/chat/synthetic-2', title:'Second synthetic conversation', group:'今天'}]
let state = {
  mode:'chat', modeEnabled:true, desktopAvailable:true, language:'zh-CN',
  websiteAuthenticationStatus:'signed-in', webLoading:false,
  websiteNavigation:{status:'ready', authenticated:true, conversations:rows, selectedHref:rows[0].href},
}
const bridge = {
  getSnapshot:()=>state,
  subscribe:fn=>{listeners.add(fn);return ()=>listeners.delete(fn)},
  commandWebsite:command=>commands.push(command),
  refreshWebsiteNavigation:()=>{},
}
const update = patch => {state={...state,...patch};flushSync(()=>listeners.forEach(fn=>fn()))}
const root = createRoot($('#chat'))
const render = wide => flushSync(()=>root.render(React.createElement(DshChatChatNavigation,{bridge,wide,expandSidebar:()=>{}})))
render(true)
const item = () => $('.dsh-chat-conversation-item')
const more = () => $('.dsh-chat-conversation-more')
const paint = element => {
  const r=rect(element), s=css(element)
  return {left:r.left+parseFloat(s.borderLeftWidth), right:r.right-parseFloat(s.borderRightWidth)}
}
const compare = () => {
  const own=paint(item()), native=paint($('#native-row'))
  const ownHost=rect($('#chat-shell')), nativeHost=rect($('#native-shell'))
  return near(own.left-ownHost.left,native.left-nativeHost.left) && near(own.right-ownHost.left,native.right-nativeHost.left)
}
const scrollbar = element => {
  const r=rect(element)
  // Includes the stable reserved gutter. CSS forces a 5px WebKit scrollbar in this fixture.
  return {left:r.right-(element.offsetWidth-element.clientWidth),right:r.right,top:r.top,bottom:r.bottom}
}
const compareScrollbar = () => {
  const own=scrollbar($('.dsh-chat-navigation-list-area')), native=scrollbar($('#native-list-area'))
  const ownHost=rect($('#chat-shell')), nativeHost=rect($('#native-shell'))
  return near(own.left-ownHost.left,native.left-nativeHost.left) && near(own.right-ownHost.left,native.right-nativeHost.left)
    && near(own.top-ownHost.top,native.top-nativeHost.top) && near(own.bottom-ownHost.top,native.bottom-nativeHost.top)
}
const measurements=[]
window.fixtureReady = tick()
window.testBaseline = async () => {
  check('production navigation renders a selected long-title conversation',Boolean(item()?.hasAttribute('data-selected')))
  check('default list paint edges match native session rows',compare())
  const secondItem=$('.dsh-chat-conversation-item+.dsh-chat-conversation-item'), secondNative=$('#native-row2')
  check('rows keep the native 2px vertical gap',secondItem!==null && secondNative!==null && css(secondItem).marginTop===css(secondNative).marginTop)
  check('row height matches the native 32px session row',near(rect(item()).height,rect($('#native-row')).height))
  const groupTitle=$('.dsh-chat-conversation-group h3')
  check('conversation groups keep their own title spacing',groupTitle!==null && css(groupTitle).marginTop==='15px' && css(groupTitle).marginBottom==='4px')

  const hocHost=document.createElement('div');document.body.append(hocHost)
  const hocRoot=createRoot(hocHost)
  let hocNative=0
  const renderHoc=()=>flushSync(()=>hocRoot.render(React.createElement(DshChatNewSessionAction,{bridge,children:React.createElement('button',{id:'hoc-new',onClick:()=>{hocNative++}},'New session')})))
  renderHoc()
  document.getElementById('hoc-new').click()
  check('CHAT consumes the official new-session HOC action',commands.at(-1)?.type==='new' && hocNative===0)
  update({mode:'harness'});renderHoc()
  document.getElementById('hoc-new').click()
  check('HARNESS passes the official new-session HOC action through',hocNative===1 && commands.at(-1)?.type==='new')
  update({mode:'chat'});renderHoc()
  hocRoot.unmount();hocHost.remove()
  check('selected row excludes transparent paint insets',css(item()).backgroundClip==='padding-box' && css(item()).borderLeftColor==='rgba(0, 0, 0, 0)' && css(item()).borderLeftWidth==='3px')
  check('selected row uses the same fill and radius as HARNESS',css(item()).backgroundColor===css($('#native-row')).backgroundColor && css(item()).borderRadius===css($('#native-row')).borderRadius)
  const search=$('.dsh-chat-search-button'),refresh=$('.dsh-chat-search-actions .dsh-chat-icon-button')
  check('search and refresh share the theme small radius',css(search).borderRadius==='8px' && css(refresh).borderRadius===css(search).borderRadius)
  document.documentElement.style.setProperty('--dsw-radius-sm','10px')
  check('both header buttons follow the same radius token dynamically',css(search).borderRadius==='10px' && css(refresh).borderRadius===css(search).borderRadius)
  document.documentElement.style.removeProperty('--dsw-radius-sm')
  check('more action retains its separate native extra-small radius',css(more()).borderRadius==='4px')
  check('root right inset matches native root',css($('.dsh-chat-navigation')).paddingRight===css($('#native-root')).paddingRight)
  check('list preserves native stable gutter and external scrollbar gap',css($('.dsh-chat-navigation-list-area')).scrollbarGutter===css($('#native-list-area')).scrollbarGutter && css($('.dsh-chat-navigation-list-area')).marginRight===css($('#native-list-area')).marginRight)
  for (const width of [192,280,420]) {
    document.querySelectorAll('.shell').forEach(el=>el.style.width=`${width}px`)
    await tick()
    check(`paint edges still match native at width ${width}`,compare())
    check(`scrollbar horizontal and vertical bounds match native at width ${width}`,compareScrollbar())
    measurements.push({width,chatPaint:paint(item()),nativePaint:paint($('#native-row')),chatScrollbar:scrollbar($('.dsh-chat-navigation-list-area')),nativeScrollbar:scrollbar($('#native-list-area'))})
    check(`long titles do not cause horizontal scrolling at width ${width}`,$('.dsh-chat-navigation-list-area').scrollWidth <= $('.dsh-chat-navigation-list-area').clientWidth)
    check(`more button stays inside row paint at width ${width}`,rect(more()).right<=paint(item()).right && rect(more()).left>=paint(item()).left)
  }
  for (const inset of [12,16]) {
    document.querySelectorAll('.shell').forEach(el=>el.style.setProperty('--dsh-sidebar-inline-padding',`${inset}px`))
    await tick()
    check(`geometry follows shared sidebar inset ${inset}`,compare())
    check(`scrollbar follows shared sidebar inset ${inset}`,compareScrollbar())
  }
  document.querySelectorAll('.shell').forEach(el=>{el.style.width='280px';el.style.removeProperty('--dsh-sidebar-inline-padding')})
  await tick()
  check('resting more action uses native tertiary colour and no background',css(more()).color===css($('#native-more')).color && transparent(css(more()).backgroundColor))
  check('more action retains the native 24px hit target',near(rect(more()).width,24) && near(rect(more()).height,24))
}
window.testHover = async () => {
  check('hover changes only the more icon colour to native primary',css(more()).color===css($('#native-more')).color && css(more()).color===css(item()).color)
  check('more hover never paints a button background',transparent(css(more()).backgroundColor) && transparent(css($('#native-more')).backgroundColor))
  check('row hover paint stays clipped to the same native edges',compare() && css(item()).backgroundClip==='padding-box')
  update({websiteNavigation:{...state.websiteNavigation,selectedHref:null}})
  await tick()
  check('unselected hovered row still shows its more action',css(more()).opacity==='1')
  check('unselected hover fill matches selected/native row fill',css(item()).backgroundColor===css($('#native-row')).backgroundColor)
}
window.testFocusAndMenu = async () => {
  more().focus(); await tick()
  check('keyboard more focus keeps an inset visible outline',document.activeElement===more() && css(more()).outlineStyle==='solid' && parseFloat(css(more()).outlineWidth)>0 && css(more()).outlineOffset==='-2px')
  flushSync(()=>more().click()); await tick()
  check('more still opens its menu and keeps row highlighted',more().getAttribute('aria-expanded')==='true' && item().hasAttribute('data-menu-open') && !transparent(css(item()).backgroundColor))
  check('menu-open more action keeps transparent background',transparent(css(more()).backgroundColor))
  flushSync(()=>$('[data-menu-id="pin"]').click()); await tick()
  check('menu operation still routes to the same website command',commands.at(-1)?.type==='conversation-action' && commands.at(-1)?.action==='pin' && commands.at(-1)?.href===rows[0].href)
  check('menu closes after choosing an action',more().getAttribute('aria-expanded')==='false' && !item().hasAttribute('data-menu-open'))
  flushSync(()=>$('.dsh-chat-conversation-row').click())
  check('conversation selection still uses the website open command',commands.at(-1)?.type==='open' && commands.at(-1)?.href===rows[0].href)
}
window.testOtherStates = async () => {
  update({websiteNavigation:{...state.websiteNavigation,selectedHref:rows[0].href}})
  document.documentElement.setAttribute('data-theme','light');await tick()
  check('light theme keeps native row paint and transparent more background',compare() && css(item()).backgroundColor===css($('#native-row')).backgroundColor && transparent(css(more()).backgroundColor))
  document.documentElement.setAttribute('data-windows-titlebar','');await tick()
  check('Windows-titlebar geometry uses the same list alignment',compare())
  update({webLoading:true});await tick()
  check('disabled more remains disabled without a background block',more().disabled && transparent(css(more()).backgroundColor))
  update({webLoading:false});render(false);await tick()
  check('collapsed rail does not retain the wide list right inset',css($('.dsh-chat-navigation-rail')).paddingRight==='0px' && !$('.dsh-chat-navigation-list'))
  render(true);await tick()
  check('expanding the rail restores native list alignment',compare())
  const filler=document.createElement('div');filler.style.height='1600px';$('#native-list').append(filler)
  update({websiteNavigation:{...state.websiteNavigation,conversations:Array.from({length:60},(_,i)=>({...rows[0],href:`https://chat.deepseek.com/a/chat/synthetic-${i}`}))}})
  await tick()
  check('overflow scenario really has scrollable content on both sides',$('.dsh-chat-navigation-list-area').scrollHeight>$('.dsh-chat-navigation-list-area').clientHeight && $('#native-list-area').scrollHeight>$('#native-list-area').clientHeight)
  check('visible overflow scrollbars keep matching boundaries',compareScrollbar())
  check('overflow content keeps native row width',compare())
  $('.dsh-chat-navigation-list-area').scrollTop=150;$('#native-list-area').scrollTop=150;await tick()
  check('scrolling changes neither row width nor scrollbar placement',compare() && compareScrollbar())
  root.unmount()
  check('navigation unmount cleans subscriptions',listeners.size===0)
  return {results,measurements,limits:'Production React/CSS against synthetic DSH 0.2.2-rc.2 geometry; Menu API stand-in; no user content, live DSH or native compositor.'}
}
