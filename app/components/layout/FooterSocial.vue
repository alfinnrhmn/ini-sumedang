<script setup lang="ts">
import { FOOTER_SOCIALS } from '~/config/footer'

defineProps<{ showLabel?: boolean }>()

// Ikon menjadi tautan hanya bila `url` berupa https; selain itu dekoratif (bukan <a>).
const items = FOOTER_SOCIALS.map(item => ({
  ...item,
  href: item.url && item.url.startsWith('https://') ? item.url : null
}))
const decorative = items.every(item => !item.href)
</script>

<template>
  <div class="social" :aria-hidden="decorative ? 'true' : undefined">
    <p v-if="showLabel" class="label">
      Ikuti kami
    </p>
    <div class="icons">
      <template v-for="item in items" :key="item.name">
        <a
          v-if="item.href"
          :href="item.href"
          rel="noopener noreferrer"
          :aria-label="item.name"
          class="icon"
        >
          <img :src="item.icon" alt="" width="26" height="26">
        </a>
        <span v-else class="icon">
          <img :src="item.icon" alt="" width="26" height="26">
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.label {
  height: 18px; /* 88:462 label y 10 ke ikon y 28 */
  font: var(--type-metadata);
  color: var(--color-footer-muted);
}

.icons {
  display: flex;
  gap: 12px; /* 60:488..60:506 pitch 38 = 26 + 12 */
}

.icon {
  display: block;
  width: 26px;
  height: 26px;
}
</style>
