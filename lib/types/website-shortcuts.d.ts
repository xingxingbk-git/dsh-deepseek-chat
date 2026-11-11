export declare const WEBSITE_SHORTCUT_MARKER = "dsh-chat-shortcut:";
export interface WebsiteShortcutConfig {
    readonly enabled: boolean;
    readonly chat: string;
    readonly harness: string;
}
export type WebsiteShortcutAction = 'chat' | 'harness' | 'toggle';
/** Serialized into the approved guest. Keep all helpers inside the IIFE. */
export declare function websiteShortcutScript(config: WebsiteShortcutConfig): string;
/** Parse one guest console line without trusting anything else on the channel. */
export declare function parseWebsiteShortcutMessage(value: unknown): WebsiteShortcutAction | null;
