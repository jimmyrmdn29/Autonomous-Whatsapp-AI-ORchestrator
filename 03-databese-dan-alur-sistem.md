Struktur Database (Google Sheets) & Alur Kerja:
Sistem menggunakan tiga tab dalam satu file Google Sheets.
- Tab 1: 'Jadwal_Shift' (Ketersediaan teknisi berdasarkan jam/hari).
- Tab 2: 'Log_Tiket' (Header: ID Tiket | Timestamp | Jenis Tiket | Nama | Detail | Teknisi | Status).
- Tab 3: 'Data_Pelanggan' (Header: Nomor WA | Nama Pelanggan | Alamat | Paket Internet).

Alur Kerja End-to-End:
1. Pelanggan chat WA bot.
2. Backend mengecek nomor WA di Tab 'Data_Pelanggan'.
3. Backend menjalankan LangChain RunnableSequence/Chain, memasukkan konteks pelanggan (Lama/Baru) ke Prompt Template.
4. AI merespons natural -> AI mengeluarkan JSON saat data beres.
5. JIKA pelanggan baru, Backend menyimpan datanya ke Tab 'Data_Pelanggan'.
6. Node.js mengecek 'Jadwal_Shift', mencari teknisi, dan mengirim pesan WA penugasan beserta ID Tiket (#T001).
7. Node.js mencatat tiket ke 'Log_Tiket' dengan Status "Diproses".
8. Teknisi membalas WA bot ("SELESAI #T001").
9. Node.js mendeteksi ID tiket dan mengubah status di 'Log_Tiket' menjadi "Selesai".
10.