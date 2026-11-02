/**
 * Isi artikel fixture (PAGE-002; Keputusan PM 12). HANYA untuk pengembangan: setara `content.rendered` dan
 * `excerpt.rendered` WordPress (HTML mentah dari CMS). Tidak pernah dirender langsung: `server/services/articles.ts`
 * menyanitasinya dengan `sanitizeBodyHtml` sebelum keluar dari server.
 * Pembangkit bersifat deterministik (hanya bergantung pada id dan judul), tanpa waktu/acak.
 * Gambar relatif `/fixtures/figma-N.jpg` (JPEG 716x400, sama dengan dimensi di `posts.ts`); WAJIB dihapus bersama
 * `public/fixtures/` sebelum tayang (PRD §13).
 */

const IMG_WIDTH = 716
const IMG_HEIGHT = 400
/** Id contoh pemutar YouTube [I] (11 karakter, lolos pola `EMBED_PATH_PATTERN`). */
const SAMPLE_VIDEO_ID = 'M7lc1UVf-VE'
const FIGMA_ARTICLE_ID = 81

/** Teks Figma 127:2135, 127:2152-127:2159 (dan kotak Baca Juga 130:2366-130:2368): "Pemkab Sumedang Percepat Transformasi Layanan Publik". */
const FIGMA_EXCERPT = 'Pemanfaatan teknologi digital membuat layanan administrasi semakin mudah, cepat, dan dekat dengan kebutuhan masyarakat.'
const FIGMA_BODY = [
  '<p>Pemanfaatan teknologi digital membuat layanan administrasi semakin mudah, cepat, dan dekat dengan kebutuhan masyarakat. Kemudahan akses menjadi bagian penting saat warga mencari informasi dan menyiapkan kebutuhan administrasi.</p>',
  '<p>Kanal digital memberi ruang untuk menyampaikan alur, persyaratan, dan pilihan layanan secara lebih jelas. Informasi yang mudah ditemukan dapat membantu warga memahami langkah yang perlu dilakukan sebelum mengurus dokumen.</p>',
  '<h2>Akses yang lebih sederhana</h2>',
  '<p>Warga membutuhkan petunjuk yang ringkas dan bahasa yang mudah dipahami. Pengalaman layanan yang baik dimulai dari informasi dasar: apa yang harus disiapkan, ke mana harus menghubungi petugas, dan bagaimana mengikuti prosesnya.</p>',
  '<blockquote><p><strong>Baca Juga:</strong></p><p>DPRD Sumedang Bahas Prioritas Pembangunan Daerah dalam Rapat Kerja</p></blockquote>',
  '<p>Layanan digital juga dapat melengkapi pelayanan tatap muka. Keduanya memberi pilihan agar masyarakat bisa mencari informasi secara mandiri maupun memperoleh bantuan langsung ketika diperlukan.</p>',
  '<h2>Dekat dengan kebutuhan warga</h2>',
  '<p>Kecepatan penyelesaian bukan satu-satunya ukuran. Kejelasan informasi, kemudahan menyiapkan dokumen, dan kepastian langkah berikutnya ikut menentukan pengalaman warga saat menggunakan layanan publik.</p>',
  '<p>Dengan pendekatan tersebut, teknologi menjadi sarana untuk menghadirkan layanan yang lebih mudah diakses dan lebih relevan bagi masyarakat Sumedang.</p>'
].join('\n')

// Kumpulan paragraf netral [I, dikarang untuk fixture] yang dirotasi menurut id agar isi antar artikel berbeda.
const PARAGRAPHS = [
  'Informasi ini disusun dari keterangan narasumber dan dokumen resmi yang dapat diakses publik. Redaksi terus memperbarui laporan seiring perkembangan terbaru di lapangan.',
  'Sejumlah warga menyambut baik langkah tersebut dan berharap pelaksanaannya berjalan konsisten. Menurut mereka, kejelasan jadwal dan informasi yang mudah ditemukan sangat membantu kegiatan sehari-hari.',
  'Pihak terkait menjelaskan bahwa pelaksanaan dilakukan bertahap agar setiap kecamatan memperoleh layanan yang merata. Evaluasi berkala disiapkan untuk memastikan manfaatnya benar-benar dirasakan masyarakat.',
  'Pengamat setempat menilai keterbukaan data menjadi kunci kepercayaan publik. Ia menyarankan agar laporan perkembangan disampaikan secara rutin melalui kanal yang mudah dijangkau warga.',
  'Dalam beberapa pekan terakhir, kegiatan serupa juga digelar di wilayah sekitar dan mendapat respons positif. Pengalaman tersebut dipakai sebagai bahan penyempurnaan untuk tahap berikutnya.',
  'Untuk keperluan lebih lanjut, warga dapat menghubungi kantor desa atau kecamatan terdekat pada jam kerja. Petugas siap membantu menjelaskan alur dan persyaratan yang diperlukan.',
  'Selain itu, pemangku kepentingan mengajak seluruh pihak untuk terlibat aktif. Kolaborasi antara pemerintah, pelaku usaha, dan komunitas dinilai mempercepat hasil yang diharapkan.',
  'Ke depan, program ini direncanakan diperluas dengan memperhatikan masukan warga. Setiap usulan akan dikaji agar sesuai dengan kebutuhan dan kemampuan daerah.'
]

const HEADINGS = [
  'Latar belakang kegiatan',
  'Tanggapan warga di lapangan',
  'Rencana tahap berikutnya',
  'Dampak bagi masyarakat sekitar',
  'Catatan dari narasumber',
  'Langkah yang disiapkan'
]

const LIST_ITEMS = [
  'Pendataan dilakukan secara bertahap di tiap kecamatan.',
  'Informasi layanan disampaikan melalui kanal resmi dan papan pengumuman desa.',
  'Warga dapat menyampaikan masukan langsung kepada petugas.',
  'Hasil evaluasi dipublikasikan secara berkala.'
]

/** Escape teks untuk disisipkan ke HTML fixture (judul dapat memuat tanda kutip atau &). */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Judul tampil di sini berasal dari fixture; entitas HTML pada `title.rendered` dibiarkan (sudah HTML). */
function pick<T>(items: T[], seed: number, offset: number): T {
  return items[(seed + offset) % items.length] as T
}

/** Gambar fixture 1-8 mengikuti id. */
function imageFor(id: number): number {
  return ((id - 1) % 8) + 1
}

/**
 * Isi default setiap artikel (HTML mentah fixture): 5 paragraf, 2 h2, 1 daftar, 1 blockquote "Baca Juga",
 * 1 gambar relatif 716x400, 1 embed YouTube nocookie. Artikel id 81 memakai teks Figma persis (tanpa gambar/embed
 * tambahan agar sama dengan node 127:2151). `titleHtml` = `title.rendered`.
 */
export function buildDefaultBody(id: number, titleHtml: string): string {
  if (id === FIGMA_ARTICLE_ID) return FIGMA_BODY
  const n = imageFor(id)
  return [
    `<p>${titleHtml}. ${pick(PARAGRAPHS, id, 0)}</p>`,
    `<p>${pick(PARAGRAPHS, id, 1)}</p>`,
    `<h2>${pick(HEADINGS, id, 0)}</h2>`,
    `<p>${pick(PARAGRAPHS, id, 2)} Rincian lengkap dapat dibaca di <a href="https://example.com/dokumen-contoh">dokumen contoh</a>.</p>`,
    `<blockquote><p><strong>Baca Juga:</strong></p><p>${escapeHtml('DPRD Sumedang Bahas Prioritas Pembangunan Daerah dalam Rapat Kerja')}</p></blockquote>`,
    `<ul>${[0, 1, 2].map(i => `<li>${pick(LIST_ITEMS, id, i)}</li>`).join('')}</ul>`,
    `<figure><img src="/fixtures/figma-${n}.jpg" alt="Ilustrasi kegiatan di Sumedang" width="${IMG_WIDTH}" height="${IMG_HEIGHT}"><figcaption>Ilustrasi: IniSumedang</figcaption></figure>`,
    `<h2>${pick(HEADINGS, id, 3)}</h2>`,
    `<p>${pick(PARAGRAPHS, id, 4)}</p>`,
    `<iframe src="https://www.youtube-nocookie.com/embed/${SAMPLE_VIDEO_ID}" width="560" height="315" title="Video contoh" allowfullscreen></iframe>`,
    `<p>${pick(PARAGRAPHS, id, 5)}</p>`
  ].join('\n')
}

/** Ringkasan default (HTML mentah ala WordPress `excerpt.rendered`: dibungkus `<p>`). */
export function buildDefaultExcerpt(id: number, titleHtml: string): string {
  if (id === FIGMA_ARTICLE_ID) return `<p>${FIGMA_EXCERPT}</p>\n`
  return `<p>${titleHtml}. ${pick(PARAGRAPHS, id, 0).split('. ')[0]}.</p>\n`
}

/** Edge (a): payload XSS dasar. Semua harus hilang setelah sanitasi; teks aman tetap ada. */
export const EDGE_XSS_BODY = [
  '<p>Paragraf aman sebelum payload.</p>',
  '<script>window.__xss = 1; alert("xss-script")</script>',
  `<img src="/fixtures/figma-1.jpg" alt="gambar uji" width="${IMG_WIDTH}" height="${IMG_HEIGHT}" onerror="window.__xss = 2; alert('xss-onerror')">`,
  '<img src=x onerror="window.__xss = 3; alert(\'xss-onerror-x\')">',
  '<p><a href="javascript:window.__xss = 4; alert(\'xss-javascript\')">tautan javascript</a></p>',
  '<svg onload="window.__xss = 5; alert(\'xss-svg\')"><circle r="5"></circle></svg>',
  '<p onclick="window.__xss = 6">paragraf dengan onclick</p>',
  '<p><a href="data:text/html,&lt;script&gt;alert(7)&lt;/script&gt;">tautan data</a></p>',
  '<p style="background:url(javascript:alert(8))">paragraf dengan style</p>',
  '<math><mi xlink:href="javascript:alert(9)">x</mi></math>',
  '<form action="javascript:alert(10)"><input autofocus onfocus="window.__xss = 11"></form>',
  '<p>Paragraf aman sesudah payload.</p>'
].join('\n')

/** Edge (b): iframe non-YouTube dan YouTube palsu. Semua harus hilang (tidak ada iframe di DOM). */
export const EDGE_IFRAME_BODY = [
  '<p>Paragraf sebelum iframe.</p>',
  '<iframe src="https://evil.example/embed/abcdefghijk" width="640" height="360" title="bukan youtube"></iframe>',
  '<iframe src="https://youtube.com.evil.example/embed/abcdefghijk" width="640" height="360" title="youtube palsu"></iframe>',
  '<iframe src="https://www.youtube.com@evil.example/embed/abcdefghijk" width="640" height="360" title="userinfo"></iframe>',
  '<iframe src="javascript:window.__xss = 12" width="640" height="360" title="javascript"></iframe>',
  '<iframe srcdoc="&lt;script&gt;parent.__xss = 13&lt;/script&gt;" width="640" height="360" title="srcdoc"></iframe>',
  '<p>Paragraf sesudah iframe.</p>'
].join('\n')
