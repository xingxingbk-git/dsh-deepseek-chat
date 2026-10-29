import schema from '@deepseek-ai/schemastery'
import { SWITCH_LABEL_PATTERN } from './preferences.js'

/** Volatile fields persist through official settings without remounting the Host/guest. */
export const SwitchPreferencesConfig = schema.object({
  switchStyle: schema.union(['text','icon']).default('text').volatile(),
  chatLabel: schema.string().max(20).pattern(SWITCH_LABEL_PATTERN).default('CHAT').volatile(),
  harnessLabel: schema.string().max(20).pattern(SWITCH_LABEL_PATTERN).default('HARNESS').volatile(),
})
