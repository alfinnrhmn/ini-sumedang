<script setup lang="ts">
// `tag="h1"` (PAGE-003, judul halaman kategori): tampilan identik, hanya elemennya `h1` dan dapat menerima fokus program (tabindex -1)
// agar halaman memindahkan fokus ke judul setelah navigasi. Bawaan `h2` (Beranda) tidak berubah.
// `moreTo` (E4, evaluasi pemilik): tautan "Lainnya" + panah di kanan judul (68:1145 desktop, 165:1720 mobile) menuju halaman kategori;
// tautan terpisah dari judul (judul tetap non-interaktif), satu tab stop; `moreLabel` = nama aksesibel lengkap (mis. "Lainnya: Otomotif").
// Tanpa `moreTo` tampilan identik dengan sebelumnya.
withDefaults(defineProps<{ title: string, tag?: 'h1' | 'h2', moreTo?: string, moreLabel?: string }>(), { tag: 'h2', moreTo: undefined, moreLabel: undefined })
</script>

<template>
  <div class="section-title" :class="{ 'section-title--more': moreTo }">
    <component
      :is="tag"
      class="heading"
      :tabindex="tag === 'h1' ? -1 : undefined"
    >
      {{ title }}
    </component>
    <NuxtLink v-if="moreTo" :to="moreTo" :aria-label="moreLabel" :aria-current="undefined" class="more">
      <span class="more-text">Lainnya</span>
      <img class="more-arrow" src="/icons/arrow-right.svg" alt="" width="13" height="13">
    </NuxtLink>
  </div>
</template>

<style scoped>
/* Garis pemisah 42:374 (3 px). Figma #D9D9D9 tidak ada di token; dipakai --color-gray-5 (keputusan PM 14). */
.section-title {
  border-bottom: 3px solid var(--color-gray-5);
}

.heading {
  position: relative;
  display: inline-block;
  vertical-align: top; /* hilangkan celah baseline di bawah inline-block */
  font: var(--type-heading-mobile); /* mobile 165:1727: garis langsung di bawah teks, tanpa jarak */
  color: var(--color-black);
}

/* E4: "Lainnya" di kanan judul. Mobile 165:1720: x 268 dari 354 (rata kanan), y 4,5, tinggi 16, teks Inter Medium 11,111/15,555, panah 13 setelah celah 3.
   Warna #525252 -> --color-gray-2 (#4F4F4F, selisih 3/3/3; kontras 8,6:1). Area sentuh diperluas 6 px ke segala sisi (tinggi >= 25) tanpa mengubah tampilan. */
.section-title--more {
  position: relative;
}

.more {
  position: absolute;
  top: 4.5px; /* 165:1720 */
  right: 0;
  display: flex;
  align-items: center;
  gap: 3px; /* 165:1720 celah teks-panah */
  height: 16px; /* 165:1720 */
  font: 500 11.111px/15.555px var(--font-sans); /* 165:1721 Inter Medium (= --type-metadata) */
  color: var(--color-gray-2);
  white-space: nowrap;
}

.more::after {
  content: '';
  position: absolute;
  inset: -6px;
}

.more-arrow {
  flex: none;
  width: 13px;
  height: 13px;
}

@media (hover: hover) {
  .more:hover .more-text {
    text-decoration: underline;
  }
}

/* Judul yang menerima fokus program (h1 halaman kategori): bukan kontrol interaktif, tanpa cincin fokus bergaya baru */
.heading[tabindex="-1"]:focus {
  outline: none;
}

/* Garis aksen 42:375 (3 px) menimpa garis pemisah; lebar mengikuti teks */
.heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 3px;
  background: var(--color-brand);
}

@media (min-width: 1024px) {
  /* Desktop 68:1145: tepi kanan = tepi kanan garis (x 899), y 10 dari atas teks judul (2951 - 2941), tinggi 13, Inter Regular 10 */
  .more {
    top: 10px;
    height: 13px;
    font: 400 10px/normal var(--font-sans); /* 84:1439 */
  }

  .heading {
    font: var(--type-heading-desktop);
    padding-bottom: 5px; /* 42:376 (y 782+30) ke garis 42:374 (y 817) */
    padding-right: 14px; /* 42:375 lebar 166 = teks 152 + 14 */
  }
}
</style>
