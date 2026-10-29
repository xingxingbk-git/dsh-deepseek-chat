import type { Context } from '@deepseek-ai/cordis';
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    switchStyle: import("@deepseek-ai/schemastery").default<"text" | "icon", "text" | "icon", "volatile-defined">;
    chatLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    harnessLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    switchStyle: import("@deepseek-ai/schemastery").default<"text" | "icon", "text" | "icon", "volatile-defined">;
    chatLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    harnessLabel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, "plain">;
export declare const name = "dsh-deepseek-chat";
/** Host-half entry. Browser UI is declared separately by the `dsh.client` manifest. */
export declare const inject: string[];
export declare function apply(ctx: Context): void;
