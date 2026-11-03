<script setup lang="ts">
import { SOCIAL_STATS, socialHref, socialLabel } from '~/config/social'

// Widget "Ikuti IniSumedang" (SOC-001; Figma Frame 283: desktop 101:2601 / 127:2810 = 357x200, mobile 100:2447 = 354x200).
// Menampilkan jumlah pengikut tiap akun IniSumedang; BUKAN fitur follow: tanpa tombol ikuti, form, SDK, atau skrip pihak ketiga.
// Satu komponen untuk Beranda, Detail, dan kategori. Angka = penampung [I] dari app/config/social.ts. Kotak = teks biasa; bila `url`
// https terisi menjadi <a rel="noopener noreferrer" target="_blank">. Nama aksesibel satu unit "<Platform>, <nilai> <satuan>" (ikon dekoratif).
// Judul = h2 (halaman memakai h1; Beranda: h2 judul section; Detail/kategori: h2 sidebar), jadi urutan heading tidak melompat.
// Gambar ikon `loading="lazy"`: salinan yang jauh di luar layar tidak diunduh lebih awal. Berkas SVG sama dipakai semua salinan (satu permintaan per ikon).
const headingId = useId()
const items = SOCIAL_STATS.map(item => ({
  ...item,
  href: socialHref(item.url),
  label: socialLabel(item),
  boxStyle: { width: `${item.iconBox[0]}px`, height: `${item.iconBox[1]}px` },
  imgStyle: item.iconRect
    ? { left: `${item.iconRect.x}px`, top: `${item.iconRect.y}px`, width: `${item.iconRect.width}px`, height: `${item.iconRect.height}px` }
    : { left: '0', top: '0', width: '100%', height: '100%' },
  tileStyle: { '--social-gap': `${item.gap}px`, '--social-text': `${item.textWidth}px` }
}))
</script>

<template>
  <aside class="social" :aria-labelledby="headingId">
    <div class="inner">
      <div class="head">
        <h2 :id="headingId" class="title">
          Ikuti IniSumedang
        </h2>
        <p class="subtitle">
          Kabar terbaru langsung di kanal pilihanmu
        </p>
      </div>
      <ul class="grid">
        <li v-for="item in items" :key="item.name" class="cell">
          <a
            v-if="item.href"
            class="tile tile--link"
            :style="item.tileStyle"
            :href="item.href"
            rel="noopener noreferrer"
            target="_blank"
            :aria-label="item.label"
          >
            <span class="icon" aria-hidden="true" :style="item.boxStyle">
              <img :src="item.icon" alt="" loading="lazy" decoding="async" :style="item.imgStyle">
            </span>
            <span class="text">
              <span class="value">{{ item.value }}</span>
              <span class="unit">{{ item.unit }}</span>
            </span>
          </a>
          <div v-else class="tile" :style="item.tileStyle">
            <span class="icon" aria-hidden="true" :style="item.boxStyle">
              <img :src="item.icon" alt="" loading="lazy" decoding="async" :style="item.imgStyle">
            </span>
            <span class="text">
              <span class="visually-hidden">{{ item.name }}, </span>
              <span class="value">{{ item.value }}</span>
              <span class="unit">{{ item.unit }}</span>
            </span>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
/* Figma 101:2601: kotak putih 357x200, garis 1 #E5E7EB (= --color-footer-divider), radius 16, isi (Frame 282 320x165) di tengah.
   Lebar 100% kolom (maks 357; mobile 354 = lebar kolom frame 402), tinggi tetap 200: tanpa layout shift. */
.social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 357px;
  height: 200px;
  border: 1px solid var(--color-footer-divider);
  border-radius: var(--radius-16);
  background: var(--color-white);
}

/* < 1024 (mobile dan tablet, PM 1): seperti iklan mobile, selebar kolom; isi tetap 320 di tengah */
@media (max-width: 1023.98px) {
  .social {
    max-width: none;
  }
}

.inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-24); /* 101:2602 */
  width: min(320px, calc(100% - 2px));
}

/* Frame 281 223x41: judul 101:2605 (25) + subjudul 101:2607 (16) */
.head {
  height: 41px;
}

/* 101:2605 Merriweather SemiBold 19,2/24,96 #2866EB (= News/Heading/Mobile, --color-brand) */
.title {
  font: var(--type-heading-mobile);
  color: var(--color-brand);
  white-space: nowrap;
}

/* 101:2607 Inter Medium 11,111/15,555 #667085 (= News/Metadata, --color-footer-muted) */
.subtitle {
  font: var(--type-metadata);
  color: var(--color-footer-muted);
  white-space: nowrap;
}

/* Frame 278 320x100: grid 3x2, kotak 104x46, celah 4 horizontal dan 8 vertikal */
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, 46px);
  gap: 8px 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cell {
  display: flex;
  min-width: 0;
}

/* Kotak 101:2609: latar #F5F5F5 -> --color-surface #F8F8F8 (selisih 3/3/3), radius 8; isi (ikon + teks) di tengah */
.tile {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: var(--social-gap);
  min-width: 0;
  border-radius: var(--radius-8);
  background: var(--color-surface);
  color: inherit;
}

/* Ikon 24x24 (X 20x23); WhatsApp: SVG grup mask di dalam kotak 24x24 (clip) */
.icon {
  position: relative;
  flex: none;
  overflow: hidden;
}

.icon img {
  position: absolute;
  display: block;
  max-width: none;
}

/* Kolom teks 101:2613: lebar Figma (50-58), nilai 101:2615 Inter SemiBold 16/22,4 (= News/Card/Headline/Mobile) di blok 23,
   satuan 101:2617 Inter Medium 11,111/15,555 (= News/Metadata) di blok 16 */
.text {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  min-width: var(--social-text);
  text-align: center;
  white-space: nowrap;
}

/* Nilai #1F2937 -> --color-footer-link #172033 (selisih 8/9/4 > 4: deviasi untuk POLISH-01); satuan #667085 = --color-footer-muted */
.value {
  display: block;
  height: 23px;
  font: var(--type-card-headline-mobile);
  color: var(--color-footer-link);
}

.unit {
  display: block;
  height: 16px;
  font: var(--type-metadata);
  color: var(--color-footer-muted);
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
</style>
