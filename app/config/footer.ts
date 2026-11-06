/**
 * Konfigurasi footer, satu daftar untuk desktop dan mobile. `to: null` = teks biasa (bukan <a>, tanpa href, tidak dapat difokus); terisi = tautan internal.
 * Label kategori dari daftar resmi, bukan teks desain (ada salah ketik di desain); `to` kategori = `categoryPath(slug)`.
 */
import { categoryPath } from '../utils/routes.ts'

export interface FooterLink {
  label: string
  to: string | null
  /** Hanya tautan kategori: slug kategori resmi (dasar `aria-current` saat halaman kategori itu dibuka). */
  slug?: string
}

/** Tautan kategori footer: `to` selalu dari `categoryPath` (satu tempat bentuk URL kategori). */
function categoryItem(label: string, slug: string): FooterLink {
  return { label, slug, to: categoryPath(slug) }
}

export interface FooterSection {
  id: string
  title: string
  links: FooterLink[]
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
    links: [
      categoryItem('Berita', 'berita'),
      categoryItem('Nasional', 'nasional'),
      categoryItem('Pemerintahan', 'pemerintahan'),
      categoryItem('Politik', 'politik'),
      categoryItem('Hukum', 'hukum'),
      categoryItem('Sepak Bola', 'sepak-bola'),
      categoryItem('Otomotif', 'otomotif'),
      categoryItem('Jelajah', 'jelajah'),
      categoryItem('Bisnis & Teknologi', 'bisnis-teknologi')
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

/** Urutan: Facebook, X, WordPress, Instagram, YouTube, TikTok. URL akun belum ada. */
export const FOOTER_SOCIALS: FooterSocial[] = [
  { name: 'Facebook', icon: '/icons/social-facebook.svg' },
  { name: 'X', icon: '/icons/social-x.svg' },
  { name: 'WordPress', icon: '/icons/social-wordpress.svg' },
  { name: 'Instagram', icon: '/icons/social-instagram.svg' },
  { name: 'YouTube', icon: '/icons/social-youtube.svg' },
  { name: 'TikTok', icon: '/icons/social-tiktok.svg' }
]
