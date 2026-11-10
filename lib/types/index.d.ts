import type { Context } from '@deepseek-ai/cordis';
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    switchStyle: import("@deepseek-ai/schemastery").default<"text" | "icon", "text" | "icon", "volatile-defined">;
    chatLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    harnessLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    websiteLifetime: import("@deepseek-ai/schemastery").default<"retain" | "immediate" | "delayed", "retain" | "immediate" | "delayed", "volatile-defined">;
    websiteReleaseDelay: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    brandNoticeDismissed: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    shortcutEnabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    shortcutChat: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    shortcutHarness: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    switchStyle: import("@deepseek-ai/schemastery").default<"text" | "icon", "text" | "icon", "volatile-defined">;
    chatLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    harnessLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    websiteLifetime: import("@deepseek-ai/schemastery").default<"retain" | "immediate" | "delayed", "retain" | "immediate" | "delayed", "volatile-defined">;
    websiteReleaseDelay: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    brandNoticeDismissed: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    shortcutEnabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    shortcutChat: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    shortcutHarness: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, "plain">;
export declare const name = "dsh-deepseek-chat";
/** Host-half entry. Browser UI is declared separately by the `dsh.client` manifest. */
export declare const inject: string[];
export declare function apply(ctx: Context): void;
