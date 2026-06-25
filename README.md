# 🍜 NAKAM: The Ultimate Campus Food Discovery & FinTech Tracker

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

> *Dirancang, dibangun, dan dikembangkan sepenuhnya oleh **Lanciuy**, Lead Developer & Creator.*

---

## 📖 Tentang Proyek Ini
**Nakam** bukanlah sekadar direktori kuliner biasa; ini adalah **ekosistem hibrida** yang menggabungkan fitur pencarian makanan berbasis geolokasi (GPS) dengan pelacakan keuangan sekelas aplikasi *Financial Technology (FinTech)*. 

Proyek ini diciptakan oleh **Lanciuy** untuk memecahkan dilema klasik mahasiswa: *"Makan enak, porsi kuli, tapi dompet tetap aman sampai akhir bulan."* Dengan Nakam, pengguna tidak hanya bisa berburu *hidden gems* (warung murah) di sekitar kampus, tetapi juga dapat melacak pengeluaran, menerima notifikasi *Flash Promo* secara *real-time*, dan mengatur anggaran jajan bulanan mereka dalam satu antarmuka yang sangat premium dan futuristik.

---

## 🚀 Fitur & Metode Utama

Nakam dirancang dengan arsitektur modern dan fitur-fitur yang menjangkau 3 aktor utama: **Mahasiswa (Pembeli)**, **Pemilik Warung (Merchant)**, dan **Administrator**.

### 1. Sinkronisasi Real-Time (Supabase Broadcast) ⚡
Dibangun menggunakan metode **WebSockets via Supabase Realtime Channels**, Nakam memungkinkan penyebaran informasi secara instan tanpa perlu memuat ulang halaman.
- **Admin Broadcast**: Administrator dapat menyiarkan pengumuman (misal: "Diskon Massal Hari Kemerdekaan") yang akan langsung berbunyi dan muncul di layar seluruh pengguna yang sedang *online*.
- **Merchant Flash Promo**: Pemilik warung dapat menembakkan "Flash Promo" dengan batas waktu tertentu yang langsung memicu FOMO (*Fear of Missing Out*) di panel notifikasi semua mahasiswa di area tersebut.

### 2. Peta Geospatial & Deteksi Jarak 🗺️
Terintegrasi langsung dengan **OpenStreetMap** dan **Leaflet.js**, Nakam membaca titik koordinat pengguna melalui GPS perangkat (*Geolocation API*). 
- Sistem secara matematis mengkalkulasi jarak (dalam meter/kilometer) antara posisi mahasiswa dan warung, memastikan rekomendasi makanan yang diberikan benar-benar dapat dijangkau dengan berjalan kaki atau kendaraan singkat.

### 3. Sistem FinTech & Budgeting 💳
Nakam membawa kapabilitas *budgeting* tingkat lanjut.
- **Smart Wallet & Receipt**: Setiap kali pengguna melakukan *check-in* atau memasukkan pengeluaran, Nakam mencatatnya dalam bentuk E-Receipt (Resi Elektronik) yang realistis.
- **Limit & Warning System**: Pengguna dapat memasukkan jatah uang bulanan. Sistem akan memvisualisasikan persentase pengeluaran dengan indikator warna (Hijau -> Kuning -> Merah) jika pengeluaran hampir menyentuh batas kritis.

### 4. UI/UX Kelas Atas (Premium Glassmorphism) 💎
Dirancang oleh **Lanciuy** dengan obsesi pada estetika, antarmuka Nakam mengusung bahasa desain modern:
- Efek **Glassmorphism** (kaca tembus pandang) dipadukan dengan palet warna neon gelap (*Dark Mode* native).
- Transisi halaman yang sehalus sutra berkat algoritma animasi *spring-physics* dari **Framer Motion**.
- Kustomisasi profil tanpa batas dengan penyimpanan awan terenkripsi (Supabase Storage).

---

## 🛠️ Arsitektur & Tech Stack

Sebagai pengembang utama, **Lanciuy** memilih perpaduan teknologi yang berfokus pada kecepatan, keamanan, dan skalabilitas tinggi:

| Kategori | Teknologi Utama | Deskripsi / Penggunaan |
|----------|-----------------|------------------------|
| **Frontend** | React 18, TypeScript, Vite | Memastikan performa secepat kilat dengan *type-safety* untuk meminimalisir *runtime error*. |
| **Styling & Animasi** | Tailwind CSS, Framer Motion | *Styling utility-first* untuk responsivitas sempurna, dipadukan dengan engine animasi kelas atas. |
| **Database & Auth** | Supabase (PostgreSQL) | Bertindak sebagai *BaaS (Backend as a Service)*, menangani *Row Level Security (RLS)*, Autentikasi, dan *Realtime Broadcast*. |
| **State Management** | Zustand | Penyimpanan *state* lokal yang jauh lebih ringan dan cepat dibandingkan Redux, memastikan data dompet tidak tertunda. |
| **Peta & Ikonografi** | React Leaflet, Lucide React | Sistem pemetaan spasial dan aset visual ikon yang konsisten. |

---

## 💻 Panduan Instalasi (Development)

Ingin berkontribusi atau menjalankan *masterpiece* ini di mesin lokal Anda? Ikuti langkah-langkah berikut:

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/Lanciuy/NAKAM.git
   cd NAKAM
   ```

2. **Instal seluruh dependensi yang dibutuhkan:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat file bernama `.env.local` di *root directory*. Minta *keys* Supabase kepada **Lanciuy** atau gunakan *database* Anda sendiri:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Jalankan mesin peladen (Development Server):**
   ```bash
   npm run dev
   ```
   *Buka `http://localhost:5173` di peramban Anda dan nikmati pengalamannya.*

---

## 👑 Sentuhan Akhir dari Kreator

> *"Kode yang baik adalah kode yang bekerja. Namun kode yang luar biasa adalah kode yang tidak hanya bekerja, tetapi juga menyelesaikan masalah nyata dengan keindahan visual yang memanjakan mata."* 
> 
> **— Lanciuy, Pembuat & Pengembang Utama NAKAM**

Terima kasih telah mengunjungi repositori ini! Nakam adalah bukti nyata bahwa aplikasi fungsional yang menjembatani masalah UMKM (pemilik warung) dan Mahasiswa dapat dibalut dengan desain *engineering* dan *user-interface* kelas dunia. 

Jika sistem ini membantu, menginspirasi, atau membuat Anda takjub, jangan ragu untuk menekan tombol ⭐️ **Star** di pojok kanan atas. Mari terus berinovasi tanpa batas!🚀