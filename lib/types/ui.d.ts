import type { StoredEntry } from '@deepseek-ai/dsh-client-ui-slots';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { WebsiteCommand, WebsiteNavigation } from './website-navigation.js';
import type { ChatLanguage } from './website-settings.js';
import type { WebsiteSession } from './protocol.js';
import type { WindowDragRegion } from './window-drag.js';
import { type SwitchPreferences } from './preferences.js';
export type DshChatMode = 'chat' | 'harness';
export interface DshChatViewportRect {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
    /** Host main-content clip, projected locally; never website or account data. */
    readonly borderRadius?: string;
}
/** Only in-memory navigation metadata; never message bodies or account secrets. */
export interface DshChatViewState {
    readonly mode: DshChatMode;
    readonly modeEnabled: boolean;
    readonly authorizationStatus: 'pending' | 'authorized' | 'unauthorized' | 'unavailable';
    readonly availabilityMessage: string;
    readonly accountLabel: string | null;
    readonly error: string | null;
    readonly desktopAvailable: boolean;
    readonly webLoading: boolean;
    readonly webError: string | null;
    readonly accountStorageKey: string | null;
    readonly authorizationGeneration: number;
    readonly websiteReloadRevision: number;
    readonly settingsOpen: boolean;
    readonly language: ChatLanguage | null;
    readonly websiteAuthenticationStatus: 'loading' | 'signed-out' | 'signing-in' | 'signed-in' | 'signing-out' | 'error';
    readonly websiteAuthenticationRevision: number;
    readonly websiteSessionStatus: 'idle' | 'saved' | 'error';
    readonly websiteSessionError: string | null;
    readonly viewport: DshChatViewportRect | null;
    readonly brandAnchor: DshChatViewportRect | null;
    readonly sidebarAdapted: boolean | null;
    readonly websiteNavigation: WebsiteNavigation;
    readonly websiteNavigationRefreshing: boolean;
    readonly websiteNavigationRefreshError: string | null;
    readonly showWebsiteNavigation: boolean;
    readonly switchPreferences?: SwitchPreferences;
    readonly switchPreferencesStatus?: 'loading' | 'ready' | 'unavailable';
    readonly switchPreferencesPending?: boolean;
    readonly switchPreferencesError?: string | null;
}
export interface DshChatUIBridge {
    getSnapshot(): DshChatViewState;
    subscribe(listener: () => void): () => void;
    selectMode(mode: DshChatMode): void;
    refreshAuthorization(): void;
    manageAccount(): void;
    beginWebsiteSignIn(): void;
    toggleSidebar(): void;
    attachViewport(element: HTMLElement | null): void;
    updateViewport(rect: DshChatViewportRect | null): void;
    updateBrandAnchor(rect: DshChatViewportRect | null, owner?: HTMLElement): void;
    attachSidebar(element: HTMLElement): void;
    reloadWebsite(): void;
    refreshWebsiteNavigation(): void;
    reportWebsiteNavigationRefresh(generation: number, state: {
        readonly requestId: number;
        readonly refreshing: boolean;
        readonly error: string | null;
    }): void;
    reportWebsiteState(generation: number, state: {
        readonly loading: boolean;
        readonly error: string | null;
    }): void;
    reportWebsiteNavigation(generation: number, value: unknown, newDocument?: boolean): void;
    bindWebsiteNavigation(generation: number, handler: (command: WebsiteCommand) => Promise<void>): () => void;
    /** Read-only, current-document geometry; only a CHAT-owned overlay consumes it. */
    readWindowDrag(viewport: DshChatViewportRect): Promise<readonly WindowDragRegion[]>;
    bindWindowDragSampler(generation: number, handler: (viewport: DshChatViewportRect) => Promise<readonly WindowDragRegion[]>): () => void;
    commandWebsite(command: WebsiteCommand): void;
    renameWebsiteConversation(href: string, title: string): Promise<void>;
    toggleWebsiteNavigation(): void;
    setSettingsOpen(open: boolean): void;
    setSwitchPreference?(field: keyof SwitchPreferences, value: string): Promise<boolean>;
    logoutWebsite(): void;
    loadWebsiteSession(generation: number): Promise<WebsiteSession | null>;
    saveWebsiteSession(generation: number, session: WebsiteSession): Promise<boolean>;
    clearWebsiteSession(generation: number): Promise<boolean>;
    reportWebsiteSessionError(generation: number, message: string): void;
}
export interface DshChatBridgeProps {
    readonly bridge: DshChatUIBridge;
}
export declare function useDshChat(bridge: DshChatUIBridge): DshChatViewState;
export declare function DshChatStyles(): null;
export declare function DshChatModeSelector({ bridge, state, compact }: DshChatBridgeProps & {
    readonly state: DshChatViewState;
    readonly compact?: boolean;
}): import("react/jsx-runtime").JSX.Element;
/** Keep interactive controls in the sidebar row, outside its decorative/new-chat brand. */
export declare function DshChatBrandName({ bridge }: PropsRuntime<'sidebar.brand.name'> & DshChatBridgeProps): import("react/jsx-runtime").JSX.Element;
/** DOM siblings remain React descendants of the Windows New Session brand. */
export declare function DshChatBrandControl({ bridge }: DshChatBridgeProps): import("react/jsx-runtime").JSX.Element;
/** rc.2 replays its retained request counter on WorkspaceBrowser remount.
 * Adapt only the view hook; never mutate the host request store or actions. */
export declare function guardHarnessSearchReplay(entry: StoredEntry): (() => void) | null;
/** Only the middle browsing region changes; the shipped shell and Settings stay mounted. */
export declare function DshChatChatNavigation({ bridge, wide, expandSidebar }: PropsRuntime<'sidebar.workspaces'> & DshChatBridgeProps): import("react/jsx-runtime").JSX.Element;
/** Measures only this plugin's own element; website content lives in the retained overlay. */
export declare function DshChatChatPanel({ bridge }: PropsRuntime<'main'> & DshChatBridgeProps): import("react/jsx-runtime").JSX.Element;
/** Same public primitive icons, geometry and tooltip behavior as native rc.2 chrome. */
export declare function DshChatLeadingControls({ bridge }: PropsRuntime<'shell.leading'> & DshChatBridgeProps): import("react/jsx-runtime").JSX.Element;
export declare function DshChatChatSettings({ bridge, close }: PropsRuntime<'settings.section'> & DshChatBridgeProps): import("react/jsx-runtime").JSX.Element;
