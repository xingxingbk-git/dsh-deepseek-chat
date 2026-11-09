/** Session-scoped guest lifetime rules for the CHAT website surface. */
/** The CHAT website and its signed-in conversation history live on this origin only. */
export declare const WEBSITE_ORIGIN = "https://chat.deepseek.com";
export interface WebsiteGuestState {
    readonly mode: string;
    readonly modeEnabled: boolean;
    readonly settingsOpen: boolean;
    readonly authorizationStatus: string;
    readonly accountStorageKey: string | null;
}
/**
 * Decide whether the CHAT guest should exist for the current state.
 *
 * Electron resolves menu roles such as `toggleDevTools` through
 * `webContents.getFocusedWebContents()`, which deliberately prefers a webview over the
 * embedder that also reports focus. Packaged hosts attach every guest with
 * `devTools: false`, so any retained guest keeps F12, Ctrl+Shift+I and the menu item
 * pointing at a disabled webview. The configured lifetime decides the tradeoff:
 * retaining keeps switching instant, while immediate/delayed release frees the guest so
 * the main window becomes the only DevTools target. `released` carries the runtime
 * decision (immediate, or the delayed timer elapsed).
 */
export declare function holdsWebsiteGuest(state: WebsiteGuestState, released?: boolean): boolean;
/**
 * Resume the last in-site page after the guest was released. Anything that is not an
 * official `chat.deepseek.com` URL falls back to the site root.
 */
export declare function resumeWebsiteUrl(candidate: string | null | undefined, fallback: string): string;
