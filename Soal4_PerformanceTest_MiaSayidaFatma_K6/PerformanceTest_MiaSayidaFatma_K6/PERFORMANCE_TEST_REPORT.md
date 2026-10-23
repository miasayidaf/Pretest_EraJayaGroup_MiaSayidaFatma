# Laporan Hasil Performance Testing — DemoQA Book Store API

**Project:** PerformanceTest_MiaSayidaFatma  
**Penguji:** Mia Sayida Fatma  
**Tools:** Grafana k6 (JavaScript)  
**Aplikasi:** DemoQA Book Store API  
**Base URL pada script:** `https://demoqa.com`  
**Sumber hasil:** File `results/*.json` dan dashboard `results/*-report.html` dari arsip pengujian.  

## 1. Ringkasan Pengujian

Performance testing dilakukan untuk melihat respons API Book Store saat digunakan oleh sejumlah virtual user (VU) dengan tingkat beban yang berbeda. Pengujian mencakup kondisi awal dengan satu pengguna, peningkatan beban secara bertahap hingga 100 VU, kenaikan beban yang lebih cepat melalui stress test, serta pengujian berkelanjutan selama 30 menit melalui soak test.

Laporan ini disusun berdasarkan hasil eksekusi yang tersimpan pada folder `results`. Pengujian tidak dijalankan ulang saat penyusunan laporan. Dengan demikian, seluruh angka yang dibahas mengacu pada hasil yang tersedia di project, bukan perkiraan.

## 2. Tujuan dan Ruang Lingkup

Tujuan utama pengujian adalah mengetahui waktu respons API, jumlah request yang dapat diproses, persentase kegagalan HTTP, dan keberhasilan validasi fungsional saat beban bertambah. Pengujian juga digunakan untuk mengidentifikasi indikasi penurunan performa pada skenario dengan jumlah pengguna tinggi.

Alur yang diuji:

1. **Login** — `POST /Account/v1/Login` untuk autentikasi dan mengambil `userId`.
2. **Generate Token** — `POST /Account/v1/GenerateToken` untuk memperoleh token autentikasi.
3. **Browse Books** — `GET /BookStore/v1/Books` untuk mengambil daftar buku dan ISBN.
4. **Select Book** — `GET /BookStore/v1/Book?ISBN={isbn}` untuk membuka detail buku terpilih.
5. **Cleanup Collection** — `DELETE /BookStore/v1/Books?UserId={userId}` untuk mengosongkan koleksi akun uji sebelum penambahan buku.
6. **Add Book** — `POST /BookStore/v1/Books` untuk menambahkan buku ke koleksi akun.

**Catatan:** Proses cleanup dilakukan sebelum Add Book dan menghapus seluruh koleksi buku pada akun uji. Akun yang digunakan sebaiknya merupakan akun khusus pengujian.

## 3. Metode dan Konfigurasi

Script utama berada pada `performance.js`. Data akun dibaca dari `data/users.csv` melalui `SharedArray` dan dibagikan berdasarkan ID virtual user sehingga masing-masing VU menggunakan akun yang berbeda. ISBN diambil dari response Browse Books, sedangkan fallback CSV hanya digunakan apabila opsi `ALLOW_FALLBACK_ISBN=true` diaktifkan. Antarproses terdapat *think time* acak sekitar 1–3 detik.

| Skenario | Beban | Pola Eksekusi |
|---|---|---|
| Baseline | 1 VU | 1 VU, 5 iterasi |
| Load 10 VU | 10 VU | 30 dtk naik, 2 mnt stabil, 30 dtk turun |
| Load 50 VU | 50 VU | 2 mnt naik, 3 mnt stabil, 1 mnt turun |
| Load 100 VU | 100 VU | 3 mnt naik, 5 mnt stabil, 1 mnt turun |
| Stress 100 VU | 100 VU | 1 mnt naik, 2 mnt stabil, 1 mnt turun |
| Soak 20 VU | 20 VU | 30 menit konstan |

### Kriteria Keberhasilan

Threshold yang didefinisikan dalam script:

| Metrik | Target |
|---|---|
| `http_req_duration` p95 | Kurang dari 3.000 ms |
| `http_req_failed` | Kurang dari 5% |
| `checks` | Lebih dari 95% |

Skenario dinyatakan **PASS** hanya jika ketiga threshold terpenuhi. `http_req_failed` menunjukkan kegagalan request HTTP menurut k6, sedangkan `checks` menunjukkan persentase pemeriksaan yang berhasil. Keduanya tidak selalu menghasilkan angka yang sama.

## 4. Rekapitulasi Hasil

| Skenario | Rata-rata RT | p95 RT | HTTP gagal | Check berhasil | Request/detik | Iterasi selesai | Status |
|---|---:|---:|---:|---:|---:|---:|---|
| Baseline | 697,97 ms | 1.630,83 ms | 0.00% | 100.00% | 0,37 | 5 | PASS |
| Load 10 VU | 1.125,03 ms | 4.102,41 ms | 0.00% | 100.00% | 2,70 | 85 | FAIL |
| Load 50 VU | 12.962,77 ms | 29.338,60 ms | 0.10% | 97.96% | 2,56 | 150 | FAIL |
| Load 100 VU | 23.140,47 ms | 49.656,17 ms | 67.18% | 28.00% | 1,74 | 893 | FAIL |
| Stress 100 VU | 11.508,25 ms | 50.964,28 ms | 53.41% | 42.82% | 5,83 | 475 | FAIL |
| Soak 20 VU | 7.711,56 ms | 11.657,39 ms | 1.16% | 98.82% | 1,46 | 544 | FAIL |

**Interpretasi:** p95 merupakan waktu respons yang tidak dilampaui oleh sekitar 95% request yang tercatat. Angka throughput di atas adalah request HTTP per detik, bukan jumlah transaksi end-to-end yang berhasil per detik.

## 5. Detail Hasil per Skenario

### 5.1 Baseline

**Konfigurasi:** 1 VU, 5 iterasi.  
**Hasil threshold:** PASS.

| Metrik | Hasil |
|---|---:|
| Total HTTP request | 30 |
| Throughput | 0,37 req/detik |
| Iterasi selesai | 5 |
| Response time minimum | 194,19 ms |
| Response time rata-rata | 697,97 ms |
| Median (p50) | 565,01 ms |
| p90 | 1.335,12 ms |
| p95 | 1.630,83 ms |
| Response time maksimum | 2.711,50 ms |
| HTTP request gagal | 0.00% |
| Check berhasil | 100.00% |

Ketiga threshold terpenuhi. Pada tingkat beban ini, response time p95, tingkat kegagalan HTTP, dan hasil check masih berada dalam batas yang ditetapkan.

Bukti pengujian: `results/baseline.json` dan `results/baseline-report.html`.

### 5.2 Load 10 VU

**Konfigurasi:** 30 dtk naik, 2 mnt stabil, 30 dtk turun.  
**Hasil threshold:** FAIL.

| Metrik | Hasil |
|---|---:|
| Total HTTP request | 510 |
| Throughput | 2,70 req/detik |
| Iterasi selesai | 85 |
| Response time minimum | 176,39 ms |
| Response time rata-rata | 1.125,03 ms |
| Median (p50) | 623,30 ms |
| p90 | 2.738,81 ms |
| p95 | 4.102,41 ms |
| Response time maksimum | 8.556,20 ms |
| HTTP request gagal | 0.00% |
| Check berhasil | 100.00% |

Skenario ini belum memenuhi seluruh kriteria karena p95 response time melebihi batas 3.000 ms.

Bukti pengujian: `results/load10.json` dan `results/load10-report.html`.

### 5.3 Load 50 VU

**Konfigurasi:** 2 mnt naik, 3 mnt stabil, 1 mnt turun.  
**Hasil threshold:** FAIL.

| Metrik | Hasil |
|---|---:|
| Total HTTP request | 964 |
| Throughput | 2,56 req/detik |
| Iterasi selesai | 150 |
| Response time minimum | 182,85 ms |
| Response time rata-rata | 12.962,77 ms |
| Median (p50) | 10.582,89 ms |
| p90 | 26.209,34 ms |
| p95 | 29.338,60 ms |
| Response time maksimum | 60.001,34 ms |
| HTTP request gagal | 0.10% |
| Check berhasil | 97.96% |

Skenario ini belum memenuhi seluruh kriteria karena p95 response time melebihi batas 3.000 ms.

Bukti pengujian: `results/load50.json` dan `results/load50-report.html`.

### 5.4 Load 100 VU

**Konfigurasi:** 3 mnt naik, 5 mnt stabil, 1 mnt turun.  
**Hasil threshold:** FAIL.

| Metrik | Hasil |
|---|---:|
| Total HTTP request | 2514 |
| Throughput | 1,74 req/detik |
| Iterasi selesai | 893 |
| Response time minimum | 169,62 ms |
| Response time rata-rata | 23.140,47 ms |
| Median (p50) | 187,09 ms |
| p90 | 32.021,71 ms |
| p95 | 49.656,17 ms |
| Response time maksimum | 1.152.711,68 ms |
| HTTP request gagal | 67.18% |
| Check berhasil | 28.00% |

Skenario ini belum memenuhi seluruh kriteria karena p95 response time melebihi batas 3.000 ms, serta persentase kegagalan HTTP mencapai atau melampaui 5%, serta persentase check berhasil tidak melebihi 95%.

Bukti pengujian: `results/load100.json` dan `results/load100-report.html`.

### 5.5 Stress 100 VU

**Konfigurasi:** 1 mnt naik, 2 mnt stabil, 1 mnt turun.  
**Hasil threshold:** FAIL.

| Metrik | Hasil |
|---|---:|
| Total HTTP request | 1524 |
| Throughput | 5,83 req/detik |
| Iterasi selesai | 475 |
| Response time minimum | 164,64 ms |
| Response time rata-rata | 11.508,25 ms |
| Median (p50) | 189,07 ms |
| p90 | 38.982,44 ms |
| p95 | 50.964,28 ms |
| Response time maksimum | 60.027,81 ms |
| HTTP request gagal | 53.41% |
| Check berhasil | 42.82% |

Skenario ini belum memenuhi seluruh kriteria karena p95 response time melebihi batas 3.000 ms, serta persentase kegagalan HTTP mencapai atau melampaui 5%, serta persentase check berhasil tidak melebihi 95%.

Bukti pengujian: `results/stress.json` dan `results/stress-report.html`.

### 5.6 Soak 20 VU

**Konfigurasi:** 30 menit konstan.  
**Hasil threshold:** FAIL.

| Metrik | Hasil |
|---|---:|
| Total HTTP request | 3274 |
| Throughput | 1,46 req/detik |
| Iterasi selesai | 544 |
| Response time minimum | 169,83 ms |
| Response time rata-rata | 7.711,56 ms |
| Median (p50) | 3.615,55 ms |
| p90 | 9.851,25 ms |
| p95 | 11.657,39 ms |
| Response time maksimum | 627.995,87 ms |
| HTTP request gagal | 1.16% |
| Check berhasil | 98.82% |

Skenario ini belum memenuhi seluruh kriteria karena p95 response time melebihi batas 3.000 ms.

Bukti pengujian: `results/soak.json` dan `results/soak-report.html`.

## 6. Analisis Hasil

### Perubahan waktu respons saat beban meningkat

Perbandingan Baseline, Load 10, Load 50, dan Load 100 menunjukkan bagaimana respons API berubah ketika jumlah virtual user dinaikkan. Perlu diperhatikan bahwa setiap skenario memiliki pola ramp-up dan durasi yang berbeda, sehingga perbandingan ini merupakan indikasi perilaku sistem pada konfigurasi yang diuji, bukan pengukuran kapasitas maksimum secara definitif.

### Hubungan kegagalan HTTP dan validasi fungsional

Request yang mendapat respons HTTP sukses belum tentu memenuhi semua pemeriksaan bisnis. Script memeriksa keberadaan `userId`, token, ISBN, kecocokan detail buku, keberhasilan cleanup, serta penambahan buku. Karena script dapat menghentikan iterasi lebih awal ketika data atau token tidak tersedia, jumlah iterasi yang tercatat tidak dapat langsung dianggap sebagai jumlah alur end-to-end yang sukses.

### Evaluasi stress dan soak

Stress test digunakan untuk melihat respons sistem saat jumlah VU meningkat lebih cepat. Soak test mempertahankan 20 VU selama 30 menit untuk mengamati perilaku dalam durasi lebih panjang. Hasil soak dapat menunjukkan gejala perlambatan atau kegagalan selama pengujian, tetapi tidak cukup untuk menyimpulkan adanya *memory leak* tanpa metrik penggunaan memori, CPU, dan log server.

### Keterbatasan analisis

DemoQA merupakan layanan demo publik yang dapat dipengaruhi traffic pengguna lain, kondisi jaringan, pembatasan request, dan kondisi layanan saat pengujian. File ringkasan JSON memuat metrik agregat; untuk memastikan endpoint mana yang paling lambat perlu meninjau data per-step atau dashboard terperinci. Penyebab masalah di sisi server tidak dapat dipastikan hanya dari metrik k6.

## 7. Kesimpulan

Berdasarkan hasil yang tersimpan, status masing-masing skenario adalah: **Baseline: PASS**, **Load 10 VU: FAIL**, **Load 50 VU: FAIL**, **Load 100 VU: FAIL**, **Stress 100 VU: FAIL**, **Soak 20 VU: FAIL**.

Hasil tersebut menunjukkan bahwa keberhasilan pengujian tidak cukup dinilai hanya dari banyaknya request yang diproses. Konsistensi waktu respons, kegagalan HTTP, dan keberhasilan check juga perlu diperhatikan. Pada skenario yang berstatus FAIL, satu atau lebih threshold yang ditetapkan belum tercapai.

## 8. Rekomendasi Tindak Lanjut

1. Periksa endpoint yang paling banyak menyumbang latency menggunakan tag `step` (`login`, `token`, `browse`, `select`, `cleanup`, dan `add`).
2. Cocokkan lonjakan response time dengan log aplikasi, error 4xx/5xx, penggunaan CPU, memori, dan database pada lingkungan yang memang diizinkan untuk load test.
3. Tambahkan metrik khusus untuk menghitung keberhasilan satu alur end-to-end secara utuh, karena iterasi dapat berhenti sebelum langkah Add Book.
4. Gunakan lingkungan staging atau performance test yang terkontrol untuk pengujian lanjutan, bukan menaikkan beban pada layanan demo publik tanpa izin.
5. Ulangi pengujian dengan konfigurasi dan data uji yang konsisten setelah perbaikan agar perubahan performa dapat dibandingkan.

## 9. Dokumentasi dan Evidence

Berkas pendukung pada folder project:

- `performance.js` — script utama beserta enam skenario dan threshold.
- `registerUsers.js` — utility pembuatan akun uji.
- `testLogin.js` — utility validasi login.
- `data/books.csv` dan `data/users.example.csv` — contoh data pengujian.
- `results/*.json` — ringkasan metrik k6 untuk masing-masing skenario.
- `results/*-report.html` — dashboard HTML hasil pengujian.
- `PerformanceTest_MiaSayidaFatma_K6_Recording.webm` — rekaman pengujian yang disertakan pada arsip.
