import { createPortal } from 'react-dom'
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

const WIDTH = 230
const MARGIN = 12
const GAP = 6

/** The sidebar brand row clips its descendants; our own notice must escape it. */
export function DshChatBrandNotice({ anchor, role = 'status', children }: {
  readonly anchor: RefObject<HTMLElement>
  readonly role?: 'status' | 'alert'
  readonly children: ReactNode
}) {
  const [box, setBox] = useState<{ left: number; top: number; maxHeight: number } | null>(null)
  const notice = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    let frame = 0
    const measure = () => {
      frame = 0
      const element = anchor.current
      if (!element || !element.isConnected) { setBox(null); return }
      const rect = element.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) { setBox(null); return }
      const width = Math.min(WIDTH, Math.max(0, window.innerWidth - MARGIN * 2))
      const left = Math.min(Math.max(rect.right - width, MARGIN), Math.max(MARGIN, window.innerWidth - MARGIN - width))
      const top = rect.bottom + GAP
      setBox(previous => previous && previous.left === left && previous.top === top
        && previous.maxHeight === Math.max(0, window.innerHeight - top - MARGIN) ? previous
        : { left, top, maxHeight: Math.max(0, window.innerHeight - top - MARGIN) })
    }
    const schedule = () => { if (frame === 0) frame = requestAnimationFrame(measure) }
    measure()
    const sizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    const element = anchor.current
    if (element) sizes?.observe(element, { box: 'border-box' })
    if (element?.parentElement) sizes?.observe(element.parentElement)
    const shape = new MutationObserver(schedule)
    let parent: Element | null = anchor.current
    for (let depth = 0; parent && depth < 6; depth++, parent = parent.parentElement) {
      shape.observe(parent, { attributes: true, attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'inert', 'data-sidebar-collapsed'] })
    }
    window.addEventListener('resize', schedule)
    document.addEventListener('scroll', schedule, true)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      sizes?.disconnect(); shape.disconnect()
      window.removeEventListener('resize', schedule)
      document.removeEventListener('scroll', schedule, true)
    }
  }, [anchor])
  if (box === null || typeof document === 'undefined') return null
  return createPortal(<div ref={notice} className="dsh-chat-authorization-notice dsh-chat-brand-notice" role={role}
    style={{ position: 'fixed', left: box.left, top: box.top, right: 'auto', bottom: 'auto', width: WIDTH, maxWidth: `calc(100vw - ${MARGIN * 2}px)`, maxHeight: box.maxHeight, overflow: 'auto', zIndex: 60 }}>{children}</div>, document.body)
}
