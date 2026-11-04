<script setup lang="ts">
import { normalizeSearchQuery, searchInputValue } from '~/config/search'

// Kolom cari header (PAGE-004). Desktop >= 1024: input 400 x 54 sesuai Figma 21:5270 (radius 16, latar --color-surface, border --color-border-subtle,
// ikon 20 x 20 di x 15, teks mulai x 51). Di bawah 1024 form tersembunyi sampai tombol ikon di header (SiteHeader) membukanya (prop `open`): barisnya
// menggantikan isi bilah (hamburger + logo disembunyikan), fokus otomatis ke input, tombol tutup dan Esc memancarkan `close` (pemanggil mengembalikan
// fokus ke tombol cari). Keadaan terbuka mobile dan tombol tutup tanpa frame [?]: diturunkan dari token (Keputusan PM 1; deviasi untuk POLISH-01).
// Dasar = <form role="search" method="get" action="/cari"> dengan <input type="search" name="q" maxlength="100">: berfungsi tanpa JavaScript
// (pengiriman GET biasa). Dengan JavaScript pengiriman dicegat dan dialihkan lewat router ke /cari?q=<kata kunci ternormalisasi> (tanpa muat ulang).
// Ikon cari = tombol kirim ("Cari"), posisinya di kiri input tetapi urutan DOM/Tab: input lalu tombol. Tanpa saran otomatis saat mengetik.
// Nilai awal = `q` bila halaman /cari sedang terbuka (nilai input, tidak pernah HTML), selain itu kosong.
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

// Pengiriman dengan JavaScript: kata kunci valid menjadi /cari?q=<ternormalisasi>; kosong atau tidak valid tetap dikirim (halaman menampilkan
// pesan netral) dengan nilai dipadatkan, tanpa karakter kontrol. Tujuan dikirim ke pemanggil agar baris pencarian mobile ditutup.
async function onSubmit(event: SubmitEvent) {
  event.preventDefault()
  const to = searchPath(normalizeSearchQuery(value.value) ?? searchInputValue(value.value))
  await navigateTo(to)
  emit('navigate', to)
}

// Esc menutup baris pencarian (hanya saat terbuka di bawah 1024); tanpa itu Esc tetap perilaku bawaan input. Teks yang sudah diketik tidak dihapus.
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
/* < 1024: tersembunyi sampai dibuka. Terbuka = baris setinggi 40 (bilah mobile 51: padding atas 11 diatur SiteHeader), kolom input melebar + tombol tutup 40. */
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
  border: 1px solid var(--color-border-subtle); /* Figma 21:5270 rgba(8,8,8,0.05) */
  border-radius: var(--radius-6); /* mobile turunan tombol 116:1647 (radius 6); desktop 16 di bawah */
  background: var(--color-surface); /* #F8F8F8 */
}

/* Teks Inter Regular 18 / 27, spasi huruf -4 % (Text/L/Regular); padding kiri 50 + border 1 = teks mulai x 51 (21:5273 x 15 + 36).
   Warna isian --color-text (12,6:1), placeholder = Grey 2 #4F4F4F (21:5273) = --color-gray-2 (8,0:1 di atas #F8F8F8). */
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

/* Tombol kirim = ikon 20 x 20 pada x 15 (padding kiri 14 + border 1), disetel di atas padding kiri input. Area ketuk 46 x tinggi kolom. */
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

/* Tanpa JavaScript (< 1024) form selalu tampil (SiteHeader menaruhnya sebagai baris kedua bilah) dan tombol tutup tidak berguna */
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

/* Desktop 21:5270: 400 x 54, radius 16; tombol tutup tidak dipakai (hanya untuk baris mobile) */
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
