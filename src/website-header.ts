/** Adapt only the public conversation title/share row. No message or input value is read. */
export function adaptWebsiteHeader(doc: Document, content: HTMLElement | undefined, title: string | null, inset: number) {
  const rowMarker = 'data-dsh-chat-header-row'
  const titleMarker = 'data-dsh-chat-header-title'
  const shareMarker = 'data-dsh-chat-header-share'
  const hostMarker = 'data-dsh-chat-header-title-host'
  const editorMarker = 'data-dsh-chat-header-editor'
  const depthMarker = 'data-dsh-chat-header-native-depth'
  const markers = [rowMarker, titleMarker, shareMarker, hostMarker, editorMarker]
  const editors = 'input:not([type]),input[type="text"],[contenteditable="true"],[contenteditable="plaintext-only"]'
  const clearMarkers = () => {
    for (const marker of markers) doc.querySelectorAll(`[${marker}]`).forEach(el => el.removeAttribute(marker))
  }
  if (!content) { clearMarkers(); return }
  const inTopRow = (el: HTMLElement, maxHeight = 80) => {
    const r = el.getBoundingClientRect()
    return content.contains(el) && r.top >= 0 && r.top <= 48 && r.width > 0 && r.height > 0 && r.height <= maxHeight
      && !el.closest('[hidden],[aria-hidden="true"],[role="dialog"],.ds-modal-content')
  }
  const findEditor = (row: HTMLElement) => {
    // The confirmed top row is the boundary. Never search inputs in the
    // composer, sign-in page, navigation, or settings; never read their values.
    const candidates = [...row.querySelectorAll<HTMLElement>(editors)].filter(el => inTopRow(el, 48)
      && !el.closest('[role="search"],[data-dsh-chat-navigation],[data-dsh-chat-web-chrome]')
      && !/search|搜索/i.test(el.getAttribute('aria-label') ?? ''))
    const focused = candidates.find(el => el === doc.activeElement || (doc.activeElement && el.contains(doc.activeElement)))
    return focused ?? (candidates.length === 1 ? candidates[0] : undefined)
  }
  const findShare = (row: HTMLElement) => {
    const r = row.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()
    const buttons = [...row.querySelectorAll<HTMLElement>('button,[role="button"]')]
    return buttons.find(el => /^(Share|分享|Share chat|分享对话)$/i.test(el.getAttribute('aria-label') ?? el.getAttribute('title') ?? ''))
      ?? buttons.find(el => {
        const b = el.getBoundingClientRect()
        return !el.textContent?.trim() && !!el.querySelector('svg') && b.width >= 20 && b.width <= 56
          && b.height >= 20 && b.height <= 56 && b.top >= 0 && b.top <= 60
          && r.width >= contentRect.width * 0.6 && b.right >= contentRect.right - 72
          && !el.closest('[data-dsh-chat-web-chrome]')
      })
  }
  // The public website keeps this same branch while history is fetching:
  // title -> skeleton -> title/input; its share button may temporarily be absent.
  // Confirm the real bounded row once, then retain its direct depth in the main
  // content. CSS will apply to replacement nodes before any observer/poll runs.
  const nativeRows = [...content.querySelectorAll<HTMLElement>('._2be88ba')].filter(candidate =>
    inTopRow(candidate) && candidate.getBoundingClientRect().width >= content.getBoundingClientRect().width * .6
    && !!candidate.querySelector(':scope > .the-header > ._9fcbeda') && !candidate.querySelector('textarea,pre,code'))
  const nativeRow = nativeRows.length === 1 ? nativeRows[0] : undefined
  // The same row also contains a hidden mobile .the-header. Keep it hidden:
  // only the desktop branch directly owning the editable title is adapted.
  const nativeHeader = nativeRow?.querySelector<HTMLElement>(':scope > .the-header:has(> ._9fcbeda)')
  if (nativeRow) {
    let ancestor: HTMLElement | null = nativeRow
    let depth = 0
    while (ancestor && ancestor !== content && depth < 12) { ancestor = ancestor.parentElement; depth++ }
    if (ancestor === content && depth >= 1) doc.documentElement.setAttribute(depthMarker, String(depth))
  }
  const installStyle = () => {
    const left = Math.max(24, Math.min(320, Math.ceil(inset)))
    doc.documentElement.style.setProperty('--dsh-chat-title-inset', `${left}px`)
    const scope = 'html:not([data-dsh-chat-settings-view])'
    const depth = Number(doc.documentElement.getAttribute(depthMarker))
    const nativeRowSelector = Number.isInteger(depth) && depth >= 1 && depth <= 12
      ? `[data-dsh-chat-content]${' > *'.repeat(depth - 1)} > ._2be88ba:has(> .the-header > ._9fcbeda):not([role="dialog"],[role="dialog"] *,.ds-modal-content,.ds-modal-content *)` : null
    const withNative = (marker: string, branch: string) => `${scope} :is([${marker}]${nativeRowSelector ? `,${nativeRowSelector}${branch}` : ''})`
    const rowSelector = withNative(rowMarker, '')
    const hostSelector = withNative(hostMarker, ' > .the-header:has(> ._9fcbeda)')
    const labelSelector = withNative(titleMarker, ' > .the-header > ._9fcbeda > .afa34042')
    const shareSelector = withNative(shareMarker, ' > ._57370c5')
    const editorSelector = `${scope} [${editorMarker}],${hostSelector} :is(${editors})`
    // Native left/transform transitions can outrank even important target
    // positions while active. Lock only the verified title host, including its
    // replacement branch; leave skeleton, share and unrelated animations alone.
    // Text uses a 20px line box centered in the 48px row. An editor has a
    // matching content box: 28px minus two 1px borders and two 3px paddings.
    // Its outside edge extends 9px left, so the text keeps the display inset.
    // Set font properties separately: inheriting the host's shorthand would
    // also inherit its 48px display line height when the host is the title.
    const styleText = `
      ${nativeRowSelector ? `${scope} ${nativeRowSelector} > ._1aa2651.the-header{display:none!important}` : ''}
      ${rowSelector}{position:relative!important;box-sizing:border-box!important;height:48px!important;min-height:48px!important;max-height:48px!important;flex-shrink:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}
      ${hostSelector}{position:fixed!important;top:0!important;right:auto!important;bottom:auto!important;left:var(--dsh-chat-title-inset,24px)!important;box-sizing:border-box!important;height:48px!important;min-height:0!important;max-height:48px!important;width:auto!important;max-width:calc(100% - var(--dsh-chat-title-inset,24px) - 64px)!important;min-width:0!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:20px!important;flex:none!important;text-align:left!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;outline:0!important;box-shadow:none!important;transform:none!important;transition:none!important;white-space:nowrap!important;z-index:10!important}
      ${hostSelector} :is(div,span,label):not([contenteditable],.ds-skeleton,.ds-skeleton *,.ds-input__mirror,.ds-input__mirror *){position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;box-sizing:border-box!important;height:auto!important;min-height:0!important;max-height:28px!important;width:auto!important;min-width:0!important;max-width:100%!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:20px!important;flex:0 1 auto!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;outline:0!important;box-shadow:none!important;text-align:left!important;transform:none!important}
      ${hostSelector} .ds-input::before,${hostSelector} .ds-input::after{border:0!important;background:transparent!important;outline:0!important;box-shadow:none!important}
      ${labelSelector}:not([${hostMarker}]){position:static!important;height:20px!important;min-height:20px!important;max-height:20px!important;width:auto!important;max-width:100%!important;min-width:0!important;display:block!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:20px!important;flex:0 1 auto!important;margin:0!important;padding:0!important;text-align:left!important;text-overflow:ellipsis!important;white-space:nowrap!important;overflow:hidden!important}
      ${scope} [${titleMarker}][${hostMarker}]{display:block!important;line-height:48px!important;text-overflow:ellipsis!important;overflow:hidden!important}
      ${editorSelector}{position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;display:block!important;box-sizing:border-box!important;height:28px!important;min-height:28px!important;max-height:28px!important;width:min(320px,calc(100vw - var(--dsh-chat-title-inset,24px) - 64px))!important;min-width:0!important;max-width:100%!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:20px!important;color:inherit!important;margin:0!important;margin-left:-9px!important;padding:3px 8px!important;border:1px solid #7d98ed!important;border-radius:6px!important;background:rgba(77,107,254,.04)!important;outline:0!important;box-shadow:none!important;text-align:left!important;white-space:nowrap!important;transform:none!important}
      @supports (field-sizing:content){${editorSelector}{field-sizing:content!important;width:auto!important;min-width:min(96px,calc(100vw - var(--dsh-chat-title-inset,24px) - 64px))!important;max-width:min(320px,calc(100vw - var(--dsh-chat-title-inset,24px) - 64px))!important}}
      ${scope} [${editorMarker}][${hostMarker}]{position:fixed!important;top:10px!important;left:calc(var(--dsh-chat-title-inset,24px) - 9px)!important;margin-left:0!important;display:block!important}
      ${shareSelector}{position:absolute!important;top:10px!important;right:12px!important;bottom:auto!important;left:auto!important;box-sizing:border-box!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;max-width:28px!important;max-height:28px!important;margin:0!important;transform:none!important;z-index:11!important}
    `
    let style = doc.getElementById('dsh-chat-header-style')
    if (!style) {
      style = doc.createElement('style')
      style.id = 'dsh-chat-header-style'
      doc.head.append(style)
    }
    if (style.textContent !== styleText) style.textContent = styleText
  }
  installStyle()
  // A missing navigation title is normal during loading. It must not discard
  // the verified native header contract or detach the website's own controls.
  if (!nativeRow && !title) { clearMarkers(); return }
  let row = nativeRow ?? doc.querySelector<HTMLElement>(`[${rowMarker}]`)
  if (row && (!inTopRow(row) || row.querySelector('textarea,pre,code'))) row = null
  let share = row ? findShare(row) : undefined
  let editor = nativeHeader ? findEditor(nativeHeader) : row && share ? findEditor(row) : undefined
  let label = nativeHeader?.querySelector<HTMLElement>(':scope > ._9fcbeda > .afa34042') ?? undefined

  if (!nativeRow && !editor) {
    label = [...content.querySelectorAll<HTMLElement>(`[${titleMarker}],header,div,span,h1,h2`)].find(el => {
      if (!inTopRow(el, 48) || el.matches(editors) || el.querySelector(`${editors},textarea,pre,code,p,button,[role="button"]`)) return false
      return el.textContent?.trim() === title && ![...el.children].some(child => child.textContent?.trim() === title)
    })
    if (label) {
      row = label
      share = undefined
      for (let depth = 0; row && row !== content && depth < 7; depth++, row = row.parentElement) {
        if (!inTopRow(row) || row.querySelector('textarea,pre,code')) break
        share = findShare(row)
        if (share) break
      }
    } else {
      // React can replace the whole title branch. Recover only from a bounded
      // top row containing the same public share control and a title editor.
      row = null
      share = undefined
      for (const button of content.querySelectorAll<HTMLElement>('button,[role="button"]')) {
        if (!inTopRow(button, 56) || !button.querySelector('svg')) continue
        for (let parent = button.parentElement, depth = 0; parent && parent !== content && depth < 7; parent = parent.parentElement, depth++) {
          if (!inTopRow(parent) || parent.querySelector('textarea,pre,code')) break
          if (findShare(parent) !== button) continue
          const candidate = findEditor(parent)
          if (candidate) { row = parent; share = button; editor = candidate; break }
        }
        if (editor) break
      }
    }
  }
  const target = editor ?? label ?? nativeHeader
  if (!row || (!nativeRow && !share) || !target) { clearMarkers(); return }

  // Keep the highest title-only wrapper in place. Replacing a text child with
  // an input then inherits the same position before the next adapter pass.
  let host = nativeHeader ?? target
  for (let parent = host.parentElement, depth = 0; !nativeHeader && parent && parent !== row && depth < 7; parent = parent.parentElement, depth++) {
    if (!inTopRow(parent) || (share && parent.contains(share)) || parent.querySelector('button,[role="button"],textarea,pre,code,p')) break
    if ([...parent.querySelectorAll(editors)].some(el => el !== editor)) break
    host = parent
  }
  // Fixed positioning is still relative to a transformed ancestor. The first
  // native sidebar collapse can animate that ancestor after the title itself
  // is locked. Finish only finite positional motion on this verified header
  // path during its first appearance; never disable page-wide animations.
  const root = doc.documentElement
  const motionUntil = 'data-dsh-chat-header-motion-until'
  const motionComplete = 'data-dsh-chat-header-motion-complete'
  if (typeof host.getAnimations === 'function' && !root.hasAttribute(motionComplete)) {
    const first = !root.hasAttribute(motionUntil)
    if (first) root.setAttribute(motionUntil, String(Date.now() + 1200))
    const ownedStyle = doc.getElementById('dsh-chat-header-style')
    const deadline = root.getAttribute(motionUntil)
    const settle = () => {
      if (!host.isConnected || !content.isConnected || !ownedStyle || doc.getElementById('dsh-chat-header-style') !== ownedStyle || root.getAttribute(motionUntil) !== deadline || root.hasAttribute('data-dsh-chat-settings-view')) return
      if (Date.now() > Number(root.getAttribute(motionUntil))) { root.setAttribute(motionComplete, ''); root.removeAttribute(motionUntil); return }
      const elements = [host, ...host.querySelectorAll<HTMLElement>('div,span,label,input')].filter(el => !el.closest('.ds-skeleton,.ds-input__mirror')).slice(0, 32)
      for (let parent = host.parentElement, depth = 0; parent && depth < 12; parent = parent.parentElement, depth++) {
        elements.push(parent)
        if (parent === content) break
      }
      const positional = new Set(['transform','translate','left','right','insetInlineStart','marginLeft','marginRight','marginInlineStart','width','maxWidth','minWidth'])
      for (const element of elements) for (const animation of element.getAnimations()) {
        const effect = animation.effect
        if (!effect || !('getKeyframes' in effect) || !('target' in effect) || effect.target !== element || effect.getTiming().iterations === Infinity) continue
        const frames = (effect as KeyframeEffect).getKeyframes()
        if (!frames.some(frame => Object.keys(frame).some(key => positional.has(key)))) continue
        try { animation.finish() } catch { /* An unfinishable site animation is not ours to cancel. */ }
      }
    }
    settle()
    if (first) doc.defaultView?.requestAnimationFrame(() => { settle(); doc.defaultView?.requestAnimationFrame(settle) })
  }
  const targets: (HTMLElement | undefined)[] = [row, label, share, host, editor]
  markers.forEach((marker, index) => {
    const element = targets[index]
    doc.querySelectorAll(`[${marker}]`).forEach(el => { if (el !== element) el.removeAttribute(marker) })
    if (element && !element.hasAttribute(marker)) element.setAttribute(marker, '')
  })
}
