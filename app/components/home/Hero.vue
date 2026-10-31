<script setup lang="ts">
import type { Article } from '~/types/article'

const props = defineProps<{
  /** Slide hero, urutan = urutan slide. Kosong: hero tidak dirender; kurang dari 2: titik tidak dirender. */
  articles: Article[]
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
}>()

// Carousel manual (keputusan PM 1): tanpa putar otomatis, tanpa tombol prev/next dan geser sentuh.
// Empat titik = tombol; roving tabindex; panah kiri/kanan (berputar), Home, End memindahkan fokus dan slide.
const selected = ref(0)
const active = computed(() => Math.min(selected.value, props.articles.length - 1))
const dotEls: (HTMLElement | null)[] = []

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
  selected.value = next
  dotEls[next]?.focus()
}

// Chip = kategori pertama artikel (nama sudah didekode di server); tanpa kategori chip tidak dirender.
const slides = computed(() =>
  props.articles.map(article => ({
    article,
    category: article.categories[0]?.name ?? '',
    time: formatRelativeTime(article.publishedAt, props.now)
  }))
)
</script>

<template>
  <section v-if="articles.length" class="hero" aria-roledescription="carousel" aria-label="Berita utama">
    <div class="slides" aria-live="polite">
      <div
        v-for="(slide, index) in slides"
        :key="slide.article.id"
        class="slide"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${index + 1} dari ${slides.length}`"
        :hidden="active !== index"
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
        <p v-if="slide.category" class="chip">
          {{ slide.category }}
        </p>
        <h2 class="title">
          {{ slide.article.title }}
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
        @click="selected = index"
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
}

.slide {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: end;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto auto 8px; /* baris terakhir = ruang titik 90:2137 (56x8) */
  grid-template-areas: 'chip' 'title' 'meta' 'dots';
  row-gap: var(--space-16); /* 90:2150 gap 16 (chip, judul, titik) */
  padding: 20px 20px 20px 30px; /* 90:2130 py 20, px 30; kanan 20 = 354 - 30 - 304 (kontainer 90:2150 lebar 304) */
  overflow: hidden;
  border-radius: var(--radius-16);
  background: var(--color-black-2); /* pengganti bila artikel tanpa gambar: teks putih tetap terbaca */
}

.slide[hidden] {
  display: none;
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

/* Penerbit dan waktu 90:2142: kolom 110, rata kanan, sebaris dengan dasar judul */
.meta {
  grid-area: meta;
  align-self: end;
  justify-self: end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 110px; /* 90:2142 */
  max-width: 100%;
}

.publisher {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-8); /* 90:2143 */
  width: 100%;
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
  text-align: right;
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

/* Layar sempit (< 402): penerbit dan waktu di bawah judul, kolom tunggal */
@media (max-width: 401px) {
  .meta {
    width: auto;
    justify-self: end;
  }
}

/* Mobile 402 sampai tablet: dua kolom judul 186 | penerbit 110 (90:2148) */
@media (min-width: 402px) {
  .slide {
    grid-template-columns: minmax(0, 186px) 110px; /* 90:2136 lebar judul 186, 90:2142 lebar 110 */
    grid-template-rows: auto auto 8px;
    grid-template-areas: 'chip chip' 'title meta' 'dots dots';
  }
}

/* Tablet 600 sampai 1023: turunan hero mobile [I], judul mengisi sisa lebar */
@media (min-width: 600px) {
  .slide {
    grid-template-columns: minmax(0, 1fr) 110px;
  }
}

/* Hero desktop 21:4974: 739x531, kolom kiri (chip, judul, titik) 379, kolom kanan (penerbit, waktu) 270 rata kanan */
@media (min-width: 1024px) {
  .hero {
    height: 531px; /* 21:4974 */
  }

  .slide {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto 12px; /* baris terakhir = ruang titik 21:4981 (72x12) */
    grid-template-areas: 'chip meta' 'title meta' '. meta';
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
    width: auto;
    max-width: 270px; /* 21:4986 */
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
