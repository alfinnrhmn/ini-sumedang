import type { AdsResponse } from '~/types/ad'

// Iklan per slot (ADS-002): SATU permintaan `/api/ads` (kunci `ads`) dibagikan semua `AdSlot` (pola `useCategories`).
// - SSR: pemanggil yang datang saat permintaan masih berjalan ikut menunggunya (`dedupe: 'defer'`), pemanggil sesudahnya memakai hasil di
//   payload (`getCachedData`), jadi HTML server dan hidrasi memakai data yang sama (tanpa hydration mismatch).
// - Navigasi klien: data dibaca dari payload, tanpa permintaan baru dan tanpa slot yang berkedip (tanpa layout shift).
// - Kegagalan permintaan tidak melempar: `data` kosong, `AdSlot` tidak dirender, halaman tetap tampil.
/** Respons `/api/ads`; `undefined` bila belum/gagal dimuat. */
export function useAds() {
  const { data } = useFetch<AdsResponse>('/api/ads', {
    key: 'ads',
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] as AdsResponse | undefined
  })
  return data
}
