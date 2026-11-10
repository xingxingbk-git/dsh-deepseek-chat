export type WebsiteLifetime = 'retain' | 'immediate' | 'delayed';
export declare const WEBSITE_RELEASE_DELAY_MIN = 5;
export declare const WEBSITE_RELEASE_DELAY_MAX = 3600;
export declare const DEFAULT_WEBSITE_RELEASE_DELAY = 60;
export interface SwitchPreferences {
    readonly switchStyle: 'text' | 'icon';
    readonly chatLabel: string;
    readonly harnessLabel: string;
    readonly websiteLifetime: WebsiteLifetime;
    readonly websiteReleaseDelay: number;
    readonly brandNoticeDismissed: boolean;
    readonly shortcutEnabled: boolean;
    readonly shortcutChat: string;
    readonly shortcutHarness: string;
}
export declare const DEFAULT_SWITCH_PREFERENCES: SwitchPreferences;
export declare const SWITCH_LABEL_LIMIT = 10;
/** Printable ASCII costs one; all other Unicode code points cost two. Never split surrogates. */
export declare function switchLabelWidth(value: string): number;
export declare const SWITCH_LABEL_PATTERN: RegExp;
export declare function validSwitchLabel(value: unknown): value is string;
export declare function parseSwitchPreferences(value: unknown): SwitchPreferences;
