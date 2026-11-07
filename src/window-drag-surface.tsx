import { createPortal } from 'react-dom'
import { useLayoutEffect, useRef, useState } from 'react'
import { useDshChat, type DshChatBridgeProps, type DshChatViewState, type DshChatViewportRect } from './ui.js'
import { createWindowDragTracker, windowDragExclusions, type WindowDragRegion } from './window-drag.js'

function dragReady(state: DshChatViewState): state is DshChatViewState & { readonly viewport: DshChatViewportRect } {
  const rect = state.viewport
  return state.mode === 'chat' && state.modeEnabled && !state.settingsOpen
    && state.authorizationStatus === 'authorized' && state.desktopAvailable
    && state.websiteAuthenticationStatus === 'signed-in' && !state.webLoading && !state.webError
    && state.websiteNavigation.status === 'ready' && state.websiteNavigation.authenticated === true
    && rect !== null && !rect.inert && [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)
    && rect.left >= 0 && rect.top >= 0 && rect.width > 0 && rect.height >= 40
}

function sameViewport(left: DshChatViewportRect | null, right: DshChatViewportRect): boolean {
  return left !== null && left.left === right.left && left.top === right.top
    && left.width === right.width && left.height === right.height
}

function windowChrome() {
  const root = document.documentElement
  return {
    fullscreen: root.getAttribute('data-fullscreen') === 'true' || document.fullscreenElement !== null,
    captionHeight: root.hasAttribute('data-windows-titlebar')
      ? Number.parseFloat(getComputedStyle(root).getPropertyValue('--dsh-windows-titlebar-height')) || 40 : 0,
  }
}

/** Mode-owned native hit testing; never changes the guest or any host-owned node. */
export function DshChatWindowDragSurface({ bridge, signal }: DshChatBridgeProps & { readonly signal: AbortSignal }) {
  const state = useDshChat(bridge)
  const ownRef = useRef<HTMLDivElement | null>(null)
  const trackerRef = useRef<ReturnType<typeof createWindowDragTracker> | null>(null)
  const [aborted, setAborted] = useState(signal.aborted)
  const [surface, setSurface] = useState<HTMLElement | null>(null)
  const [chrome, setChrome] = useState(windowChrome)
  const [sample, setSample] = useState<{ readonly key: string; readonly regions: readonly WindowDragRegion[] } | null>(null)
  const withdrawOwn = () => {
    // Abort must revoke native hit testing before React's asynchronous unmount.
    // Only the node rendered by this component is touched, never the portal host.
    const own = ownRef.current
    if (own) { own.style.display = 'none'; own.removeAttribute('data-window-drag') }
  }

  useLayoutEffect(() => {
    const stop = () => {
      withdrawOwn()
      trackerRef.current?.dispose()
      trackerRef.current = null
      setAborted(true)
      setSample(null)
    }
    setAborted(signal.aborted)
    signal.addEventListener('abort', stop, { once: true })
    if (signal.aborted) stop()
    return () => {
      signal.removeEventListener('abort', stop)
      withdrawOwn()
      // The sampler effect performs its own terminal cleanup after this revoke.
    }
  }, [signal])

  useLayoutEffect(() => {
    const locate = () => setSurface(document.getElementById('dsh-chat-website-surface'))
    const updateChrome = () => {
      const next = windowChrome()
      if (next.fullscreen) withdrawOwn()
      setChrome(previous => previous.fullscreen === next.fullscreen && previous.captionHeight === next.captionHeight ? previous : next)
    }
    locate()
    const surfaceObserver = new MutationObserver(locate)
    surfaceObserver.observe(document.body, { childList: true })
    const chromeObserver = new MutationObserver(updateChrome)
    chromeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-fullscreen', 'data-windows-titlebar', 'style'] })
    document.addEventListener('fullscreenchange', updateChrome)
    window.addEventListener('resize', updateChrome)
    return () => {
      surfaceObserver.disconnect()
      chromeObserver.disconnect()
      document.removeEventListener('fullscreenchange', updateChrome)
      window.removeEventListener('resize', updateChrome)
    }
  }, [])

  const viewport = state.viewport
  const key = `${state.authorizationGeneration}:${state.websiteAuthenticationRevision}:${state.websiteReloadRevision}:${viewport?.left}:${viewport?.top}:${viewport?.width}:${viewport?.height}`
  const clipTop = Math.max(0, chrome.captionHeight - (viewport?.top ?? 0))
  const rowHeight = 40 - clipTop
  const enabled = !aborted && !signal.aborted && !chrome.fullscreen && rowHeight >= 8 && dragReady(state) && surface !== null

  useLayoutEffect(() => {
    setSample(null)
    if (!enabled || !viewport || !surface) return
    const generation = state.authorizationGeneration
    const authenticationRevision = state.websiteAuthenticationRevision
    const reloadRevision = state.websiteReloadRevision
    let stopped = false
    const current = () => {
      const latest = bridge.getSnapshot()
      return !stopped && !signal.aborted && !windowChrome().fullscreen && dragReady(latest)
        && latest.authorizationGeneration === generation && latest.websiteAuthenticationRevision === authenticationRevision
        && latest.websiteReloadRevision === reloadRevision && sameViewport(latest.viewport, viewport)
        && surface.isConnected && document.getElementById('dsh-chat-website-surface') === surface
    }
    const tracker = createWindowDragTracker({
      read: () => {
        const latestViewport = bridge.getSnapshot().viewport
        return current() && latestViewport ? bridge.readWindowDrag(latestViewport) : []
      },
      onChange: regions => {
        if (stopped || signal.aborted) return
        if (!current() || regions.length === 0) { withdrawOwn(); setSample(null); return }
        setSample(previous => previous?.key === key && previous.regions === regions ? previous : { key, regions })
      },
    })
    trackerRef.current = tracker
    const refresh = () => tracker.refresh()
    window.addEventListener('resize', refresh)
    tracker.start()
    return () => {
      withdrawOwn()
      stopped = true
      window.removeEventListener('resize', refresh)
      tracker.dispose()
      if (trackerRef.current === tracker) trackerRef.current = null
    }
  }, [bridge, signal, surface, enabled, key])

  useLayoutEffect(() => {
    const own = ownRef.current
    if (!own) return
    const latest = bridge.getSnapshot()
    if (!enabled || signal.aborted || windowChrome().fullscreen || !surface?.isConnected || own.parentElement !== surface
      || sample?.key !== key || sample.regions.length === 0 || !viewport || !dragReady(latest)
      || latest.authorizationGeneration !== state.authorizationGeneration
      || latest.websiteAuthenticationRevision !== state.websiteAuthenticationRevision
      || latest.websiteReloadRevision !== state.websiteReloadRevision || !sameViewport(latest.viewport, viewport)) {
      withdrawOwn()
      return
    }
    // A revoke and a fresh sample can share one React batch and keep this same
    // DOM node. Repair only our imperatively revoked fields, without touching
    // the stable positive rectangle or overriding platform/fullscreen CSS.
    if (own.style.display === 'none') own.style.removeProperty('display')
    if (own.getAttribute('data-window-drag') !== 'true') own.setAttribute('data-window-drag', 'true')
  })

  if (!enabled || !surface || !viewport || sample?.key !== key || sample.regions.length === 0) return null
  return createPortal(<div ref={ownRef} className="dsh-chat-window-drag-row" data-window-drag="true" aria-hidden="true"
    style={{ position: 'absolute', left: 0, top: clipTop, width: viewport.width, height: rowHeight, pointerEvents: 'none' }}>
    {windowDragExclusions(sample.regions, viewport.width).map((hole, index) =>
      <div key={index} className="dsh-chat-window-drag-hole" style={{ position: 'absolute', left: hole.left, top: 0, width: hole.width, height: rowHeight, pointerEvents: 'none' }} />)}
  </div>, surface)
}
