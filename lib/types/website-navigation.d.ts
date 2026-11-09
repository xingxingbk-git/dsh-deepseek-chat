import type { ChatLanguage } from './website-settings.js';
/** Visible website navigation/account/settings only; no credentials, storage or request APIs. */
export interface WebsiteConversation {
    readonly href: string;
    readonly title: string;
    readonly group: string;
}
export interface WebsiteNavigation {
    readonly status: 'loading' | 'ready' | 'sign-in' | 'unsupported';
    /** Public profile presence only; independent of layout/settings readiness. */
    readonly authenticated?: boolean;
    /** Current public account proof is unavailable; never means signed-out. */
    readonly identityUnconfirmed?: boolean;
    /** A currently verified CHAT layout still hides the original website sidebar. */
    readonly layoutReady?: boolean;
    /** Fresh desktop DOM proof: hidden sidebar, attempted native collapse and verified header. */
    readonly desktopReady?: boolean;
    /** The first conversation header arrived after a headerless new-chat page. */
    readonly needsDesktopChrome?: boolean;
    /** Numeric DOM viewport acknowledgement; no website content or host internals. */
    readonly viewportWidth?: number;
    readonly conversations: readonly WebsiteConversation[];
    readonly selectedHref: string | null;
    readonly canCreate: boolean;
    readonly error: string | null;
    readonly accountName?: string | null;
    readonly settings?: {
        language: string | null;
        theme: string | null;
        error: string | null;
        pending?: boolean;
    };
}
export type WebsiteCommand = {
    readonly type: 'snapshot';
    readonly showOriginal: boolean;
    readonly headerInset?: number;
} | {
    readonly type: 'open';
    readonly href: string;
} | {
    readonly type: 'conversation-action';
    readonly href: string;
    readonly action: 'rename' | 'pin' | 'unpin' | 'share' | 'delete';
    readonly title?: string;
} | {
    readonly type: 'settings-retry';
} | {
    readonly type: 'logout';
}
/** Handled by the guest owner; never a DOM-only snapshot. */
 | {
    readonly type: 'refresh';
    readonly requestId: number;
    readonly authenticationRevision: number;
} | {
    readonly type: 'new';
} | {
    readonly type: 'more';
} | {
    readonly type: 'restore';
};
export declare const emptyNavigation: () => WebsiteNavigation;
/** This function is serialized into our isolated guest. Keep all helpers inside it. */
export declare function adaptWebsiteNavigation(doc: Document, page: Pick<Location, 'origin' | 'pathname'>, command: WebsiteCommand): WebsiteNavigation;
export declare function websiteCommandScript(command: WebsiteCommand, contentFontSize?: number, colorScheme?: 'light' | 'dark', language?: ChatLanguage | null): string;
/** Treat the guest response as untrusted; keep only bounded, origin-scoped list data. */
export declare function parseWebsiteNavigation(value: unknown): WebsiteNavigation;
