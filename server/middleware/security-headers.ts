import { embedFrameSrcPolicy } from '../utils/sanitize-config'

// HARD-001: header keamanan untuk respons HTML saja. CSP hanya `frame-src` (diturunkan dari EMBED_ALLOWED_HOSTS, satu sumber
// dengan penyanitasi); CSP penuh = SEC-001. API (/api), aset build (/_nuxt, /_*), dan berkas statis (nama berkas bertitik:
// .js, .css, .svg, .json, _payload.json, ...) tidak diberi header. Kebijakan dihitung sekali karena daftar host konstan.
const FRAME_SRC_POLICY = embedFrameSrcPolicy()

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] ?? ''
  const isHtmlRoute = path !== '/api' && !path.startsWith('/api/') && !path.startsWith('/_') && !(path.split('/').pop() ?? '').includes('.')
  if (!isHtmlRoute) return
  setResponseHeader(event, 'Content-Security-Policy', FRAME_SRC_POLICY)
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
})
