# CURA Healthcare — Web Automation

Project WebdriverIO 10 + Cucumber + JavaScript (CommonJS) + Page Object Model.

## Cara menjalankan (Git Bash di VS Code)

1. Extract ZIP. Buka folder `WebAutomation_MiaSayidaFatma_Ready` di VS Code.
2. Buka Terminal > New Terminal (Git Bash).
3. Jalankan `npm ci` (membutuhkan koneksi internet untuk install dependencies).
4. Jalankan `npm run test:login` untuk 2 skenario login.
5. Jalankan `npm run test:appointment` untuk 2 skenario appointment.
6. Jalankan `npm test` untuk keempat skenario.

Website: https://katalon-demo-cura.herokuapp.com/profile.php#login

**Catatan:** Pengujian browser belum dieksekusi di lingkungan ini. Selector menggunakan struktur standar CURA Healthcare demo. Jika aplikasi berubah atau validasi Visit Date tidak sesuai, lihat pesan error dari terminal. `node_modules` sengaja tidak disertakan untuk menghindari file Windows/Linux yang tidak kompatibel; `npm ci` akan menginstalnya berdasarkan package-lock.json.
