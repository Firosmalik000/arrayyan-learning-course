# Roadmap Semi-Sistem — Arrayyan Learning Course

> Dokumen panduan pengerjaan bertahap. Tujuan: aplikasi naik dari
> **company profile + form pendaftaran + CRUD** menjadi **semi-sistem bimbel**
> yang profesional, tanpa merusak flow yang sudah ada.
> Setiap instruksi/prompt pengerjaan di masa depan WAJIB merujuk ke milestone di dokumen ini.

## 0. Kondisi awal (baseline)

- Backend: Laravel 12, `routes/web.php` (public + `/admin` dengan guard `auth:admin`).
- Frontend: Inertia v2 + React 19 + Tailwind v4 di `resources/js/Pages`.
- Auth/otorisasi: `spatie/laravel-permission`, middleware `role_or_permission:...`.
- Alur inti sekarang:
  `Public/Register` submit → `RegistrationController@storeStudent/storeTeacher`
  → menumpuk di `Admin/Registrations` → approve/reject manual
  → copy ke tabel `Student` / `Teacher` (`Admin/RegistrationController.php`).
- Model utama: `Program`, `Package`, `BankSoal`, `Olympiad`, `Student`,
  `Teacher`, `StudentRegistration`, `TeacherRegistration`, `PageContent`.

## 1. Prinsip pengerjaan (anti-merusak flow)

1. **Additive, bukan rewrite.** Kolom baru hanya via migration `add_*_*_table`.
   DILARANG rename/drop kolom lama tanpa persetujuan eksplisit.
2. **Route name lama tidak diubah.** Contoh: `register`, `admin.registrations`,
   `admin.programs`. Hanya tambah route baru (misal `status.check`, `invoices.*`).
3. **Payload lama tetap diterima.** Form baru boleh menambah field, tapi field lama
   (`student_name`, `program_id`, dll) tetap wajib didukung.
4. **Fitur lama tetap jalan saat fitur baru rilis.** Tidak ada flag yang mematikan
   submit lama sebelum pengganti terbukti stabil.
5. **Ikut konvensi existing:** Form Request untuk validasi, `useForm` Inertia untuk
   form React, guard admin terpisah dari guard portal (nanti), Pest untuk test,
   `vendor/bin/pint --dirty` sebelum selesai tiap milestone.
6. **Tiap milestone rilis mandiri** dengan Definition of Done (DoD) + verifikasi.
7. **Urutan eksekusi baku:** `M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8`.
   Jangan loncat ke M4 sebelum M1–M3 selesai (ID murid + status lunas adalah fondasi kelas).

## 2. Peta milestone

| Milestone | Nama | Hasil rilis |
|---|---|---|
| M0 | Fondasi & Bug Kritis | Approve aman, tabel cepat, kode rapi |
| M1 | Pendaftaran End-to-End + Notifikasi | No. tiket + cek status + WA |
| M2 | Program & UX Pendaftaran | Wizard + detail program + kuota |
| M3 | Pembayaran Sederhana | Invoice + bukti bayar + verifikasi |
| M4 | Akademik Inti | Kelas + jadwal + absensi + nilai |
| M5 | Portal Murid & Guru | Login mandiri murid/guru |
| M6 | Olimpiade & Bank Soal Pro | Event + materi terkunci |
| M7 | CMS Marketing + Admin Excellence | Blog/FAQ/testimoni + notif + audit + laporan |
| M8 | Hardening & Go-Live | Aman, cepat, siap produksi |

---

## M0 — Fondasi & Bug Kritis

**Tujuan:** pondasi stabil sebelum bangun lantai berikutnya.

**Masalah yang diperbaiki:**
- Approve ganda bisa bikin duplikat `Student`/`Teacher`
  (`app/Http/Controllers/Admin/RegistrationController.php:15-40` tanpa guard status).
- Filter tabel registrasi jalan di frontend
  (`resources/js/Pages/Admin/Registrations/index.jsx:111-117`), berat untuk data besar.
- Tombol mati di dashboard (`Admin/Dashboard/index.jsx:88-101`).
- Validasi WA/file belum ketat.

**Scope:**
- BE: guard idempotent di 4 aksi approve/reject murid+guru
  (`if status !== pending → tolak`), cegah duplikat by WA + program,
  index DB untuk `status, created_at`.
- Validasi: perketat `StoreStudentRegistrationRequest` /
  `StoreTeacherRegistrationRequest` (format WA ID, mime+size CV).
- Admin tabel: search/filter/status + pagination pindah ke backend (query Laravel).
- Bersihkan/fungsikan tombol mati dashboard.
- Test Pest: approve 2x tidak duplikat, reject tidak bikin Student,
  validasi WA salah memberi pesan jelas.

**DoD:** klik approve ganda aman, tabel 1000+ row cepat,
`php artisan test --compact` hijau, `vendor/bin/pint --dirty` bersih.

---

## M1 — Pendaftaran End-to-End + Notifikasi

**Tujuan:** pendaftar tahu nasibnya, admin tidak konfirmasi manual via chat.

**Yang dipertahankan:** URL `/pendaftaran`, `/pendaftaran/murid`,
`/pendaftaran/pengajar` dan payload lama tetap diterima.

**Scope:**
- DB (additive): `registration_no` unik di `student_registrations` dan
  `teacher_registrations` (format `ALC-2026-XXXX`), kolom `admin_note`,
  `notified_at`. Tabel baru `notification_logs`.
- BE: generate tiket dalam transaction + lock; queue job notifikasi WA
  (provider Fonnte/Wablas) + email; fallback ke log jika provider mati.
  Route publik baru `/cek-status` (cari by tiket + WA) dengan timeline
  `diterima → diproses → disetujui/ditolak`.
- FE Public: halaman sukses berisi kartu tiket + salin + tombol WA +
  link cek-status; halaman cek-status (timeline + alasan tolak + langkah lanjut).
- FE Admin: modal approve/reject dengan template pesan + preview WA,
  kolom tiket di tabel, badge pending di sidebar, bulk approve berkonfirmasi.
- Test: tiket unik, cek-status akurat, approve mencatat log notif,
  provider mati tidak bikin error (retry/log).

**DoD:** tiap pendaftaran punya tiket, bisa dilacak publik,
tiap perubahan status tercatat + terkirim.

---

## M2 — Program & UX Pendaftaran

**Tujuan:** form ringan di HP, program jelas, tidak ada salah pilih/penuh.

**Yang dipertahankan:** name field lama tetap, submit ke endpoint sama,
konten landing lama tidak dihapus.

**Scope:**
- DB (additive, nullable dulu): `programs`/`packages` tambah
  `slug, price, duration, quota, schedule_info, syllabus(json), teacher_id, is_featured`.
- BE: dukung slug untuk detail (ID lama redirect), endpoint sisa kuota,
  tolak submit jika kuota 0 dengan pesan ramah.
- FE Public: wizard 4 langkah (Data diri → Sekolah → Program → Review),
  validasi per langkah, draft localStorage, bisa maju-mundur tanpa hilang.
- Detail program: harga, durasi, jadwal, sisa kuota (progress bar),
  silabus accordion, pengajar, FAQ mini, CTA sticky
  `→ /pendaftaran?program_id=X` (auto-prefill + kurangi salah pilih).
- Test: draft tidak hilang, kuota penuh ditolak, prefill program benar.

**DoD:** form nyaman di HP, program penuh otomatis tutup,
daftar dari detail program selalu prefill benar.

---

## M3 — Pembayaran Sederhana

**Tujuan:** uang tercatat di sistem, bukan hanya di chat.

**Yang dipertahankan:** arti approve tidak berubah (tetap bikin `Student`).

**Scope:**
- DB baru: `invoices (no_invoice, student_id, registration_id, amount,
  status unpaid/pending/paid/expired/rejected, due_date)`,
  `payments (invoice_id, proof_path, note, verified_by/at)`.
- Flow: approve murid → auto-buat 1 invoice `unpaid` (harga dari program/paket,
  fallback input manual). Halaman bayar publik (by no. invoice + WA):
  nominal + rekening (dari config) + upload bukti → `pending`.
  Admin verifikasi terima/tolak + alasan. Expire + pengingat H-1 via scheduler.
- FE: halaman bayar + riwayat di cek-status; tabel invoice admin
  (filter status + preview bukti + verifikasi).
- Test: 1 approve = 1 invoice (anti-dobel), file non-gambar/PDF ditolak,
  verifikasi tercatat siapa/kapan.

**DoD:** tiap murid baru punya invoice, tiap pembayaran ada status,
laporan pemasukan bulanan bisa ditarik.

---

## M4 — Akademik Inti

**Tujuan:** operasional belajar tercatat (ini yang membuat layak disebut sistem).

**Yang dipertahankan:** CRUD murid/guru existing tetap, data tidak dihapus.

**Scope (modul baru, tidak menimpa modul lama):**
- DB baru: `class_groups (program_id, teacher_id, name, quota, room, is_active)`,
  `class_members (class_group_id, student_id, joined_at, status)`,
  `schedules (class_group_id, day, start_at, end_at)`,
  `attendances (class_group_id, student_id, date, status, marked_by)`,
  `grades (student_id, class_group_id, subject, term, score)`.
- Aturan: hanya murid `paid` (M3) yang bisa masuk kelas aktif
  (kecuali flag beasiswa + alasan). 1 murid aktif = 1 kelas per program.
  Tolak bentrok jadwal guru.
- FE Admin: CRUD kelas + kuota terisi, assign massal dari murid lunas
  yang belum punya kelas, kalender mingguan, absensi per tanggal
  (checklist massal + edit satuan), leger nilai per term + export Excel/PDF.
- Test: murid belum lunas ditolak (kecuali beasiswa), jadwal bentrok ditolak,
  absensi 30 murid konsisten dalam 1 transaksi.

**DoD:** siapa di kelas mana, kapan, hadir/tidak, nilai berapa — semua di sistem.

---

## M5 — Portal Murid & Guru

**Tujuan:** self-service, kurangi pertanyaan rutin ke admin.

**Yang dipertahankan:** auth admin (`auth:admin`) tidak diubah.
Guard portal WAJIB terpisah.

**Scope:**
- Auth baru: guard `student`/`teacher` (atau satu guard `portal` + role).
  Akun auto-create saat approve (password awal/OTP WA), wajib ganti password
  saat login pertama. Rate-limit login + OTP. Dilarang akses `/admin/*`.
- Portal murid: Jadwal Saya, Absensi Saya (rekap %), Nilai Saya,
  Tagihan Saya (reuse M3) + upload bukti, Materi/Bank Soal khusus murid, Profil.
- Portal guru: Jadwal Mengajar, Kelas Saya, Absensi per pertemuan,
  Input Nilai, Profil + dokumen.
- Test otorisasi: murid A tidak bisa buka data murid B (403),
  guru hanya kelasnya sendiri.

**DoD:** jadwal, tagihan, dan nilai bisa dilihat mandiri tanpa WA admin.

---

## M6 — Olimpiade & Bank Soal Pro

**Tujuan:** dua fitur pembeda menjadi produk, bukan pajangan.

**Yang dipertahankan:** halaman info olimpiade/bank soal tetap ada.

**Scope:**
- Olimpiade: tabel `olympiad_registrations (olympiad_id, name, school, level,
  contact, fee_status, ticket_no)`; form daftar khusus (terpisah dari
  pendaftaran murid); countdown + kuota + tutup otomatis; pengumuman lolos +
  sertifikat sederhana. Fee reuse pola invoice M3 bila berbayar.
- Bank Soal: akses bertingkat (publik = judul/deskripsi saja; file penuh hanya
  murid login M5 atau passkey per item). Rapikan `bankSoalPasskey` global
  menjadi izin per item. Tambah search + filter kategori/level + preview +
  hitung view/download. Link file tanpa hak → 403/redirect + rate-limit passkey.
- Test: kuota penuh menutup form, passkey salah ditolak, file terkunci aman.

**DoD:** olimpiade menghasilkan peserta tercatat (+bayar bila berbayar),
bank soal menjadi aset terkunci.

---

## M7 — CMS Marketing + Admin Excellence

**Tujuan:** datangkan murid baru + admin betah dan akuntabel.

**Yang dipertahankan:** slug section landing di
`LandingContentController::SECTION_SLUGS` tetap; konten lama dimigrasi.

**Scope:**
- CMS baru: `posts` (blog/pengumuman), `testimonials`, `faqs`, `galleries` —
  CRUD + slug + `is_active` + SEO meta per item + sitemap otomatis
  (perkaya `SitemapController` yang sekarang masih dasar).
- Landing editor: pecah per tab section + live preview + snapshot revisi
  per simpan (bisa rollback). Jangan tambah blob raksasa baru.
- Admin excellence: notification center (pending/pembayaran/kelas penuh),
  activity/audit log (siapa-apa-kapan), role granular
  (`keuangan.verify`, `akademik.manage`, dst mengikuti pola
  `pendaftaran.approve` yang sudah ada), laporan pendaftaran/keuangan/akademik
  + export, cetak kartu murid & formulir.
- Bilingual: satu helper `localize()` konsisten; hilangkan campur
  string vs `{id,en}` antar modul.
- Test: publish/unpublish langsung tampil di public + sitemap,
  revisi landing bisa rollback.

**DoD:** non-teknis bisa publish tanpa dev, aksi sensitif tercatat,
laporan keluar 1 klik.

---

## M8 — Hardening & Go-Live

**Scope:**
- Security: rate-limit form publik, captcha/turnstile pendaftaran,
  validasi ketat upload (mime+size), backup otomatis DB+storage,
  `APP_DEBUG=false`, audit ulang `role_or_permission` tiap route admin.
- Performance: cache landing/program, eager loading (anti N+1),
  optimasi/resize gambar, `npm run build` bersih (tanpa Vite manifest error).
- Quality gate: test Pest per modul M1–M7, `vendor/bin/pint --dirty` tiap phase,
  seed demo + SOP 1 halaman per modul untuk training admin.

**DoD:** siap produksi: aman, cepat, ter-backup, terdokumentasi.

## 3. Cara memakai dokumen ini untuk instruksi berikutnya

- Setiap perintah pengerjaan HARUS menyebut milestone (misal: "kerjakan M0 item 2").
- Setiap perubahan WAJIB additive dan menyebut file + migration + test yang dibuat.
- Setiap selesai milestone WAJIB: `vendor/bin/pint --dirty`,
  `php artisan test --compact` (minimal filter terkait), dan update bagian
  "Status" di bawah.
- Dilarang mengubah arti status existing (`pending/approved/rejected`) atau
  menghapus route name lama tanpa update dokumen ini dulu.

## 4. Status pengerjaan

- [x] M0 — selesai (approve idempotent + anti-duplikat, validasi WA, pagination/filter server, tombol dashboard difungsikan, 77 test hijau)
- [x] M1 — selesai (no. tiket unik + kartu tiket di sukses daftar, /cek-status by tiket+WA + timeline, notifikasi WA queue log/fonnte + notification_logs, reject beralasan, bulk approve, kolom tiket admin; 90 test hijau)
- [x] M2 — selesai (kolom marketing program/paket + slug auto, kuota enforced pending+approved, wizard 4 langkah + draft + validasi per langkah, detail program kaya + CTA prefill + status penuh, admin Programs kelola harga/kuota/silabus/pengajar; 97 test hijau)
- [x] M3 — selesai (invoices + payments, invoice otomatis saat approve + idempotent, /bayar by invoice+WA + upload bukti, verifikasi/tolak admin + notif WA, expire scheduler + command, riwayat di cek-status, menu + permission keuangan; 110 test hijau)
- [x] M4 — selesai (class_groups/members/schedules/attendances/grades, aturan paid-only + beasiswa + 1 kelas/program + kuota kelas + anti-bentrok guru, absensi/nilai upsert, export CSV, halaman admin Akademik; 120 test hijau)
- [x] M5 — selesai (guard portal terpisah + auto-akun saat approve + password sementara via WA + wajib ganti, dashboard/jadwal/absensi/nilai/tagihan murid, kelas + input absensi/nilai guru, isolasi auth diuji; 132 test hijau)
- [x] M6 — selesai (pendaftaran olimpiade + tiket OLS + kuota/deadline + admin kelola + verifikasi biaya, pengumuman pemenang + sertifikat cetak, bank soal gate server + passkey per item + portal auto + statistik view/unduh; 143 test hijau)
- [x] M7 — selesai (CMS blog/pengumuman/testimoni/FAQ + halaman publik editorial + sitemap, pusat notifikasi, audit log, export CSV pendaftaran/keuangan, kartu murid cetak, revisi landing + restore, helper localize; 156 test hijau)
- [ ] M8 — belum mulai
