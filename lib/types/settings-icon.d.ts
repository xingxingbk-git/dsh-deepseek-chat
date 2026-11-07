import type { Context } from '@deepseek-ai/cordis';
import type { ReactNode } from 'react';
export declare const CHAT_SETTINGS_SECTION_ID = "dsh-deepseek-chat.chat-settings";
/** Prefer the 0.2.2 public icon seat. Keep the approved decoration only while
 * that declaration is absent on older shells; never rewrite the new nav DOM. */
export declare function bindChatSettingsIconSlot(slots: Context['slots'], component: (props: {
    size: number;
    active: boolean;
}) => ReactNode, doc?: Document): () => void;
/** User-approved fallback for our one settings row on shells without an icon
 * seat. Leave its label, SVG, event handlers and every other row untouched. */
export declare function bindChatSettingsIcon(doc: Document): () => void;
