import { onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'

// Kolom kanan menempel (UX-001 Keputusan PM 5): perilaku umum situs berita. Menempelnya sendiri = CSS `position: sticky` (bawaan browser, tanpa
// animasi tambahan, jadi tanpa aturan reduced-motion) hanya pada >= 1024 px; yang dihitung di sini hanya nilai `top`, karena kolom yang lebih tinggi
// dari layar harus menempel dengan DASARNYA (bukan atasnya) agar iklan paling bawah tetap terjangkau.
// Tanpa JavaScript (SSR) `top` = var(--space-24) dari CSS halaman; setelah mount nilainya diganti `top` inline hasil `stickyTop`.
// Fokus keyboard (UX-001 putaran 2, temuan F1): pada kolom lebih tinggi dari layar, elemen yang menerima fokus bisa berada di luar layar karena
// scroll-into-view browser tidak dapat menggeser elemen yang sedang menempel. `useStickyColumn` menggeser `top` inline sementara
// (`stickyTopForFocus`) agar elemen fokus terlihat penuh, lalu mengembalikannya ke rumus `stickyTop` saat fokus keluar kolom, saat resize,
// atau saat pengguna menggulir halaman.
// Syarat tata letak: tidak ada leluhur ber-overflow selain visible di antara kolom dan kontainernya (kolom menempel di dalam kontainer bergulirnya).

/** Jarak kolom ke tepi atas (dan bawah) layar saat menempel; sama dengan --space-24. */
export const STICKY_OFFSET = 24

/** Sticky hanya pada desktop; di bawahnya kolom bertumpuk dan bergulir normal. Sama dengan ambang `min-width: 1024px` di CSS halaman. */
export const STICKY_MIN_WIDTH = 1024

/**
 * Murni: `top` sticky = min(offset, tinggiLayar - tinggiKolom - offset).
 * Kolom yang tidak lebih tinggi dari (layar - 2 x offset) menempel `offset` dari atas layar; kolom yang lebih tinggi mendapat `top` negatif,
 * sehingga ia bergulir normal sampai dasarnya berjarak `offset` dari dasar layar, lalu menempel di sana.
 */
export function stickyTop(viewportHeight: number, columnHeight: number, offset: number = STICKY_OFFSET): number {
  return Math.min(offset, viewportHeight - columnHeight - offset)
}

/** Gulir halaman (px) setelah fokus yang dianggap gulir pengguna: `top` kembali ke rumus `stickyTop`. */
export const STICKY_SCROLL_RESET = 8

/**
 * Murni: `top` sticky sementara agar elemen fokus terlihat penuh (jarak `offset` dari tepi atas dan bawah layar). Semua ukuran dalam piksel
 * koordinat layar: `columnTop` = posisi atas kolom saat ini, `targetTop`/`targetBottom` = tepi elemen fokus saat ini.
 * Mengembalikan `null` bila elemen sudah terlihat penuh (tidak ada yang digeser). Hasil dibatasi ke [stickyTop, offset]: tidak pernah lebih rendah dari
 * posisi kolom yang menampakkan dasarnya, dan tidak pernah lebih dari `offset` dari atas layar. Elemen lebih tinggi dari ruang yang tersedia
 * diprioritaskan agar tepi atasnya terlihat.
 */
export function stickyTopForFocus(
  viewportHeight: number,
  columnHeight: number,
  columnTop: number,
  targetTop: number,
  targetBottom: number,
  offset: number = STICKY_OFFSET
): number | null {
  if (targetTop >= offset && targetBottom <= viewportHeight - offset) return null
  // Rentang `top` kolom yang membuat elemen terlihat penuh (relatif terhadap kolom, jadi tak bergantung pada status menempel).
  const lowest = offset - (targetTop - columnTop)
  const highest = viewportHeight - offset - (targetBottom - columnTop)
  const wanted = lowest > highest ? lowest : Math.min(Math.max(columnTop, lowest), highest)
  return Math.min(Math.max(wanted, stickyTop(viewportHeight, columnHeight, offset)), offset)
}

/**
 * Pasang perilaku menempel pada elemen `target` (kolom kanan): mengatur `style.top` inline mengikuti tinggi layar dan tinggi kolom
 * (`ResizeObserver` + `resize`), hanya saat lebar >= STICKY_MIN_WIDTH; di bawahnya `top` inline dibuang. Bersih saat unmount.
 */
export function useStickyColumn(target: Ref<HTMLElement | null | undefined>) {
  let cleanup: (() => void) | undefined

  onMounted(() => {
    const element = target.value
    if (!element) return
    const desktop = window.matchMedia(`(min-width: ${STICKY_MIN_WIDTH}px)`)
    let shifted = false // `top` sedang digeser demi fokus
    let baseScrollY: number | null = null // gulir saat fokus selesai menetap; null = masih menetap
    let frame = 0

    const update = () => {
      shifted = false
      baseScrollY = null
      cancelAnimationFrame(frame)
      if (!desktop.matches) {
        element.style.removeProperty('top')
        return
      }
      element.style.top = `${stickyTop(window.innerHeight, element.getBoundingClientRect().height)}px`
    }

    const reveal = (focused: Element) => {
      const column = element.getBoundingClientRect()
      const box = focused.getBoundingClientRect()
      const next = stickyTopForFocus(window.innerHeight, column.height, column.top, box.top, box.bottom)
      if (next === null) return
      element.style.top = `${next}px`
      shifted = true
    }

    const onFocusIn = (event: FocusEvent) => {
      if (!desktop.matches || !(event.target instanceof Element)) return
      const focused = event.target
      cancelAnimationFrame(frame)
      baseScrollY = null
      reveal(focused)
      // Setelah browser selesai menggulir untuk fokus (gulir itu bukan gulir pengguna): periksa ulang lalu catat posisi gulir.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (document.activeElement === focused) reveal(focused)
          baseScrollY = window.scrollY
        })
      })
    }

    const onFocusOut = (event: FocusEvent) => {
      if (shifted && !(event.relatedTarget instanceof Node && element.contains(event.relatedTarget))) update()
    }

    const onScroll = () => {
      if (shifted && baseScrollY !== null && Math.abs(window.scrollY - baseScrollY) > STICKY_SCROLL_RESET) update()
    }

    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', onScroll, { passive: true })
    element.addEventListener('focusin', onFocusIn)
    element.addEventListener('focusout', onFocusOut)
    desktop.addEventListener('change', update)
    update()
    cleanup = () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', onScroll)
      element.removeEventListener('focusin', onFocusIn)
      element.removeEventListener('focusout', onFocusOut)
      desktop.removeEventListener('change', update)
      element.style.removeProperty('top')
    }
  })

  onBeforeUnmount(() => cleanup?.())
}
