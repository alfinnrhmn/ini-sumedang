<script setup lang="ts">
import type { Article } from '~/types/article'
import { HERO_AUTOPLAY_MS, HERO_SLIDE_MS, heroAutoplayStatus, heroLiveMode, nextHeroSlide } from '~/config/home'

const props = defineProps<{
  /** Slide hero, urutan = urutan slide. Kosong: hero tidak dirender; kurang dari 2: titik tidak dirender. */
  articles: Article[]
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
}>()

// Carousel (HOME-07 keputusan PM 1, tanpa tombol prev/next dan geser sentuh); UX-001 Keputusan PM 1 menambah putar otomatis (di bawah).
// Empat titik = tombol; roving tabindex; panah kiri/kanan (berputar), Home, End memindahkan fokus dan slide.
// E3 (evaluasi pemilik): perpindahan slide = geser ke kiri (slide lama keluar ke kiri, slide baru masuk dari kanan, HERO_SLIDE_MS ease),
// tanpa pergeseran tata letak (slide bertumpuk absolut di kotak tetap). Selama animasi slide lama tetap dirender tetapi `inert` +
// `aria-hidden` (tidak fokus, tidak terbaca); setelah selesai kembali `hidden`. `prefers-reduced-motion: reduce` = berpindah instan.
const selected = ref(0)
const active = computed(() => Math.min(selected.value, props.articles.length - 1))
const leaving = ref<number | null>(null)
const entering = ref<number | null>(null)
const dotEls: (HTMLElement | null)[] = []
let settleTimer: ReturnType<typeof setTimeout> | undefined

function settle() {
  clearTimeout(settleTimer)
  leaving.value = null
  entering.value = null
}

function select(next: number) {
  const current = active.value
  if (next === current) return
  selected.value = next
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    settle()
    return
  }
  leaving.value = current
  entering.value = next
  // Cadangan bila animationend tidak datang (tab di latar belakang): bersihkan sedikit setelah durasi.
  clearTimeout(settleTimer)
  settleTimer = setTimeout(settle, HERO_SLIDE_MS + 100)
}

function onSlideAnimationEnd(event: AnimationEvent) {
  if (event.target === event.currentTarget) settle()
}

// UX-001 Keputusan PM 1: putar otomatis tiap HERO_AUTOPLAY_MS, hanya di klien setelah mount (SSR/hidrasi tidak berubah, tanpa layout shift).
// Dijeda saat pointer di atas hero, fokus keyboard di dalam hero, atau tab tersembunyi; `prefers-reduced-motion: reduce` = tanpa putar.
// Fokus dihitung hanya bila `:focus-visible` (keyboard): titik yang baru diklik mouse/sentuh tetap fokus tetapi tidak boleh menjeda
// selamanya setelah pointer meninggalkan hero. Pilihan titik / panah keyboard memulai ulang timer dari 0 (`restartAutoplay`).
// Keputusan logika (status, slide berikutnya, aria-live) ada di app/config/home.ts agar bisa diuji murni. Satu timer (setTimeout) yang
// dipasang ulang tiap status/slide berubah, dibersihkan saat unmount.
const root = ref<HTMLElement | null>(null)
const mounted = ref(false)
const reducedMotion = ref(false)
const hovering = ref(false)
const focused = ref(false)
const hidden = ref(false)
const status = computed(() => heroAutoplayStatus({
  mounted: mounted.value,
  slideCount: props.articles.length,
  reducedMotion: reducedMotion.value,
  hovering: hovering.value,
  focused: focused.value,
  hidden: hidden.value
}))
const liveMode = computed(() => heroLiveMode(status.value))
let autoplayTimer: ReturnType<typeof setTimeout> | undefined

function stopAutoplay() {
  clearTimeout(autoplayTimer)
  autoplayTimer = undefined
}

function restartAutoplay() {
  stopAutoplay()
  if (status.value !== 'running') return
  autoplayTimer = setTimeout(() => select(nextHeroSlide(active.value, props.articles.length)), HERO_AUTOPLAY_MS)
}

watch([status, active], restartAutoplay, { flush: 'post' })

function onPointerEnter(event: PointerEvent) {
  if (event.pointerType !== 'touch') hovering.value = true
}

function onPointerLeave() {
  hovering.value = false
}

function onFocusIn(event: FocusEvent) {
  try {
    focused.value = (event.target as HTMLElement).matches(':focus-visible')
  }
  catch {
    focused.value = true // peramban tanpa :focus-visible: anggap fokus keyboard (lebih aman: menjeda)
  }
}

function onFocusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) focused.value = false
}

const reducedMotionQuery = typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)')
const onReducedMotionChange = () => { reducedMotion.value = reducedMotionQuery?.matches ?? false }
const onVisibilityChange = () => { hidden.value = document.visibilityState === 'hidden' }

onMounted(() => {
  onReducedMotionChange()
  onVisibilityChange()
  reducedMotionQuery?.addEventListener('change', onReducedMotionChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
  mounted.value = true
})

onBeforeUnmount(() => {
  clearTimeout(settleTimer)
  stopAutoplay()
  reducedMotionQuery?.removeEventListener('change', onReducedMotionChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

function onDotClick(index: number) {
  select(index)
  restartAutoplay()
}

function onKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const count = props.articles.length
  let next: number
  switch (event.key) {
    case 'ArrowRight': next = (active.value + 1) % count; break
    case 'ArrowLeft': next = (active.value - 1 + count) % count; break
    case 'Home': next = 0; break
    case 'End': next = count - 1; break
    default: return
  }
  event.preventDefault()
  select(next)
  restartAutoplay()
  dotEls[next]?.focus()
}

// Chip = kategori pertama artikel (nama sudah didekode di server); tanpa kategori chip tidak dirender.
// PAGE-003: kategori resmi = tautan ke /kategori/<slug> (tab stop sendiri, di atas overlay judul); non-resmi tetap teks.
const slides = computed(() =>
  props.articles.map(article => ({
    article,
    category: article.categories[0]?.name ?? '',
    categoryTo: article.categories[0] ? categoryLink(article.categories[0].slug) : null,
    href: articlePath(article),
    time: formatRelativeTime(article.publishedAt, props.now)
  }))
)
</script>

<template>
  <section
    v-if="articles.length"
    ref="root"
    class="hero"
    aria-roledescription="carousel"
    aria-label="Berita utama"
    :style="{ '--hero-slide-ms': `${HERO_SLIDE_MS}ms` }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div class="slides" :aria-live="liveMode">
      <div
        v-for="(slide, index) in slides"
        :key="slide.article.id"
        class="slide"
        :class="{ 'slide--enter': entering === index, 'slide--leave': leaving === index }"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${index + 1} dari ${slides.length}`"
        :hidden="active !== index && leaving !== index"
        :aria-hidden="leaving === index ? 'true' : undefined"
        :inert="leaving === index ? true : undefined"
        @animationend="onSlideAnimationEnd"
      >
        <img
          v-if="slide.article.heroImage"
          class="photo"
          :src="slide.article.heroImage.url"
          :alt="slide.article.heroImage.alt"
          :width="slide.article.heroImage.width"
          :height="slide.article.heroImage.height"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : undefined"
        >
        <NuxtLink v-if="slide.category && slide.categoryTo" :to="slide.categoryTo" :aria-current="undefined" class="chip">
          {{ slide.category }}
        </NuxtLink>
        <p v-else-if="slide.category" class="chip">
          {{ slide.category }}
        </p>
        <h2 class="title">
          <NuxtLink :to="slide.href" class="link">
            {{ slide.article.title }}
          </NuxtLink>
        </h2>
        <div class="meta">
          <div class="publisher">
            <img class="avatar" src="/images/avatar-mobile.png" alt="" width="50" height="50">
            <span class="author">{{ slide.article.authorLabel }}</span>
          </div>
          <time class="time" :datetime="slide.article.publishedAt">{{ slide.time }}</time>
        </div>
      </div>
    </div>
    <div v-if="slides.length > 1" class="dots" role="group" aria-label="Pilih slide" @keydown="onKeydown">
      <button
        v-for="(slide, index) in slides"
        :key="slide.article.id"
        :ref="(el) => { dotEls[index] = el as HTMLElement | null }"
        type="button"
        class="dot"
        :aria-label="`Slide ${index + 1}`"
        :aria-current="active === index ? 'true' : 'false'"
        :tabindex="active === index ? 0 : -1"
        @click="onDotClick(index)"
      />
    </div>
  </section>
</template>

<style scoped>
/* Hero mobile 90:2130: 354x238 (lebar mengikuti kolom), radius 16. Tinggi tetap supaya berpindah slide tidak menggeser tata letak. */
.hero {
  position: relative;
  width: 100%;
  height: 238px; /* 90:2130 */
  border-radius: var(--radius-16);
  color: var(--color-white);
}

.slides {
  position: absolute;
  inset: 0;
  overflow: hidden; /* E3: slide yang bergeser tidak keluar dari kotak hero */
  border-radius: var(--radius-16);
}

.slide {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: end;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto auto 8px; /* baris terakhir = ruang titik 90:2137 (56x8) */
  grid-template-areas: 'chip' 'title' 'meta' 'dots'; /* E3: penulis + waktu di bawah judul, kiri (sebelumnya kolom kanan 90:2142) */
  row-gap: var(--space-16); /* 90:2150 gap 16 (chip, judul, meta, titik) */
  padding: 20px 20px 20px 30px; /* 90:2130 py 20, px 30; kanan 20 = 354 - 30 - 304 (kontainer 90:2150 lebar 304) */
  overflow: hidden;
  border-radius: var(--radius-16);
  background: var(--color-black-2); /* pengganti bila artikel tanpa gambar: teks putih tetap terbaca */
}

.slide[hidden] {
  display: none;
}

/* E3: animasi geser-kiri. Slide baru masuk dari kanan, slide lama keluar ke kiri, bersamaan (bersebelahan, tanpa tumpang tindih). */
.slide--enter {
  animation: hero-slide-in var(--hero-slide-ms) ease both;
}

.slide--leave {
  animation: hero-slide-out var(--hero-slide-ms) ease both;
}

@keyframes hero-slide-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes hero-slide-out {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide--enter,
  .slide--leave {
    animation: none;
  }
}

/* Foto memenuhi kotak (object-fit: cover). Lapisan gelap [I]: Figma 21:4974/90:2130 tidak punya gradien atau overlay
   (foto asli dipakai apa adanya, rasio piksel hasil render/foto = 1,00); ditambahkan agar teks putih dan chip (putih 20%) terbaca
   di foto CMS yang lebih terang. Kontras dihitung (WCAG, persentil 95 luminansi piksel di bawah tiap elemen, 8 foto fixture, 1440 dan 402):
   semua teks >= 4,9:1 (terendah chip mobile figma-5 4,92:1), titik >= 15:1; tanpa lapisan ini chip turun ke 1,2:1.
   Stop 20% dinaikkan 60% -> 65% (sebelumnya chip mobile figma-5 4,43:1, di bawah AA 4,5:1). Deviasi untuk POLISH-01. */
.photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
}

.slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--color-black-1) 65%, transparent) 20%,
    color-mix(in srgb, var(--color-black-1) 90%, transparent)
  );
  pointer-events: none;
}

.slide > :not(.photo) {
  position: relative;
  z-index: 1;
}

/* PAGE-002: judul = satu-satunya tautan slide (satu titik tab). Tautan memakai overlay ::after seluruh slide sebagai area klik, jadi
   judul tidak boleh menjadi blok penampung (position: static; z-index berlaku karena judul adalah item grid). Foto bukan tautan. */
.slide > .title {
  position: static;
  z-index: 1;
}

.link::after {
  content: '';
  position: absolute;
  inset: 0;
}

/* Cincin fokus 4 px total (2 + jarak 2) di luar hero (slide ber-overflow hidden akan memotongnya, jadi digambar pada .hero) */
.link:focus-visible {
  outline: none;
}

.hero:has(.link:focus-visible) {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Hover (PAGE-002 Keputusan PM 2): judul bergaris bawah, tanpa ubah warna; hanya perangkat dengan hover */
@media (hover: hover) {
  .link:hover {
    text-decoration: underline;
  }
}

/* Chip 90:2134: tinggi 18, radius 4, latar putih 20%. Figma: lebar tetap 117 dengan px 15, teks (97,56) terpusat dan melewati padding,
   jadi jarak tepi teks sebenarnya ~9,7; dipakai padding 10 dengan lebar mengikuti teks (selisih lebar 0,56 untuk label contoh) [I] */
.chip {
  grid-area: chip;
  justify-self: start;
  display: flex;
  align-items: center;
  max-width: 100%;
  height: 18px; /* 90:2134 */
  padding-inline: 10px; /* lihat catatan chip di atas */
  border-radius: 4px; /* 90:2134 */
  background: color-mix(in srgb, var(--color-white) 20%, transparent);
  font: var(--type-card-label-mobile);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* PAGE-003: chip tautan di atas overlay judul (z-index 2 > judul 1); hover bergaris bawah; fokus putih seperti titik (--color-focus tak terlihat di foto gelap) */
.slide > .chip {
  z-index: 2;
}

/* POLISH-01 D41 (WCAG 2.5.8): chip tautan (mobile 18 px) punya area klik >= 24 x 24 px lewat ::after tak terlihat berpusat pada chip; overflow chip tautan
   dibuat visible agar ::after tidak terpotong (nama kategori resmi pendek, jadi tidak ada teks yang meluber). Tampilan chip tidak berubah. */
a.chip {
  overflow: visible;
}

a.chip::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 24px);
  height: 24px;
  transform: translate(-50%, -50%);
}

.chip:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 2px;
}

@media (hover: hover) {
  a.chip:hover {
    text-decoration: underline;
  }
}

/* Judul mobile 90:2136: Merriweather SemiBold 19,2/24,96, lebar 186 (kolom judul) */
.title {
  grid-area: title;
  align-self: end;
  font: var(--type-heading-mobile);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 90:2136: 3 baris */
  line-clamp: 3;
  overflow: hidden;
  overflow-wrap: anywhere;
}

/* Penerbit dan waktu (90:2142): E3 (evaluasi pemilik) dipindah dari kolom kanan ke kiri, sejajar tepi kiri judul, di bawah judul */
.meta {
  grid-area: meta;
  align-self: end;
  justify-self: start;
  pointer-events: none; /* klik di atas penerbit/waktu tembus ke tautan slide (PAGE-002) */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 100%;
  min-width: 0;
}

.publisher {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-8); /* 90:2143 */
  max-width: 100%;
  min-width: 0;
}

.avatar {
  flex: none;
  width: 12px; /* 90:2144 */
  height: 12px;
  border-radius: var(--radius-full);
}

.author {
  min-width: 0;
  font: var(--type-caption); /* 90:2145 Inter Regular 13,333/18,666 */
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font: var(--type-card-label-mobile); /* 90:2147 Inter SemiBold 11,111/16,667 */
  white-space: nowrap;
}

/* Titik 90:2137: 56x8, titik 8, celah 8, cincin 1; aktif terisi putih. Dipasang di kiri-bawah, sejajar dasar kontainer teks. */
.dots {
  position: absolute;
  left: 30px; /* 90:2130 px 30 */
  bottom: 20px; /* 90:2130 py 20 */
  z-index: 2;
  display: flex;
  gap: var(--space-8);
}

.dot {
  position: relative;
  width: 8px; /* 90:2137 */
  height: 8px;
  padding: 0;
  border: 1px solid var(--color-white);
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
}

.dot[aria-current='true'] {
  background: var(--color-white);
}

/* Area sentuh diperluas tanpa mengubah tampilan titik (pitch 16 mobile, 20 desktop: tidak saling tumpang tindih) */
.dot::after {
  content: '';
  position: absolute;
  inset: -4px;
}

/* Cincin fokus 4 px total (2 + jarak 2), putih: --color-focus (hampir hitam) tidak terlihat di foto gelap */
.dot:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 2px;
}

/* Mobile 402 sampai tablet: lebar judul 186 (90:2136) dipertahankan; penulis + waktu (E3) memakai seluruh lebar di bawah judul */
@media (min-width: 402px) {
  .slide {
    grid-template-columns: minmax(0, 186px) 110px; /* 90:2136 lebar judul 186 */
    grid-template-areas: 'chip chip' 'title .' 'meta meta' 'dots dots';
  }
}

/* Tablet 600 sampai 1023: turunan hero mobile [I], judul mengisi sisa lebar */
@media (min-width: 600px) {
  .slide {
    grid-template-columns: minmax(0, 1fr) 110px;
  }
}

/* Hero desktop 21:4974: 739x531, kolom kiri (chip, judul, penulis + waktu, titik) 379 */
@media (min-width: 1024px) {
  .hero {
    height: 531px; /* 21:4974 */
  }

  .slide {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto 12px; /* baris terakhir = ruang titik 21:4981 (72x12) */
    grid-template-areas: 'chip' 'title' 'meta' 'dots';
    row-gap: var(--space-32); /* 21:4976 gap 32 (chip, judul, titik) */
    padding: 0 39px 50px 30px; /* 21:4974 pb 50, px 30; kanan 39 = 739 - 30 - 670 (kontainer 21:4975 lebar 670) */
  }

  .chip {
    height: auto;
    padding: 5px 15px; /* 21:4978 */
    border-radius: var(--radius-8);
    font: var(--type-text-l-medium);
    letter-spacing: var(--tracking-text-l);
  }

  .title {
    max-width: 379px; /* 21:4976 lebar kolom kiri */
    font: var(--type-hero-headline-desktop);
    letter-spacing: var(--tracking-hero-headline);
    text-transform: capitalize; /* 21:4980 */
    -webkit-line-clamp: 4;
    line-clamp: 4;
  }

  .meta {
    max-width: 270px; /* 21:4986 */
    margin-top: -16px; /* E3: jarak judul ke penulis 16 (row-gap 32 - 16); penulis ke titik tetap 32 */
    gap: var(--space-8); /* 21:4986 */
  }

  .publisher {
    gap: var(--space-16); /* 21:4987 */
  }

  .avatar {
    width: 50px; /* 21:4988 */
    height: 50px;
  }

  .author {
    font: var(--type-heading-desktop); /* 21:4989 Merriweather SemiBold 23,04/29,952 */
  }

  .time {
    font: var(--type-text-l-regular); /* 21:4993 Inter Regular 18/27 */
    letter-spacing: var(--tracking-text-l);
  }

  .dots {
    bottom: 50px; /* 21:4974 pb 50 */
  }

  .dot {
    width: 12px; /* 21:4981 */
    height: 12px;
  }
}
</style>
