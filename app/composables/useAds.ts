import type { AdsResponse } from '~/types/ad'

// Satu permintaan `/api/ads` dibagikan semua `AdSlot` (`dedupe: 'defer'` + payload), jadi HTML server dan hidrasi memakai data yang sama.
// Gagal tidak melempar: `data` kosong, `AdSlot` tidak dirender, halaman tetap tampil.
/** Respons `/api/ads`; `undefined` bila belum/gagal dimuat. */
export function useAds() {
  const { data } = useFetch<AdsResponse>('/api/ads', {
    key: 'ads',
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] as AdsResponse | undefined
  })
  return data
}
