/** Project only a matching host content clip onto our retained body portal.
 * No platform names, private classes, guest access or host DOM writes.
 */
export function readSurfaceBorderRadius(element: HTMLElement): string {
  const doc=element.ownerDocument, view=doc.defaultView
  if (!view) return '0px'
  const rect=element.getBoundingClientRect()
  if (!(rect.width>0 && rect.height>0)) return '0px'
  const near=(a:number,b:number)=>Math.abs(a-b)<.75
  let parent=element.parentElement
  // Body/window corners are not the main content clip. Restrict discovery to
  // the own main slot's bounded ancestor path and an equivalent border box.
  for(let depth=0;parent && parent!==doc.body && parent!==doc.documentElement && depth<12;depth++,parent=parent.parentElement) {
    const bounds=parent.getBoundingClientRect()
    if (!near(bounds.left,rect.left) || !near(bounds.top,rect.top) || !near(bounds.right,rect.right) || !near(bounds.bottom,rect.bottom)) continue
    const css=view.getComputedStyle(parent)
    if (![css.overflowX,css.overflowY].every(value=>/^(hidden|clip|auto|scroll)$/.test(value))) continue
    const radius=css.borderRadius.trim()
    // Computed radii only: do not accept URLs, expressions or arbitrary CSS.
    if(radius.length>160 || !/^(?:\d+(?:\.\d+)?(?:px|%)\s*){1,4}(?:\/\s*(?:\d+(?:\.\d+)?(?:px|%)\s*){1,4})?$/.test(radius)) continue
    if(radius.split(/[\s/]+/).some(value=>parseFloat(value)>0)) return radius
  }
  return '0px'
}
