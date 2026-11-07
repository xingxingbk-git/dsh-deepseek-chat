import {build} from 'esbuild'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
// One dependency-free, fictional-data suite; no project build output or live browser.
const result=await build({absWorkingDir:root,entryPoints:['tests/website-links.test.ts'],bundle:true,write:false,format:'esm',platform:'node',target:'node22'})
await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
