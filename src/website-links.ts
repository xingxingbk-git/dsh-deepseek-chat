export type WebsiteLinkRoute = { readonly kind: 'same-site' | 'external'; readonly url: string }
export type WebsiteLinkResult =
  | { readonly kind: 'same-site'; readonly url: string }
  | { readonly kind: 'external' | 'rejected' | 'failed' }
export type WebsiteLinkOpener = (url: string, target: '_blank', features: 'noopener,noreferrer') => unknown

/** Absolute, credential-free web URLs only. No base URL, coercion, logging or page state. */
export function routeWebsiteLink(value: unknown): WebsiteLinkRoute | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 8192
    || value.trim() !== value || /[\u0000-\u001f\u007f\\]/.test(value)
    || !/^https?:\/\/[^/?#]/i.test(value)) return null
  try {
    const target = new URL(value)
    if (!['http:', 'https:'].includes(target.protocol) || target.username !== '' || target.password !== ''
      || target.href.length > 8192) return null
    return { kind: target.origin === 'https://chat.deepseek.com' ? 'same-site' : 'external', url: target.href }
  } catch { return null }
}

/** Use the caller's public window.open binding; the same-site route stays in its existing guest. */
export function handleWebsiteLink(value: unknown, open: WebsiteLinkOpener): WebsiteLinkResult {
  const route = routeWebsiteLink(value)
  if (!route) return { kind: 'rejected' }
  if (route.kind === 'same-site') return { kind: 'same-site', url: route.url }
  try {
    open(route.url, '_blank', 'noopener,noreferrer')
    // DSH's desktop window-open handler opens externally and denies a child
    // window. Its normal null result is not evidence that dispatch failed.
    return { kind: 'external' }
  } catch { return { kind: 'failed' } }
}
