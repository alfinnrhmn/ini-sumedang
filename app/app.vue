<script setup lang="ts">
import '~/assets/css/tokens.css'
import '~/assets/css/base.css'

useHead({ htmlAttrs: { lang: 'id' } })
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
