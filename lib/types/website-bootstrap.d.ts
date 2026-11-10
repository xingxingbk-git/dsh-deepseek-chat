import type { WebsiteNavigation } from './website-navigation.js';
/** A fresh document must be adapted at desktop width before its first visible paint. */
export declare const WEBSITE_DESKTOP_WIDTH = 1024;
export declare const WEBSITE_BOOTSTRAP_TIMEOUT = 30000;
type Projection = Pick<WebsiteNavigation, 'status' | 'authenticated' | 'desktopReady' | 'viewportWidth'>;
/** Only the official Google account origin is an embedded sign-in surface. */
export declare function isGoogleSignInUrl(value: string): boolean;
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
