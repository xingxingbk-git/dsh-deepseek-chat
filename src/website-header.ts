/** Adapt only the public conversation title/share row. No message or input value is read. */
export function adaptWebsiteHeader(doc: Document, content: HTMLElement | undefined, title: string | null, inset: number) {
  const rowMarker = 'data-dsh-chat-header-row'
  const titleMarker = 'data-dsh-chat-header-title'
  const shareMarker = 'data-dsh-chat-header-share'
  const hostMarker = 'data-dsh-chat-header-title-host'
  const editorMarker = 'data-dsh-chat-header-editor'
  const depthMarker = 'data-dsh-chat-header-native-depth'
  const shareMetricsMarker = 'data-dsh-chat-header-share-metrics'
  const emptyMarker = 'data-dsh-chat-header-empty'
  const absentMarker = 'data-dsh-chat-header-absent'
  const markers = [rowMarker, titleMarker, shareMarker, hostMarker, editorMarker]
  const editors = 'input:not([type]),input[type="text"],[contenteditable="true"],[contenteditable="plaintext-only"]'
  const clearMarkers = () => {
    for (const marker of markers) doc.querySelectorAll(`[${marker}]`).forEach(el => el.removeAttribute(marker))
  }
  if (!content) { clearMarkers(); return false }
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
    const buttons = [...row.querySelectorAll<HTMLElement>('button,[role="button"]')].filter(el => {
      const b = el.getBoundingClientRect()
      const style = doc.defaultView?.getComputedStyle(el)
      return inTopRow(el, 56) && b.width >= 20 && b.width <= 56 && b.height >= 20
        && style?.display !== 'none' && style?.visibility !== 'hidden'
        && !el.closest('[data-dsh-chat-web-chrome]')
    })
    // The verified desktop branch owns exactly one direct share control. Never
    // mark a hidden mobile duplicate or an unrelated right-side icon as Share.
    const native = buttons.filter(el => el.parentElement === row && el.classList.contains('_57370c5'))
    if (native.length === 1) return native[0]
    const named = buttons.filter(el => /^(Share|分享|Share chat|分享对话)$/i.test(el.getAttribute('aria-label') ?? el.getAttribute('title') ?? ''))
    if (named.length === 1) return named[0]
    const anonymous = buttons.filter(el => {
      const b = el.getBoundingClientRect()
      return !el.textContent?.trim() && !!el.querySelector('svg') && r.width >= contentRect.width * 0.6
        && b.right >= contentRect.right - 72
    })
    return anonymous.length === 1 ? anonymous[0] : undefined
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
    const metrics = (doc.documentElement.getAttribute(shareMetricsMarker) ?? '').split(',').map(Number)
    const measured = metrics.length === 8 && metrics.every(value => Number.isFinite(value) && value >= 0 && value <= 96)
      && metrics[0] > 0 && metrics[1] > 0
    const backgroundWidth = measured && metrics[6] > 0 ? metrics[6] : 28
    const backgroundHeight = measured && metrics[7] > 0 ? metrics[7] : 28
    // All three window states share one measured geometry: the same icon size and
    // the same hover background, centred on the fixed 28px control. The tooltip
    // label is rendered outside the button and keeps the website's own behaviour.
    const shareSize = measured ? `
      ${shareSelector}{padding:${metrics.slice(2, 6).map(value => `${value}px`).join(' ')}!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:50%!important}
      ${shareSelector} :is(.ds-button__icon,.ds-icon),${shareSelector} svg{width:${metrics[0]}px!important;height:${metrics[1]}px!important;min-width:${metrics[0]}px!important;min-height:${metrics[1]}px!important;max-width:${metrics[0]}px!important;max-height:${metrics[1]}px!important;flex:none!important}
      ${shareSelector} .ds-button__background{position:absolute!important;top:50%!important;left:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:${backgroundWidth}px!important;height:${backgroundHeight}px!important;margin:0!important;border-radius:50%!important}
      ${shareSelector} > *{font-size:0!important;line-height:0!important}
    ` : ''
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
      ${scope} [${rowMarker}][${emptyMarker}] > *{display:none!important}
      ${scope} [data-dsh-chat-web-chrome]{display:none!important}
      ${editorSelector}{position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;display:block!important;box-sizing:border-box!important;height:28px!important;min-height:28px!important;max-height:28px!important;width:min(320px,calc(100vw - var(--dsh-chat-title-inset,24px) - 64px))!important;min-width:0!important;max-width:100%!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:20px!important;color:inherit!important;margin:0!important;margin-left:-9px!important;padding:3px 8px!important;border:1px solid #7d98ed!important;border-radius:6px!important;background:rgba(77,107,254,.04)!important;outline:0!important;box-shadow:none!important;text-align:left!important;white-space:nowrap!important;transform:none!important}
      @supports (field-sizing:content){${editorSelector}{field-sizing:content!important;width:auto!important;min-width:min(96px,calc(100vw - var(--dsh-chat-title-inset,24px) - 64px))!important;max-width:min(320px,calc(100vw - var(--dsh-chat-title-inset,24px) - 64px))!important}}
      ${scope} [${editorMarker}][${hostMarker}]{position:fixed!important;top:10px!important;left:calc(var(--dsh-chat-title-inset,24px) - 9px)!important;margin-left:0!important;display:block!important}
      ${shareSelector}{position:absolute!important;top:10px!important;right:12px!important;bottom:auto!important;left:auto!important;box-sizing:border-box!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;max-width:28px!important;max-height:28px!important;margin:0!important;transform:none!important;z-index:11!important}
      ${shareSize}
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
  // The responsive (<=767px) branch does not expose the desktop class names.
  // Identify its top row by geometry and public semantics, then apply the same
  // 48px row, single title and single Share contract used at desktop widths.
  const compactRowCandidates = () => {
    if (nativeRow) return []
    const contentRect = content.getBoundingClientRect()
    return [...content.querySelectorAll<HTMLElement>('div,header')].filter(el => {
      if (el.matches('._2be88ba') || el.closest('[hidden],[aria-hidden="true"],[role="dialog"],.ds-modal-content')) return false
      const r = el.getBoundingClientRect()
      return r.top >= -1 && r.top <= 24 && r.height >= 36 && r.height <= 96 && r.width >= contentRect.width * .6
        && !el.querySelector('textarea,pre,code')
        && !!el.querySelector('button,[role="button"],[contenteditable="true"],[contenteditable="plaintext-only"]')
    }).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)
  }
  const compactRow = compactRowCandidates()[0]
  const compactEditable = compactRow ? [...compactRow.querySelectorAll<HTMLElement>(editors)]
    .find(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height <= 56 }) : undefined
  const compactLabel = compactRow && title ? [...compactRow.querySelectorAll<HTMLElement>('div,span,h1,h2')]
    .find(el => !el.matches(editors) && !el.querySelector('button,[role="button"],textarea,pre,code')
      && el.textContent?.trim() === title) : undefined
  const compactShare = compactRow ? (() => {
    const buttons = [...compactRow.querySelectorAll<HTMLElement>('button,[role="button"]')]
    const named = buttons.filter(el => /^(Share|分享|Share chat|分享对话)$/i.test(el.getAttribute('aria-label') ?? el.getAttribute('title') ?? ''))
    if (named.length === 1) return named[0]
    const icons = buttons.filter(el => !!el.querySelector('svg') && !el.textContent?.trim())
    return icons.length === 1 ? icons[0] : undefined
  })() : undefined
  if (compactRow) {
    const hasTitle = !!(compactEditable || compactLabel)
    clearMarkers()
    doc.querySelectorAll(`[${emptyMarker}]`).forEach(el => el.removeAttribute(emptyMarker))
    compactRow.setAttribute(rowMarker, '')
    doc.documentElement.removeAttribute(absentMarker)
    if (hasTitle || compactShare) {
      const host = compactEditable ?? compactLabel
      if (host) {
        host.setAttribute(hostMarker, '')
        host.setAttribute(compactEditable ? editorMarker : titleMarker, '')
      }
      if (compactShare) compactShare.setAttribute(shareMarker, '')
      // CHAT owns its own sidebar entry; hide the website's compact menu chrome.
      for (const button of compactRow.querySelectorAll<HTMLElement>('button,[role="button"]')) {
        if (button === compactShare || (host && (button.contains(host) || host.contains(button)))) continue
        button.setAttribute('data-dsh-chat-web-chrome', '')
      }
      return true
    }
    // New-chat pages only carry the website's menu/new-chat controls. Keep the
    // same 48px top row and hide those controls instead of exposing them.
    compactRow.setAttribute(emptyMarker, '')
    return true
  }
  // A missing navigation title is normal during loading. It must not discard
  // the verified native header contract or detach the website's own controls.
  if (!nativeRow && !title) { clearMarkers(); doc.documentElement.setAttribute(absentMarker, ''); return false }
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
  if (!row || (!nativeRow && !share) || !target) {
    clearMarkers()
    // No identifiable top row at all (for example an intermediate page): do not
    // deadlock the presentation gate. A detected-but-unadapted row still fails.
    if (!nativeRow && compactRowCandidates().length === 0) doc.documentElement.setAttribute(absentMarker, '')
    return false
  }

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
  const desktopShare = share && (!share.classList.contains('ds-button') || (share.classList.contains('ds-button--l') && !share.classList.contains('ds-button--xl')))
  // matchMedia can update innerWidth before React commits its desktop button.
  // Never freeze an old mobile (--xl) glyph as the desktop reference.
  if (share && desktopShare && (doc.defaultView?.innerWidth ?? 0) >= 768 && !doc.documentElement.hasAttribute(shareMetricsMarker)) {
    const icons = share.querySelectorAll('svg')
    const box = icons.length === 1 ? icons[0].getBoundingClientRect() : null
    const background = share.querySelector<HTMLElement>('.ds-button__background')?.getBoundingClientRect()
    const css = doc.defaultView?.getComputedStyle(share)
    if (box && css && box.width > 0 && box.height > 0 && box.width <= 56 && box.height <= 56) {
      const metrics = [box.width, box.height, ...[css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft].map(value => Number.parseFloat(value) || 0),
        background && background.width > 0 && background.width <= 96 ? background.width : 0,
        background && background.height > 0 && background.height <= 96 ? background.height : 0]
      doc.documentElement.setAttribute(shareMetricsMarker, metrics.join(','))
      installStyle()
    }
  }
  return true
}
