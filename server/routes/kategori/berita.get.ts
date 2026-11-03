// E1 (PAGE-003, evaluasi pemilik): Beranda adalah kategori "Berita", jadi `/kategori/berita` tidak punya halaman sendiri dan dialihkan
// permanen (308, metode dan badan dipertahankan) ke `/`. Query (mis. `?halaman=2`) sengaja tidak diteruskan: Beranda tidak berhalaman.
// Dilakukan di server route (bukan `routeRules` di nuxt.config.ts); navigasi SPA ke URL ini ditangani halaman kategori.
export default defineEventHandler((event) => {
  return sendRedirect(event, '/', 308)
})
