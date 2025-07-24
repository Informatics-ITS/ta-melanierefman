# 🏁 Tugas Akhir (TA) - Final Project

**Nama Mahasiswa**: Melanie Sayyidina Sabrina Refman <br>
**NRP**: 5025211029 <br>
**Judul TA**: Rancangan Bangun Aplikasi Web Sistem Informasi Kelompok Riset Iklim dan Lingkungan Masa Lampau BRIN Menggunakan Arsitektur Monolitik <br>
**Dosen Pembimbing**: Ir. Siti Rochimah, MT., Ph.D. <br>
**Dosen Ko-pembimbing**: Bintang Nuralamsyah, S.Kom, M.Kom.

---

## 📺 Demo Aplikasi  

[![Demo Aplikasi](https://i.ytimg.com/vi/zIfRMTxRaIs/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)  
*Klik gambar di atas untuk menonton demo*

---

## 🛠 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat

* **Node.js** v18+
* **PHP** v8.2+
* **Composer**
* **MySQL** v8.0+
* **Git**
* **Visual Studio Code** (opsional tapi disarankan)

---

### Langkah-langkah Instalasi

1. **Clone Repository**

   ```bash
   git clone https://github.com/Informatics-ITS/ta-melanierefman.git
   cd ta-melanierefman
   ```

2. **Instalasi Dependensi**

   * **Laravel (Backend)**

     ```bash
     composer install
     ```
   * **React + Vite (Frontend)**

     ```bash
     npm install
     ```

3. **Konfigurasi Environment**

   * Salin file `.env.example` menjadi `.env`

     ```bash
     cp .env.example .env
     ```
   * Atur variabel database dan lainnya di file `.env`
   * Generate application key

     ```bash
     php artisan key:generate
     ```

4. **Persiapan Storage**

   ```bash
   php artisan storage:link
   ```

5. **Migrasi dan Seed Database**

   ```bash
   php artisan migrate --seed
   ```

6. **Menjalankan Aplikasi**

   * Jalankan backend Laravel:

     ```bash
     php artisan serve
     ```
   * Jalankan frontend React + Vite:

     ```bash
     npm run dev
     ```

7. **Akses Aplikasi di Browser**

   * Laravel API / Backend: `http://localhost:8000`
   * Frontend (via Vite): biasanya di `http://localhost:5173`

---

## 📚 Dokumentasi Tambahan

- [![Dokumentasi API]](docs/api.md)
- [![Diagram Arsitektur]](docs/architecture.png)
- [![Struktur Basis Data]](docs/database_schema.sql)

---

## ⁉️ Pertanyaan?

Hubungi:
- Penulis: 5025211029@student.its.ac.id
- Pembimbing Utama: siti@its.ac.id
