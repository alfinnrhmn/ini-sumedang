import { embedFrameSrcPolicy } from '../utils/sanitize-config'

// Header keamanan untuk respons HTML saja. CSP hanya `frame-src` (dari EMBED_ALLOWED_HOSTS, satu sumber penyanitasi).
// /api, /_nuxt, dan berkas statis (nama bertitik) tidak diberi header. Kebijakan dihitung sekali: daftar host konstan.
const FRAME_SRC_POLICY = embedFrameSrcPolicy()

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] ?? ''
  const isHtmlRoute = path !== '/api' && !path.startsWith('/api/') && !path.startsWith('/_') && !(path.split('/').pop() ?? '').includes('.')
  if (!isHtmlRoute) return
  setResponseHeader(event, 'Content-Security-Policy', FRAME_SRC_POLICY)
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
})
