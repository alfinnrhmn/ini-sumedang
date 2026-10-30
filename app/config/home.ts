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
