/** Own UI plus the user's narrowly approved, reversible rc.2 sidebar markers. */
export const chatStyles = String.raw`
.dsh-chat-rename-input{box-sizing:border-box;width:100%;height:44px;padding:7px 14px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);outline:none;background:transparent;font-size:14px;font-weight:400;line-height:22px;color:var(--dsw-alias-label-primary)}
.dsh-chat-rename-input:disabled{color:var(--dsw-alias-label-dimmed)}
.dsh-chat-rename-error{margin-top:8px;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary)}
.dsh-chat-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.dsh-chat-navigation,.dsh-chat-brand-control,.dsh-chat-brand-name,.dsh-chat-main-anchor,.dsh-chat-web-surface{font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);color:var(--dsw-alias-label-primary,#22242a);box-sizing:border-box;font-size:14px}
.dsh-chat-navigation *,.dsh-chat-brand-control *,.dsh-chat-brand-name *,.dsh-chat-main-anchor *,.dsh-chat-web-surface *,.dsh-chat-settings *{box-sizing:border-box}
.dsh-chat-navigation button,.dsh-chat-brand-control button,.dsh-chat-main-anchor button,.dsh-chat-web-surface button{font:inherit;-webkit-app-region:no-drag}
.dsh-chat-settings button{-webkit-app-region:no-drag}
.dsh-chat-navigation button:focus-visible,.dsh-chat-brand-control button:focus-visible,.dsh-chat-main-anchor button:focus-visible,.dsh-chat-web-surface button:focus-visible{outline:2px solid #4d6bfe;outline-offset:3px}
.dsh-chat-modes{display:flex;align-items:center;gap:2px;border:0;padding:3px;margin:0;border-radius:9px;background:var(--dsw-alias-interactive-bg-hover,#e7e9ed);min-width:0;width:max-content}
.dsh-chat-modes button{padding:6px 9px;border:0;background:transparent;border-radius:6px;color:inherit;font-size:10px;font-weight:650;letter-spacing:.35px;white-space:nowrap;cursor:pointer;min-height:27px}
.dsh-chat-modes button[aria-pressed="true"]{background:#fff;color:#242832;box-shadow:0 1px 3px #151e2f15}
.dsh-chat-modes:disabled{opacity:.42}.dsh-chat-modes:disabled button{cursor:not-allowed}
.dsh-chat-mode-compact .dsh-chat-modes{flex-direction:column;width:30px;gap:3px}.dsh-chat-mode-compact .dsh-chat-modes button{width:24px;padding:4px 2px}
[data-dsh-chat-brand-fill="identity"]{flex:1;width:100%}
[data-dsh-chat-brand-fill="name"]{flex:1}
[data-dsh-chat-sidebar-mode="chat"] > [data-dsh-chat-panel-region="true"]{display:none}
[data-dsh-chat-sidebar-mode="chat"] [data-dsh-chat-new-session="true"]:disabled{opacity:.45;cursor:default}
.dsh-chat-brand-name{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%;flex:1;width:100%}
[data-dsh-chat-brand-fill="brand"]{flex:0 0 auto;min-width:max-content}
.dsh-chat-brand-wordmark{display:block;flex:0 0 102px;min-width:102px;width:102px;height:24px;overflow:hidden}
.dsh-chat-brand-wordmark svg{display:block;width:156px;max-width:none;height:24px}
.dsh-chat-brand-control-host{display:flex;align-items:center;justify-content:flex-end;width:auto;min-width:0;height:24px;flex:1 1 auto;margin-left:auto;margin-right:calc(var(--dsh-sidebar-paint-inset, 3px) + 1px);-webkit-app-region:no-drag}
.dsh-chat-brand-control{position:relative;width:100%;min-width:0;height:24px;pointer-events:auto;display:flex;align-items:center;-webkit-app-region:no-drag}
.dsh-chat-brand-control .dsh-chat-modes{height:23px;min-height:23px;max-height:23px;padding:1px;border-radius:8px;gap:0;overflow:hidden}
.dsh-chat-brand-control .dsh-chat-mode-wrap{display:flex;justify-content:flex-end;width:100%;min-width:0;max-width:100%}
.dsh-chat-brand-control .dsh-chat-modes{width:auto;min-width:0;max-width:100%}
.dsh-chat-brand-control .dsh-chat-modes button{flex:0 0 auto;min-width:0;overflow:hidden}
.dsh-chat-mode-label{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-chat-modes svg{flex:none}
.dsh-chat-preference-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;min-height:36px}
.dsh-chat-presentation-settings h3,.dsh-chat-website-lifetime h3{font-size:14px;line-height:1.4;margin:0;font-weight:600}
.dsh-chat-preference-select{width:var(--dsh-chat-settings-action-width);min-width:0;max-width:100%;flex:0 0 var(--dsh-chat-settings-action-width);margin-inline-start:auto}
.dsh-chat-style-menu{display:block;width:100%}.dsh-chat-style-trigger{width:100%;justify-content:space-between;text-align:start;gap:12px;background:var(--dsw-specific-selector);border:0}
.dsh-chat-style-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid,var(--dsw-specific-selector))}
.dsh-chat-style-trigger>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dsh-chat-style-trigger>svg{flex:none}
.dsh-chat-preference-divider{border:0;border-top:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l3));margin:16px 0}
.dsh-chat-preference-labels{display:flex;align-items:center;flex-wrap:wrap;gap:12px;min-width:0}
.dsh-chat-label-editor{position:relative;flex:1 1 160px;min-width:0;max-width:100%}.dsh-chat-label-input{display:flex;width:100%;min-width:0}.dsh-chat-label-input input{min-width:0;width:100%}
.dsh-chat-label-count{position:absolute;inset-inline-end:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));pointer-events:none;font-variant-numeric:tabular-nums}
.dsh-chat-label-editor[data-invalid="true"] .dsh-chat-label-count{color:var(--dsw-alias-state-error-primary,#ef5350)}
.dsh-chat-label-input,.dsh-chat-label-input input,.dsh-chat-label-input input:hover,.dsh-chat-label-input input:focus,.dsh-chat-label-input input:disabled{background:transparent}
.dsh-chat-label-save{flex:none;margin-inline-start:auto}
.dsh-chat-preference-note{font-size:12px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.6}
/* Settings controls share one height so rows, inputs, menus and buttons align. */
.dsh-chat-settings{--dsh-chat-control-height:34px}
.dsh-chat-settings-card .dsh-chat-preference-row{min-height:var(--dsh-chat-control-height)}
.dsh-chat-settings-card h4{font-size:14px;font-weight:600;line-height:1.4;margin:0}
.dsh-chat-settings .dsh-chat-label-input,
.dsh-chat-settings .dsh-chat-label-input input,
.dsh-chat-settings .dsh-chat-lifetime-input,
.dsh-chat-settings .dsh-chat-lifetime-input input,
.dsh-chat-settings .dsh-chat-shortcut-input{height:var(--dsh-chat-control-height)!important;min-height:var(--dsh-chat-control-height)!important}
.dsh-chat-settings .dsh-chat-label-save,
.dsh-chat-settings .dsh-chat-style-trigger,
.dsh-chat-settings .dsh-chat-shortcut-actions button,
.dsh-chat-settings .dsh-chat-brand-notice-settings button{height:var(--dsh-chat-control-height)!important;min-height:var(--dsh-chat-control-height)!important}
.dsh-chat-shortcut-settings .dsh-chat-shortcut-section{display:flex;flex-direction:column;gap:12px}
.dsh-chat-shortcut-header{justify-content:space-between}
.dsh-chat-shortcut-title{display:flex;align-items:center;gap:10px;min-width:0}
.dsh-chat-shortcut-row{display:flex;align-items:flex-start;gap:12px}
.dsh-chat-shortcut-control{display:flex;flex-direction:column;gap:4px;flex:1 1 160px;min-width:0;max-width:100%}
.dsh-chat-shortcut-field{position:relative;display:flex;align-items:center;width:100%;height:var(--dsh-chat-control-height);box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l3,#333));border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-3,transparent);overflow:hidden}
.dsh-chat-shortcut-field:hover{border-color:var(--dsw-alias-border-l2,var(--dsw-alias-label-secondary))}
.dsh-chat-shortcut-field:focus-within{border-color:var(--dsw-alias-label-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent)}
.dsh-chat-shortcut-prefix{display:inline-flex;align-items:center;align-self:stretch;flex:none;padding:0 12px;border-right:1px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2,#333));font-size:13px;line-height:1.4;color:var(--dsw-alias-label-secondary,inherit);white-space:nowrap}
.dsh-chat-shortcut-input-wrap{position:relative;display:flex;align-items:center;flex:1 1 auto;min-width:0;height:100%}
.dsh-chat-shortcut-input{flex:1 1 auto;min-width:0;width:100%;height:100%!important;min-height:0!important;padding:0 30px 0 12px;border:0!important;border-radius:0!important;background:transparent;color:inherit;font:inherit;font-size:13px;line-height:1.4;cursor:pointer;outline:none;box-shadow:none!important}
.dsh-chat-shortcut-guidance{position:absolute;inset:0;display:flex;align-items:center;overflow:hidden;pointer-events:none;padding:0 10px;box-sizing:border-box}
.dsh-chat-shortcut-guidance-text{white-space:nowrap;font-size:13px;line-height:1.4;color:var(--dsw-alias-state-error-primary,#ef5350)}

.dsh-chat-shortcut-input::placeholder{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}
.dsh-chat-shortcut-input:disabled{opacity:.5;cursor:default}
.dsh-chat-shortcut-clear{position:absolute;right:6px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary,inherit);cursor:pointer}
.dsh-chat-shortcut-clear:hover{background:var(--dsw-alias-interactive-bg-hover-solid,var(--dsw-alias-border-l3));color:var(--dsw-alias-label-primary,inherit)}
.dsh-chat-shortcut-clear:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}

.dsh-chat-shortcut-save{flex:none;height:var(--dsh-chat-control-height)!important;min-height:var(--dsh-chat-control-height)!important}
.dsh-chat-preference-heading{display:flex;align-items:center;gap:6px;margin:0}
.dsh-chat-preference-heading-wrap{position:relative;display:flex;align-items:center;min-width:0}
.dsh-chat-preference-hint{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex:none;padding:0;background:transparent;border-radius:50%;border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary,inherit);font:inherit;font-size:11px;line-height:1;cursor:pointer;user-select:none}
.dsh-chat-preference-hint:hover{border-color:var(--dsw-alias-label-secondary,inherit)}
.dsh-chat-preference-hint-popover{position:absolute;top:calc(100% + 8px);left:0;z-index:20;width:min(360px,70vw);padding:10px 12px;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-elevated,var(--dsw-alias-bg-base,#1f1f21));color:var(--dsw-alias-label-primary,inherit);font-size:12px;line-height:1.6;box-shadow:0 8px 24px rgba(0,0,0,.24);white-space:normal}
.dsh-chat-preference-hint:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}
.dsh-chat-lifetime-editor{position:relative;display:flex;align-items:center;min-width:0;flex:1 1 220px}
.dsh-chat-lifetime-editor .dsh-chat-lifetime-input{width:100%;min-width:0}
.dsh-chat-lifetime-editor .dsh-chat-label-count{position:absolute;right:12px;pointer-events:none}
.dsh-chat-brand-control .dsh-chat-modes button{display:inline-flex;align-items:center;justify-content:center;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);padding:0 8px;height:21px;min-height:21px;max-height:21px;font-size:9px;line-height:13px;letter-spacing:.2px;border-radius:7px}
.dsh-chat-brand-control .dsh-chat-modes button[aria-pressed="true"]{box-shadow:none}
.dsh-chat-brand-control .dsh-chat-modes button:focus-visible{outline-offset:-2px}
.dsh-chat-authorization-notice{position:absolute;top:calc(100% + 6px);right:0;width:230px;max-width:calc(100vw - 24px);padding:10px 12px;z-index:40;border:1px solid var(--dsw-alias-border-l2,#dee1e8);border-radius:8px;background:var(--dsw-specific-sidebar-fill,#f4f5f8);box-shadow:0 4px 16px #0d1a3520;font-size:11px;line-height:1.6;color:var(--dsw-alias-label-primary,#22242a)}
.dsh-chat-authorization-notice p{margin:0 0 5px}
.dsh-chat-brand-notice{box-sizing:border-box;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);pointer-events:auto;-webkit-app-region:no-drag;overscroll-behavior:contain}
.dsh-chat-brand-notice p{padding-right:18px}
.dsh-chat-brand-notice-close{position:absolute;top:8px;right:8px;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,inherit);cursor:pointer}
.dsh-chat-brand-notice-close:hover{background:var(--dsw-alias-interactive-bg-hover-solid,var(--dsw-alias-border-l3));color:var(--dsw-alias-label-primary,inherit)}
.dsh-chat-brand-notice-close:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}
[data-dsh-chat-brand-fallback] .dsh-chat-brand-wordmark{display:none}
.dsh-chat-web-toast{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:20;max-width:calc(100% - 32px);margin:0;padding:8px 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#dee1e8);background:var(--dsw-specific-sidebar-fill,#f4f5f8);box-shadow:0 6px 20px #0d1a3526;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-primary,#22242a);pointer-events:none}
.dsh-chat-web-toast-error{border-color:var(--dsw-alias-state-error-primary,#ef5350);color:var(--dsw-alias-state-error-primary,#ef5350)}
.dsh-chat-navigation{--dsh-chat-list-edge-inset:var(--dsh-sidebar-inline-padding,12px);--dsh-chat-list-scrollbar-width:5px;--dsh-chat-list-scrollbar-offset:2px;display:flex;flex-direction:column;height:100%;min-height:0;padding-right:var(--dsh-chat-list-edge-inset);background:transparent;color:inherit}
.dsh-chat-navigation-header{margin:2px -4px 4px 0;padding:0 1px 0 var(--dsh-sidebar-row-padding,12px)}
.dsh-chat-navigation-header[data-searching]{padding-inline:calc(var(--dsh-sidebar-paint-inset,3px) + 1px);margin-right:0}
.dsh-chat-navigation-header{box-sizing:border-box;border-radius:var(--dsw-radius-md);height:36px;color:var(--dsw-alias-label-tertiary);flex:none;justify-content:flex-end;align-items:center;gap:4px;margin-bottom:4px;display:flex;overflow:hidden}
.dsh-chat-search-label{white-space:nowrap;opacity:1;visibility:visible;min-width:0;max-width:45%;transition:max-width .18s var(--ds-ease-in-out), margin-right .18s var(--ds-ease-in-out), opacity .12s var(--ds-ease-in-out), transform .18s var(--ds-ease-in-out), visibility 0s linear;flex:none;line-height:20px;overflow:hidden}
[data-searching] .dsh-chat-search-label{opacity:0;visibility:hidden;max-width:0;margin-right:-4px;transition-delay:0s,0s,0s,0s,.18s;transform:translate(-4px)}
.dsh-chat-search-slot{box-sizing:border-box;min-width:0;max-width:28px;transition:max-width .18s var(--ds-ease-in-out), padding-left .18s var(--ds-ease-in-out);flex:1;align-items:center;margin-left:auto;padding-left:0;display:flex}
[data-searching] .dsh-chat-search-slot{max-width:100%;padding-left:0}
.dsh-chat-search-actions{opacity:1;visibility:visible;max-width:60px;transition:max-width .18s var(--ds-ease-in-out), opacity .12s var(--ds-ease-in-out), transform .18s var(--ds-ease-in-out), visibility 0s linear;flex:none;align-items:center;gap:4px;display:flex;overflow:hidden}
[data-searching] .dsh-chat-search-actions{opacity:0;visibility:hidden;pointer-events:none;max-width:0;transition-delay:0s,0s,0s,.18s;transform:translate(4px)}
.dsh-chat-search{box-sizing:border-box;border-radius:var(--dsw-radius-sm);cursor:text;width:100%;height:28px;color:var(--dsw-alias-label-secondary);transition:width .18s var(--ds-ease-in-out), padding .18s var(--ds-ease-in-out), border-color .18s var(--ds-ease-in-out), background-color .18s var(--ds-ease-in-out);background:0 0;border:none;flex:none;align-items:center;gap:0;margin:0;padding:0;display:flex;overflow:hidden}
[data-searching] .dsh-chat-search{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);width:calc(100% + 4px);height:30px;color:var(--dsw-alias-label-caption);background:0 0;margin-inline:-2px;padding:0 4px 0 0}
.dsh-chat-search-button,.dsh-chat-search-actions .dsh-chat-icon-button{border-radius:var(--dsw-radius-sm)}
.dsh-chat-search-button{cursor:pointer;width:28px;height:28px;color:inherit;background:0 0;border:none;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}
[data-searching] .dsh-chat-search .dsh-chat-search-button{width:28px;height:30px}
.dsh-chat-search-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
[data-searching] .dsh-chat-search .dsh-chat-search-button:hover{background:0 0}
.dsh-chat-search-input{opacity:0;pointer-events:none;width:0;min-width:0;color:var(--dsw-alias-label-primary);transition:opacity .12s var(--ds-ease-in-out);background:0 0;border:none;outline:none;flex:1;font-size:13px;line-height:18px}
[data-searching] .dsh-chat-search .dsh-chat-search-input{opacity:1;pointer-events:auto;margin-left:-2px}
.dsh-chat-search-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dsh-chat-search-clear{border-radius:var(--dsw-radius-sm);cursor:pointer;width:24px;height:24px;color:var(--dsw-alias-label-secondary);background:0 0;border:none;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}
.dsh-chat-search-button:focus-visible,.dsh-chat-search-clear:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.dsh-chat-search-clear:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-chat-icon-button{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#8b8d91);cursor:pointer;font-size:21px!important}.dsh-chat-icon-button:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff0d)}.dsh-chat-icon-button:disabled{opacity:.4;cursor:default}
.dsh-chat-refreshing{animation:dsh-chat-refresh-spin .8s linear infinite}@keyframes dsh-chat-refresh-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.dsh-chat-refreshing{animation:none}.dsh-chat-search,.dsh-chat-search-label,.dsh-chat-search-slot,.dsh-chat-search-input,.dsh-chat-search-actions{transition:none}}
/* Do not set scrollbar-width here: Chromium's standard override bypasses DSH's
   shared WebKit scrollbar skin. Inherit the host's width, thumb and hover tokens. */
/* WorkspaceBrowser has THREE layers: root -> listArea -> scrolling list.
   listArea reclaims the root's right inset so the scrollbar stays near the
   sidebar edge; the inner list still insets row content independently. */
.dsh-chat-navigation-list-area{min-height:0;margin-left:-4px;margin-right:calc(-1 * var(--dsh-chat-list-edge-inset));flex-direction:column;flex:1;padding-left:4px;display:flex;overflow:visible}
.dsh-chat-navigation-list{flex:1;min-height:0;overflow-y:auto;margin-left:-4px;margin-right:var(--dsh-chat-list-scrollbar-offset);padding:0 calc(var(--dsh-chat-list-edge-inset) - var(--dsh-chat-list-scrollbar-width) - var(--dsh-chat-list-scrollbar-offset)) 16px 4px;scrollbar-gutter:stable}
[data-dsh-chat-settings-icon="chat"] > svg{display:none}
[data-dsh-chat-settings-icon="chat"]::before{content:"";display:block;flex:none;width:16px;height:16px;background:currentColor;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 3.25h8A1.75 1.75 0 0 1 13.75 5v5A1.75 1.75 0 0 1 12 11.75H7l-3.75 2v-2.2A1.75 1.75 0 0 1 2.25 10V5A1.75 1.75 0 0 1 4 3.25Z M5 6.25h6 M5 8.75h4' fill='none' stroke='black' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/16px 16px no-repeat}
.dsh-chat-conversation-group h3{font-size:12px;font-weight:400;color:var(--dsw-alias-label-secondary,#8b8d91);margin:15px var(--dsh-sidebar-row-padding,12px) 6px}
.dsh-chat-conversation-row{display:block;flex:1;min-width:0;width:100%;min-height:32px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:7px 10px;border:0;border-radius:8px;background:transparent;color:inherit;font-size:13px;cursor:pointer}.dsh-chat-conversation-item{display:flex;align-items:center;border-radius:var(--dsw-radius-md,12px);border-inline:var(--dsh-sidebar-paint-inset,3px) solid transparent;background-clip:padding-box;padding-right:8px;min-width:0}
.dsh-chat-conversation-item:hover,.dsh-chat-conversation-item[data-menu-open],.dsh-chat-conversation-item[data-selected]{background-color:var(--dsw-alias-interactive-bg-hover,#ffffff0d)}
/* Row actions use the native SessionRow's colour-only hover, not the header button fill. */
.dsh-chat-conversation-more{opacity:0}
.dsh-chat-conversation-more.dsh-chat-icon-button{flex:none;width:24px;height:24px;margin:-4px;border-radius:var(--dsw-radius-xs,4px);background:transparent;color:var(--dsw-alias-label-tertiary,#8b8d91)}
.dsh-chat-conversation-more.dsh-chat-icon-button:hover:not(:disabled){color:var(--dsw-alias-label-primary,#22242a)}
.dsh-chat-conversation-more.dsh-chat-icon-button:focus-visible{outline-offset:-2px}
.dsh-chat-conversation-item:hover .dsh-chat-conversation-more,.dsh-chat-conversation-item:focus-within .dsh-chat-conversation-more,.dsh-chat-conversation-item[data-selected] .dsh-chat-conversation-more,.dsh-chat-conversation-item[data-menu-open] .dsh-chat-conversation-more{opacity:1}
@media(hover:none){.dsh-chat-conversation-more{opacity:1}}
.dsh-chat-navigation-status{font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary,#8b8d91);padding:6px 4px}
.dsh-chat-navigation-sign-in{text-align:center}
.dsh-chat-navigation-rail{align-items:center;padding-top:6px;padding-right:0}
.dsh-chat-text-button{padding:7px 4px;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#8b8d91);font-size:11px!important;cursor:pointer}
.dsh-chat-primary-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:144px;min-height:40px;padding:10px 20px;border:1px solid #4d6bfe;border-radius:8px;background:#4d6bfe;color:#fff;font-size:14px!important;font-weight:600!important;line-height:20px;white-space:nowrap;cursor:pointer;pointer-events:auto;-webkit-app-region:no-drag}.dsh-chat-primary-button:hover{background:#617dff;border-color:#617dff}.dsh-chat-primary-button:active{background:#3b58e8;border-color:#3b58e8}.dsh-chat-primary-button:disabled{opacity:.5;cursor:default}
.dsh-chat-main-anchor{height:100%;min-width:0;width:100%;position:relative;background:var(--dsw-alias-bg-base,#fff)}
.dsh-chat-web-surface{position:fixed;z-index:20;pointer-events:auto;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base,#fff);border-radius:0;overflow:hidden}
.dsh-chat-web-content{position:relative;flex:1;min-height:0;display:flex}.dsh-chat-webview{display:flex;width:100%;height:100%;flex:1;border:0}
.dsh-chat-window-drag-row{position:absolute;left:0;z-index:3;display:none;pointer-events:none;user-select:none}
html:is([data-platform="darwin"],[data-platform="win32"]) .dsh-chat-window-drag-row{display:block;-webkit-app-region:drag}
.dsh-chat-window-drag-hole{position:absolute;top:0;height:100%;pointer-events:none;-webkit-app-region:no-drag}
html[data-fullscreen="true"] .dsh-chat-window-drag-row{display:none}
.dsh-chat-session-error{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:2;max-width:calc(100% - 32px);padding:8px 12px;border-radius:8px;background:#362725;color:#ffb4a8;font-size:12px;line-height:1.5;pointer-events:none}
.dsh-chat-web-status{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100% - 40px));text-align:center;padding:22px;border:1px solid var(--dsw-alias-border-l2,#e4e9f0);border-radius:12px;background:var(--dsw-alias-bg-base,#fff);font-size:12px;line-height:1.8;pointer-events:none}.dsh-chat-web-status strong{display:block;font-size:15px;font-weight:550;margin-bottom:9px}.dsh-chat-web-status p{color:var(--dsw-alias-label-secondary,#8190a2);margin:0}.dsh-chat-web-status-error{color:#a24f40}
.dsh-chat-unavailable{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}.dsh-chat-unavailable h2{font-size:20px;font-weight:550}.dsh-chat-unavailable p{color:var(--dsw-alias-label-secondary,#8190a2);font-size:12px}.dsh-chat-unavailable button{margin-top:18px;border:0;border-radius:8px;background:#4d6bfe;color:#fff;padding:10px 18px;cursor:pointer}
.dsh-chat-web-status button{pointer-events:auto;margin-top:12px}
.dsh-chat-leading{display:flex;align-items:center;gap:8px}
.dsh-chat-leading button{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;-webkit-app-region:no-drag}
.dsh-chat-leading button:hover{background:var(--dsw-alias-interactive-bg-hover)}.dsh-chat-leading button:disabled{opacity:.4;cursor:default}
 .dsh-chat-settings{--dsh-chat-settings-action-width:200px;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);color:var(--dsw-alias-label-primary,inherit);font-size:14px;line-height:1.5;min-width:0;max-width:720px;width:100%;box-sizing:border-box;padding:8px 0}
.dsh-chat-settings p{margin:0;overflow-wrap:anywhere}
.dsh-chat-settings-group>.dsh-chat-settings-block+.dsh-chat-settings-block{border-top:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l3));margin-top:12px;padding-top:12px}
.dsh-chat-settings-block{min-width:0}
.dsh-chat-settings-card{background:transparent;border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l3));border-radius:var(--dsw-radius-xl,16px);padding:12px 16px;margin:0 0 16px;min-width:0;box-sizing:border-box}
.dsh-chat-settings-account{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;min-width:0}.dsh-chat-settings-identity{display:flex;flex-direction:column;gap:4px;flex:1 1 160px;min-width:0}.dsh-chat-settings-identity strong{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dsh-chat-settings-badge{font-size:12px;color:var(--dsw-alias-label-secondary,inherit);display:flex;align-items:center;gap:6px}.dsh-chat-settings-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary,#20a66a);flex:none}.dsh-chat-settings-logout{flex-shrink:0;white-space:normal;max-width:100%}
.dsh-chat-settings .dsh-chat-settings-logout{background:transparent;border:.5px solid currentColor;color:var(--dsw-alias-state-error-primary,#ef5350)}
.dsh-chat-settings .dsh-chat-settings-logout:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,#ef535014)}
.dsh-chat-settings .dsh-chat-settings-logout:disabled{background:transparent;opacity:.5}
.dsh-chat-settings-actions{display:flex;align-items:center;justify-content:space-between;gap:0;flex-wrap:wrap;width:var(--dsh-chat-settings-action-width);flex:0 0 var(--dsh-chat-settings-action-width);min-width:0;max-width:100%;margin-inline-start:auto}
.dsh-chat-settings-external{display:inline-flex;align-items:center;gap:2px;min-height:36px;padding:0 0 0 14px;color:var(--dsw-alias-label-primary,inherit);text-decoration:none;white-space:nowrap;font-size:13px;line-height:22px}
.dsh-chat-settings-external:hover{color:var(--dsw-alias-label-primary,inherit);text-decoration:underline}.dsh-chat-settings-external:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:4px}
.dsh-chat-settings-loading{display:flex;align-items:center;gap:6px;min-height:36px;color:var(--dsw-alias-label-secondary,inherit);font-size:14px;line-height:22px}.dsh-chat-settings-loading svg{flex:none}
.dsh-chat-settings-error{margin-top:18px;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-state-error-primary,#ef5350);font-size:13px;line-height:1.6;display:flex;flex-wrap:wrap;align-items:center;gap:12px}.dsh-chat-settings-error p{flex:1 1 220px;min-width:0}.dsh-chat-settings-error button{flex-shrink:0;max-width:100%;white-space:normal}
.dsh-chat-account-settings>.dsh-chat-settings-error:first-child{margin-top:0;padding-top:0;border-top:0}
`


/** One stylesheet per document, owned by the plugin lifetime rather than a row. */
const styleLeases = new WeakMap<Document, { release(): void; retain(): void; ensure(): void }>()
export function acquireChatStyles(doc: Document): () => void {
  let lease = styleLeases.get(doc)
  if (!lease) {
    const style = doc.createElement('style')
    style.setAttribute('data-dsh-deepseek-chat-styles', 'true')
    let users = 0
    const ensure = () => {
      if (style.textContent !== chatStyles) style.textContent = chatStyles
      if (style.media) style.media = ''
      if (style.hasAttribute('disabled')) style.removeAttribute('disabled')
      if (!style.isConnected) doc.head.appendChild(style)
      if (style.sheet?.disabled) style.sheet.disabled = false
    }
    const observer = new MutationObserver(ensure)
    ensure()
    observer.observe(doc.head, { childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['disabled', 'media'] })
    const current = {
      ensure,
      retain() { users++; ensure() },
      release() {
        if (--users > 0) return
        observer.disconnect(); style.remove()
        if (styleLeases.get(doc) === current) styleLeases.delete(doc)
      },
    }
    lease = current
    styleLeases.set(doc, current)
  }
  lease.retain()
  let released = false
  return () => { if (!released) { released = true; lease!.release() } }
}

/** CSSOM disabling does not emit a DOM mutation; the brand measurement also checks it. */
export function ensureChatStyles(doc: Document): void { styleLeases.get(doc)?.ensure() }
