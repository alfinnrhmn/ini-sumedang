/** Konfigurasi halaman kategori. Daftar kategori situs tidak ada di kode: acuannya WordPress (`/api/categories`). */

/** Jumlah kartu per halaman kategori. */
export const CATEGORY_PER_PAGE = 10

/** Batas paginasi: `?halaman=N` hanya 1-4 digit tanpa nol di depan (`^[1-9][0-9]{0,3}$`). */
export const CATEGORY_PAGE_PATTERN = /^[1-9][0-9]{0,3}$/

/** Panjang slug kategori yang diterima API (slug lebih panjang langsung 404). */
export const CATEGORY_SLUG_MAX_LENGTH = 60

/** Kategori WordPress yang TIDAK masuk daftar situs: kategori bawaan dan induk Ruang Visual beserta anaknya. */
export const WP_DEFAULT_CATEGORY_SLUG = 'uncategorized'
export const VISUAL_PARENT_SLUG = 'ruang-visual'
