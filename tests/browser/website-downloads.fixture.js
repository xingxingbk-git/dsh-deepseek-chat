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
/** A plain code block: no Mermaid tab switch, so the download button exports directly. */
const exportPlain = (name, text) => {
  const bytes = new TextEncoder().encode(text)
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }))
  const link = document.createElement('a')
  link.href = url; link.download = name
  document.body.append(link)
  link.click()
  setTimeout(() => { link.remove(); URL.revokeObjectURL(url) }, 200)
  outcome = { kind: 'plain', name, bytes: bytes.length }
}
const plainBlock = () => {
  const code = document.createElement('div')
  code.className = 'md-code-block'
  code.innerHTML = `<div class="md-code-block-banner-wrap"><div class="md-code-block-banner md-code-block-banner-lite">`
    + `<div class="ds-button" role="button" style="${box(20, 20, 120, 30)}"><span class="code-info-button-text">下载</span></div>`
    + `</div></div>`
  stage.append(code)
  code.querySelector('.ds-button').addEventListener('click', () => exportPlain('notes.py', 'print(1)\n'))
  return code
}
/** A download link the user can click directly, without any code-block button. */
const direct = () => {
  const url = URL.createObjectURL(new Blob(['hello'], { type: 'text/plain' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'notes.txt'
  link.textContent = 'download'
  link.style.cssText = box(400, 300, 120, 30)
  document.body.append(link)
  return link
}
/** A message image download button identified only by aria-label. */
const exportImage = (name, bytes, type) => {
  const url = URL.createObjectURL(new Blob([bytes], { type }))
  const link = document.createElement('a')
  link.href = url; link.download = name
  document.body.append(link)
  link.click()
  setTimeout(() => { link.remove(); URL.revokeObjectURL(url) }, 200)
  outcome = { kind: 'image', name, bytes: bytes.length }
}
const imageBlock = () => {
  const holder = document.createElement('div')
  holder.style.cssText = box(600, 300, 200, 60)
  holder.innerHTML = `<button aria-label="下载" style="${box(600, 300, 100, 30)}">下载</button>`
  stage.append(holder)
  holder.querySelector('button').addEventListener('click', () => {
    exportImage('photo.jpeg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]), 'image/jpeg')
  })
  return holder
}
/** A binary attachment download (for example a PDF) triggered by an ordinary button. */
const fileBlock = () => {
  const holder = document.createElement('div')
  holder.style.cssText = box(600, 420, 200, 60)
  holder.innerHTML = `<button style="${box(600, 420, 100, 30)}">下载</button>`
  stage.append(holder)
  holder.querySelector('button').addEventListener('click', () => {
    const bytes = new TextEncoder().encode('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n1 0 obj\n<<>>\nendobj\n')
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'report.pdf'
    document.body.append(link)
    link.click()
    setTimeout(() => { link.remove(); URL.revokeObjectURL(url) }, 200)
    outcome = { kind: 'binary', name: 'report.pdf', bytes: bytes.length }
  })
  return holder
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
  results, reset, block, plainBlock, direct, imageBlock, fileBlock, poll,
  directPoint: () => ({ x: 460, y: 315 }),
  imagePoint: () => ({ x: 650, y: 315 }),
  filePoint: () => ({ x: 650, y: 435 }),
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
