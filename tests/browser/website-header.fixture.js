import { adaptWebsiteHeader } from '../../src/website-header.ts'
import { websiteCommandScript, parseWebsiteNavigation } from '../../src/website-navigation.ts'

// Public structural contract with fictional CSS. Compare to this document's
// original desktop metrics rather than assuming an arbitrary mobile SVG size.
window.fixtureDone = (async () => {
  const results = []
  const check = (name, value) => { results.push({ name, passed: !!value }); if (!value) throw new Error(name) }
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  const node = document.createElement('iframe')
  node.style.cssText = 'border:0;width:1024px;height:720px'
  document.body.append(node)
  const doc = node.contentDocument
  doc.open(); doc.write(`<!doctype html><html><head><style>
    body{margin:0;font:14px Arial} main{height:720px;width:100%} ._2be88ba{position:relative;width:100%;height:48px}
    .the-header{height:48px;display:flex;align-items:center}.afa34042{line-height:20px} ._1aa2651{display:none}
    ._57370c5{display:flex;align-items:center;justify-content:center;padding:4px;position:absolute;right:12px;top:10px;width:28px;height:28px;box-sizing:border-box;border:0;border-radius:50%;background:transparent;color:rgb(44,55,66)}
    .ds-button__background{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:9999px;background:currentColor;opacity:0}.ds-button:hover .ds-button__background{opacity:.08}.ds-button[aria-disabled=true]{opacity:.4}
    .ds-button__icon,.ds-icon{display:flex;width:16px;height:16px;line-height:0}.ds-icon svg{width:16px;height:16px}
    @media(max-width:767px){._2be88ba{height:64px}._1aa2651{display:flex}.ds-button__icon,.ds-icon,.ds-icon svg{width:24px;height:24px}._57370c5{padding:8px;width:44px;height:44px}._57370c5 .ds-button__background{width:44px;height:44px}}
  </style></head><body><main data-dsh-chat-content></main></body></html>`); doc.close()
  await frame()
  const main = doc.querySelector('main')
  const icon = size => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><path d="M1 1L10 8L1 15" fill="none" stroke="currentColor"/></svg>`
  const shareHTML = size => `<div class="_57370c5 ds-button ds-button--l ds-button--icon ds-button--icon-relative-m" role="button" aria-label="Share"><div class="ds-button__background"></div><div class="ds-button__icon"><div class="ds-icon">${icon(size)}</div></div></div>`
  const rowHTML = (branch = '<span class="afa34042">Fixture title</span>', size = 16) => `<div class="_2be88ba"><div class="the-header"><div class="_9fcbeda">${branch}</div></div><div class="_1aa2651 the-header"><button aria-label="Open sidebar">Menu</button></div>${shareHTML(size)}</div>`
  main.innerHTML = rowHTML()
  const adapt = () => adaptWebsiteHeader(doc, main, 'Fixture title', 24)
  const measure = () => {
    const share = main.querySelector('._57370c5'), row = main.querySelector('._2be88ba')
    const size = selector => { const r = share.querySelector(selector).getBoundingClientRect(); return [r.width, r.height] }
    const bounds = share.getBoundingClientRect(), css = node.contentWindow.getComputedStyle(share)
    return { row: row.getBoundingClientRect().height, control: [bounds.width, bounds.height], icon: size('.ds-button__icon'), svg: size('svg'), background: size('.ds-button__background'), padding: css.padding, color: css.color, mobile: node.contentWindow.getComputedStyle(main.querySelector('._1aa2651')).display }
  }
  const nativeSvg = main.querySelector('svg').getBoundingClientRect()
  adapt()
  const reference = measure()
  check('desktop glyph retains its original measured size, not forced 20px', reference.svg[0] === nativeSvg.width && reference.svg[0] === 16)
  check('desktop retains the existing 28px control and 48px title row', reference.row === 48 && reference.control.join(',') === '28,28')
  check('desktop metrics are recorded only as bounded geometry', /^16,16,4,4,4,4,34,34$/.test(doc.documentElement.getAttribute('data-dsh-chat-header-share-metrics')))
  let clicks = 0
  const originalShare = main.querySelector('._57370c5'); originalShare.onclick = () => clicks++
  for (const width of [1024, 800, 768, 767, 640, 420, 320, 240]) {
    node.style.width = `${width}px`; await frame()
    const share = main.querySelector('._57370c5')
    share.classList.toggle('ds-button--xl', width < 768)
    share.classList.toggle('ds-button--l', width >= 768)
    share.querySelector('.ds-icon').innerHTML = icon(width < 768 ? 20 : 16)
    const before = measure()
    // One measured geometry for every width: the site's own wide hover
    // background must survive the responsive replacement unchanged.
    const expectedBackground = [34, 34]
    check(`${width}px responsive replacement keeps desktop glyph before the next adapter pass`, JSON.stringify(before.svg) === JSON.stringify(reference.svg) && JSON.stringify(before.background) === JSON.stringify(expectedBackground))
    adapt()
    const current = measure()
    check(`${width}px preserves desktop row/control/icon/padding and hidden mobile controls`, ['row', 'control', 'icon', 'svg', 'padding', 'color'].every(key => JSON.stringify(current[key]) === JSON.stringify(reference[key])) && current.mobile === 'none')
    check(`${width}px hover background matches the original wide size or the fixed control`, JSON.stringify(current.background) === JSON.stringify(expectedBackground))
  }
  originalShare.click()
  check('resizing preserves the original share node and click handler', main.querySelector('._57370c5') === originalShare && clicks === 1)
  originalShare.setAttribute('aria-disabled', 'true')
  check('native disabled styling is not replaced', node.contentWindow.getComputedStyle(originalShare).opacity === '0.4')
  originalShare.removeAttribute('aria-disabled')
  const hidden = doc.createElement('button'); hidden.setAttribute('aria-label', 'Share'); hidden.style.display = 'none'
  main.querySelector('._2be88ba').prepend(hidden)
  const unrelated = doc.createElement('button'); unrelated.style.cssText = 'position:absolute;right:48px;top:10px;width:28px;height:28px'; unrelated.innerHTML = icon(16)
  main.querySelector('._2be88ba').prepend(unrelated)
  adapt()
  check('a hidden named duplicate and nearby anonymous icon cannot steal the Share marker', originalShare.hasAttribute('data-dsh-chat-header-share') && !hidden.hasAttribute('data-dsh-chat-header-share') && !unrelated.hasAttribute('data-dsh-chat-header-share'))
  main.innerHTML = rowHTML('<div class="ds-skeleton"></div>', 20)
  main.querySelector('._57370c5').remove()
  adaptWebsiteHeader(doc, main, null, 24)
  check('loading without Share keeps the learned desktop metrics', doc.documentElement.getAttribute('data-dsh-chat-header-share-metrics') === '16,16,4,4,4,4,34,34')
  main.innerHTML = rowHTML('<span class="afa34042">Fixture title</span>', 20)
  check('a whole mobile row replacement inherits desktop geometry before adaptation', measure().row === 48 && measure().svg[0] === 16 && measure().mobile === 'none')
  main.innerHTML = rowHTML('<input type="text" aria-label="Rename title">', 20)
  const input = main.querySelector('input'); input.value = 'Fixture unsent rename'; input.focus(); input.setSelectionRange(1, 4)
  adapt()
  check('header adaptation retains the real editor/focus/draft/selection', main.querySelector('input') === input && doc.activeElement === input && input.value === 'Fixture unsent rename' && input.selectionStart === 1 && input.selectionEnd === 4)
  node.style.width = '1024px'; await frame()
  main.innerHTML = rowHTML()
  doc.documentElement.removeAttribute('data-dsh-chat-header-share-metrics')
  main.querySelector('._57370c5').classList.replace('ds-button--l', 'ds-button--xl')
  adapt()
  check('wide innerWidth alone cannot sample a stale React mobile button', !doc.documentElement.hasAttribute('data-dsh-chat-header-share-metrics'))
  main.querySelector('._57370c5').classList.replace('ds-button--xl', 'ds-button--l'); adapt()
  check('the late desktop branch supplies the original glyph metrics', doc.documentElement.getAttribute('data-dsh-chat-header-share-metrics') === '16,16,4,4,4,4,34,34')
  // A textless mobile skeleton with several icons used to be misclassified as
  // the site's compact sidebar button group, permanently hiding the real header.
  doc.body.innerHTML = `<div style="display:flex;height:720px"><aside style="position:relative;width:240px;flex:none;height:720px"><button>New chat</button><a href="/a/chat/s/fixture">Fixture title</a><div style="position:absolute;bottom:0;width:200px;height:48px;display:flex;align-items:center"><img width="32" height="32" alt="Fixture avatar"><span>Fixture account</span></div></aside><main style="position:relative;flex:1;min-width:0;width:auto">${rowHTML()}<textarea></textarea></main></div>`
  doc.documentElement.setAttribute('data-dsh-chat-observing', '')
  doc.documentElement.setAttribute('data-dsh-chat-theme-complete', 'dark')
  doc.documentElement.setAttribute('data-dsh-chat-settings-theme-target', 'dark')
  doc.documentElement.setAttribute('data-dsh-chat-native-collapse-attempt', 'true')
  const runInFrame = () => node.contentWindow.eval(`(()=>{const location={origin:'https://chat.deepseek.com',pathname:'/a/chat/s/fixture'};return ${websiteCommandScript({ type: 'snapshot', showOriginal: false })}})()`)
  const initial = runInFrame()
  check('the narrow skeleton scenario starts from an adapted desktop layout', initial.authenticated === true && initial.desktopReady === true)
  node.style.width = '320px'; await frame()
  const frameMain = doc.querySelector('main')
  frameMain.innerHTML = rowHTML('<div class="ds-skeleton"></div>', 20) + '<textarea></textarea>'
  frameMain.querySelector('._1aa2651').innerHTML = `<button>${icon(16)}</button><button>${icon(16)}</button>`
  runInFrame()
  const skeletonRow = frameMain.querySelector('._2be88ba')
  check('an icon-only narrow title skeleton is never hidden as sidebar chrome', !skeletonRow.hasAttribute('data-dsh-chat-web-chrome') && node.contentWindow.getComputedStyle(skeletonRow).display !== 'none')
  frameMain.querySelector('._9fcbeda').innerHTML = '<span class="afa34042">Fixture title</span>'; runInFrame()
  check('the title and Share remain visible after skeleton replacement', node.contentWindow.getComputedStyle(skeletonRow).display !== 'none' && frameMain.querySelector('._57370c5 svg').getBoundingClientRect().width === 16)
  node.remove()

  // Responsive DOM (<=767px): the desktop class names are gone, but the same top
  // row must be taken over so the website's menu/new-chat/share chrome never shows.
  const responsive = document.createElement('div')
  responsive.innerHTML = `<div style="display:flex;height:800px"><main id="m-content" style="flex:1;min-width:0;position:relative"><div id="m-row" style="display:flex;align-items:center;height:56px;width:100%;padding:0 8px;box-sizing:border-box"><button id="m-menu" aria-label="打开菜单"><svg width="20" height="20"></svg></button><span id="m-title" style="flex:1;line-height:20px">Fixture title</span><button id="m-share" aria-label="分享" style="width:44px;height:44px"><svg width="20" height="20"></svg></button></div><textarea style="position:absolute;bottom:0;width:100%;height:80px"></textarea></main></div>`
  document.body.append(responsive)
  const mobileAdapt = adaptWebsiteHeader(document, document.getElementById('m-content'), 'Fixture title', 24)
  const mobileRow = document.getElementById('m-row'), mobileMenu = document.getElementById('m-menu'), mobileShare = document.getElementById('m-share')
  check('the responsive conversation row is adapted without desktop classes', mobileAdapt === true)
  check('the responsive row keeps the 48px CHAT header height', mobileRow.getBoundingClientRect().height === 48)
  check('the website menu button is hidden while the real Share stays', getComputedStyle(mobileMenu).display === 'none' && mobileShare.hasAttribute('data-dsh-chat-header-share'))
  check('the responsive title is pinned to the CHAT inset', Math.abs(document.getElementById('m-title').getBoundingClientRect().left - 24) <= 1)
  check('the responsive Share is normalized to the 28px control', Math.abs(mobileShare.getBoundingClientRect().width - 28) <= 1)

  responsive.innerHTML = `<div style="display:flex;height:800px"><main id="h-content" style="flex:1;min-width:0;position:relative"><div id="h-row" style="display:flex;align-items:center;justify-content:space-between;height:56px;width:100%;padding:0 8px;box-sizing:border-box"><button aria-label="打开菜单"><svg width="20" height="20"></svg></button><button aria-label="新会话"><svg width="20" height="20"></svg></button></div><textarea style="position:absolute;bottom:0;width:100%;height:80px"></textarea></main></div>`
  const homeAdapt = adaptWebsiteHeader(document, document.getElementById('h-content'), null, 24)
  const homeRow = document.getElementById('h-row')
  check('a new-chat page takes over its chrome row', homeAdapt === true && homeRow.hasAttribute('data-dsh-chat-header-empty'))
  check('the website menu and new-chat icons are hidden on the new-chat page', [...homeRow.children].every(child => getComputedStyle(child).display === 'none'))
  check('the empty chrome row still reserves the 48px CHAT header', homeRow.getBoundingClientRect().height === 48)
  responsive.remove()

  // Execute the production serialized command in the approved synthetic origin.
  document.body.innerHTML = `<div id="layout" style="display:flex;height:800px"><aside style="position:relative;width:240px;flex:none;height:800px"><button style="position:absolute;top:8px;right:8px;width:24px;height:24px" aria-label="Collapse sidebar">${icon(16)}</button><div style="padding-top:80px">New chat</div><a href="/a/chat/s/fixture">Fixture title</a><div style="position:absolute;bottom:0;width:200px;height:48px;display:flex;align-items:center"><img width="32" height="32" alt="Fixture avatar"><span>Fixture account</span></div></aside><main style="position:relative;flex:1;height:800px">${rowHTML()}<textarea></textarea></main></div>`
  const style = document.createElement('style'); style.textContent = 'body{margin:0}._2be88ba{position:relative;height:48px;width:100%}.the-header{height:48px}._1aa2651{display:none}._57370c5{position:absolute;right:12px;top:10px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;padding:4px;box-sizing:border-box}.ds-icon svg{width:16px;height:16px}'
  document.head.append(style)
  const root = document.documentElement
  root.setAttribute('data-dsh-chat-theme-complete', 'dark'); root.setAttribute('data-dsh-chat-settings-theme-target', 'dark')
  let collapse = 0
  document.querySelector('[aria-label="Collapse sidebar"]').onclick = () => collapse++
  const run = () => window.eval(websiteCommandScript({ type: 'snapshot', showOriginal: false }))
  const result = run()
  check('serialized production command confirms desktop chrome after native collapse', parseWebsiteNavigation(result).desktopReady === true && collapse === 1 && root.hasAttribute('data-dsh-chat-header-share-metrics'))
  run()
  check('repeated serialized snapshots never reopen or re-collapse the native sidebar', collapse === 1)
  // The real site may omit its collapse control or expose no measurable Share.
  // Presentation must still become ready: those are enhancements, not gates.
  document.querySelector('[aria-label="Collapse sidebar"]').remove()
  root.removeAttribute('data-dsh-chat-header-share-metrics')
  root.removeAttribute('data-dsh-chat-native-collapse-attempt')
  const withoutChrome = parseWebsiteNavigation(run())
  check('verified identity plus a hidden original sidebar is enough when chrome evidence is absent', withoutChrome.desktopReady === true && withoutChrome.status === 'ready')
  window.eval(websiteCommandScript({ type: 'restore' }))
  check('explicit cleanup removes learned metrics and header styling', !root.hasAttribute('data-dsh-chat-header-share-metrics') && !document.getElementById('dsh-chat-header-style'))
  return results
})()
