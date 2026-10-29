import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
// Keep the actual Client, ModeController and surface modules. Registration-only
// Node tests do not render the visual SDK, whose browser package imports CSS.
const visualPrimitives=[
  'BrandWordmark','IconSearchOutlineRegular','IconCloseFillRegular','IconNewChatOutlineRegular',
  'IconPanelLeftOutlineRegular','IconRefreshOutlineRegular','IconLoadingOutlineRegular','IconEllipsisOutlineRegular',
  'IconEditOutlineRegular','IconPinOutlineRegular','IconShareOutlineRegular','IconTrashOutlineRegular',
  'Menu','Modal','Button','Input','IconChevronDownOutlineRegular','Tooltip',
]
const visualSdkFixture={name:'window-contracts-visual-sdk',setup(plugin){
  plugin.onResolve({filter:/^@deepseek-ai\/dsh-client-ui-primitives$/},()=>({path:'visual-primitives',namespace:'window-contracts-fixture'}))
  plugin.onLoad({filter:/.*/,namespace:'window-contracts-fixture'},()=>({
    contents:`const unused=()=>{throw new Error('Registration tests must not render the visual SDK')};export{${visualPrimitives.map(name=>`unused as ${name}`).join(',')}}`,loader:'js',
  }))
}}
// Target current contracts without modifying unrelated historical authorization fixtures.
for(const entry of ['tests/website-navigation.test.ts','tests/window-drag.test.ts','tests/window-drag-integration.test.ts']) {
  const result=await build({absWorkingDir:root,entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'node',target:'node22',plugins:[visualSdkFixture]})
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}
