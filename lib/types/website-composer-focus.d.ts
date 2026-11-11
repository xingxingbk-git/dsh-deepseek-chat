/**
 * Guest-side helper: focus the visible DeepSeek composer after a mode switch or
 * after opening/creating a conversation. Never reads draft text, never writes
 * global state; the serialized call only returns a boolean.
 */
export declare function focusWebsiteComposer(doc: Document, origin: string): boolean;
/** Serialized into the isolated guest; the host only parses a boolean. */
export declare function websiteComposerFocusScript(): string;
export declare function parseComposerFocusResult(value: unknown): boolean;
