import { parseWebsiteDownload, websiteDownloadBlob, websiteDownloadScript } from '../../src/website-downloads.ts'

// Fictional Mermaid export UI mirroring the public 0.2.2 markup shapes. No DSH,
// no website, no credentials and no real conversation content.
const results = []
const check = (name, passed) => results.push({ name, passed: Boolean(passed) })
const box = (left, top, width, height) => `position:fixed;left:${left}px;top:${top}px;width:${width}px;height:${height}px`
const stage = document.createElement('div')
document.body.append(stage)
let menu = null, outcome = null
const evaluate = (action, enabled) => parseWebsiteDownload(eval(websiteDownloadScript(action, enabled)))
const reset = () => {
  stage.innerHTML = ''
  document.querySelectorAll('.ds-dropdown-menu').forEach(node => node.remove())
  menu = null; outcome = null
  evaluate('poll', false)
}
const block = ({ tabs = ['图表', '代码'], labels = ['下载 SVG', '下载 PNG', '下载代码'] } = {}) => {
  const code = document.createElement('div')
  code.className = 'md-code-block'
  code.innerHTML = `<div class="md-code-block-banner-wrap"><div class="md-code-block-banner md-code-block-banner-lite">`
    + `<div class="ds-segmented" role="tablist">${tabs.map(label => `<div role="tab">${label}</div>`).join('')}</div>`
    + `<div class="ds-button" role="button" style="${box(20, 20, 120, 30)}"><span class="code-info-button-text">下载</span></div>`
    + `</div></div>`
  stage.append(code)
  code.querySelector('.ds-button').addEventListener('click', () => openMenu(labels))
  return code
}
const openMenu = labels => {
  menu = document.createElement('div')
  menu.className = 'ds-dropdown-menu ds-elevated'
  menu.setAttribute('role', 'menu')
  menu.style.cssText = box(20, 60, 170, labels.length * 32)
  menu.innerHTML = labels.map((label, index) =>
    `<div class="ds-dropdown-menu-option ds-dropdown-menu-option--none" style="${box(20, 60 + index * 32, 170, 32)}"><div class="ds-dropdown-menu-option__label">${label}</div></div>`).join('')
  document.body.append(menu)
  for (const option of menu.querySelectorAll('.ds-dropdown-menu-option')) {
    option.addEventListener('click', () => exportFile(option.textContent.trim()))
  }
}
/** Mirrors the documented public helper: Blob → object URL → anchor → click → revoke. */
const exportFile = label => {
  const kind = label.endsWith('SVG') ? 'svg' : label.endsWith('PNG') ? 'png' : 'code'
  const bytes = kind === 'png'
    ? new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82])
    : new TextEncoder().encode(kind === 'svg' ? '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>' : 'flowchart TD\n  A --> B')
  const name = kind === 'svg' ? 'diagram.svg' : kind === 'png' ? 'diagram.png' : 'diagram.mermaid'
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }))
  const link = document.createElement('a')
  link.href = url; link.download = name
  document.body.append(link)
  link.click()
  setTimeout(() => { link.remove(); URL.revokeObjectURL(url) }, 200)
  outcome = { kind, name, bytes: bytes.length }
}
const poll = () => {
  const value = evaluate('poll', true)
  let valid = null
  if (value && value.kind === 'file') {
    try {
      const blob = websiteDownloadBlob(value)
      valid = { name: value.name, mediaType: value.mediaType, size: blob.size, type: blob.type }
    } catch (error) { valid = { error: String(error) } }
  }
  return { raw: value ? { kind: value.kind } : null, valid }
}
window.fixture = {
  results, reset, block, poll,
  install: () => evaluate('poll', true),
  untrusted: index => {
    stage.querySelector('.ds-button')?.click()
    menu?.querySelectorAll('.ds-dropdown-menu-option')[index]?.click()
  },
  triggerPoint: () => ({ x: 80, y: 35 }),
  optionPoint: index => ({ x: 100, y: 60 + index * 32 + 16 }),
  outcome: () => outcome,
  stray: () => {
    const url = URL.createObjectURL(new Blob(['stray'], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'stray.svg'
    document.body.append(link); link.click()
    setTimeout(() => { link.remove(); URL.revokeObjectURL(url) }, 200)
  },
  check,
}
window.fixtureDone = true
