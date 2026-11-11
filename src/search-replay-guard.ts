/** rc.2 replays its retained request counter on WorkspaceBrowser remount.
 * Adapt only the view hook; never mutate the host request store or actions. */
import { createElement, useCallback, useRef } from 'react'
import type { ComponentType } from 'react'
import type { StoredEntry } from '@deepseek-ai/dsh-client-ui-slots'

export function guardHarnessSearchReplay(entry: StoredEntry): (() => void) | null {
  // Identify the workspace browser by its stable registration facts only: the
  // workspace dictionary namespace, a component, and its declared inject face.
  // Slot children keys moved between DSH releases, so they must not gate this
  // guard; the wrapper below re-checks the hook at render time instead.
  if (entry.locale !== 'workspace' || typeof entry.component !== 'function' || !entry.inject) return null
  const original = entry.component as ComponentType<Record<string, unknown>>
  type SearchState = { searchRequest: number; [key: string]: unknown }
  type SearchHook = <T>(selector: (state: SearchState) => T) => T
  function SearchRequestGuard(props: Record<string, unknown>) {
    const originalHook = props.useWorkspaceShortcuts as SearchHook
    const request = originalHook(state => state.searchRequest)
    const mountedRequest = useRef(request)
    const guardedHook = useCallback<SearchHook>(selector => originalHook(state =>
      selector(state.searchRequest === mountedRequest.current ? { ...state, searchRequest: 0 } : state)), [originalHook])
    return createElement(original, { ...props, useWorkspaceShortcuts: guardedHook })
  }
  function GuardedWorkspace(props: Record<string, unknown>) {
    // Unknown component shapes pass through untouched instead of failing.
    return typeof props.useWorkspaceShortcuts === 'function'
      ? createElement(SearchRequestGuard, props) : createElement(original, props)
  }
  entry.component = GuardedWorkspace
  return () => { if (entry.component === GuardedWorkspace) entry.component = original }
}
