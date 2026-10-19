# IKY XITER — Gaming Panel Store

Website katalog digital responsif dengan backend Express. Browser hanya memanggil `/api/products`; API key disimpan di environment server dan tidak dikirim ke frontend.

## Isi
- `public/` — tampilan toko, pencarian, filter kategori.
- `server.js` — proxy backend untuk katalog API.
- `.env.example` — contoh konfigurasi, bukan tempat menyimpan key asli.

## Konfigurasi lokal
1. Install Node.js 20 atau lebih baru.
2. Salin `.env.example` menjadi `.env`.
3. Isi `PANEL_API_KEY` dengan API key milikmu.
4. Jalankan `npm install` lalu `npm start`.
5. Buka `http://localhost:3000`.

Jangan commit `.env` ke GitHub. `.gitignore` sudah mengabaikannya.

## Deploy
Deploy sebagai **Node.js web service**, bukan GitHub Pages statis, karena API key perlu disimpan di backend.
1. Upload folder proyek ke repository GitHub.
2. Di hosting Node.js yang kamu pilih, hubungkan repository tersebut.
3. Build command: `npm install`
4. Start command: `npm start`
5. Tambahkan environment variables:
   - `PANEL_API_BASE` = `https://dripclientofficial.dev/api/v1`
   - `PANEL_API_KEY` = API key rahasia milikmu
6. Deploy, lalu buka URL website yang diberikan hosting.

## Penting tentang autentikasi dan pembayaran
Endpoint katalog yang diberikan adalah `GET /api/v1/products`. Format produk yang terlihat mencakup `data.items`, `name`, `label`, `priceUsd`, `currency`, `stock`, `inStock`, `imageUrl`, dan `is_maintenance`.

Dokumentasi resmi penyedia menyatakan endpoint katalog bersifat publik, dan endpoint privat menggunakan `Authorization: Bearer <key>`. Backend menggunakan format Bearer dan tidak pernah mengirim key ke browser.

**Penting soal pembelian:** dokumentasi penyedia menyediakan `POST /api/v1/orders`, tetapi endpoint tersebut memotong saldo wallet API milik pemegang key dan mengembalikan key produk. Itu bukan gateway pembayaran pelanggan. Karena itu tombol checkout sengaja belum diaktifkan; mengaktifkan order publik tanpa menerima dan memverifikasi pembayaran pelanggan dapat membuat saldo API kamu terpakai orang lain. Untuk toko yang benar-benar menerima pembayaran pelanggan, sambungkan gateway pembayaran terlebih dahulu, verifikasi callback/webhook pembayaran di backend, lalu baru buat order ke API. Jangan pernah meminta kata sandi akun game pelanggan.
