// Beranda adalah kategori "Berita": `/kategori/berita` dialihkan permanen (308) ke `/`; query sengaja tidak diteruskan.
// Dilakukan di server route (bukan `routeRules` di nuxt.config.ts); navigasi SPA ke URL ini ditangani halaman kategori.
export default defineEventHandler((event) => {
  return sendRedirect(event, '/', 308)
})
