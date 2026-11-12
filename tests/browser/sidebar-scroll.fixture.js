import React from 'react'
import {createRoot} from 'react-dom/client'
import {flushSync} from 'react-dom'
import {DshChatChatNavigation} from '../../src/ui.tsx'
import {acquireChatStyles} from '../../src/styles.ts'

// Synthetic DSH 0.2.2-rc.2 SidebarRoot: the scrollArea grid carries the global
// panel list and the workspace row. Only production plugin CSS is exercised.
window.fixtureDone=(async()=>{
  const results=[]
  const check=(name,passed)=>results.push({name,passed:Boolean(passed)})
  const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve))
  const rows=Array.from({length:80},(_,i)=>({href:`https://chat.deepseek.com/a/chat/s${i}`,title:`Synthetic conversation ${i}`,group:'今天'}))
  const state={mode:'chat',modeEnabled:true,desktopAvailable:true,language:'zh-CN',websiteAuthenticationStatus:'signed-in',webLoading:false,
    websiteNavigation:{status:'ready',authenticated:true,conversations:rows,selectedHref:rows[0].href}}
  const listeners=new Set()
  const bridge={getSnapshot:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},commandWebsite:()=>{},refreshWebsiteNavigation:()=>{}}
  acquireChatStyles(document)
  document.documentElement.setAttribute('data-dsh-chat-mode','chat')
  const layout=document.createElement('style')
  layout.textContent=`
  #shell{--dsh-sidebar-inline-padding:8px;--dsh-sidebar-row-padding:12px;--dsh-sidebar-paint-inset:3px;--dsh-sidebar-label-gap:6px;width:280px;height:400px;padding:6px 8px;box-sizing:border-box;display:flex;flex-direction:column}
  .scroll-region{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}
  .scroll-area{flex:1;min-height:0;display:grid;grid-template-rows:8px max-content 2px max-content;grid-template-columns:4px minmax(0,1fr) calc(var(--dsh-sidebar-inline-padding) - 2px);margin-left:-4px;margin-right:calc(2px - var(--dsh-sidebar-inline-padding));overflow:hidden auto}
  .panel-list{grid-area:2/2;display:flex;flex-direction:column;gap:2px}
  .region-area{grid-area:4/2;display:flex;flex-direction:column;min-width:0;min-height:0}
  #chat{display:contents}`
  document.head.append(layout)
  document.body.innerHTML=`<div id="shell"><div class="scroll-region"><div id="scroll-area" class="scroll-area" data-sidebar-scrollport="">
  <nav id="panel-list" class="panel-list" aria-label="全局面板"><button>Plugins</button><button>Automation</button><button>More</button></nav>
  <div id="region-area" class="region-area"><div id="chat"></div></div>
  </div></div></div>`
  const root=createRoot(document.getElementById('chat'))
  flushSync(()=>root.render(React.createElement(DshChatChatNavigation,{bridge,wide:true,expandSidebar:()=>{}})))
  await tick()
  const nav=()=>document.querySelector('.dsh-chat-navigation')
  const area=()=>document.querySelector('.dsh-chat-navigation-list-area')
  const header=()=>document.querySelector('.dsh-chat-navigation-header')
  const scrollArea=()=>document.getElementById('scroll-area')
  const regionArea=()=>document.getElementById('region-area')
  check('the hidden panel row leaves the workspace row filling the sidebar',Math.abs(regionArea().getBoundingClientRect().height-scrollArea().getBoundingClientRect().height)<2)
  check('the chat title row sits above a scrollable conversation list',header()!==null && area()!==null && area().scrollHeight>area().clientHeight)
  check('scrolling the list keeps the title row fixed',(()=>{const top=header().getBoundingClientRect().top;area().scrollTop=120;return Math.abs(header().getBoundingClientRect().top-top)<0.6 && area().scrollTop>0})())
  const bar=area().offsetWidth-area().clientWidth
  check('the scrolling list reserves the native scrollbar gutter',bar>0 && getComputedStyle(area()).scrollbarGutter==='stable')
  check('the outer sidebar never scrolls in CHAT',scrollArea().scrollHeight<=scrollArea().clientHeight+1)
  return results
})()
