import type { ArticleCategory, CategoriesResponse } from '~/types/article'

// Daftar kategori WordPress (WP-002): SATU sumber di klien untuk menu, laci, footer, dan keputusan "label kategori ini menaut atau teks biasa"
// (`categoryLink(slug, categories)`). Datanya dari `/api/categories` (satu permintaan, kunci `categories`, dipakai SiteHeader sejak HOME-06).
// Dipanggil dari banyak komponen (kartu, hero, kepala artikel, ...) dengan opsi yang SAMA persis:
// - SSR: pemanggil yang datang saat permintaan masih berjalan ikut menunggunya (`dedupe: 'defer'`; Nuxt mendaftarkan penantian itu ke render
//   komponen pemanggil), pemanggil sesudahnya memakai hasil yang sudah ada di payload (`getCachedData`), jadi tautan kategori sudah ada di
//   HTML server tanpa bergantung pada urutan render header/halaman.
// - Hidrasi dan navigasi klien: data dibaca dari payload, tidak ada permintaan baru.
/** Pengambilan daftar kategori; dapat ditunggu (`await`), dipakai SiteHeader. Komponen lain memakai `useCategories()`. */
export function useCategoriesFetch() {
  return useFetch<CategoriesResponse>('/api/categories', {
    key: 'categories',
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] as CategoriesResponse | undefined
  })
}

/** Daftar kategori WordPress (urutan menu); kosong bila WordPress tak punya kategori atau pemuatan gagal. */
export function useCategories() {
  const { data } = useCategoriesFetch()
  return computed<ArticleCategory[]>(() => data.value?.categories ?? [])
}
