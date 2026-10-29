/** Non-secret, profile-owned mode-switch UI preferences. */
export interface SwitchPreferences {
    readonly switchStyle: 'text' | 'icon';
    readonly chatLabel: string;
    readonly harnessLabel: string;
}
export declare const DEFAULT_SWITCH_PREFERENCES: SwitchPreferences;
export declare const SWITCH_LABEL_LIMIT = 10;
/** Printable ASCII costs one; all other Unicode code points cost two. Never split surrogates. */
export declare function switchLabelWidth(value: string): number;
export declare const SWITCH_LABEL_PATTERN: RegExp;
export declare function validSwitchLabel(value: unknown): value is string;
export declare function parseSwitchPreferences(value: unknown): SwitchPreferences;
