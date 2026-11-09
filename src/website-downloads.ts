const BINARY_FILE_EXTENSIONS = new Set(['pdf','doc','docx','xls','xlsx','ppt','pptx','zip','rar','7z','gz','tar',
  'mp3','mp4','wav','mov','webm','ogg','m4a','aac','flac','epub','rtf','odt','ods','odp'])
const IMAGE_FILE_TYPES = new Map([['png','image/png'],['jpg','image/jpeg'],['jpeg','image/jpeg'],['webp','image/webp'],
  ['gif','image/gif'],['bmp','image/bmp'],['ico','image/x-icon'],['avif','image/avif']])
const TEXT_FILE_EXTENSIONS = new Set(['txt','md','markdown','mermaid','mmd','py','pyi','js','mjs','cjs','jsx','ts','tsx',
  'json','jsonl','html','htm','css','scss','sass','less','sh','bash','zsh','fish','yaml','yml','toml','ini','conf',
  'sql','java','c','h','cc','cpp','hpp','cs','go','rs','rb','php','swift','kt','kts','scala','lua','r','pl','ps1',
  'xml','log','csv','tsv','tex','diff','patch','dockerfile','makefile','gradle','properties','env','srt','vtt'])

/** User-selected generated attachments only; never read conversation text or application state. */
export const WEBSITE_FILE_MAX_BYTES = 16 * 1024 * 1024
export type WebsiteFile = { readonly kind: 'file'; readonly name: string; readonly mediaType: string; readonly dataUrl: string }
export type WebsiteDownload = WebsiteFile | { readonly kind: 'failed' | 'too-large' | 'busy' }

/** Runs in the approved guest. No API replacement, preload, IPC, storage or private React state. */
export function manageWebsiteDownloads(doc: Document, origin: string, action: 'poll' | 'dispose', enabled: boolean, maxBytes: number): unknown {
  if (origin !== 'https://chat.deepseek.com' || !doc.defaultView) return null
  type Kind = 'svg' | 'png' | 'code' | 'file'
  type State = { marker: string; poll(enabled: boolean): unknown; dispose(): void }
  const IMAGE_EXTENSIONS: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif' }
  const BINARY_EXTENSIONS = new Set(['pdf','doc','docx','xls','xlsx','ppt','pptx','zip','rar','7z','gz','tar',
    'mp3','mp4','wav','mov','webm','ogg','m4a','aac','flac','epub','rtf','odt','ods','odp'])
  // Plain code blocks download text as-is; accept the common source/text extensions only.
  const TEXT_EXTENSIONS = new Set(['txt','md','markdown','mermaid','mmd','py','pyi','js','mjs','cjs','jsx','ts','tsx',
    'json','jsonl','html','htm','css','scss','sass','less','sh','bash','zsh','fish','yaml','yml','toml','ini','conf',
    'sql','java','c','h','cc','cpp','hpp','cs','go','rs','rb','php','swift','kt','kts','scala','lua','r','pl','ps1',
    'xml','log','csv','tsv','tex','diff','patch','dockerfile','makefile','gradle','properties','env','srt','vtt'])
  const win = doc.defaultView as Window & { __dshChatDownloads?: State }
  const previous = win.__dshChatDownloads
  if (previous && previous.marker !== 'dsh-chat-downloads-v1') return null
  if (action === 'dispose') { previous?.dispose(); return null }
  if (previous) return previous.poll(enabled)
  let active = enabled, stopped = false, pending = false
  let token: { type: Kind; until: number } | null = null
  let owner: { block: Element; until: number } | null = null
  let result: WebsiteDownload | null = null
  let controller: AbortController | null = null
  const lifetime = new AbortController()
  const alive = () => !stopped && active && win.location.origin === origin
  const revoke = () => { token = null; owner = null; result = null; controller?.abort(); controller = null; pending = false }
  const classify = (entry: Element): Kind | null => {
    const label = (entry.querySelector('.ds-dropdown-menu-option__label')?.textContent ?? entry.textContent ?? '').trim()
    const match = /^(?:下载\s*)?(SVG|PNG|代码|code)$/i.exec(label)
    const value = match?.[1].toLowerCase()
    return value === 'svg' ? 'svg' : value === 'png' ? 'png' : value === '代码' || value === 'code' ? 'code' : null
  }
  // A rendered Mermaid block: one two-tab Diagram/Code switch inside one code block.
  const mermaidBlock = (block: Element): boolean => {
    const segmenteds = [...block.querySelectorAll('.ds-segmented[role="tablist"]')]
    if (segmenteds.length !== 1) return false
    const tabs = [...segmenteds[0].querySelectorAll('[role="tab"]')]
    if (tabs.length !== 2) return false
    const labels = tabs.map(tab => (tab.textContent ?? '').trim().toLowerCase())
    const some = (values: readonly string[]) => labels.some(label => values.includes(label))
    return some(['图表', 'diagram']) && some(['代码', 'code'])
  }
  /** Only the official Mermaid download trigger and its exact three-choice menu arm a transfer. */
  const authorize = (event: Event) => {
    if (!alive() || !event.isTrusted || !(event.target instanceof Element)) return
    const now = Date.now()
    const target = event.target
    const trigger = target.closest('.ds-button[role="button"], button, [role="button"]')
    if (trigger) {
      const block = trigger.closest('.md-code-block')
      const text = (trigger.querySelector('.code-info-button-text')?.textContent ?? trigger.textContent ?? '').trim()
      const aria = (trigger.getAttribute('aria-label') ?? '').trim()
      const download = /^(?:下载|Download)$/i.test(text) || /(?:下载|download)/i.test(aria)
      if (download) {
        // Mermaid exposes a three-choice menu; plain code blocks and attachment
        // buttons download directly, so arm the next download anchor for a while.
        if (block && mermaidBlock(block)) owner = { block, until: now + 10000 }
        else token = { type: 'file', until: now + 10000 }
      }
      return
    }
    const item = target.closest('.ds-dropdown-menu-option')
    if (!item) return
    const menu = item.closest('[role="menu"]')
    if (!menu) return
    const options = [...menu.querySelectorAll('.ds-dropdown-menu-option')].filter(option => option.closest('[role="menu"]') === menu)
    if (options.length !== 3) return
    const types = options.map(classify)
    if (types.some(type => type === null) || new Set(types).size !== 3) return
    const selected = classify(item)
    if (!selected || !owner || owner.until < now || !owner.block.isConnected) return
    if ((item as HTMLElement).getAttribute('aria-disabled') === 'true') return
    token = { type: selected, until: now + 5000 }
    owner = null
  }
  const click = (event: Event) => {
    authorize(event)
    if (!alive() || !(event.target instanceof Element)) return
    const link = event.target.closest('a[download]') as HTMLAnchorElement | null
    if (!link) return
    if (!token || token.until < Date.now()) {
      // A download link the user clicks directly is authorized by that click alone.
      if (!event.isTrusted) return
      token = { type: 'file', until: Date.now() + 1000 }
    }
    const expected = token.type
    const name = link.getAttribute('download') ?? ''
    const extension = /\.([a-z0-9]+)$/i.exec(name)?.[1].toLowerCase()
    const documented = expected === 'code' ? ['mermaid', 'mmd', 'txt', 'md']
      : expected === 'file' ? (extension ? [...TEXT_EXTENSIONS, ...Object.keys(IMAGE_EXTENSIONS), ...BINARY_EXTENSIONS] : null) : [expected]
    if (!documented || !name || name.length > 255 || /[\\/\u0000-\u001f\u007f]/.test(name)) return
    let source: URL
    try { source = new URL(link.href) } catch { return }
    const blobSource = source.protocol === 'blob:' && source.origin === origin
    const dataSource = source.protocol === 'data:' && source.href.length <= Math.ceil(maxBytes / 3) * 4 + 1024
      && /^data:(?:application\/octet-stream|image\/[a-z0-9.+-]+|text\/plain)(?:[;,]|$)/i.test(source.href)
    if (!blobSource && !dataSource) return
    token = null
    event.preventDefault()
    event.stopImmediatePropagation()
    if (pending) return
    if (result) { result = { kind: 'busy' }; return }
    pending = true
    const read = new AbortController()
    controller = read
    const timer = win.setTimeout(() => read.abort(), 8000)
    const mediaType = expected === 'png' ? 'image/png' : expected === 'svg' ? 'image/svg+xml'
      : (extension ? IMAGE_EXTENSIONS[extension] ?? (BINARY_EXTENSIONS.has(extension) ? 'application/octet-stream' : 'text/plain') : 'text/plain')
    // Start immediately in capture: the site's helper revokes its object URL shortly after.
    void fetch(source.href, { signal: read.signal, credentials: 'omit' }).then(async response => {
      if (!response.ok || !response.body) throw new Error('Unavailable attachment')
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let size = 0
      try {
        for (;;) {
          const part = await reader.read()
          if (part.done) break
          size += part.value.byteLength
          if (size > maxBytes) {
            await reader.cancel()
            if (alive() && controller === read) result = { kind: 'too-large' }
            return
          }
          chunks.push(part.value)
        }
      } finally { reader.releaseLock() }
      if (!alive() || read.signal.aborted || controller !== read) return
      const blob = new Blob(chunks as BlobPart[], { type: mediaType })
      if (!blob.size) throw new Error('Empty attachment')
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const file = new FileReader()
        const abort = () => { file.abort(); reject(new Error('Attachment cancelled')) }
        read.signal.addEventListener('abort', abort, { once: true })
        file.onload = () => { read.signal.removeEventListener('abort', abort); resolve(String(file.result)) }
        file.onerror = () => { read.signal.removeEventListener('abort', abort); reject(new Error('Attachment unreadable')) }
        file.readAsDataURL(blob)
      })
      if (alive() && !read.signal.aborted && controller === read) result = { kind: 'file', name, mediaType, dataUrl }
    }).catch(() => {
      if (alive() && controller === read) result = { kind: 'failed' }
    }).finally(() => {
      win.clearTimeout(timer)
      if (controller === read) { controller = null; pending = false }
    })
  }
  const state: State = {
    marker: 'dsh-chat-downloads-v1',
    poll(next) {
      active = next
      if (!active) { revoke(); return null }
      const value = result
      result = null
      return value
    },
    dispose() {
      if (stopped) return
      stopped = true; active = false; revoke(); lifetime.abort()
      if (win.__dshChatDownloads === state) delete win.__dshChatDownloads
    },
  }
  win.__dshChatDownloads = state
  doc.addEventListener('click', click, { capture: true, signal: lifetime.signal })
  doc.addEventListener('keydown', (event: KeyboardEvent) => { if (event.key === 'Enter' && !event.repeat) authorize(event) }, { capture: true, signal: lifetime.signal })
  win.addEventListener('pagehide', () => state.dispose(), { once: true, signal: lifetime.signal })
  return null
}

export function websiteDownloadScript(action: 'poll' | 'dispose', enabled = false): string {
  return `(${manageWebsiteDownloads.toString()})(document,location.origin,${JSON.stringify(action)},${enabled},${WEBSITE_FILE_MAX_BYTES})`
}

/** Treat guest output as untrusted; never hand an arbitrary URL to the native saver. */
export function parseWebsiteDownload(value: unknown): WebsiteDownload | null {
  if (typeof value !== 'object' || value === null || !('kind' in value)) return null
  if (value.kind === 'failed' || value.kind === 'too-large' || value.kind === 'busy') return { kind: value.kind }
  if (value.kind !== 'file' || !('name' in value) || typeof value.name !== 'string' || !value.name || value.name.length > 255
    || /[\\/\u0000-\u001f\u007f]/.test(value.name) || !('mediaType' in value) || typeof value.mediaType !== 'string'
    || !('dataUrl' in value) || typeof value.dataUrl !== 'string') return null
  const extension = /\.([a-z0-9]+)$/i.exec(value.name)?.[1].toLowerCase()
  const mediaType = extension === 'svg' ? 'image/svg+xml'
    : extension === undefined ? 'text/plain'
    : IMAGE_FILE_TYPES.get(extension) ?? (BINARY_FILE_EXTENSIONS.has(extension) ? 'application/octet-stream'
      : TEXT_FILE_EXTENSIONS.has(extension) ? 'text/plain' : null)
  if (!mediaType || value.mediaType !== mediaType) return null
  const prefix = `data:${mediaType};base64,`
  if (!value.dataUrl.startsWith(prefix) || value.dataUrl.length > prefix.length + Math.ceil(WEBSITE_FILE_MAX_BYTES / 3) * 4) return null
  const base64 = value.dataUrl.slice(prefix.length)
  if (!base64 || base64.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) return null
  const size = base64.length / 4 * 3 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
  if (size <= 0 || size > WEBSITE_FILE_MAX_BYTES) return null
  return { kind: 'file', name: value.name, mediaType, dataUrl: value.dataUrl }
}

/** Reconstitute only the explicitly selected file; bytes never enter a UI snapshot or log. */
export function websiteDownloadBlob(value: WebsiteFile): Blob {
  const checked = parseWebsiteDownload(value)
  if (!checked || checked.kind !== 'file') throw new Error('Invalid attachment')
  const encoded = checked.dataUrl.slice(checked.dataUrl.indexOf(',') + 1)
  const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0))
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
  if (checked.mediaType === 'image/png' && ![137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) throw new Error('Invalid attachment')
  if (checked.mediaType === 'image/jpeg' && !(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) throw new Error('Invalid attachment')
  if (checked.mediaType === 'image/gif' && !['GIF87a', 'GIF89a'].includes(ascii(0, 6))) throw new Error('Invalid attachment')
  if (checked.mediaType === 'image/webp' && !(ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP')) throw new Error('Invalid attachment')
  if (checked.mediaType === 'image/bmp' && !(bytes[0] === 0x42 && bytes[1] === 0x4d)) throw new Error('Invalid attachment')
  if (checked.mediaType === 'text/plain' || checked.mediaType === 'image/svg+xml') {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    if (text.includes('\u0000') || checked.mediaType === 'image/svg+xml' && !/^\s*(?:<\?xml[^>]*\?>\s*)?<svg(?:\s|>)/i.test(text.slice(0, 4096))) throw new Error('Invalid attachment')
  }
  return new Blob([bytes], { type: checked.mediaType })
}
