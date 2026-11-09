export type WebsiteLinkRoute = {
    readonly kind: 'same-site' | 'external';
    readonly url: string;
};
export type WebsiteLinkResult = {
    readonly kind: 'same-site';
    readonly url: string;
} | {
    readonly kind: 'external' | 'rejected' | 'failed';
};
export type WebsiteLinkOpener = (url: string, target: '_blank', features: 'noopener,noreferrer') => unknown;
/** Absolute, credential-free web URLs only. No base URL, coercion, logging or page state. */
export declare function routeWebsiteLink(value: unknown): WebsiteLinkRoute | null;
/** Use the caller's public window.open binding; the same-site route stays in its existing guest. */
export declare function handleWebsiteLink(value: unknown, open: WebsiteLinkOpener): WebsiteLinkResult;
/** Page-generated resources (downloads, previews) must never be treated as external links. */
export declare function isGeneratedResourceUrl(value: unknown): boolean;
