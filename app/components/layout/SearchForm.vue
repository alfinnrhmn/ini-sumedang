<script setup lang="ts">
import { normalizeSearchQuery, searchInputValue } from '~/config/search'

// Kolom cari: <form role="search" method="get" action="/cari"> jalan tanpa JS; dengan JS via router ke /cari?q=<kata>.
// Nilai awal = q. < 1024 tersembunyi sampai prop open; fokus ke input, tutup/Esc memancarkan close; Tab: input, tombol.
const props = defineProps<{
  /** id form; dipakai aria-controls pada tombol cari di header */
  id: string
  /** Hanya berlaku di bawah 1024: baris pencarian terbuka */
  open: boolean
}>()
const emit = defineEmits<{ close: [], navigate: [to: string] }>()

const route = useRoute()
const inputId = `${props.id}-input`
const input = ref<HTMLInputElement | null>(null)

function valueFromRoute(): string {
  return route.name === SEARCH_ROUTE_NAME ? searchInputValue(route.query.q) : ''
}
const value = ref(valueFromRoute())
watch(() => [route.name, route.query.q], () => {
  value.value = valueFromRoute()
})

watch(() => props.open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  input.value?.focus()
})

// Kirim dengan JS: kata valid jadi /cari?q=<ternormalisasi>; kosong/tidak valid tetap dikirim dengan nilai dipadatkan
// tanpa karakter kontrol (halaman beri pesan netral). Tujuan dikirim ke pemanggil agar baris pencarian mobile ditutup.
async function onSubmit(event: SubmitEvent) {
  event.preventDefault()
  const to = searchPath(normalizeSearchQuery(value.value) ?? searchInputValue(value.value))
  await navigateTo(to)
  emit('navigate', to)
}

// Esc menutup baris pencarian (hanya saat terbuka di bawah 1024), selain itu bawaan input; teks yang diketik tetap.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.open) return
  event.preventDefault()
  emit('close')
}
</script>

<template>
  <form
    :id="id"
    class="search"
    :class="{ 'search--open': open }"
    role="search"
    method="get"
    action="/cari"
    @submit="onSubmit"
    @keydown="onKeydown"
  >
    <div class="field">
      <label :for="inputId" class="visually-hidden">Cari berita</label>
      <input
        :id="inputId"
        ref="input"
        v-model="value"
        class="input"
        type="search"
        name="q"
        maxlength="100"
        placeholder="Cari berita…"
        autocomplete="off"
        enterkeyhint="search"
      >
      <button type="submit" class="submit" aria-label="Cari">
        <img src="/icons/search-20.svg" alt="" width="20" height="20">
      </button>
    </div>
    <button type="button" class="close" aria-label="Tutup pencarian" @click="emit('close')">
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
  </form>
</template>

<style scoped>
/* < 1024: tersembunyi sampai dibuka. Terbuka = baris setinggi 40 (bilah mobile 51: padding atas 11 diatur SiteHeader),
   kolom input melebar + tombol tutup 40. */
.search {
  display: none;
}

.search--open {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--space-8);
  min-width: 0;
  height: var(--space-40);
}

.field {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  height: var(--space-40);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-6); /* mobile: radius 6; desktop 16 di bawah */
  background: var(--color-surface);
}

/* Teks Text/L/Regular; padding kiri 50 + border 1 = teks mulai x 51. Warna isian --color-text (12,6:1),
   placeholder = Grey 2 #4F4F4F = --color-gray-2 (8,0:1 di atas #F8F8F8). */
.input {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0 var(--space-16) 0 50px;
  border: 0;
  border-radius: inherit;
  background: transparent;
  font: var(--type-text-l-regular);
  letter-spacing: var(--tracking-text-l);
  color: var(--color-text);
  appearance: none;
}

.input::placeholder {
  color: var(--color-gray-2);
  opacity: 1;
}

.input::-webkit-search-cancel-button,
.input::-webkit-search-decoration {
  appearance: none;
}

/* Fokus input: cincin global pada seluruh kolom (bukan pada input di dalam bingkai) */
.input:focus {
  outline: none;
}

.field:has(.input:focus-visible) {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Tombol kirim = ikon 20 x 20 pada x 15 (padding kiri 14 + border 1) di atas padding input. Area ketuk 46 x tinggi. */
.submit {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 46px;
  margin: 0;
  padding: 0 0 0 14px;
  border: 0;
  border-radius: inherit;
  background: none;
  line-height: 0;
  cursor: pointer;
}

.close {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--space-40); /* sama dengan tombol tutup laci */
  height: var(--space-40);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--radius-6);
  background: var(--color-surface);
  color: var(--color-black-1);
  cursor: pointer;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Tanpa JS (< 1024) form selalu tampil (SiteHeader menaruhnya sebagai baris kedua bilah); tombol tutup tidak berguna */
@media (max-width: 1023.98px) and (scripting: none) {
  .search {
    display: flex;
    align-items: center;
    height: var(--space-40);
  }

  .close {
    display: none;
  }
}

/* Desktop: 400 x 54, radius 16; tombol tutup tidak dipakai (hanya untuk baris mobile) */
@media (min-width: 1024px) {
  .search {
    display: block;
    flex: none;
    width: 400px;
    height: 54px;
  }

  .field {
    height: 54px;
    border-radius: var(--radius-16);
  }

  .close {
    display: none;
  }
}
</style>
