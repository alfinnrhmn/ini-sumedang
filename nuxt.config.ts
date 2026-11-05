// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // Privat (hanya server): URL WordPress, diisi env NUXT_WP_BASE_URL. Kosong = data contoh (fixture). Bukan secret, tetapi tidak dikirim ke klien.
    wpBaseUrl: '',
    public: {
      siteUrl: ''
    }
  }
})
