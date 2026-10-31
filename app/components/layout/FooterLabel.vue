<script setup lang="ts">
import type { FooterLink } from '~/config/footer'

// `to` terisi = tautan internal (NuxtLink); `null` = teks biasa tanpa <a>/href dan tidak dapat difokus.
defineProps<{ link: FooterLink }>()
</script>

<template>
  <NuxtLink v-if="link.to" :to="link.to">
    {{ link.label }}
  </NuxtLink>
  <span v-else>{{ link.label }}</span>
</template>
