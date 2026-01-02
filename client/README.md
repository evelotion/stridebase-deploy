# 👟 StrideBase - Shoe Cleaning Service Platform

**StrideBase** adalah platform web *full-stack* yang menghubungkan pelanggan dengan penyedia jasa cuci sepatu (*laundry partners*). Aplikasi ini memudahkan pengguna untuk memesan layanan, melacak status pengerjaan, dan melakukan pembayaran secara digital, sekaligus menyediakan dashboard lengkap bagi mitra laundry untuk mengelola pesanan dan keuangan mereka.

## 🚀 Fitur Utama

### 👤 Pengguna (Customer)
* **Booking Layanan:** Pesan layanan cuci sepatu dengan berbagai pilihan paket.
* **Tracking Order:** Pantau status pengerjaan sepatu secara *real-time* (Jemput, Proses, Selesai, Antar).
* **Pembayaran Digital:** Integrasi pembayaran aman via **Midtrans** (QRIS, VA, E-Wallet).
* **Review & Rating:** Berikan ulasan untuk layanan mitra.

### 🏪 Mitra (Partner Store)
* **Store Dashboard:** Kelola pesanan masuk dan update status pengerjaan.
* **Wallet System:** Sistem dompet digital untuk melihat pendapatan dan riwayat transaksi.
* **Withdrawal:** Fitur pencairan dana (payout) ke rekening bank mitra.
* **Manajemen Layanan:** Tambah/edit layanan dan harga toko sendiri.

### 🛡️ Admin Platform
* **User Management:** Kelola data pengguna dan mitra.
* **Financial Reports:** Laporan transaksi dan komisi platform.
* **Content Management:** Kelola banner promosi dan konten statis.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [React](https://reactjs.org/) (Vite)
* **Language:** JavaScript / TypeScript
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **State Management:** React Context / Hooks
* **HTTP Client:** Axios

### Backend
* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Caching & Queue:** [Redis](https://redis.io/) (via Upstash/Local)

### 3rd Party Services
* **Payment Gateway:** Midtrans Snap
* **Image Storage:** Cloudinary
* **Authentication:** Passport.js (Google OAuth), JWT

---

## ⚙️ Persyaratan Sistem (Prerequisites)

Sebelum memulai, pastikan komputer lo sudah terinstall:
* [Node.js](https://nodejs.org/) (v18+)
* [PostgreSQL](https://www.postgresql.org/) (Local atau Docker)
* [Redis](https://redis.io/) (Local atau Docker - Opsional jika pakai Upstash)

---

## 🚀 Cara Install & Menjalankan (Local Development)

Ikuti langkah-langkah ini untuk menjalankan project di lokal:

### 1. Clone Repository
```bash
git clone [https://github.com/username-lo/stridebase.git](https://github.com/username-lo/stridebase.git)
cd stridebase
```

### 2. Setup Backend (Server)

Buka terminal baru, masuk ke folder server:

```bash
cd server
npm install
```

Konfigurasi Environment Variable: Buat file .env di dalam folder server/ (lihat .env.example sebagai referensi) dan isi data berikut:

```bash
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/stridebase_db"
JWT_SECRET="bebasapaaja"

# Cloudinary (Untuk upload gambar)
CLOUDINARY_CLOUD_NAME="nama_cloud_anda"
CLOUDINARY_API_KEY="api_key_anda"
CLOUDINARY_API_SECRET="api_secret_anda"

# Midtrans (Untuk pembayaran)
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"
MIDTRANS_IS_PRODUCTION=false

# Google OAuth (Opsional - untuk login Google)
GOOGLE_CLIENT_ID="xxxx"
GOOGLE_CLIENT_SECRET="xxxx"

# Redis (Untuk antrian email)
REDIS_URL="redis://localhost:6379"

```

Setup Database:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database (Migrasi)
npx prisma db push

# (Opsional) Seed data dummy
npx prisma db seed
```

Jalankan Server:

```bash
npm run dev
# Server akan jalan di http://localhost:5000
```

### 3. Setup Frontend (Client)

Buka terminal baru (biarkan server tetap jalan), lalu masuk ke folder client:
```bash
cd client
npm install
```

Konfigurasi Environment Variable: Buat file .env di dalam folder client/:
```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx" # Sama dengan yang di server
```

Jalankan Client:
```bash
npm run dev
# Client akan jalan di http://localhost:5173
```

## 🐳 Menjalankan dengan Docker

Jika ingin menjalankan seluruh stack (Database + Backend + Frontend) menggunakan Docker:

1. Pastikan Docker Desktop sudah jalan.

2. Jalankan command:

```bash
docker-compose up --build
```

3.  Aplikasi akan tersedia di:

* ***Frontend:*** http://localhost:80
* ***Backend:*** http://localhost:5000
* ***Database:*** localhost:5432

## 📂 Struktur Folder

```bash
stridebase/
├── client/                 # Frontend React App
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Halaman aplikasi
│   │   ├── services/       # API calls (Axios)
│   │   └── styles/         # CSS & Tailwind config
│   ├── .env                # Env frontend (Wajib buat sendiri)
│   └── vite.config.ts
│
├── server/                 # Backend Express App
│   ├── config/             # Konfigurasi (DB, Midtrans, dll)
│   ├── controllers/        # Logika bisnis
│   ├── middleware/         # Auth & Error handling
│   ├── prisma/             # Schema Database
│   ├── routes/             # API Endpoints
│   ├── .env                # Env backend (Wajib buat sendiri)
│   └── index.js            # Entry point
│
└── README.md               # Dokumentasi Project
```

## 🤝 Contributing
    1. Fork repository ini.
    2. Buat branch fitur baru (git checkout -b fitur-keren).
    3. Commit perubahan lo (git commit -m 'Menambahkan fitur keren').
    4. Push ke branch (git push origin fitur-keren).
    5. Buat Pull Request.

# 📝 License
Project ini dilisensikan di bawah MIT License.