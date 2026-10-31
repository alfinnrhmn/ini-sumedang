/**
 * Konfigurasi footer (HOME-05). Satu daftar untuk footer desktop (60:486) dan mobile (101:2600).
 * `to: null` = teks biasa (bukan <a>, tanpa href, tidak dapat difokus); `to` terisi (path internal "/…") = tautan.
 * Label kategori dari daftar resmi (PRD §4.4), bukan teks Figma (ada salah ketik di desain); slug kategori
 * ditambahkan saat halaman kategori (PAGE-003) ada.
 */
export interface FooterLink {
  label: string
  to: string | null
}

export interface FooterSection {
  id: string
  title: string
  links: FooterLink[]
  /** Kolom daftar pada desktop (default 1). Kategori 9 item dibagi dua kolom agar tinggi footer tetap 270. */
  columns?: 2
}

export interface FooterSocial {
  name: string
  icon: string
  /** Opsional. Hanya `https://`; bila terisi ikon menjadi tautan (rel="noopener noreferrer"). Kosong = ikon dekoratif. */
  url?: string
}

/** Tahun hak cipta dari konfigurasi (bukan hitung otomatis) sampai pemilik menyatakan lain. */
export const FOOTER_YEAR = 2026
export const FOOTER_COMPANY = 'PT. Ini Media Network'
export const FOOTER_TAGLINE = 'Berita lokal, cerita warga, dan informasi Sumedang dalam satu ruang.'

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    id: 'navigasi',
    title: 'Navigasi',
    links: [
      { label: 'Beranda', to: '/' },
      { label: 'Terbaru', to: null },
      { label: 'Terpopuler', to: null }
    ]
  },
  {
    id: 'kategori',
    title: 'Kategori',
    columns: 2,
    links: [
      { label: 'Berita', to: null },
      { label: 'Nasional', to: null },
      { label: 'Pemerintahan', to: null },
      { label: 'Politik', to: null },
      { label: 'Hukum', to: null },
      { label: 'Sepak Bola', to: null },
      { label: 'Otomotif', to: null },
      { label: 'Jelajah', to: null },
      { label: 'Bisnis & Teknologi', to: null }
    ]
  },
  {
    id: 'tentang',
    title: 'Tentang IniSumedang',
    links: [
      { label: 'Redaksi', to: null },
      { label: 'Pedoman Siber', to: null },
      { label: 'Iklan', to: null },
      { label: 'Kontak', to: null }
    ]
  }
]

/** Baris legal setelah "© tahun perusahaan". */
export const FOOTER_LEGAL: FooterLink[] = [
  { label: 'Kebijakan Privasi', to: null },
  { label: 'Ketentuan Penggunaan', to: null }
]

/** Urutan Figma 60:486: Facebook, X, WordPress, Instagram, YouTube, TikTok. URL akun belum ada (keputusan pemilik). */
export const FOOTER_SOCIALS: FooterSocial[] = [
  { name: 'Facebook', icon: '/icons/social-facebook.svg' },
  { name: 'X', icon: '/icons/social-x.svg' },
  { name: 'WordPress', icon: '/icons/social-wordpress.svg' },
  { name: 'Instagram', icon: '/icons/social-instagram.svg' },
  { name: 'YouTube', icon: '/icons/social-youtube.svg' },
  { name: 'TikTok', icon: '/icons/social-tiktok.svg' }
]
