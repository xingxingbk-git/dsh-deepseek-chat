/** Collapse only the verified website navigation via its own public control.
 * Keep React's sidebar nodes for list/account projection; no store mutation. */
export function collapseWebsiteSidebar(doc: Document, track: HTMLElement): boolean {
  const attempt='data-dsh-chat-native-collapse-attempt'
  if(doc.defaultView?.location.origin!=='https://chat.deepseek.com' || doc.documentElement.hasAttribute(attempt)
    || !track.hasAttribute('data-dsh-chat-navigation') || !track.querySelector('[data-dsh-chat-profile-confirmed]')) return false
  const sheet=(doc.getElementById('dsh-chat-website-navigation-style') as HTMLStyleElement|null)?.sheet
  const originalStyle=track.getAttribute('style');const disabled=sheet?.disabled
  try {
    track.style.setProperty('visibility','hidden','important');track.style.setProperty('pointer-events','none','important')
    if(sheet)sheet.disabled=true
    const bounds=track.getBoundingClientRect()
    if(bounds.width<160 || bounds.width>480 || bounds.left < -1 || bounds.left>16) return false
    let controls=[...track.querySelectorAll<HTMLElement>('button,[role="button"],.ds-icon-button,.ds-button')].filter(el=>{
      const r=el.getBoundingClientRect()
      return r.top>=0 && r.top<=72 && r.width>=12 && r.width<=56 && r.height>=12 && r.height<=56
        && (!el.textContent?.trim() || /^(收起侧边栏|关闭侧边栏|搜索|搜索对话|Collapse sidebar|Close sidebar|Hide sidebar|Search)$/i.test(el.textContent.trim())) && !!el.querySelector('svg') && !el.matches(':disabled,[aria-disabled="true"]')
    }).filter(el=>![...track.querySelectorAll('button,[role="button"],.ds-icon-button,.ds-button')].some(other=>other!==el && el.contains(other)))
    if(controls.length===0){
      const candidates:HTMLElement[]=[]
      for(const svg of track.querySelectorAll('svg')){
        let el=svg.parentElement
        for(let depth=0;el&&el!==track&&depth<4;depth++,el=el.parentElement){
          const r=el.getBoundingClientRect()
          if(r.top>=0 && r.top<=72 && r.left>=bounds.right-100 && r.right<=bounds.right+1 && r.width>=12 && r.width<=56 && r.height>=12 && r.height<=56
            && !el.textContent?.trim() && !el.querySelector('input,a[href]')) candidates.push(el)
        }
      }
      controls=[...new Set(candidates)].filter(el=>!candidates.some(other=>other!==el&&other.contains(el)))
    }
    const named=controls.filter(el=>/^(收起侧边栏|关闭侧边栏|Collapse sidebar|Close sidebar|Hide sidebar)$/i.test(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent?.trim()||''))
    let button=named.length===1?named[0]:undefined
    if(!button && controls.length===2){
      const ordered=controls.sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left)
      let header=ordered[1]!.parentElement
      for(let depth=0;header&&header!==track&&depth<4;depth++,header=header.parentElement){
        const r=header.getBoundingClientRect()
        if(header.contains(ordered[0]!) && r.top>=0 && r.top<=32 && r.height<=80 && header.querySelector('svg,img')){button=ordered[1];break}
      }
    }
    if(!button) return false
    // One native toggle per document. If a future site version unmounts its
    // navigation, the existing recovery path may reopen it without a loop.
    doc.documentElement.setAttribute(attempt,'true');button.click();return true
  } finally {
    if(sheet && disabled!==undefined)sheet.disabled=disabled
    if(originalStyle===null)track.removeAttribute('style');else track.setAttribute('style',originalStyle)
  }
}
