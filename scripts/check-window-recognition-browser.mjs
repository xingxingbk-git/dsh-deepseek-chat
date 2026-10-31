import { build, transform } from 'esbuild'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
// 113 literal assertions plus 3 strict-proof configurations in the fixture loop.
export const WINDOW_RECOGNITION_CASES = 116
export async function startWindowRecognitionFixture({quiet=false}={}) {
  const bundle=async entry=>(await build({absWorkingDir:root,entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'browser',target:'chrome130'})).outputFiles[0].text
  const surface=await readFile(path.join(root,'src/web-surface.tsx'),'utf8')
  const refreshStart=surface.indexOf('function websiteRefreshReadiness('),refreshEnd=surface.indexOf('/** Public Electron methods',refreshStart)
  if(refreshStart<0 || refreshEnd<=refreshStart)throw new Error('Actual refresh guard was not found')
  const refresh=(await transform(`export ${surface.slice(refreshStart,refreshEnd)}`,{loader:'ts',format:'esm'})).code
  // Exercise actual components and their lifecycle; only SDK visual primitives are inert.
  const primitives=['BrandWordmark','IconSearchOutlineRegular','IconCloseFillRegular','IconNewChatOutlineRegular','IconPanelLeftOutlineRegular','IconRefreshOutlineRegular','IconLoadingOutlineRegular','IconEllipsisOutlineRegular','IconEditOutlineRegular','IconPinOutlineRegular','IconShareOutlineRegular','IconTrashOutlineRegular','IconChevronDownOutlineRegular','Menu','Modal','Tooltip']
  const settings=(await build({absWorkingDir:root,stdin:{contents:`
      import {createElement} from 'react'
      import {createRoot} from 'react-dom/client'
      import {DshChatChatSettings,DshChatChatPanel} from './src/ui.tsx'
      import {DshChatWebSurface} from './src/web-surface.tsx'
      import {DshChatWindowDragSurface} from './src/window-drag-surface.tsx'
      function mount(Component,props,element){const root=createRoot(element);root.render(createElement(Component,props));return()=>root.unmount()}
      export const mountSettings=(bridge,element)=>mount(DshChatChatSettings,{bridge,close(){}},element)
      export const mountSurface=(bridge,nativeBrowser,element)=>mount(DshChatWebSurface,{bridge,nativeBrowser},element)
      export const mountPanel=(bridge,element)=>mount(DshChatChatPanel,{bridge},element)
      export const mountDragSurface=(bridge,signal,element)=>mount(DshChatWindowDragSurface,{bridge,signal},element)
    `,resolveDir:root,loader:'tsx'},bundle:true,write:false,format:'esm',platform:'browser',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'fixture-sdk-presentation',setup(plugin){plugin.onResolve({filter:/^@deepseek-ai\/dsh-client-ui-primitives$/},()=>({path:'primitives',namespace:'fixture'}));plugin.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:"import {createElement} from 'react';export function Button({children,variant,...props}){return createElement('button',props,children)};export function Input(props){return createElement('input',props)};"+primitives.map(name=>`export const ${name}=({children,...props})=>createElement('span',props,children);`).join(''),loader:'js',resolveDir:root}))}}]})).outputFiles[0].text
  const files={
    '/':['text/html; charset=utf-8',await readFile(path.join(root,'tests/browser/window-recognition.fixture.html'))],
    '/fixture.js':['text/javascript; charset=utf-8',await readFile(path.join(root,'tests/browser/window-recognition.fixture.js'))],
    '/navigation.js':['text/javascript; charset=utf-8',await bundle('src/website-navigation.ts')],
    '/drag.js':['text/javascript; charset=utf-8',await bundle('src/window-drag.ts')],
    '/styles.js':['text/javascript; charset=utf-8',await bundle('src/styles.ts')],
    '/refresh.js':['text/javascript; charset=utf-8',refresh],
    '/settings-ui.js':['text/javascript; charset=utf-8',settings],
  }
  const server=createServer(async(req,res)=>{
    if(req.method==='POST' && req.url==='/results') {
      let body=''
      for await(const chunk of req){body+=chunk;if(body.length>30000){res.writeHead(413).end();return}}
      try {
        const results=JSON.parse(body)
        const passed=Array.isArray(results) && results.length===WINDOW_RECOGNITION_CASES && results.every(r=>typeof r.name==='string' && r.passed===true)
        if(!quiet)console.log(JSON.stringify({passed,actualCases:results.length,results},null,2))
        res.writeHead(200).end('ok');server.close(()=>{if(!passed)process.exitCode=1})
      }catch{res.writeHead(400).end()}
      return
    }
    const file=req.method==='GET' && files[req.url]
    if(!file){res.writeHead(404).end();return}
    res.writeHead(200,{'Content-Type':file[0],'Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src data:"}).end(file[1])
  })
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  return {url:`http://127.0.0.1:${server.address().port}/`,close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections()})}
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const fixture=await startWindowRecognitionFixture()
  console.log(`Open the fictional-only window/recognition fixture (not DSH): ${fixture.url}`)
  process.on('SIGINT',()=>{void fixture.close()})
}
