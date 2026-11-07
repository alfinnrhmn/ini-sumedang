<script setup lang="ts">
// tag="h1" (judul halaman kategori): tampilan identik, elemen h1, menerima fokus program (tabindex -1).
// moreTo: tautan "Lainnya" + panah di kanan judul (judul non-interaktif), satu tab stop; moreLabel = nama aksesibel.
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
/* Garis pemisah (3 px). Figma #D9D9D9 tidak ada di token; dipakai --color-gray-5. */
.section-title {
  border-bottom: 3px solid var(--color-gray-5);
}

.heading {
  position: relative;
  display: inline-block;
  vertical-align: top; /* hilangkan celah baseline di bawah inline-block */
  font: var(--type-heading-mobile); /* mobile: garis langsung di bawah teks, tanpa jarak */
  color: var(--color-black);
}

/* "Lainnya" di kanan judul, rata kanan. Sengaja lebih besar dari Figma (mobile 14, desktop 16), di bawah ukuran judul.
   Kotak setinggi baris judul, rata tengah; tinggi >= 24, sentuh +6 px. #525252 -> --color-gray-2 (selisih 3/3/3). */
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
  font: 500 14px/normal var(--font-sans);
  color: var(--color-gray-2);
  white-space: nowrap;
}

/* Tautan di luar alur: judul diberi batas lebar (tautan "Lainnya" 14 px ~ 70, + 4) agar tidak menimpa tautan;
   judul terpanjang ("Bisnis dan Teknologi", 197 px) muat sampai 320 px, di bawahnya membungkus tanpa tumpang-tindih. */
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

/* Garis aksen (3 px) menimpa garis pemisah; lebar mengikuti teks */
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
  /* Desktop: tepi kanan = tepi kanan garis; teks dan panah 16, Inter Regular; kotak setinggi baris judul (29,95) */
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
    padding-bottom: 5px;
    padding-right: 14px; /* lebar aksen 166 = teks 152 + 14 */
  }
}
</style>
