<template>
  <div class="layout">
    <!-- Ruang untuk header situs (HOME-06). -->
    <div class="content">
      <slot />
    </div>
    <LayoutSiteFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Footer tetap di dasar viewport pada halaman pendek */
.content {
  flex: 1 0 auto;
}
</style>
