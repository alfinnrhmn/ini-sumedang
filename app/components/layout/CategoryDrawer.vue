<script setup lang="ts">
import type { ArticleCategory } from '~/types/article'

// Laci kategori (HOME-06, G20): panel samping dari kiri, sama di desktop dan mobile. Visual = "Usulan visual" di
// docs/tasks/HOME-06.md (disetujui pemilik 1 Nov 2026). Tertutup = atribut `hidden` (isi tetap ada di HTML server).
// Terbuka: fokus ke tombol tutup, fokus terkurung di panel, Esc menutup, scroll halaman dikunci.
// Pemanggil mengembalikan fokus ke tombol hamburger saat `close` dipancarkan.
const props = defineProps<{
  open: boolean
  /** id elemen dialog; dipakai aria-controls pada tombol hamburger */
  id: string
  categories: ArticleCategory[]
}>()
const emit = defineEmits<{ close: [] }>()

const titleId = `${props.id}-title`
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

// Kunci scroll halaman; lebar scrollbar diganti padding agar tata letak tidak bergeser saat scrollbar hilang.
function lockScroll() {
  const root = document.documentElement
  const scrollbar = window.innerWidth - root.clientWidth
  root.style.overflow = 'hidden'
  if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`
}

function unlockScroll() {
  const root = document.documentElement
  root.style.overflow = ''
  root.style.paddingRight = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !panel.value) return

  // Fokus terkurung: Tab/Shift+Tab berputar di antara elemen fokus panel (tombol tutup + tautan kategori bila ada).
  const focusable = Array.from(panel.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  const active = document.activeElement
  if (!active || !panel.value.contains(active)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    lockScroll()
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    unlockScroll()
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  unlockScroll()
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="drawer" :hidden="!open">
    <div class="overlay" @click="emit('close')" />
    <div
      :id="id"
      ref="panel"
      class="panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="head">
        <h2 :id="titleId" class="title">
          Kategori
        </h2>
        <button
          ref="closeButton"
          type="button"
          class="close"
          aria-label="Tutup menu kategori"
          @click="emit('close')"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        </button>
      </div>
      <ul class="list">
        <li v-for="category in categories" :key="category.id">
          <LayoutCategoryLabel :category="category" class="item" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.drawer[hidden] {
  display: none;
}

.overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-black-1) 40%, transparent); /* alfa 40 % = usulan yang disetujui, bukan token baru */
}

.panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: var(--container-mobile);
  max-width: calc(100% - var(--space-24));
  overflow-y: auto;
  background: var(--color-white);
  border-right: 1px solid var(--color-border);
  animation: drawer-in 250ms ease;
}

@keyframes drawer-in {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    animation: none;
  }
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-16);
  padding: var(--space-16) var(--space-24);
  border-bottom: 1px solid var(--color-border);
}

.title {
  font: var(--type-heading-mobile);
  color: var(--color-text);
}

.close {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-40); /* 40 = tombol hamburger desktop 21:5352 */
  height: var(--space-40);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--radius-6);
  background: var(--color-surface);
  color: var(--color-black-1);
  cursor: pointer;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list li + li {
  border-top: 1px solid var(--color-border);
}

/* Gaya item meniru teks menu kategori desktop 21:4951: Inter Medium 18, spasi huruf -4 %, warna merek (di atas putih 5,0 : 1) */
.item {
  display: block;
  padding: var(--space-16) var(--space-24);
  font: var(--type-text-l-medium);
  letter-spacing: var(--tracking-text-l);
  color: var(--color-brand);
}

a.item:hover,
a.item[aria-current="page"] {
  background: var(--color-surface);
}
</style>
