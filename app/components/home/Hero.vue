<script setup lang="ts">
import type { Article } from '~/types/article'
import { HERO_AUTOPLAY_MS, HERO_SLIDE_MS, heroAutoplayStatus, heroLiveMode, nextHeroSlide } from '~/config/home'

const props = defineProps<{
  /** Slide hero, urutan = urutan slide. Kosong: hero tidak dirender; kurang dari 2: titik tidak dirender. */
  articles: Article[]
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
}>()

// Carousel tanpa tombol prev/next dan geser sentuh: titik = tombol dengan roving tabindex; panah kiri/kanan (berputar), Home, End memindahkan fokus dan slide. Pindah slide = geser ke kiri (HERO_SLIDE_MS ease) tanpa pergeseran tata letak
// (slide bertumpuk absolut di kotak tetap); slide lama tetap dirender `inert` + `aria-hidden` sampai animasi selesai lalu `hidden`; `prefers-reduced-motion: reduce` = instan.
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

// Putar otomatis tiap HERO_AUTOPLAY_MS, hanya di klien setelah mount (SSR/hidrasi tidak berubah). Dijeda saat pointer di atas hero, fokus keyboard (`:focus-visible`; titik yang baru diklik tidak menjeda) di dalam hero, atau tab tersembunyi; reduced-motion = tanpa putar.
// Satu timer setTimeout dipasang ulang tiap status/slide berubah, dibersihkan saat unmount; pilihan titik/panah memulai ulang dari 0 (`restartAutoplay`). Logika keputusan ada di app/config/home.ts agar bisa diuji murni.
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

// Chip = kategori pertama artikel (nama sudah didekode di server), tanpa kategori tidak dirender; kategori dari daftar WordPress = tautan ke /kategori/<slug> (tab stop sendiri, di atas overlay judul), selain itu teks.
const categories = useCategories()
const slides = computed(() =>
  props.articles.map(article => ({
    article,
    category: article.categories[0]?.name ?? '',
    categoryTo: article.categories[0] ? categoryLink(article.categories[0].slug, categories.value) : null,
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
/* Tinggi tetap supaya berpindah slide tidak menggeser tata letak. */
.hero {
  position: relative;
  width: 100%;
  height: 238px;
  border-radius: var(--radius-16);
  color: var(--color-white);
}

.slides {
  position: absolute;
  inset: 0;
  overflow: hidden; /* slide yang bergeser tidak keluar dari kotak hero */
  border-radius: var(--radius-16);
}

.slide {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: end;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto auto 8px; /* baris terakhir = ruang titik (56x8) */
  grid-template-areas: 'chip' 'title' 'meta' 'dots'; /* penulis + waktu di bawah judul, kiri */
  row-gap: var(--space-16);
  padding: 20px 20px 20px 30px; /* kanan 20 = 354 - 30 - 304 (kontainer lebar 304) */
  overflow: hidden;
  border-radius: var(--radius-16);
  background: var(--color-black-2); /* pengganti bila artikel tanpa gambar: teks putih tetap terbaca */
}

.slide[hidden] {
  display: none;
}

/* Animasi geser-kiri: slide baru masuk dari kanan, slide lama keluar ke kiri, bersamaan (bersebelahan, tanpa tumpang tindih). */
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

/* Foto memenuhi kotak (object-fit: cover). Lapisan gelap ditambahkan (Figma tanpa overlay) agar teks putih dan chip (putih 20%) terbaca di foto CMS yang lebih terang.
   Kontras teks >= 4,9:1 (WCAG, 8 foto fixture, 1440 dan 402); tanpa lapisan ini chip turun ke 1,2:1; stop 20% = 65% menjaga chip mobile di atas AA 4,5:1. */
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

/* Judul = satu-satunya tautan slide (satu titik tab). Tautan memakai overlay ::after seluruh slide sebagai area klik, jadi judul tidak boleh menjadi blok penampung
   (position: static; z-index berlaku karena judul adalah item grid). Foto bukan tautan. */
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

/* Hover: judul bergaris bawah, tanpa ubah warna; hanya perangkat dengan hover */
@media (hover: hover) {
  .link:hover {
    text-decoration: underline;
  }
}

/* Chip: tinggi 18, radius 4, latar putih 20%. Figma: lebar tetap 117 dengan px 15, teks terpusat melewati padding (jarak tepi sebenarnya ~9,7);
   dipakai padding 10 dengan lebar mengikuti teks (selisih lebar 0,56 untuk label contoh). */
.chip {
  grid-area: chip;
  justify-self: start;
  display: flex;
  align-items: center;
  max-width: 100%;
  height: 18px;
  padding-inline: 10px; /* lihat catatan chip di atas */
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-white) 20%, transparent);
  font: var(--type-card-label-mobile);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chip tautan di atas overlay judul (z-index 2 > judul 1); hover bergaris bawah; fokus putih seperti titik (--color-focus tak terlihat di foto gelap) */
.slide > .chip {
  z-index: 2;
}

/* Area klik chip tautan (mobile 18 px) >= 24 x 24 px (WCAG 2.5.8) lewat ::after tak terlihat berpusat pada chip; overflow chip tautan dibuat visible agar ::after tidak terpotong
   (nama kategori resmi pendek, jadi tidak ada teks yang meluber). Tampilan chip tidak berubah. */
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

.title {
  grid-area: title;
  align-self: end;
  font: var(--type-heading-mobile);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  overflow-wrap: anywhere;
}

/* Penerbit dan waktu: di bawah judul, sejajar tepi kiri judul */
.meta {
  grid-area: meta;
  align-self: end;
  justify-self: start;
  pointer-events: none; /* klik di atas penerbit/waktu tembus ke tautan slide */
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
  gap: var(--space-8);
  max-width: 100%;
  min-width: 0;
}

.avatar {
  flex: none;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
}

.author {
  min-width: 0;
  font: var(--type-caption);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font: var(--type-card-label-mobile);
  white-space: nowrap;
}

/* Titik: 56x8, titik 8, celah 8, cincin 1; aktif terisi putih. Dipasang di kiri-bawah, sejajar dasar kontainer teks. */
.dots {
  position: absolute;
  left: 30px;
  bottom: 20px;
  z-index: 2;
  display: flex;
  gap: var(--space-8);
}

.dot {
  position: relative;
  width: 8px;
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

/* Mobile 402 sampai tablet: lebar judul 186 dipertahankan; penulis + waktu memakai seluruh lebar di bawah judul */
@media (min-width: 402px) {
  .slide {
    grid-template-columns: minmax(0, 186px) 110px;
    grid-template-areas: 'chip chip' 'title .' 'meta meta' 'dots dots';
  }
}

/* Tablet 600 sampai 1023: turunan hero mobile, judul mengisi sisa lebar */
@media (min-width: 600px) {
  .slide {
    grid-template-columns: minmax(0, 1fr) 110px;
  }
}

/* Hero desktop: 739x531, kolom kiri (chip, judul, penulis + waktu, titik) 379 */
@media (min-width: 1024px) {
  .hero {
    height: 531px;
  }

  .slide {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto 12px; /* baris terakhir = ruang titik (72x12) */
    grid-template-areas: 'chip' 'title' 'meta' 'dots';
    row-gap: var(--space-32);
    padding: 0 39px 50px 30px; /* kanan 39 = 739 - 30 - 670 (kontainer lebar 670) */
  }

  .chip {
    height: auto;
    padding: 5px 15px;
    border-radius: var(--radius-8);
    font: var(--type-text-l-medium);
    letter-spacing: var(--tracking-text-l);
  }

  .title {
    max-width: 379px; /* lebar kolom kiri */
    font: var(--type-hero-headline-desktop);
    letter-spacing: var(--tracking-hero-headline);
    text-transform: capitalize;
    -webkit-line-clamp: 4;
    line-clamp: 4;
  }

  /* Blok penerbit + waktu desktop sengaja lebih kecil dari Figma (avatar 50, nama 23,04, waktu 18) agar ringkas: avatar 32, nama 16, waktu 13,333,
     celah dan jarak ~0,64x. Mobile/tablet tidak berubah. */
  .meta {
    max-width: 270px;
    margin-top: -16px; /* jarak judul ke penulis tetap 16 (row-gap 32 - 16): garis dasar judul sudah memberi ruang tambahan */
    margin-bottom: -12px; /* jarak penulis ke titik 32 -> 20 (32 x 0,64), tanpa mengubah row-gap chip-judul */
    gap: 4px; /* waktu rapat di bawah penerbit */
  }

  .publisher {
    gap: 10px; /* 16 x 0,64 */
  }

  .avatar {
    width: 32px; /* Figma 50 */
    height: 32px;
  }

  .author {
    font: 600 16px/24px var(--font-serif); /* literal: tidak ada token Merriweather SemiBold 16 px */
  }

  .time {
    font: var(--type-caption);
  }

  .dots {
    bottom: 50px;
  }

  .dot {
    width: 12px;
    height: 12px;
  }
}
</style>
