/**
 * Konfigurasi section kategori Beranda (HOME-02). Urutan array = urutan di halaman.
 * Judul section = teks konfigurasi (Figma 84:1437, 57:496, 57:501, 57:505), bukan nama kategori
 * dari data. Slug [I]: final di gerbang WordPress (PRD §13).
 */
export const HOME_SECTIONS = [
  { slug: 'sepak-bola', title: 'Sepak Bola' },
  { slug: 'nasional', title: 'Nasional' },
  { slug: 'bisnis-teknologi', title: 'Bisnis dan Teknologi' },
  { slug: 'otomotif', title: 'Otomotif' }
] as const

export type HomeSectionSlug = (typeof HOME_SECTIONS)[number]['slug']

/** Jumlah kartu per section. Default 4 [usulan PM; angka final menunggu pemilik, "4 atau 6"]. */
export const HOME_SECTION_COUNTS: Record<HomeSectionSlug, number> = {
  'sepak-bola': 4,
  'nasional': 4,
  'bisnis-teknologi': 4,
  'otomotif': 4
}

/** Batas `limit` yang diterima API section (bilangan bulat). */
export const SECTION_LIMIT_MIN = 1
export const SECTION_LIMIT_MAX = 12

/** Kolom samping Beranda (HOME-03): jumlah item per tab [V 34:354 dan 4 `Card Popular News` di 90:1611]. */
export const SIDEBAR_COUNT = 4

/**
 * Terpopuler = pilihan editor (PRD §3.6): artikel terbit bertag `POPULAR_TAG_SLUG` yang terbit dalam
 * `POPULAR_WINDOW_DAYS` hari terakhir (umur tepat 14 hari masuk, lebih tua tidak). Satu konstanta jendela.
 * Skenario "tidak ada populer" untuk QA di salinan sementara: ubah POPULAR_TAG_SLUG menjadi slug yang tak ada.
 */
export const POPULAR_WINDOW_DAYS = 14
export const POPULAR_TAG_SLUG = 'terpopuler'

/** Hero Beranda (HOME-07): jumlah slide = jumlah titik di Figma [V 21:4981 dan 90:2137: 4 titik]. */
export const HERO_SLIDE_COUNT = 4
