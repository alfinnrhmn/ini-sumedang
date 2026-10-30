<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="section-title">
    <h2 class="heading">
      {{ title }}
    </h2>
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
  .heading {
    font: var(--type-heading-desktop);
    padding-bottom: 5px; /* 42:376 (y 782+30) ke garis 42:374 (y 817) */
    padding-right: 14px; /* 42:375 lebar 166 = teks 152 + 14 */
  }
}
</style>
