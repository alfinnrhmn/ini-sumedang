/**
 * Konfigurasi halaman kategori (PAGE-003). Satu tempat untuk jumlah per halaman dan batas slug. Daftar kategori situs
 * tidak ada di kode: acuannya WordPress (WP-002; `getCategories()` di server, `/api/categories` untuk klien).
 */

/** Jumlah kartu per halaman kategori (Keputusan PM 2). */
export const CATEGORY_PER_PAGE = 10

/** Batas paginasi: `?halaman=N` hanya 1-4 digit tanpa nol di depan (`^[1-9][0-9]{0,3}$`). */
export const CATEGORY_PAGE_PATTERN = /^[1-9][0-9]{0,3}$/

/** Panjang slug kategori yang diterima API (slug lebih panjang langsung 404). */
export const CATEGORY_SLUG_MAX_LENGTH = 60

/**
 * Kategori WordPress yang TIDAK masuk daftar kategori situs (WP-002, Keputusan PM 1): kategori bawaan WordPress dan induk
 * Ruang Visual beserta anak-anaknya (anak hanya dipakai sebagai topik Ruang Visual, bukan kategori menu/halaman).
 */
export const WP_DEFAULT_CATEGORY_SLUG = 'uncategorized'
export const VISUAL_PARENT_SLUG = 'ruang-visual'
