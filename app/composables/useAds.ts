import type { AdsResponse } from '~/types/ad'

// Satu permintaan `/api/ads` dibagi semua `AdSlot` (`dedupe: 'defer'` + payload) agar HTML server dan hidrasi sama.
// Gagal tidak melempar: `data` kosong, `AdSlot` tidak dirender, halaman tetap tampil.
export function useAds() {
  const { data } = useFetch<AdsResponse>('/api/ads', {
    key: 'ads',
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] as AdsResponse | undefined
  })
  return data
}
