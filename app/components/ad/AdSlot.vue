<script setup lang="ts">
import { AD_SLOTS } from '~/utils/ad-slots'
import type { AdSlotName } from '~/utils/ad-slots'

// Papan iklan (E6, evaluasi pemilik): penampung STATIS yang meniru slot "Advertisement" di Figma (kotak abu-abu + teks, mis. 57:589).
// Tanpa konten sungguhan: tidak ada tautan, gambar, skrip, atau HTML dari CMS (gambar + tautan https = ADS-002, di luar scope), jadi
// tidak menjadi tab stop. Tinggi tetap sesuai Figma (lihat app/utils/ad-slots.ts) sehingga tidak ada layout shift. Teks "Advertisement"
// dekoratif bagi pembaca layar; landmark `aside` berlabel "Iklan" cukup.
const props = defineProps<{ variant: AdSlotName }>()

const spec = computed(() => AD_SLOTS[props.variant])
const style = computed(() => ({
  '--ad-height': `${spec.value.height}px`,
  '--ad-max-width': spec.value.width === null ? 'none' : `${spec.value.width}px`
}))
</script>

<template>
  <aside class="ad" aria-label="Iklan" :style="style">
    <span class="text" aria-hidden="true">Advertisement</span>
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
</style>
