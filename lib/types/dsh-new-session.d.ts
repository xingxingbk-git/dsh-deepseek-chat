import type { ShortcutPlatform } from './shortcuts.js';
/** The subset of a DSH shortcut gesture we must recognize. */
export interface DshShortcutGesture {
    readonly code?: unknown;
    readonly meta?: unknown;
    readonly control?: unknown;
    readonly alt?: unknown;
    readonly shift?: unknown;
}
/** A keydown that DSH binds to its New Session command (primary+N). */
export declare function isDshNewSessionGesture(gesture: DshShortcutGesture | null | undefined, platform: ShortcutPlatform): boolean;
export interface DshShortcutRegistry {
    dispatch?: (gesture: unknown, context: unknown, consume?: unknown) => unknown;
}
export interface DshWebviewShortcutOptions {
    readonly platform: ShortcutPlatform;
    readonly isChat: () => boolean;
    readonly openChatNewConversation: () => void;
}
/**
 * DSH forwards keys from the CHAT webview to its shortcut registry. While CHAT
 * is active, redirect its New Session binding to a website conversation and
 * keep the remaining DSH desktop shortcuts out of the website. Every other
 * input path (and HARNESS mode) is left untouched.
 * @returns disposer restoring the registry, or null when the surface is absent.
 */
export declare function takeOverDshWebviewShortcuts(registry: DshShortcutRegistry | undefined, options: DshWebviewShortcutOptions): (() => void) | null;
