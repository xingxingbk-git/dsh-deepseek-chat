/** User-approved rc.2 sidebar exception. No services, Session state or credentials. */
export interface SidebarAdapterState {
  readonly chat: boolean
  readonly canCreate: boolean
}

/** Client-owned lifetime survives the brand seat unmounting on sidebar collapse. */
export function createSidebarBinding(read: () => SidebarAdapterState, create: () => void, report: (ready: boolean) => void) {
  let adapter: ReturnType<typeof attachSidebarAdapter> = null
  let owner: HTMLElement | null = null
  return {
    attach(name: HTMLElement) {
      if (owner === name && adapter?.valid()) { adapter.sync(); return }
      adapter?.dispose()
      owner = name
      adapter = attachSidebarAdapter(name, read, create)
      report(adapter !== null)
    },
    sync() { adapter?.sync() },
    dispose() { adapter?.dispose(); adapter = null; owner = null },
  }
}

/** Start at our own brand seat and require the shipped, direct-child shell shape.
 * Unknown layouts are left alone; no global search or hashed CSS selectors. */
export function attachSidebarAdapter(
  name: HTMLElement,
  read: () => SidebarAdapterState,
  create: () => void,
): { sync(): void; valid(): boolean; dispose(): void } | null {
  // The renderer's addressable SlotOutlet is display:contents, but remains a DOM ancestor.
  const outlet = name.parentElement
  const nameSeat = outlet?.getAttribute('data-slot') === 'sidebar.brand.name'
    ? outlet.parentElement : outlet
  const identity = nameSeat?.parentElement
  const brand = identity?.parentElement
  const row = brand?.parentElement
  const root = row?.parentElement
  if (!nameSeat || !identity || !brand || !row || !root
    || identity.getAttribute('aria-hidden') !== 'true'
    || !row.hasAttribute('data-window-drag') || identity.children.length !== 2) return null
  // In the shipped shell the new-session control is the sole direct button
  // immediately after the brand row. Labels can change during locale reloads.
  const next = row.nextElementSibling
  const buttons = Array.from(root.children).filter(element => element.tagName === 'BUTTON')
  if (!next || next.tagName !== 'BUTTON' || buttons.length !== 1 || buttons[0] !== next) return null
  const newButton = next as HTMLButtonElement

  const originalAttributes = new Map<Element, Map<string, string | null>>()
  const mark = (element: Element, key: string, value: string) => {
    let originals = originalAttributes.get(element)
    if (!originals) { originals = new Map(); originalAttributes.set(element, originals) }
    if (!originals.has(key)) originals.set(key, element.getAttribute(key))
    if (element.getAttribute(key) !== value) element.setAttribute(key, value)
  }
  mark(brand, 'data-dsh-chat-brand-fill', 'brand')
  mark(identity, 'data-dsh-chat-brand-fill', 'identity')
  mark(nameSeat, 'data-dsh-chat-brand-fill', 'name')
  mark(newButton, 'data-dsh-chat-new-session', 'true')
  const originallyDisabled = newButton.disabled
  let disposed = false
  const intercept = (event: Event) => {
    if (disposed || !read().chat) return
    // Keyboard activation also produces click; stop before React's delegated action.
    event.preventDefault(); event.stopImmediatePropagation()
    if (read().canCreate) create()
  }
  newButton.addEventListener('click', intercept, true)
  // On Web/Windows the entire brand is also a New Session button.
  if (brand.tagName === 'BUTTON') brand.addEventListener('click', intercept, true)
  const sync = () => {
    if (disposed) return
    const state = read()
    mark(brand, 'data-dsh-chat-brand-fill', 'brand')
    mark(identity, 'data-dsh-chat-brand-fill', 'identity')
    mark(nameSeat, 'data-dsh-chat-brand-fill', 'name')
    mark(root, 'data-dsh-chat-sidebar-mode', state.chat ? 'chat' : 'harness')
    newButton.disabled = state.chat ? !state.canCreate : originallyDisabled
    for (const nav of Array.from(root.children).filter(element => element.tagName === 'NAV')) {
      // rc.2 owns all global panel entries in this direct-child nav. Hide the
      // region, including entries registered later, without deleting React nodes.
      mark(nav, 'data-dsh-chat-panel-region', 'true')
    }
  }
  const observer = new MutationObserver(sync)
  observer.observe(root, { childList: true, subtree: true })
  sync()
  return {
    sync,
    valid: () => !disposed && name.isConnected && nameSeat.parentElement === identity
      && identity.parentElement === brand && brand.parentElement === row
      && row.parentElement === root && newButton.parentElement === root,
    dispose() {
      if (disposed) return
      disposed = true; observer.disconnect()
      newButton.removeEventListener('click', intercept, true)
      brand.removeEventListener('click', intercept, true)
      newButton.disabled = originallyDisabled
      for (const [element, attributes] of originalAttributes) for (const [key, value] of attributes) {
        if (value === null) element.removeAttribute(key)
        else element.setAttribute(key, value)
      }
    },
  }
}
