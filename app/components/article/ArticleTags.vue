<script setup lang="ts">
import type { ArticleTag } from '~/types/article'

// Baris tag Detail (tanpa frame Figma, dari token yang ada): tag artikel sebagai label TEKS (bukan tautan, tidak ada halaman tag), di bawah isi dan di atas "Bagikan".
// Pemanggil memberi tag yang tampil saja (`visibleTags`, tanpa `terpopuler`); tanpa tag baris tidak dirender. Nama tag dirender sebagai teks (di-escape), tidak pernah HTML.
defineProps<{ tags: ArticleTag[] }>()
</script>

<template>
  <ul v-if="tags.length" class="tags" aria-label="Tag">
    <li v-for="tag in tags" :key="tag.id" class="tag">
      {{ tag.name }}
    </li>
  </ul>
</template>

<style scoped>
/* Jarak atas 24 dari isi (sama dengan jarak isi ke "Bagikan"); "Bagikan" membawa jarak atas 24 sendiri */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin: var(--space-24) 0 0;
  padding: 0;
  list-style: none;
}

/* Label teks kecil (News/Metadata), abu #667085 (kontras 4,97 : 1), latar dan garis seperti kontrol pencarian */
.tag {
  min-width: 0;
  padding: 4px var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-surface);
  font: var(--type-metadata);
  color: var(--color-footer-muted);
  overflow-wrap: anywhere;
}
</style>
