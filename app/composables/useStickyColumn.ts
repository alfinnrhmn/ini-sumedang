import { onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'

// Menempel = CSS `position: sticky` (hanya >= 1024 px); di sini hanya `top` dihitung: kolom lebih tinggi dari layar menempel dengan DASARNYA, dan `top`
// digeser sementara agar elemen fokus keyboard terlihat. Syarat: tanpa leluhur ber-overflow selain visible di antara kolom dan kontainernya.

/** Jarak kolom ke tepi atas (dan bawah) layar saat menempel; sama dengan --space-24. */
export const STICKY_OFFSET = 24

/** Sticky hanya pada desktop; di bawahnya kolom bertumpuk dan bergulir normal. Sama dengan ambang `min-width: 1024px` di CSS halaman. */
export const STICKY_MIN_WIDTH = 1024

/** Murni: `top` sticky = min(offset, tinggiLayar - tinggiKolom - offset); kolom lebih tinggi dari layar mendapat `top` negatif (menempel dengan dasarnya). */
export function stickyTop(viewportHeight: number, columnHeight: number, offset: number = STICKY_OFFSET): number {
  return Math.min(offset, viewportHeight - columnHeight - offset)
}

/** Gulir halaman (px) setelah fokus yang dianggap gulir pengguna: `top` kembali ke rumus `stickyTop`. */
export const STICKY_SCROLL_RESET = 8

/** Murni: `top` sementara agar elemen fokus terlihat penuh, atau `null` bila sudah terlihat. Dibatasi ke [stickyTop, offset]; elemen terlalu tinggi memprioritaskan tepi atasnya. */
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

/** Pasang `style.top` inline pada kolom kanan (ResizeObserver + resize) hanya saat lebar >= STICKY_MIN_WIDTH; dibersihkan saat unmount. */
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
