import schema from '@deepseek-ai/schemastery';
/** Volatile fields persist through official settings without remounting the Host/guest. */
export declare const SwitchPreferencesConfig: schema<Schemastery.ObjectS<NoInfer<{
    switchStyle: schema<"text" | "icon", "text" | "icon", "volatile-defined">;
    chatLabel: schema<string, string, "volatile-defined">;
    harnessLabel: schema<string, string, "volatile-defined">;
    websiteLifetime: schema<"retain" | "immediate" | "delayed", "retain" | "immediate" | "delayed", "volatile-defined">;
    websiteReleaseDelay: schema<number, number, "volatile-defined">;
    brandNoticeDismissed: schema<boolean, boolean, "volatile-defined">;
    shortcutEnabled: schema<boolean, boolean, "volatile-defined">;
    shortcutChat: schema<string, string, "volatile-defined">;
    shortcutHarness: schema<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    switchStyle: schema<"text" | "icon", "text" | "icon", "volatile-defined">;
    chatLabel: schema<string, string, "volatile-defined">;
    harnessLabel: schema<string, string, "volatile-defined">;
    websiteLifetime: schema<"retain" | "immediate" | "delayed", "retain" | "immediate" | "delayed", "volatile-defined">;
    websiteReleaseDelay: schema<number, number, "volatile-defined">;
    brandNoticeDismissed: schema<boolean, boolean, "volatile-defined">;
    shortcutEnabled: schema<boolean, boolean, "volatile-defined">;
    shortcutChat: schema<string, string, "volatile-defined">;
    shortcutHarness: schema<string, string, "volatile-defined">;
}>>, "plain">;
