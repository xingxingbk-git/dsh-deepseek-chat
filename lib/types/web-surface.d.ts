import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { DesktopBrowserBridge } from '@deepseek-ai/dsh-client-ui-sidebar-browser/types';
import { type DshChatBridgeProps } from './ui.js';
/** Read only the product's documented origin-scoped Browser capability. */
export declare function getDesktopBrowserBridge(): DesktopBrowserBridge | undefined;
/** Stable overlay owner: layout changes reuse the guest; leaving CHAT releases it for DevTools. */
export declare function DshChatWebSurface({ bridge, nativeBrowser }: PropsRuntime<'shell.overlay'> & DshChatBridgeProps & {
    readonly nativeBrowser?: DesktopBrowserBridge;
}): import("react").ReactPortal;
