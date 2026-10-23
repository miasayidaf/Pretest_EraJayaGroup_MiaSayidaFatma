# Performance Test using k6

## Tools yang Digunakan
- **Visual Studio Code** untuk membuka dan mengedit script.
- **Grafana k6** untuk menjalankan performance test.
- **Git Bash / Terminal VS Code** untuk menjalankan perintah pengujian.

## Persiapan
1. Instal [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) dan cek melalui terminal:
   ```bash
   k6 version
   ```
2. Buka folder project `PerformanceTest_MiaSayidaFatma` di VS Code.
3. Siapkan akun DemoQA yang sudah terdaftar pada `data/users.csv`. Gunakan akun berbeda untuk setiap VU yang berjalan bersamaan. Jangan unggah kredensial asli ke GitHub publik.

## Cara Menjalankan Pengujian
Jalankan perintah berikut dari folder yang berisi `performance.js` melalui Git Bash atau terminal VS Code:

```bash
# Baseline
SCENARIO=baseline CLEANUP_BEFORE_ADD=true k6 run --summary-export results/baseline-summary.json performance.js

# Load Test 10 VU
SCENARIO=load10 CLEANUP_BEFORE_ADD=true k6 run performance.js

# Load Test 50 VU
SCENARIO=load50 CLEANUP_BEFORE_ADD=true k6 run performance.js

# Load Test 100 VU
SCENARIO=load100 CLEANUP_BEFORE_ADD=true k6 run performance.js

# Stress Test
SCENARIO=stress CLEANUP_BEFORE_ADD=true k6 run performance.js

# Soak Test
SCENARIO=soak SOAK_DURATION=30m CLEANUP_BEFORE_ADD=true k6 run performance.js
```

Untuk Windows CMD, tersedia alternatif file `.bat` pada folder `scripts`, seperti `run-baseline.bat` dan `run-load10.bat`.

## Alur Pengujian
**Login → Melihat Daftar Buku → Memilih Detail Buku → Menambahkan Buku ke Koleksi**

## Hasil Pengujian
Hasil running dapat dilihat pada terminal k6, meliputi **response time, throughput, HTTP request, dan error rate**. Untuk menyimpan ringkasan dalam JSON, gunakan opsi `--summary-export` seperti pada contoh baseline.

## Catatan
- DemoQA merupakan server publik. Pengujian dengan beban tinggi, stress, atau soak hanya boleh dilakukan jika sudah mendapat izin.
- `CLEANUP_BEFORE_ADD=true` menghapus **seluruh koleksi buku akun pengujian** sebelum menambahkan buku. Gunakan hanya akun khusus testing.
- Jika pengujian gagal, periksa akun, token login, respons API, dan kemungkinan pembatasan request.
