/** Keyboard shortcuts for Chat/Harness switching. Pure, DOM-free and testable. */
export type ShortcutPlatform = 'mac' | 'other';
export interface ShortcutEventLike {
    readonly key: string;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly shiftKey: boolean;
    readonly metaKey: boolean;
}
export interface ShortcutBinding {
    readonly ctrl: boolean;
    readonly alt: boolean;
    readonly shift: boolean;
    readonly meta: boolean;
    readonly key: string;
}
export declare const DEFAULT_SHORTCUT = "Tab";
/** Placeholder while the field is capturing a key. */
export declare const SHORTCUT_CAPTURE_HINT = "\u6309\u4E0B\u5FEB\u6377\u952E";
export declare const SHORTCUT_PENDING_HINT = "\u8BF7\u518D\u6309\u4E00\u4E2A\u4E3B\u952E";
export declare const SHORTCUT_RESERVED_HINT = "\u8BE5\u7EC4\u5408\u4E0E\u7CFB\u7EDF\u6216\u6D4F\u89C8\u5668\u5FEB\u6377\u952E\u51B2\u7A81";
export declare const SHORTCUT_INVALID_HINT = "\u65E0\u6CD5\u8BC6\u522B\u8BE5\u6309\u952E\uFF0C\u8BF7\u91CD\u8BD5";
export declare function shortcutPlatform(platform?: string | null): ShortcutPlatform;
/** Physical modifier names stored on disk; they render platform-specifically. */
export declare function modifierDisplay(name: 'Ctrl' | 'Alt' | 'Shift' | 'Meta', platform: ShortcutPlatform): string;
/** Normalize a raw keydown into `Ctrl+Alt+Shift+Meta+KEY`, or null when unusable. */
export declare function normalizeShortcut(event: ShortcutEventLike, platform?: ShortcutPlatform): string | null;
export declare function parseShortcut(value: unknown): ShortcutBinding | null;
export declare function validShortcut(value: unknown): boolean;
/** Stored names are physical; display swaps Meta to Cmd/Win per platform. */
export declare function displayShortcut(value: string, platform?: ShortcutPlatform): string;
export declare function matchesShortcut(event: ShortcutEventLike, value: string): boolean;
/**
 * Modifiers the host, Chromium or the OS already own. Tab itself is allowed.
 * On macOS only the system-level Cmd shortcuts are kept reserved; editor-style
 * combos such as Cmd+A/C/V/X/Z/S stay available. On Windows every Win combo is
 * system-level, so plain Meta bindings remain reserved there.
 */
export declare function reservedShortcut(value: string, platform?: ShortcutPlatform): boolean;
export type ShortcutCapture = {
    readonly kind: 'cancel';
} | {
    readonly kind: 'clear';
} | {
    readonly kind: 'pending';
} | {
    readonly kind: 'invalid';
} | {
    readonly kind: 'reserved';
    readonly value: string;
} | {
    readonly kind: 'set';
    readonly value: string;
};
/** One keydown inside a capturing field. Esc/Backspace exit or clear; modifiers wait. */
export declare function captureShortcut(event: ShortcutEventLike, platform?: ShortcutPlatform): ShortcutCapture;
export interface ShortcutContext {
    readonly enabled: boolean;
    readonly modeEnabled: boolean;
    readonly editable: boolean;
    readonly inWebsite: boolean;
    readonly composing: boolean;
    readonly defaultPrevented: boolean;
}
/** The global listener must stay out of text fields and the CHAT webview. */
export declare function shouldHandleShortcut(context: ShortcutContext): boolean;
export type ShortcutAction = 'chat' | 'harness' | 'toggle';
/** Same binding for both directions is a deliberate toggle, not a conflict. */
export declare function shortcutAction(event: ShortcutEventLike, chat: string, harness: string): ShortcutAction | null;
export declare function shortcutActionLabel(action: ShortcutAction): 'chat' | 'harness' | 'toggle';
