import { adaptWebsiteHeader } from '../../src/website-header.ts'
import { collapseWebsiteSidebar } from '../../src/website-sidebar-collapse.ts'

// All content and CSS are fictional. The runner intercepts the entire HTTPS
// document before network access; this is not a current live-site CSS capture.
window.fixtureDone = (async () => {
  const results = []
  const check = (name, passed) => results.push({ name, passed: !!passed })
  const near = (a, b) => Math.abs(a - b) < .6
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
  const main = document.querySelector('main')
  const rowHTML = (branch = '<div class="afa34042">Fictional title</div>') => `<div class="_2be88ba"><div class="the-header"><div class="_9fcbeda">${branch}</div></div><div class="_1aa2651 the-header" style="display:none">Mobile</div><button class="_57370c5" aria-label="Share"><svg></svg></button></div>`
  const host = () => main.querySelector('.the-header')
  const x = () => host().getBoundingClientRect().left
  const adapt = (title = 'Fictional title', inset = 24) => adaptWebsiteHeader(document, main, title, inset)
  main.innerHTML = rowHTML()
  check('synthetic native position starts at x340', near(x(), 340))
  // Negative control: important left/transform targets alone still interpolate.
  host().style.cssText = 'left:24px!important;transform:none!important'
  check('important targets alone do not cancel native position transition', x() > 300)
  host().removeAttribute('style')
  void x()
  const originalHost = host(), originalShare = main.querySelector('button'), originalLabel = main.querySelector('.afa34042')
  let shares = 0, labels = 0
  originalShare.onclick = () => shares++
  originalLabel.onclick = () => labels++
  adapt()
  check('adapter cancels native transition immediately at x24', near(x(), 24))
  check('transition reset applies only to verified title host', getComputedStyle(host()).transitionProperty === 'none')
  await frame(); await frame()
  check('title remains x24 on subsequent animation frames', near(x(), 24))
  check('native title host and label nodes retained', host() === originalHost && main.querySelector('.afa34042') === originalLabel)
  originalLabel.click(); originalShare.click()
  check('native title and share handlers retained', labels === 1 && shares === 1)
  check('share control layout retained', near(originalShare.getBoundingClientRect().right, 788))
  check('share opacity transition not disabled', getComputedStyle(originalShare).transitionProperty === 'opacity')
  check('unrelated transition and animation untouched', getComputedStyle(document.querySelector('#unrelated')).transitionProperty === 'left' && getComputedStyle(document.querySelector('#unrelated')).animationName === 'pulse')
  check('mobile native branch stays hidden', getComputedStyle(main.querySelector('._1aa2651')).display === 'none')
  adapt('Fictional title', 80)
  check('host inset updates without interpolation', near(x(), 80))

  // Entire React-style row replacements must inherit positioning without an
  // observer/adapter pass. Native depth is the previously verified boundary.
  main.innerHTML = rowHTML('<div class="ds-skeleton"></div>')
  main.querySelector('button').remove()
  check('replacement skeleton host stable before adapter', near(x(), 80))
  check('skeleton pulse animation remains active', getComputedStyle(main.querySelector('.ds-skeleton')).animationName === 'pulse')
  adapt(null, 24)
  check('loading without navigation title preserves x24', near(x(), 24))
  check('loading without share retains verified title host', !main.querySelector('button') && host().hasAttribute('data-dsh-chat-header-title-host'))
  main.innerHTML = rowHTML()
  check('skeleton to title replacement stable before adapter', near(x(), 24))
  check('replacement share control returns without title movement', !!main.querySelector('button') && near(x(), 24))
  main.innerHTML = rowHTML('<div class="ds-input"><input type="text" aria-label="Rename title"><div class="ds-input__mirror">Synthetic mirror</div></div>')
  const editor = main.querySelector('input')
  editor.value = 'Synthetic draft'; editor.focus(); editor.setSelectionRange(2, 5)
  let inputs = 0; editor.oninput = () => inputs++
  check('replacement editor host stable before adapter', near(x(), 24))
  check('editor text inset matches title before adapter', near(editor.getBoundingClientRect().left + 9, 24))
  adapt()
  check('editor node, focus, draft and selection retained', main.querySelector('input') === editor && document.activeElement === editor && editor.value === 'Synthetic draft' && editor.selectionStart === 2 && editor.selectionEnd === 5)
  editor.dispatchEvent(new Event('input', { bubbles: true }))
  check('native input handler retained', inputs === 1)
  check('native input measurement mirror stays hidden', getComputedStyle(main.querySelector('.ds-input__mirror')).visibility === 'hidden')

  // This is the integration order requested of navigation: lock header first,
  // then temporary natural-sidebar measurement and one native control click.
  const track = document.createElement('nav')
  track.id = 'track'; track.setAttribute('data-dsh-chat-navigation', '')
  track.setAttribute('style', 'color: rgb(1, 2, 3);')
  track.innerHTML = '<button aria-label="Collapse sidebar"><svg></svg></button><div data-dsh-chat-profile-confirmed="footer-v1"></div>'
  document.body.append(track)
  const navStyle = document.createElement('style'); navStyle.id = 'dsh-chat-website-navigation-style'
  navStyle.textContent = '[data-dsh-chat-navigation]{display:none!important}[data-dsh-chat-content]{margin-left:0!important}'
  document.head.append(navStyle)
  let toggles = 0, measuredX = null
  track.querySelector('button').onclick = () => { toggles++; measuredX = x(); document.documentElement.classList.add('native-collapsed') }
  adapt()
  check('verified native collapse executes once', collapseWebsiteSidebar(document, track) && toggles === 1)
  check('title stable during temporary navigation measurement and click', near(measuredX, 24) && near(x(), 24))
  check('collapse restores exact track inline style and stylesheet', track.getAttribute('style') === 'color: rgb(1, 2, 3);' && navStyle.sheet.disabled === false && getComputedStyle(track).display === 'none')
  check('second collapse cannot toggle native sidebar open', !collapseWebsiteSidebar(document, track) && toggles === 1)
  document.documentElement.removeAttribute('data-dsh-chat-native-collapse-attempt')
  track.querySelector('button').remove()
  navStyle.sheet.disabled = true
  check('unknown native collapse control is not guessed', !collapseWebsiteSidebar(document, track) && toggles === 1 && !document.documentElement.hasAttribute('data-dsh-chat-native-collapse-attempt'))
  check('failed collapse restores exact style and already-disabled sheet', track.getAttribute('style') === 'color: rgb(1, 2, 3);' && navStyle.sheet.disabled === true)

  document.documentElement.setAttribute('data-dsh-chat-settings-view', '')
  check('settings scope releases header transition override', getComputedStyle(host()).transitionProperty.includes('left'))
  document.documentElement.removeAttribute('data-dsh-chat-settings-view')
  check('leaving settings reacquires stable position', near(x(), 24))
  adaptWebsiteHeader(document, undefined, null, 24)
  check('missing content clears transient title markers', !document.querySelector('[data-dsh-chat-header-title-host],[data-dsh-chat-header-editor],[data-dsh-chat-header-row]'))
  // The navigation restore owner removes the sheet/depth/inset. Do the same
  // here without invoking unrelated navigation/account/locale dependencies.
  document.querySelector('#dsh-chat-header-style').remove()
  document.documentElement.removeAttribute('data-dsh-chat-header-native-depth')
  document.documentElement.style.removeProperty('--dsh-chat-title-inset')
  check('cleanup restores native transition declaration', getComputedStyle(host()).transitionProperty.includes('left') && getComputedStyle(host()).transitionProperty.includes('transform'))
  check('cleanup leaves native editor and share controls mounted', main.contains(editor) && !!main.querySelector('button'))
  // A fixed title is not viewport-fixed under a moving transformed ancestor.
  // This is the failure the former host-only transition test did not cover.
  main.innerHTML = rowHTML()
  main.style.cssText='transform:translateX(240px);transition:transform .5s linear'
  void main.getBoundingClientRect().left
  main.style.transform='translateX(0px)'
  check('moving ancestor defeats a title-only transition reset',x()>200)
  document.documentElement.removeAttribute('data-dsh-chat-header-motion-until')
  document.documentElement.removeAttribute('data-dsh-chat-header-motion-complete')
  adapt()
  check('first header finishes finite positional motion on its ancestor path',near(x(),24))
  await frame();await frame()
  check('first header remains stable on following frames with animated ancestor',near(x(),24))
  check('ancestor native transition declaration and unrelated animations remain intact',getComputedStyle(main).transitionProperty==='transform' && getComputedStyle(document.querySelector('#unrelated')).animationName==='pulse')
  main.removeAttribute('style')
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  return results
})()
