# PerformanceTest_MiaSayidaFatma (K6)

Project API performance testing DemoQA Book Store, dengan satu script utama `performance.js`.

## Persiapan
1. Install K6 dan jalankan `k6 version`.
2. Copy `data/users.example.csv` menjadi `data/users.csv`, lalu isi akun uji DemoQA yang benar-benar terdaftar. Gunakan username berbeda untuk setiap VU. Jangan commit password asli ke GitHub.
3. Pastikan `data/books.csv` memiliki header `isbn`. Script memprioritaskan ISBN dari response Browse Books.
4. Gunakan akun uji khusus: setiap iterasi **menghapus seluruh koleksi buku akun tersebut** sebelum Add Book.

## Jalankan baseline
Dari terminal di folder ini:

```bash
k6 run -e SCENARIO=baseline performance.js
```

Simpan ringkasan JSON:

```bash
k6 run -e SCENARIO=baseline --summary-export=results/baseline-summary.json performance.js
```

## Skenario tersedia
- baseline: 1 VU, 5 iterasi
- load10: 10 VU, ramp-up 30s, hold 2m, ramp-down 30s
- load50: 50 VU, ramp-up 2m, hold 3m, ramp-down 1m
- load100: 100 VU, ramp-up 3m, hold 5m, ramp-down 1m
- stress: bertahap 25 → 50 → 75 → 100 VU
- soak: 20 VU selama 30m (ubah via `SOAK_DURATION`)

**Jangan menjalankan load/stress/soak ke server publik DemoQA tanpa izin.** Pengujian non-baseline membutuhkan `AUTHORIZED_LOAD=true`, hanya untuk environment berizin, dan jumlah akun unik yang cukup. Contoh di environment berizin:

```bash
k6 run -e SCENARIO=load10 -e AUTHORIZED_LOAD=true -e BASE_URL=https://YOUR-AUTHORIZED-TEST-HOST performance.js
```

## Troubleshooting Login
Jika HTTP 200 tetapi body kosong, itu **bukan login sukses**. Script mencatat error dan menghentikan iterasi secara aman. Periksa username, password, payload, serta response endpoint `/Account/v1/Login` di Swagger/DevTools. `userId` dari CSV tidak digunakan untuk menyamarkan Login yang gagal.

## Catatan tugas
Ini project **K6** dengan file `.js`, bukan file `.jmx`. Jika penilaian mewajibkan JMeter Thread Group, JSON Extractor, Transaction Controller, Summary/Aggregate Report, dan `.jmx`, project ini **tidak menggantikan** deliverable JMeter.
