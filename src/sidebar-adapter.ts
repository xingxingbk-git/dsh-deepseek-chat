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

/**
 * Brand-row visuals must not depend on takeover acceptance. Mark the three rows
 * that decide whether the wordmark may shrink, with a reversible cleanup.
 */
export function markBrandVisual(identity: HTMLElement, brand: HTMLElement, seat: HTMLElement): () => void {
  const entries: [HTMLElement, string, string][] = [
    [brand, 'data-dsh-chat-brand-fill', 'brand'],
    [identity, 'data-dsh-chat-brand-fill', 'identity'],
    [seat, 'data-dsh-chat-brand-fill', 'name'],
  ]
  const previous = entries.map(([element, attribute]) => [element, attribute, element.getAttribute(attribute)] as const)
  for (const [element, attribute, value] of entries) element.setAttribute(attribute, value)
  return () => {
    for (const [element, attribute, before] of previous) {
      if (before === null) element.removeAttribute(attribute)
      else element.setAttribute(attribute, before)
    }
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
  const anchorValid = () => name.isConnected && name.parentElement === outlet
    && (outlet === nameSeat || outlet?.parentElement === nameSeat)
    && nameSeat.parentElement === identity && identity.parentElement === brand
    && brand.parentElement === row && row.parentElement === root
    && identity.getAttribute('aria-hidden') === 'true' && identity.children.length === 2
    && row.hasAttribute('data-window-drag')
  const controls = (): { button: HTMLButtonElement | null; navs: Element[] } | null => {
    if (!anchorValid()) return null
    const next = row.nextElementSibling, children = Array.from(root.children)
    const buttons = children.filter(element => element.tagName === 'BUTTON')
    const navs = children.filter(element => element.tagName === 'NAV')
    // rc.2/0.2.1 and permitted 0.2.2: one direct new-session control after the row.
    if (next?.tagName === 'BUTTON' && buttons.length === 1 && buttons[0] === next) return { button: next as HTMLButtonElement, navs }
    // 0.2.2 session/create denial removes that button AND makes the brand a SPAN.
    // Prove its labelled NAV and immediately following workspace region locally;
    // zero buttons alone is not evidence that an arbitrary shell is supported.
    if (brand.tagName !== 'SPAN' || buttons.length !== 0 || next?.tagName !== 'NAV'
      || navs.length !== 1 || !next.getAttribute('aria-label')?.trim()) return null
    const regions = children.filter(element => Array.from(element.children).some(child => child.getAttribute('data-slot') === 'sidebar.workspaces'))
    const region = regions[0]
    if (regions.length !== 1 || region.tagName !== 'DIV' || region !== next.nextElementSibling
      || Array.from(region.children).filter(child => child.getAttribute('data-slot') === 'sidebar.workspaces').length !== 1) return null
    return { button: null, navs }
  }
  if (!controls()) return null

  const originalAttributes = new Map<Element, Map<string, string | null>>()
  const mark = (element: Element, key: string, value: string) => {
    let originals = originalAttributes.get(element)
    if (!originals) { originals = new Map(); originalAttributes.set(element, originals) }
    if (!originals.has(key)) originals.set(key, element.getAttribute(key))
    if (element.getAttribute(key) !== value) element.setAttribute(key, value)
  }
  const restore = (element: Element) => {
    for (const [key, value] of originalAttributes.get(element) ?? []) {
      if (value === null) element.removeAttribute(key)
      else element.setAttribute(key, value)
    }
    originalAttributes.delete(element)
  }
  const restoreAll = () => { for (const element of originalAttributes.keys()) restore(element) }
  let disposed = false, newButton: HTMLButtonElement | null = null, originallyDisabled = false
  let navigation = new Set<Element>()
  const bindButton = (next: HTMLButtonElement | null) => {
    if (newButton === next) return
    if (newButton) { newButton.disabled = originallyDisabled; restore(newButton) }
    newButton = next
    if (next) { originallyDisabled = next.disabled; mark(next, 'data-dsh-chat-new-session', 'true') }
  }
  const intercept = (event: Event) => {
    const state = read()
    if (disposed || !state.chat || !anchorValid() || !(event.target instanceof Node)) return
    const current = controls()
    const brandClick = brand.tagName === 'BUTTON' && brand.contains(event.target)
    const buttonClick = current?.button?.contains(event.target)
    if (!brandClick && !buttonClick) return
    // Delegate only inside our proven root so a freshly replaced button is safe
    // even before MutationObserver runs. Never redirect another shell control.
    event.preventDefault(); event.stopImmediatePropagation()
    if (current && state.canCreate) create()
  }
  root.addEventListener('click', intercept, true)
  const sync = () => {
    if (disposed) return
    const current = controls()
    if (!current) { bindButton(null); restoreAll(); navigation.clear(); return }
    const state = read()
    bindButton(current.button)
    mark(brand, 'data-dsh-chat-brand-fill', 'brand')
    mark(identity, 'data-dsh-chat-brand-fill', 'identity')
    mark(nameSeat, 'data-dsh-chat-brand-fill', 'name')
    mark(root, 'data-dsh-chat-sidebar-mode', state.chat ? 'chat' : 'harness')
    if (newButton) newButton.disabled = state.chat ? !state.canCreate : originallyDisabled
    const nextNavigation = new Set(current.navs)
    for (const nav of navigation) if (!nextNavigation.has(nav)) restore(nav)
    for (const nav of nextNavigation) mark(nav, 'data-dsh-chat-panel-region', 'true')
    navigation = nextNavigation
  }
  const observer = new MutationObserver(sync)
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden', 'aria-label', 'data-window-drag', 'data-slot'] })
  sync()
  return {
    sync,
    valid: () => !disposed && controls() !== null,
    dispose() {
      if (disposed) return
      disposed = true; observer.disconnect(); root.removeEventListener('click', intercept, true)
      bindButton(null); restoreAll(); navigation.clear()
    },
  }
}
