import { type ReactNode, type RefObject } from 'react';
/** The sidebar brand row clips its descendants; our own notice must escape it. */
export declare function DshChatBrandNotice({ anchor, role, children }: {
    readonly anchor: RefObject<HTMLElement>;
    readonly role?: 'status' | 'alert';
    readonly children: ReactNode;
}): import("react").ReactPortal | null;
