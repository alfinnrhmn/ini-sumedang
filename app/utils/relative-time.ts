const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

/** Waktu relatif bahasa Indonesia; `now` diberikan agar SSR dan hidrasi sama. */
export function formatRelativeTime(publishedAt: string, now: string | Date): string {
  const published = new Date(publishedAt).getTime()
  const nowMs = new Date(now).getTime()
  const diffMin = Math.floor((nowMs - published) / 60000)

  if (diffMin < 1) return 'baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} hari lalu`

  const wib = new Date(published + WIB_OFFSET_MS)
  return `${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`
}
