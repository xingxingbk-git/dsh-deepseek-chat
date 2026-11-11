import type { WebsiteNavigation } from './website-navigation.js';
/** A fresh document must be adapted at desktop width before its first visible paint. */
export declare const WEBSITE_DESKTOP_WIDTH = 1024;
export declare const WEBSITE_BOOTSTRAP_TIMEOUT = 30000;
type Projection = Pick<WebsiteNavigation, 'status' | 'authenticated' | 'desktopReady' | 'viewportWidth'>;
/**
 * Any external HTTPS sign-in provider (Google, Apple, WeChat, enterprise SSO,
 * ...) may be shown as-is while a DeepSeek sign-in is in progress. DeepSeek
 * itself, non-HTTPS pages, non-default ports and credential-bearing URLs never
 * qualify.
 */
export declare function isExternalAuthUrl(value: string): boolean;
/**
 * Per-guest, per-document state, deliberately independent of React layout props.
 * A resize never starts a document, and a timeout never exposes an unadapted page.
 */
export declare function createWebsiteBootstrap(options: {
    readonly desktop: (enabled: boolean) => void;
    readonly timeout: () => void;
    readonly schedule?: (callback: () => void, delay: number) => unknown;
    readonly cancel?: (timer: unknown) => void;
}): {
    begin(): number;
    domReady(expected: number): void;
    loaded(expected: number): void;
    /** A provider form awaits the user; it cannot supply DeepSeek layout/account proof. */
    authentication(expected: number, url: string): boolean;
    /** The first conversation may introduce Share after a headerless new-chat page. */
    recheck(expected: number): boolean;
    /** Expected width is the real host content box; observed width comes from the guest DOM. */
    project(expected: number, navigation: Projection, expectedWidth: number): "waiting" | "resized" | "ready";
    dispose(): void;
};
export {};
