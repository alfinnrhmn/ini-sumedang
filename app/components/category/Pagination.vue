<script setup lang="ts">
// Navigasi paginasi halaman kategori (PAGE-003, Keputusan PM 3). Tautan biasa (<a href>) dirender di server; "Sebelumnya" di halaman
// pertama dan "Berikutnya" di halaman terakhir = teks biasa non-tautan (bukan <a> mati, tidak fokus). Hanya muncul bila totalPages > 1.
// `:aria-current="undefined"`: penanda otomatis NuxtLink mengabaikan query, jadi tautan ke halaman 1/N+1 kategori yang sama salah ditandai halaman saat ini.
// Komponen visual BARU tanpa frame Figma: gaya hanya dari token (teks --color-brand, hover = garis bawah seperti kartu, fokus global 4 px).
const props = defineProps<{
  slug: string
  page: number
  totalPages: number
}>()

const prevTo = computed(() => (props.page > 1 ? categoryPagePath(props.slug, props.page - 1) : null))
const nextTo = computed(() => (props.page < props.totalPages ? categoryPagePath(props.slug, props.page + 1) : null))
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Paginasi">
    <NuxtLink v-if="prevTo" :to="prevTo" :aria-current="undefined" rel="prev" class="step">
      Sebelumnya
    </NuxtLink>
    <span v-else class="step step--off">Sebelumnya</span>
    <p class="status">
      Halaman {{ page }} dari {{ totalPages }}
    </p>
    <NuxtLink v-if="nextTo" :to="nextTo" :aria-current="undefined" rel="next" class="step">
      Berikutnya
    </NuxtLink>
    <span v-else class="step step--off">Berikutnya</span>
  </nav>
</template>

<style scoped>
/* Tanpa frame Figma [?]: tiga bagian satu baris di tengah (Sebelumnya | Halaman X dari Y | Berikutnya), gaya teks menu kategori
   (Inter Medium 18, --type-text-l-medium) pada tautan; status dan tepi memakai warna redam yang sudah ada. Butuh peninjauan pemilik. */
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-8) var(--space-24);
}

.step {
  padding: var(--space-8) var(--space-16);
  font: var(--type-text-l-medium);
  letter-spacing: var(--tracking-text-l);
  color: var(--color-brand);
}

.step--off {
  color: var(--color-footer-muted); /* 4,97 : 1 di atas putih; teks biasa, bukan tautan */
}

a.step {
  border-radius: var(--radius-6);
}

@media (hover: hover) {
  a.step:hover {
    text-decoration: underline;
  }
}

.status {
  font: var(--type-body);
  color: var(--color-footer-muted);
}

/* Layar sempit: tiga bagian tidak muat satu baris (354 px). Status di baris sendiri di atas, dua tautan di bawahnya di kiri dan kanan.
   Ambang 600 = ambang tablet yang sudah dipakai Hero. */
@media (max-width: 599px) {
  .pagination {
    justify-content: space-between;
  }

  .status {
    order: -1;
    flex: 0 0 100%;
    text-align: center;
  }
}
</style>
