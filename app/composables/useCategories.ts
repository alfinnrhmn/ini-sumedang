import type { ArticleCategory, CategoriesResponse } from '~/types/article'

// Satu sumber daftar kategori di klien (menu, laci, footer, keputusan label menaut atau teks biasa). Opsi `dedupe: 'defer'` + `getCachedData`
// harus SAMA di semua pemanggil agar tautan kategori sudah ada di HTML server dan hidrasi/navigasi tidak meminta ulang.
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
