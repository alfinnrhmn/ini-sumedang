// Beranda adalah kategori "Berita", jadi `/kategori/berita` dialihkan permanen (308, metode dan badan dipertahankan) ke `/`. Query (mis. `?halaman=2`) sengaja tidak diteruskan: Beranda tidak berhalaman.
// Dilakukan di server route (bukan `routeRules` di nuxt.config.ts); navigasi SPA ke URL ini ditangani halaman kategori.
export default defineEventHandler((event) => {
  return sendRedirect(event, '/', 308)
})
