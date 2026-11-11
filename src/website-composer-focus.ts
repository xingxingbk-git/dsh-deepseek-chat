/**
 * Guest-side helper: focus the visible DeepSeek composer after a mode switch or
 * after opening/creating a conversation. Never reads draft text, never writes
 * global state; the serialized call only returns a boolean.
 */
export function focusWebsiteComposer(doc: Document, origin: string): boolean {
  if (origin.replace(/\/+$/, '') !== 'https://chat.deepseek.com') return false
  const view = doc.defaultView
  const visible = (node: Element): boolean => {
    const rect = node.getBoundingClientRect()
    const style = view?.getComputedStyle(node)
    return rect.width > 0 && rect.height > 0 && style?.display !== 'none' && style?.visibility !== 'hidden'
  }
  const isElement = (node: Element): node is HTMLElement =>
    Boolean(node && typeof (node as { getBoundingClientRect?: unknown }).getBoundingClientRect === 'function')
  const editors = [...doc.querySelectorAll('textarea,[contenteditable="true"],[contenteditable="plaintext-only"],[role="textbox"]')]
    .filter((node): node is HTMLElement => isElement(node) && visible(node) && !node.matches(':disabled,[aria-disabled="true"]'))
    .filter(node => !/搜索|search/i.test([node.getAttribute('aria-label'), node.getAttribute('placeholder')].join(' ')))
  if (!editors.length) return false
  // The composer is the largest editor near the bottom of the viewport.
  const score = (node: HTMLElement): number => {
    const rect = node.getBoundingClientRect()
    return rect.width * rect.height + (view ? Math.max(0, view.innerHeight - rect.bottom) : 0)
  }
  editors.sort((left, right) => score(right) - score(left))
  const target = editors[0]
  if (!target) return false
  if (doc.activeElement === target) return true
  target.focus({ preventScroll: true })
  const tag = target.tagName
  try {
    if (tag === 'TEXTAREA' || tag === 'INPUT') {
      const field = target as HTMLTextAreaElement | HTMLInputElement
      field.setSelectionRange(field.value.length, field.value.length)
    } else {
      const selection = view?.getSelection()
      if (selection) {
        const range = doc.createRange()
        range.selectNodeContents(target)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  } catch { /* caret placement is best effort */ }
  return doc.activeElement === target
}

/** Serialized into the isolated guest; the host only parses a boolean. */
export function websiteComposerFocusScript(): string {
  return `(${focusWebsiteComposer.toString()})(document, location.origin)`
}

export function parseComposerFocusResult(value: unknown): boolean {
  return value === true
}
