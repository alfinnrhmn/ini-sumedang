<script setup lang="ts">
import { AD_SLOTS } from '~/utils/ad-slots'
import type { AdSlotName } from '~/utils/ad-slots'

// Slot iklan (E6 + ADS-002). Isi mengikuti `/api/ads` (satu permintaan dibagikan semua slot, lihat useAds):
// - source `fixture` (tanpa WordPress): penampung STATIS yang meniru slot "Advertisement" di Figma (mis. 57:589), tanpa tautan/gambar/skrip,
//   bukan tab stop; teks "Advertisement" dekoratif bagi pembaca layar (landmark `aside` berlabel "Iklan" cukup).
// - source `wordpress`: ada iklan untuk slot ini -> SATU tautan bergambar (`rel="sponsored noopener noreferrer"`, tab stop satu-satunya) + label
//   kecil "Iklan"; tidak ada iklan atau data gagal dimuat -> TIDAK dirender (tanpa kotak kosong).
// Gambar dan tautan sudah divalidasi di server (host WordPress, https); alt dirender sebagai teks. Tidak ada HTML/skrip dari CMS.
// Tinggi tetap sesuai Figma (lihat app/utils/ad-slots.ts), jadi tidak ada layout shift; gambar `object-fit: cover` di kotak itu.
const props = defineProps<{ variant: AdSlotName }>()

const spec = computed(() => AD_SLOTS[props.variant])
const style = computed(() => ({
  '--ad-height': `${spec.value.height}px`,
  '--ad-max-width': spec.value.width === null ? 'none' : `${spec.value.width}px`
}))

const ads = useAds()
const ad = computed(() => (ads.value?.source === 'wordpress' ? ads.value.ads[props.variant] ?? null : null))
</script>

<template>
  <aside v-if="ads?.source === 'fixture'" class="ad" aria-label="Iklan" :style="style">
    <span class="text" aria-hidden="true">Advertisement</span>
  </aside>
  <aside v-else-if="ad" class="ad ad--live" aria-label="Iklan" :style="style">
    <a class="link" :href="ad.href" target="_blank" rel="sponsored noopener noreferrer">
      <img class="image" :src="ad.image.url" :alt="ad.alt" loading="lazy" decoding="async">
    </a>
    <span class="label" aria-hidden="true">Iklan</span>
  </aside>
</template>

<style scoped>
/* Figma 57:591: kotak #D9D9D9 radius 10, teks 57:593 Merriweather SemiBold 23,04/29,952 hitam di tengah.
   #D9D9D9 dipetakan ke --color-footer-divider-mobile (#D5D5D5, selisih 4/4/4 <= 4). */
.ad {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: var(--ad-max-width);
  height: var(--ad-height);
  border-radius: var(--radius-10);
  background: var(--color-footer-divider-mobile);
  color: var(--color-black);
  overflow: hidden;
}

.text {
  font: var(--type-heading-desktop); /* 57:593 News/Heading/Desktop */
  white-space: nowrap;
}

/* Iklan nyata: kotak yang sama (lebar, tinggi, radius). Aside tidak memotong (overflow terlihat) supaya cincin fokus tautan tidak terpotong;
   pemotongan gambar oleh tautan (radius + overflow hidden). Label "Iklan" melayang di sudut, tidak mengubah tata letak. */
.ad--live {
  position: relative;
  display: block;
  overflow: visible;
  background: none;
}

.link {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-10);
  background: var(--color-surface); /* terlihat hanya sebelum gambar termuat */
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.label {
  position: absolute;
  top: var(--space-8);
  left: var(--space-8);
  padding: 0 var(--space-8);
  border-radius: var(--radius-6);
  background: var(--color-white);
  color: var(--color-gray-2);
  font: var(--type-metadata);
  pointer-events: none;
}
</style>
