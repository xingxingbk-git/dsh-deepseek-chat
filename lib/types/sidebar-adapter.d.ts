/** User-approved rc.2 sidebar exception. No services, Session state or credentials. */
export interface SidebarAdapterState {
    readonly chat: boolean;
    readonly canCreate: boolean;
}
/** Client-owned lifetime survives the brand seat unmounting on sidebar collapse. */
export declare function createSidebarBinding(read: () => SidebarAdapterState, create: () => void, report: (ready: boolean) => void): {
    attach(name: HTMLElement): void;
    sync(): void;
    dispose(): void;
};
/**
 * Brand-row visuals must not depend on takeover acceptance. Mark the three rows
 * that decide whether the wordmark may shrink, with a reversible cleanup.
 */
export declare function markBrandVisual(identity: HTMLElement, brand: HTMLElement, seat: HTMLElement): () => void;
/** Start at our own brand seat and require the shipped, direct-child shell shape.
 * Unknown layouts are left alone; no global search or hashed CSS selectors. */
export declare function attachSidebarAdapter(name: HTMLElement, read: () => SidebarAdapterState, create: () => void): {
    sync(): void;
    valid(): boolean;
    dispose(): void;
} | null;
