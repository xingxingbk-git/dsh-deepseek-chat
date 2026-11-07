import assert from 'node:assert/strict'
import test from 'node:test'
import { parseWebsiteDownload, websiteDownloadBlob, WEBSITE_FILE_MAX_BYTES } from '../src/website-downloads.js'

const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82])
const encode = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')
const file = (name: string, mediaType: string, bytes: Uint8Array) => ({ kind: 'file', name, mediaType, dataUrl: `data:${mediaType};base64,${encode(bytes)}` })

test('a known image attachment is accepted and rebuilt with its original bytes', () => {
  const parsed = parseWebsiteDownload(file('diagram.png', 'image/png', png))
  assert.ok(parsed && parsed.kind === 'file')
  const blob = websiteDownloadBlob(parsed)
  assert.equal(blob.type, 'image/png')
  assert.equal(blob.size, png.length)
})

test('SVG and Mermaid source are accepted with their documented MIME pair', () => {
  const svg = parseWebsiteDownload(file('diagram.svg', 'image/svg+xml', new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>')))
  assert.ok(svg && svg.kind === 'file')
  const source = parseWebsiteDownload(file('diagram.mermaid', 'text/plain', new TextEncoder().encode('flowchart TD\n  A --> B')))
  assert.ok(source && source.kind === 'file')
})

test('guest failure codes stay bounded and never carry text', () => {
  for (const kind of ['failed', 'too-large', 'busy'] as const) assert.deepEqual(parseWebsiteDownload({ kind }), { kind })
  // Extra page-supplied fields are dropped rather than forwarded.
  assert.deepEqual(parseWebsiteDownload({ kind: 'failed', message: 'page text' }), { kind: 'failed' })
})

test('MIME and extension must agree before anything reaches the host saver', () => {
  assert.equal(parseWebsiteDownload(file('diagram.png', 'image/svg+xml', png)), null)
  assert.equal(parseWebsiteDownload(file('diagram.exe', 'application/octet-stream', png)), null)
  // A mismatched payload parses as a named file but its bytes are verified below.
  const mismatch = parseWebsiteDownload(file('diagram.svg', 'image/svg+xml', png))
  assert.ok(mismatch && mismatch.kind === 'file')
  assert.throws(() => websiteDownloadBlob(mismatch))
})

test('unsafe names and non-base64 payloads are rejected', () => {
  for (const name of ['../escape.png', 'a/b.png', 'diagram\u0000.png', '', 'x'.repeat(256) + '.png'])
    assert.equal(parseWebsiteDownload(file(name, 'image/png', png)), null)
  assert.equal(parseWebsiteDownload({ kind: 'file', name: 'diagram.png', mediaType: 'image/png', dataUrl: 'data:image/png;base64,not base64!' }), null)
  assert.equal(parseWebsiteDownload({ kind: 'file', name: 'diagram.png', mediaType: 'image/png', dataUrl: 'data:image/png;base64,' }), null)
  assert.equal(parseWebsiteDownload({ kind: 'file', name: 'diagram.svg', mediaType: 'image/svg+xml', dataUrl: 'data:image/png;base64,' + encode(png) }), null)
})

test('oversized payloads are refused before decoding', () => {
  const limit = Math.ceil(WEBSITE_FILE_MAX_BYTES / 3) * 4 + 1024
  const head = 'data:image/png;base64,'
  assert.equal(parseWebsiteDownload({ kind: 'file', name: 'diagram.png', mediaType: 'image/png', dataUrl: head + 'A'.repeat(limit) }), null)
})

test('a PNG without a PNG signature never becomes a saved image', () => {
  const parsed = parseWebsiteDownload(file('diagram.png', 'image/png', new TextEncoder().encode('not a png')))
  assert.ok(parsed && parsed.kind === 'file')
  assert.throws(() => websiteDownloadBlob(parsed), /Invalid attachment/)
})

test('an SVG payload must actually start with an SVG root', () => {
  const parsed = parseWebsiteDownload(file('diagram.svg', 'image/svg+xml', new TextEncoder().encode('<html>not svg</html>')))
  assert.ok(parsed && parsed.kind === 'file')
  assert.throws(() => websiteDownloadBlob(parsed), /Invalid attachment/)
})

test('non-file input never produces a downloadable attachment', () => {
  for (const value of [null, undefined, 'file', 42, {}, { kind: 'file' }, { kind: 'file', name: 1 }])
    assert.equal(parseWebsiteDownload(value), null)
})
