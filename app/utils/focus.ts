/**
 * Pindahkan fokus ke judul halaman (`<h1 tabindex="-1">` di dalam `<main>`) tanpa menggulir. Dipakai setelah navigasi SPA
 * ke halaman kategori (PAGE-003) agar pembaca layar dan keyboard tidak kehilangan posisi (fokus tidak jatuh ke `<body>`).
 * Hanya jalan di klien; tanpa judul yang dapat difokus tidak melakukan apa-apa.
 */
export function focusPageHeading(): void {
  if (typeof document === 'undefined') return
  document.querySelector<HTMLElement>('main h1[tabindex="-1"]')?.focus({ preventScroll: true })
}

/**
 * Pembeda navigasi riwayat (tombol Back/Forward browser, `popstate`) dari navigasi maju yang disengaja (klik/Enter pada tautan).
 * Gulir ke atas dan pemindahan fokus ke `<h1>` hanya untuk navigasi maju; pada Back/Forward posisi gulir dipulihkan router/browser
 * dan fokus tidak dicuri (PAGE-003, Keputusan PM atas temuan M1).
 *
 * Cara kerja: `popstate` hanya dipancarkan browser untuk Back/Forward, dan dipancarkan lebih dulu daripada navigasi router
 * (guard vue-router berjalan asinkron). Pendengar `popstate` menandai `pending`; hook `afterEach` router (jalan untuk setiap navigasi
 * yang selesai atau gagal) memindahkan tanda itu ke `lastWasPop` lalu mengosongkannya. Jadi `lastWasPop` selalu menjawab
 * "apakah navigasi terakhir yang selesai berasal dari riwayat?" dan tetap benar saat halaman baru dipasang atau datanya tiba kemudian.
 */
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

/**
 * Pasang (sekali per sesi browser; aman dipanggil berulang) pelacak navigasi riwayat pada `router` dan `window`.
 * Di server (tanpa `window`) mengembalikan pelacak yang tidak pernah menandai pop. Harus dipanggil sebelum navigasi riwayat
 * pertama yang diamati; halaman kategori memanggilnya di setup, dan modulnya bertahan selama dokumen yang sama hidup.
 */
export function trackHistoryNavigation(router: { afterEach: (guard: () => void) => unknown }): HistoryNavigationTracker {
  if (tracker) return tracker
  const created = createHistoryNavigationTracker()
  if (typeof window === 'undefined') return created
  window.addEventListener('popstate', created.markPop)
  router.afterEach(created.settle)
  tracker = created
  return created
}

/**
 * Ingatan posisi gulir per URL penuh untuk perpindahan antar `?halaman=N` pada instansi halaman yang sama: router Nuxt tidak
 * memulihkan gulir bila `path` sama (hanya query berbeda), jadi Back/Forward antar halaman paginasi dipulihkan di sini.
 */
const scrollByUrl = new Map<string, number>()

export function rememberScroll(url: string, y: number): void {
  scrollByUrl.set(url, y)
}

export function recalledScroll(url: string): number | undefined {
  return scrollByUrl.get(url)
}
