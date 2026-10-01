# Budget Management System

Aplikasi manajemen keuangan sederhana berbasis web, dibangun sebagai tugas akhir mata kuliah pengembangan web. Aplikasi ini memungkinkan pengguna mencatat pemasukan dan pengeluaran pribadi, dengan tiga tingkat hak akses: **customer**, **admin**, dan **owner**.

**Live demo:** https://budget-management-system-five.vercel.app

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Backend | Node.js, Express |
| Database | PostgreSQL (hosting: Neon) |
| Autentikasi | JWT (jsonwebtoken), bcrypt |
| Application Logging | Pino, pino-http |
| Error Tracking | Sentry |
| Uptime Monitoring | UptimeRobot |
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Deployment | Vercel |

---

## Role dan Hak Akses

### Customer
- Mendaftar dan login
- Menambah dan mengubah data pemasukan (income) miliknya sendiri
- Menambah dan mengubah data pengeluaran (expense) miliknya sendiri
- Melihat ringkasan total pemasukan, pengeluaran, dan saldo miliknya sendiri
- Mengubah profil (nama, email, password)

### Admin
Semua hak customer, ditambah:
- Melihat daftar seluruh user di sistem
- Melihat seluruh transaksi (income & expense) dari semua user
- Melihat dashboard ringkasan gabungan seluruh sistem (total income, expense, balance, jumlah user)
- Melihat activity log (riwayat aktivitas seluruh user)

### Owner
Semua hak admin, ditambah:
- Menghapus akun user (customer maupun admin)
- Akun owner **dijamin hanya ada satu** di seluruh sistem, dijaga langsung di level database lewat *partial unique index*, bukan hanya validasi di kode aplikasi. Akun owner sendiri tidak bisa dihapus lewat endpoint manapun.

Role `owner` tidak bisa didapat lewat pendaftaran biasa — endpoint `/register` selalu membuat akun dengan role `customer` secara default. Akun admin/owner dinaikkan levelnya secara manual langsung di database.

---

## Struktur Folder

```
/src
  /config       → koneksi database (pool PostgreSQL)
  /routes       → definisi endpoint per fitur
  /controllers  → logika proses tiap endpoint (validasi, panggil model, kirim response)
  /middlewares  → autentikasi (JWT) dan otorisasi (role)
  /models       → query ke database
  /utils        → logger (Pino) dan metrics
/public         → seluruh file frontend (HTML, CSS, JS)
server.js       → entry point aplikasi
vercel.json     → konfigurasi deployment ke Vercel
```

Pemisahan route–controller–model ini dipakai supaya tiap file punya satu tanggung jawab yang jelas: route menentukan endpoint mana memanggil fungsi apa, controller berisi logika (validasi, keputusan response), model murni berurusan dengan query SQL.

---

## Skema Database

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | SERIAL PK | |
| first_name, last_name | VARCHAR | |
| email, username | VARCHAR UNIQUE | mencegah duplikat akun |
| password_hash | VARCHAR | hasil hash bcrypt, bukan password asli |
| role | ENUM (owner/admin/customer) | default `customer` |
| created_at, updated_at | TIMESTAMP | |

Index khusus: `CREATE UNIQUE INDEX only_one_owner ON users (role) WHERE role = 'owner'` — index parsial ini membuat database **menolak** insert/update jika ada percobaan membuat owner kedua, terlepas dari apapun yang terjadi di level aplikasi.

### `incomes` dan `expenses`
Struktur identik, bedanya hanya nama kolom `source` (incomes) vs `item` (expenses):
- `user_id` → foreign key ke `users(id)`, `ON DELETE CASCADE` (data transaksi ikut terhapus kalau user-nya dihapus, karena data ini tidak bermakna tanpa pemiliknya)
- `amount` → tipe `NUMERIC(12,2)`, bukan `FLOAT`, karena nilai uang butuh presisi eksak (floating point rawan salah hitung di belakang koma)
- `CHECK (amount > 0)` → validasi di level database, nominal tidak boleh nol/negatif

### `activity_logs`
Mencatat jejak aktivitas: login (berhasil/gagal), register, create/update income & expense, delete user. Kolom `user_id` di sini `ON DELETE SET NULL` (bukan CASCADE) — berbeda dari dua tabel di atas, karena log ini justru harus tetap ada sebagai bukti audit walau user-nya sudah dihapus dari sistem.

---

## Autentikasi dan Otorisasi

**Autentikasi (siapa kamu)** — ditangani lewat JWT. Setelah login berhasil, server menerbitkan token berisi `userId` dan `role`, ditandatangani pakai `JWT_SECRET` supaya tidak bisa dipalsukan. Token dikirim client di setiap request lewat header `Authorization: Bearer <token>`.

**Otorisasi (boleh akses apa)** — dua middleware:
- `authenticate` — memverifikasi token valid, menolak dengan `401` kalau tidak ada token/token rusak/kadaluarsa
- `authorize(...roles)` — mengecek role di dalam token cocok dengan role yang diizinkan untuk endpoint itu, menolak dengan `403` kalau role tidak sesuai

Pesan error login untuk "username tidak ada" dan "password salah" sengaja dibuat sama (`"Username atau password salah"`) untuk mencegah *user enumeration* — penyerang tidak bisa menebak username valid dari pesan error yang berbeda.

Password disimpan sebagai hash (bcrypt, 10 salt rounds), bukan teks asli — hash bersifat satu arah, sehingga walau database bocor, password asli user tidak langsung diketahui.

Semua query ke database memakai *parameterized query* (`$1, $2, ...`), bukan penggabungan string manual, untuk mencegah SQL injection.

---

## Logging dan Monitoring

### 1. Activity Log (database)
Tabel `activity_logs` mencatat aksi penting (login, register, CRUD transaksi, delete user) beserta `user_id` pelaku, `ip_address`, dan `user_agent`. Bisa dilihat admin/owner lewat endpoint `GET /api/admin/logs`.

### 2. Application Log (Pino)
Semua request dicatat otomatis dalam format JSON terstruktur lewat `pino-http`, termasuk method, URL, status code, dan response time. Setiap request diberi **request ID** unik (dikembalikan lewat header `X-Request-Id`) sehingga satu alur request bisa ditelusuri lintas log walau melewati beberapa fungsi. Data sensitif (header `Authorization`, `Cookie`) disensor otomatis agar token tidak pernah tercatat di log.

### 3. Endpoint Monitoring
- `GET /health` — mengecek status server dan koneksi database, dipakai UptimeRobot
- `GET /metrics` — statistik ringan: total request, total error (status ≥500), error rate, rata-rata response time, dihitung di memori aplikasi

### 4. Error Tracking (Sentry)
Semua exception tak tertangani otomatis terkirim ke dashboard Sentry, lengkap dengan stack trace. Memudahkan debugging di production tanpa perlu akses langsung ke server.

*(sisipkan screenshot dashboard Sentry di sini)*

### 5. Uptime Monitoring (UptimeRobot)
Memantau endpoint `/health` setiap 5 menit, mengirim notifikasi otomatis jika server down.

*(sisipkan screenshot dashboard UptimeRobot di sini)*

---

## Penjelasan Endpoint API

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | /api/auth/register | Publik | Daftar akun baru (role selalu `customer`) |
| POST | /api/auth/login | Publik | Login, menerbitkan JWT |
| GET | /api/auth/profile | Login | Lihat profil sendiri |
| PUT | /api/auth/profile | Login | Update profil sendiri |
| POST | /api/auth/logout | Login | Mencatat log logout |
| POST | /api/incomes | Login | Tambah pemasukan |
| GET | /api/incomes | Login | Lihat pemasukan sendiri |
| PUT | /api/incomes/:id | Login | Update pemasukan sendiri |
| POST / GET / PUT | /api/expenses | Login | Sama seperti incomes |
| GET | /api/summary | Login | Total pemasukan, pengeluaran, saldo sendiri |
| GET | /api/admin/users | Admin, Owner | Daftar semua user |
| GET | /api/admin/transactions | Admin, Owner | Semua transaksi semua user |
| GET | /api/admin/dashboard | Admin, Owner | Ringkasan gabungan sistem |
| GET | /api/admin/logs | Admin, Owner | Activity log |
| DELETE | /api/admin/users/:id | Owner saja | Hapus user (owner tidak bisa dihapus) |

---

## Cara Menjalankan di Lokal

1. Clone repo ini, `npm install`
2. Buat database PostgreSQL lokal, jalankan skema SQL yang ada di `/sql/schema.sql` (atau lihat bagian Skema Database di atas)
3. Salin `.env.example` menjadi `.env`, isi `DATABASE_URL`, `JWT_SECRET`, `SENTRY_DSN` sesuai milikmu
4. Jalankan `node server.js`
5. Buka `http://localhost:3000`

---

## Deployment

Dideploy ke **Vercel** (backend + frontend statis dalam satu project), dengan database production di **Neon** (PostgreSQL serverless). Environment variables (`DATABASE_URL`, `JWT_SECRET`, `SENTRY_DSN`, `NODE_ENV`) diatur lewat dashboard Vercel.