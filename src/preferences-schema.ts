import schema from '@deepseek-ai/schemastery'
import { SWITCH_LABEL_PATTERN } from './preferences.js'

/** Volatile fields persist through official settings without remounting the Host/guest. */
export const SwitchPreferencesConfig = schema.object({
  switchStyle: schema.union(['text','icon']).default('text').volatile(),
  chatLabel: schema.string().max(20).pattern(SWITCH_LABEL_PATTERN).default('CHAT').volatile(),
  harnessLabel: schema.string().max(20).pattern(SWITCH_LABEL_PATTERN).default('HARNESS').volatile(),
  websiteLifetime: schema.union(['retain','immediate','delayed']).default('retain').volatile(),
  websiteReleaseDelay: schema.number().min(5).max(3600).step(1).default(60).volatile(),
  brandNoticeDismissed: schema.boolean().default(false).volatile(),
  shortcutEnabled: schema.boolean().default(true).volatile(),
  shortcutChat: schema.string().max(64).default('Tab').volatile(),
  shortcutHarness: schema.string().max(64).default('Tab').volatile(),
})
