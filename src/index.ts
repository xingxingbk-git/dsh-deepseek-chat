import { SwitchPreferencesConfig } from './preferences-schema.js'
import type {} from '@deepseek-ai/dsh-settings'
import type { Context } from '@deepseek-ai/cordis'
import { DshChatController } from './server.js'

// Only switch presentation is plugin-owned. Language/theme still follow DSH.
export const Config = SwitchPreferencesConfig

export const name = 'dsh-deepseek-chat'

/** Host-half entry. Browser UI is declared separately by the `dsh.client` manifest. */
export const inject = ['typert', 'credentials']

export function apply(ctx: Context): void { new DshChatController(ctx)
  ctx.inject(['settings'], child => { child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)) })
}
