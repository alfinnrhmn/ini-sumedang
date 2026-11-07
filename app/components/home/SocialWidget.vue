<script setup lang="ts">
import { SOCIAL_STATS, socialHref, socialLabel } from '~/config/social'

// Widget "Ikuti IniSumedang": jumlah pengikut tiap akun; BUKAN fitur follow (tanpa tombol, form, SDK, skrip luar).
// Angka = penampung (config/social.ts). Kotak = teks, atau <a rel="noopener noreferrer" target="_blank"> bila https.
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
/* Kotak putih maks. 357x200, garis 1 #E5E7EB (= --color-footer-divider), radius 16, isi 320 di tengah.
   Lebar 100% kolom (mobile 354), tinggi tetap 200: tanpa layout shift. */
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

/* < 1024 (mobile dan tablet): seperti iklan mobile, selebar kolom; isi tetap 320 di tengah */
@media (max-width: 1023.98px) {
  .social {
    max-width: none;
  }
}

.inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
  width: min(320px, calc(100% - 2px));
}

.head {
  height: 41px;
}

.title {
  font: var(--type-heading-mobile);
  color: var(--color-brand);
  white-space: nowrap;
}

.subtitle {
  font: var(--type-metadata);
  color: var(--color-footer-muted);
  white-space: nowrap;
}

/* Grid 3x2, kotak 104x46, celah 4 horizontal dan 8 vertikal */
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

/* Kotak: latar #F5F5F5 -> --color-surface #F8F8F8 (selisih 3/3/3), radius 8; isi (ikon + teks) di tengah */
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

/* Kolom teks: lebar Figma (50-58); nilai = News/Card/Headline/Mobile di blok 23, satuan = News/Metadata di blok 16 */
.text {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  min-width: var(--social-text);
  text-align: center;
  white-space: nowrap;
}

/* Nilai #1F2937 -> --color-footer-link (selisih 8/9/4 > 4: deviasi Figma); satuan #667085 = --color-footer-muted */
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
