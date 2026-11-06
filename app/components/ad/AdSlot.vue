<script setup lang="ts">
import { AD_SLOTS } from '~/utils/ad-slots'
import type { AdSlotName } from '~/utils/ad-slots'

// Slot iklan dari `/api/ads` (satu permintaan dibagikan semua slot): fixture = penampung statis non-interaktif; WordPress = satu tautan bergambar (rel="sponsored noopener noreferrer") + label "Iklan", tanpa iklan tidak dirender.
// Gambar/tautan sudah divalidasi di server (host WordPress, https), alt sebagai teks, tanpa HTML/skrip CMS. Tinggi tetap (app/utils/ad-slots.ts) = tanpa layout shift.
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
/* Penampung: #D9D9D9 Figma dipetakan ke --color-footer-divider-mobile (#D5D5D5, selisih 4/4/4 <= 4). */
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
  font: var(--type-heading-desktop);
  white-space: nowrap;
}

/* Iklan nyata: kotak sama. Aside tidak memotong (overflow terlihat) agar cincin fokus tautan tidak terpotong; gambar dipotong oleh tautan (radius + overflow hidden).
   Label "Iklan" melayang di sudut, tidak mengubah tata letak. */
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
