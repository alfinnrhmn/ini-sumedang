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
      <img class="more-arrow" src="/icons/arrow-right.svg" alt="" width="14" height="14">
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

/* E4: "Lainnya" di kanan judul, rata kanan (tepi kanan = tepi kanan garis). Figma 165:1720 (mobile) memakai Inter Medium 11,111 dengan panah 13 dan
   68:1145 (desktop) Inter Regular 10; UX-001 Keputusan PM 4 (instruksi pemilik 3 Nov 2026) memperbesarnya: mobile teks dan panah 14, desktop 16
   (judul 19,2 dan 23,04, jadi tetap lebih kecil dari judul). Deviasi dari Figma, dicatat untuk POLISH-01. Kotak tautan setinggi baris judul
   (24,96 mobile; 29,95 desktop) dan diratakan tengah, sehingga sejajar vertikal dengan teks judul; tinggi >= 24, area sentuh diperluas 6 px ke segala sisi.
   Warna #525252 -> --color-gray-2 (#4F4F4F, selisih 3/3/3; kontras 8,6:1). Judul diberi max-width agar tidak pernah tumpang-tindih dengan tautan (lihat .heading). */
.section-title--more {
  position: relative;
}

.more {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px; /* celah teks-panah (Figma 3 pada 11 px; proporsional) */
  height: 24.96px; /* = line-height --type-heading-mobile */
  font: 500 14px/normal var(--font-sans); /* UX-001 Keputusan PM 4 */
  color: var(--color-gray-2);
  white-space: nowrap;
}

/* Tautan di luar alur: judul diberi batas lebar (lebar tautan "Lainnya" 14 px = teks + celah + panah ~ 70, ditambah 4) agar tidak pernah menimpa
   tautan; judul terpanjang ("Bisnis dan Teknologi", 197 px) muat sampai 320 px (container 272 - 74 = 198), di bawah itu judul membungkus, tidak tumpang-tindih. */
.section-title--more .heading {
  max-width: calc(100% - 74px);
}

.more::after {
  content: '';
  position: absolute;
  inset: -6px;
}

.more-arrow {
  flex: none;
  width: 14px;
  height: 14px;
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
  /* Desktop (68:1145: tepi kanan = tepi kanan garis x 899): UX-001 teks dan panah 16, Inter Regular; kotak setinggi baris judul desktop (29,95) */
  .more {
    height: 29.95px; /* = line-height --type-heading-desktop */
    font: 400 16px/normal var(--font-sans);
  }

  .more-arrow {
    width: 16px;
    height: 16px;
  }

  .heading {
    font: var(--type-heading-desktop);
    padding-bottom: 5px; /* 42:376 (y 782+30) ke garis 42:374 (y 817) */
    padding-right: 14px; /* 42:375 lebar 166 = teks 152 + 14 */
  }
}
</style>
