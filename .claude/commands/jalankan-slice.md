---
description: Jalankan satu task/slice dari backlog (PM, Fullstack, QA, commit, merge, push)
argument-hint: <ID task, mis. HOME-02> [catatan tambahan dari pemilik]
---
Kamu orkestrator PM sesuai .agents/skills/pm/SKILL.md. Argumen: $ARGUMENTS. Kata pertama = ID task (docs/tasks/<ID>.md); sisanya (jika ada) adalah catatan tambahan dari pemilik, masukkan ke kriteria penerimaan task. Nama cabang = feat/ + ID huruf kecil.

Izin pemilik: hanya kamu, sebagai orkestrator, boleh melakukan commit, merge ke main, dan git push ke origin main sesuai tahap D. Ini mengesampingkan aturan "agen tidak commit" di AGENTS.md untuk kamu saja. Subagen Fullstack dan QA tetap DILARANG commit, push, atau mengubah cabang. Dilarang: force push, reset --hard, mengubah riwayat, menghapus cabang, menyentuh remote selain push ke origin main.

TAHAP A. Persiapan
1. Jalankan git --no-pager status --short: harus kosong. Cabang aktif harus main atau feat/<id> (jika cabang itu sudah ada). Jika tidak, berhenti dan lapor.
2. Baca AGENTS.md dan docs/tasks/<ID>.md. Status READY: lanjut. BACKLOG dan semua ketergantungan DONE: periksa Definition of Ready dan ubah sendiri ke READY; jika ada pertanyaan yang benar-benar menghalangi, berhenti dan ajukan ke pemilik (maks. 3). Status lain: berhenti dan lapor.
3. Jika di main: git switch -c feat/<id>.
4. Jika task berisiko tinggi (keamanan atau sanitasi HTML, akses WordPress nyata, dependensi baru, perubahan di .github atau konfigurasi build), kerjakan sampai tahap C lalu BERHENTI sebelum tahap D dan minta persetujuan pemilik.

TAHAP B. Putaran, tanpa bertanya kepadaku kecuali ada keputusan yang tidak bisa kamu ambil
1. Subagen Fullstack: baca .agents/skills/fullstack-engineer/SKILL.md, AGENTS.md, docs/tasks/<ID>.md; kerjakan HANYA task itu; tidak commit; tidak menyentuh berkas di luar daftar yang diizinkan task; tidak ada dependensi baru (jika butuh dependensi atau unduhan aset di luar yang disebut task, berhenti dan lapor BLOCKED dengan usulan); memakai ulang komponen yang sudah ada sesuai task; get_design_context per node; gambar dari Figma diperkecil sebelum masuk repo (lebar 716 px, JPEG sekitar 75, maks. 120 KB per berkas, lewat PowerShell + System.Drawing, skrip di luar repo); jalankan lint, typecheck, build; kembalikan ringkasan diff dan keluaran perintah yang nyata.
2. Subagen QA BARU (tanpa penalaran Fullstack): baca .agents/skills/qa-engineer/SKILL.md Fase 2, AGENTS.md, docs/tasks/<ID>.md; periksa git status --porcelain --untracked-files=all dan git diff; jalankan semua pemeriksaan di task; bandingkan visual dengan Figma (get_screenshot) di desktop dan mobile; JANGAN menginstal apa pun; tutup semua server preview dan proses browser yang dijalankan dan laporkan port; kembalikan LULUS/GAGAL/TIDAK TERUJI per pemeriksaan dengan bukti ringkas. Jangan mengubah kode.
3. GAGAL: kirim temuan apa adanya ke subagen Fullstack baru, lalu QA baru lagi. Maksimal 3 putaran, lalu BLOCKED dengan alasan dan berhenti.
4. LULUS: ubah status task ke QA_PASSED lalu DONE dengan bukti QA (hanya docs/tasks/<ID>.md dan, bila perlu, PRD §15.1; kamu sendiri tidak mengedit kode).

TAHAP C. Pra-commit otomatis. Semua harus lolos; jika ada yang gagal, berhenti, JANGAN commit, lapor.
a. Cabang aktif feat/<id>.
b. git --no-pager status --short --untracked-files=all: setiap jalur berada dalam daftar berkas yang diizinkan task, ditambah docs/tasks/<ID>.md dan docs/PRD.md.
c. Tidak ada berkas .env selain .env.example. package.json, package-lock.json, nuxt.config.ts, dan .github tidak berubah, kecuali task mengizinkannya secara eksplisit.
d. Tidak ada berkas baru di atas 300 KB, kecuali task menyebutnya.
e. git grep -n "v-html" -- app server kosong, kecuali task mengizinkan.
f. Tidak ada server atau proses browser yang dimulai olehmu atau subagen yang masih hidup.

TAHAP D. Commit, merge, push
1. git add hanya jalur yang lolos tahap C (jangan git add .). Commit dengan pesan feat(<ID>): ringkasan, plus body singkat.
2. git switch main, git merge feat/<id>. Jika konflik: git merge --abort, berhenti, lapor. Jika bersih: git push.
3. Jika gh terpasang dan sudah login: periksa run CI terbaru di main dan tunggu hasilnya maksimal 10 menit. Jika gh tidak ada atau belum login, tulis "cek Actions manual"; jangan mencoba login. Jika CI merah: JANGAN memperbaiki otomatis; lapor langkah yang gagal dan baris error-nya.

LAPORAN AKHIR, singkat: hasil (DONE/BLOCKED/berhenti di tahap mana), berkas yang berubah, tabel hasil QA, yang tidak teruji, keputusan yang kamu ambil sendiri (default, deviasi dari Figma), status CI, dan cara membatalkan commit ini (git revert <hash>).
