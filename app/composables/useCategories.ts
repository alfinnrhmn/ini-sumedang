import type { ArticleCategory, CategoriesResponse } from '~/types/article'

// Satu sumber daftar kategori klien (menu, laci, footer). `dedupe: 'defer'` + `getCachedData` harus SAMA di semua
// pemanggil agar tautan sudah ada di HTML server dan hidrasi/navigasi tak meminta ulang. SiteHeader menunggu hasilnya.
export function useCategoriesFetch() {
  return useFetch<CategoriesResponse>('/api/categories', {
    key: 'categories',
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] as CategoriesResponse | undefined
  })
}

/** Daftar kategori WordPress (urutan menu); kosong bila tak ada kategori atau pemuatan gagal. */
export function useCategories() {
  const { data } = useCategoriesFetch()
  return computed<ArticleCategory[]>(() => data.value?.categories ?? [])
}
