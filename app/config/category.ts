/**
 * Konfigurasi halaman kategori (PAGE-003). Satu tempat untuk jumlah per halaman dan daftar slug kategori resmi.
 */

/** Jumlah kartu per halaman kategori (Keputusan PM 2). */
export const CATEGORY_PER_PAGE = 10

/** Batas paginasi: `?halaman=N` hanya 1-4 digit tanpa nol di depan (`^[1-9][0-9]{0,3}$`). */
export const CATEGORY_PAGE_PATTERN = /^[1-9][0-9]{0,3}$/

/** Panjang slug kategori yang diterima API (slug lebih panjang langsung 404). */
export const CATEGORY_SLUG_MAX_LENGTH = 60

/**
 * 9 kategori resmi (PRD §4.4), urutan = urutan menu. Hanya slug ini yang punya halaman `/kategori/<slug>` dan hanya
 * nama kategori ini yang menjadi tautan; kategori lain (mis. anak Ruang Visual, label contoh kolom samping) tetap teks.
 * Slug [I]: final di gerbang WordPress (PRD §13); server memvalidasi terhadap `getCategories()`, daftar ini hanya
 * dipakai sisi aplikasi untuk memutuskan apakah suatu nama kategori ditautkan.
 */
export const OFFICIAL_CATEGORY_SLUGS: readonly string[] = [
  'berita',
  'nasional',
  'pemerintahan',
  'politik',
  'hukum',
  'sepak-bola',
  'otomotif',
  'jelajah',
  'bisnis-teknologi'
]
