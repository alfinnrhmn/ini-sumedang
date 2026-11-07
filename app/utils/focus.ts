/** Pindahkan fokus ke judul halaman (`<h1 tabindex="-1">` di `<main>`) tanpa menggulir, setelah navigasi SPA. */
export function focusPageHeading(): void {
  if (typeof document === 'undefined') return
  document.querySelector<HTMLElement>('main h1[tabindex="-1"]')?.focus({ preventScroll: true })
}

// Membedakan navigasi riwayat (Back/Forward) dari navigasi maju: gulir ke atas dan fokus ke `<h1>` hanya untuk maju.
// `popstate` tiba sebelum guard router: ia menandai `pending`, lalu `afterEach` memindahkannya ke `lastWasPop`.
export interface HistoryNavigationTracker {
  /** Dipanggil saat `popstate` (Back/Forward). */
  markPop: () => void
  /** Dipanggil oleh `router.afterEach`: menetapkan jenis navigasi yang baru selesai. */
  settle: () => void
  /** Apakah navigasi terakhir yang selesai berasal dari Back/Forward? */
  readonly lastWasPop: boolean
}

export function createHistoryNavigationTracker(): HistoryNavigationTracker {
  let pending = false
  let lastWasPop = false
  return {
    markPop() {
      pending = true
    },
    settle() {
      lastWasPop = pending
      pending = false
    },
    get lastWasPop() {
      return lastWasPop
    }
  }
}

let tracker: HistoryNavigationTracker | null = null

// Pasang pelacak navigasi riwayat (sekali per sesi, aman dipanggil berulang); di server tidak pernah menandai pop.
// Harus dipanggil sebelum navigasi riwayat pertama yang diamati.
export function trackHistoryNavigation(router: { afterEach: (guard: () => void) => unknown }): HistoryNavigationTracker {
  if (tracker) return tracker
  const created = createHistoryNavigationTracker()
  if (typeof window === 'undefined') return created
  window.addEventListener('popstate', created.markPop)
  router.afterEach(created.settle)
  tracker = created
  return created
}

// Posisi gulir per URL penuh: router Nuxt tidak memulihkan gulir bila `path` sama (hanya `?halaman=N` beda),
// jadi Back/Forward antar halaman paginasi dipulihkan di sini.
const scrollByUrl = new Map<string, number>()

export function rememberScroll(url: string, y: number): void {
  scrollByUrl.set(url, y)
}

export function recalledScroll(url: string): number | undefined {
  return scrollByUrl.get(url)
}
